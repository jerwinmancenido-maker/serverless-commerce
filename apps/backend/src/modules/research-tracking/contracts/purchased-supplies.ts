import type { BigNumberInput } from "@medusajs/framework/types"
import { MathBN, MedusaError } from "@medusajs/framework/utils"

import {
  isResearchBaseUnit,
  normalizeResearchUnitProfile,
  RESEARCH_MAX_BASE_UNITS,
  type ResearchDisplayUnit,
  type ResearchBaseUnit,
} from "../../../lib/research-quantity"
import {
  assertMatchingResearchFingerprint,
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
} from "./ownership"

export const PURCHASED_ITEM_INELIGIBILITY_REASONS = [
  "not_fulfilled",
  "order_cancelled",
  "returned_or_reversed",
  "unsupported_order_source",
  "material_profile_unavailable",
  "quantity_unavailable",
  "already_tracked",
  "archived_material_action_required",
] as const

export type PurchasedItemIneligibilityReason =
  (typeof PURCHASED_ITEM_INELIGIBILITY_REASONS)[number]

export const PURCHASED_ACTIVATION_CONFLICT_REASONS = [
  "research_profile_action_required",
  "idempotency_key_conflict",
  "not_fulfilled",
  "order_cancelled",
  "returned_or_reversed",
  "unsupported_order_source",
  "material_profile_unavailable",
  "quantity_unavailable",
  "archived_material_action_required",
] as const

export type PurchasedActivationConflictReason =
  (typeof PURCHASED_ACTIVATION_CONFLICT_REASONS)[number]

export type ActivatePurchasedSupplyInput = {
  customerId: string
  orderId: string
  lineItemId: string
  activeConsentVersion: string
  eligibleSalesChannelIds: string[]
  idempotencyKey: string
}

export type NormalizedActivatePurchasedSupplyInput =
  ActivatePurchasedSupplyInput & {
    requestFingerprintSha256: string
  }

export type OrderItemQuantityDetail = {
  quantity: BigNumberInput
  fulfilled_quantity: BigNumberInput
  return_requested_quantity: BigNumberInput
  return_received_quantity: BigNumberInput
  return_dismissed_quantity: BigNumberInput
  written_off_quantity: BigNumberInput
}

export type EligibleQuantityResult =
  | { eligible: true; commerceQuantity: number }
  | { eligible: false; reason: PurchasedItemIneligibilityReason }

export type PublishedMaterialProfileRecord = {
  profile_key: string
  revision: number
  product_variant_id: string
  material_quantity_base_units: number
  material_base_unit: string
  display_unit: string
  base_units_per_display_unit: number
  display_precision: number
  status: "draft" | "published" | "withdrawn"
  evidence_scope: "sku" | "formulation" | "batch"
  effective_at: Date | null
  published_at: Date | null
  withdrawn_at: Date | null
}

export type SelectedMaterialProfile = {
  profileKey: string
  revision: number
  productVariantId: string
  materialQuantityBaseUnits: number
  materialBaseUnit: ResearchBaseUnit
  displayUnit: ResearchDisplayUnit
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
}

export type ResearchSupplyActivationProjection = {
  activation_id: string
  tracked_material_id: string
  supply_id: string
  source_order_id: string
  source_order_line_item_id: string
  label: string
  eligible_commerce_quantity: number
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: ResearchBaseUnit
  material_profile_key: string
  material_profile_revision: number
  added_to_tracking_at: Date
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function requiredIdentifier(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  return normalized
}

function toNonNegativeInteger(
  value: BigNumberInput,
): ReturnType<typeof MathBN.convert> | null {
  try {
    const normalized = MathBN.convert(value)

    if (!normalized.isFinite() || !normalized.isInteger() || normalized.isNegative()) {
      return null
    }

    return normalized
  } catch {
    return null
  }
}

export function normalizeActivatePurchasedSupplyInput(
  input: ActivatePurchasedSupplyInput,
): NormalizedActivatePurchasedSupplyInput {
  const customerId = requiredIdentifier(input.customerId, "customerId")
  const orderId = requiredIdentifier(input.orderId, "orderId")
  const lineItemId = requiredIdentifier(input.lineItemId, "lineItemId")
  const activeConsentVersion = requiredIdentifier(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const eligibleSalesChannelIds = Array.from(
    new Set(input.eligibleSalesChannelIds.map((value) => value.trim()).filter(Boolean)),
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  if (!eligibleSalesChannelIds.length) {
    invalid("eligibleSalesChannelIds is required")
  }

  return {
    customerId,
    orderId,
    lineItemId,
    activeConsentVersion,
    eligibleSalesChannelIds,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "activate-purchased-research-supply",
      [orderId, lineItemId],
    ),
  }
}

export function evaluateEligibleCommerceQuantity(
  detail: OrderItemQuantityDetail,
  orderCancelled: boolean,
): EligibleQuantityResult {
  const quantity = toNonNegativeInteger(detail.quantity)
  const fulfilled = toNonNegativeInteger(detail.fulfilled_quantity)
  const returnRequested = toNonNegativeInteger(detail.return_requested_quantity)
  const returnReceived = toNonNegativeInteger(detail.return_received_quantity)
  const returnDismissed = toNonNegativeInteger(detail.return_dismissed_quantity)
  const writtenOff = toNonNegativeInteger(detail.written_off_quantity)

  if (
    !quantity ||
    !fulfilled ||
    !returnRequested ||
    !returnReceived ||
    !returnDismissed ||
    !writtenOff
  ) {
    return { eligible: false, reason: "quantity_unavailable" }
  }

  if (orderCancelled) {
    return { eligible: false, reason: "order_cancelled" }
  }

  if (!MathBN.eq(fulfilled, quantity)) {
    return { eligible: false, reason: "not_fulfilled" }
  }

  if (!MathBN.eq(writtenOff, 0)) {
    return { eligible: false, reason: "returned_or_reversed" }
  }

  const eligible = MathBN.sub(
    fulfilled,
    returnRequested,
    returnReceived,
    returnDismissed,
  )

  if (!eligible.isInteger() || MathBN.lte(eligible, 0)) {
    return { eligible: false, reason: "returned_or_reversed" }
  }

  const commerceQuantity = eligible.toNumber()

  if (
    !Number.isSafeInteger(commerceQuantity) ||
    commerceQuantity > RESEARCH_MAX_BASE_UNITS
  ) {
    return { eligible: false, reason: "quantity_unavailable" }
  }

  return { eligible: true, commerceQuantity }
}

export function selectCurrentPublishedMaterialProfile(
  profiles: PublishedMaterialProfileRecord[],
  activationTime: Date,
): SelectedMaterialProfile | null {
  const eligible = profiles
    .filter(
      (profile) =>
        profile.status === "published" &&
        profile.withdrawn_at === null &&
        profile.published_at !== null &&
        profile.published_at.getTime() <= activationTime.getTime() &&
        profile.effective_at !== null &&
        profile.effective_at.getTime() <= activationTime.getTime() &&
        (profile.evidence_scope === "sku" ||
          profile.evidence_scope === "formulation"),
    )
    .sort((left, right) => {
      const effectiveDifference =
        right.effective_at!.getTime() - left.effective_at!.getTime()

      return effectiveDifference || right.revision - left.revision
    })

  const selected = eligible[0]

  if (!selected) {
    return null
  }

  const equallyCurrent = eligible.filter(
    (profile) =>
      profile.effective_at!.getTime() === selected.effective_at!.getTime() &&
      profile.revision === selected.revision,
  )

  if (
    equallyCurrent.length !== 1 ||
    !Number.isSafeInteger(selected.revision) ||
    selected.revision <= 0 ||
    !Number.isSafeInteger(selected.material_quantity_base_units) ||
    selected.material_quantity_base_units <= 0 ||
    !isResearchBaseUnit(selected.material_base_unit)
  ) {
    return null
  }

  let unitProfile

  try {
    unitProfile = normalizeResearchUnitProfile({
      baseUnit: selected.material_base_unit,
      displayUnit: selected.display_unit as ResearchDisplayUnit,
      baseUnitsPerDisplayUnit: selected.base_units_per_display_unit,
      displayPrecision: selected.display_precision,
    })
  } catch {
    return null
  }

  return {
    profileKey: selected.profile_key,
    revision: selected.revision,
    productVariantId: selected.product_variant_id,
    materialQuantityBaseUnits: selected.material_quantity_base_units,
    materialBaseUnit: selected.material_base_unit,
    displayUnit: unitProfile.displayUnit,
    baseUnitsPerDisplayUnit: unitProfile.baseUnitsPerDisplayUnit,
    displayPrecision: unitProfile.displayPrecision,
  }
}

export function calculateInitialSupplyBaseUnits(
  commerceQuantity: number,
  materialQuantityBaseUnits: number,
): number | null {
  if (
    !Number.isSafeInteger(commerceQuantity) ||
    commerceQuantity <= 0 ||
    !Number.isSafeInteger(materialQuantityBaseUnits) ||
    materialQuantityBaseUnits <= 0
  ) {
    return null
  }

  const quantity = MathBN.mult(commerceQuantity, materialQuantityBaseUnits)
  const result = quantity.toNumber()

  return Number.isSafeInteger(result) &&
    result > 0 &&
    result <= RESEARCH_MAX_BASE_UNITS
    ? result
    : null
}

export function normalizeActivationLabel(value: string): string {
  const normalized = value.replace(/[\u0000-\u001F\u007F]/g, " ").trim()

  return Array.from(normalized || "Purchased research material")
    .slice(0, 200)
    .join("")
}

export function assertActivationFingerprint(
  stored: string,
  requested: string,
): void {
  assertMatchingResearchFingerprint(stored, requested)
}

export function purchasedActivationConflictReason(
  error: unknown,
): PurchasedActivationConflictReason | null {
  if (!(error instanceof Error)) {
    return null
  }

  return PURCHASED_ACTIVATION_CONFLICT_REASONS.includes(
    error.message as PurchasedActivationConflictReason,
  )
    ? (error.message as PurchasedActivationConflictReason)
    : null
}

export function projectResearchSupplyActivation(input: {
  activation: {
    id: string
    source_order_id: string
    source_order_line_item_id: string
    eligible_commerce_quantity: number
    label_snapshot: string
    activated_at: Date
    tracked_material_id: string
    supply_id: string
    material_profile_key: string
    material_profile_revision: number
  }
  supply: {
    id: string
    initial_quantity_base_units: number
    remaining_quantity_base_units: number
    base_unit: ResearchBaseUnit
  }
}): ResearchSupplyActivationProjection {
  return {
    activation_id: input.activation.id,
    tracked_material_id: input.activation.tracked_material_id,
    supply_id: input.supply.id,
    source_order_id: input.activation.source_order_id,
    source_order_line_item_id: input.activation.source_order_line_item_id,
    label: input.activation.label_snapshot,
    eligible_commerce_quantity: input.activation.eligible_commerce_quantity,
    initial_quantity_base_units: input.supply.initial_quantity_base_units,
    remaining_quantity_base_units: input.supply.remaining_quantity_base_units,
    base_unit: input.supply.base_unit,
    material_profile_key: input.activation.material_profile_key,
    material_profile_revision: input.activation.material_profile_revision,
    added_to_tracking_at: input.activation.activated_at,
  }
}
