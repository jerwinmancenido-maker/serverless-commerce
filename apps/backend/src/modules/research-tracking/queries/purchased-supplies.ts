import type {
  BigNumberInput,
  MedusaContainer,
  OrderDTO,
  OrderItemDTO,
  OrderLineItemDTO,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../research-content"
import type ResearchContentModuleService from "../../research-content/service"
import { RESEARCH_TRACKING_MODULE } from ".."
import type ResearchTrackingModuleService from "../service"
import {
  calculateInitialSupplyBaseUnits,
  evaluateEligibleCommerceQuantity,
  normalizeActivationLabel,
  selectCurrentPublishedMaterialProfile,
  type PurchasedItemIneligibilityReason,
  type PublishedMaterialProfileRecord,
  type ResearchSupplyActivationProjection,
  projectResearchSupplyActivation,
} from "../contracts/purchased-supplies"
import {
  normalizeResearchUnitProfile,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
  type ResearchUnitProfile,
} from "../../../lib/research-quantity"

const PURCHASED_ORDER_ITEM_FIELDS = [
  "id",
  "created_at",
  "raw_quantity",
  "raw_fulfilled_quantity",
  "raw_return_requested_quantity",
  "raw_return_received_quantity",
  "raw_return_dismissed_quantity",
  "raw_written_off_quantity",
  "item.id",
  "item.title",
  "item.variant_id",
  "item.variant_sku",
  "item.variant_title",
  "order.id",
  "order.display_id",
  "order.status",
  "order.customer_id",
  "order.sales_channel_id",
  "order.canceled_at",
  "order.created_at",
] as const

type RawOrderItemDetail = {
  raw_fulfilled_quantity: BigNumberInput
  raw_return_requested_quantity: BigNumberInput
  raw_return_received_quantity: BigNumberInput
  raw_return_dismissed_quantity: BigNumberInput
  raw_written_off_quantity: BigNumberInput
}

export type PurchasedOrderItemRecord = Pick<
  OrderLineItemDTO,
  "id" | "title" | "variant_id" | "variant_sku" | "variant_title"
> & {
  raw_quantity: BigNumberInput
  detail: RawOrderItemDetail
}

export type PurchasedOrderRecord = Omit<
  Pick<
    OrderDTO,
    | "id"
    | "display_id"
    | "status"
    | "customer_id"
    | "sales_channel_id"
    | "canceled_at"
    | "created_at"
  >,
  "display_id"
> & {
  display_id: string | number
  items?: PurchasedOrderItemRecord[]
}

type PurchasedOrderItemQueryRecord = Pick<OrderItemDTO, "id"> & {
  raw_quantity: BigNumberInput
  raw_fulfilled_quantity: BigNumberInput
  raw_return_requested_quantity: BigNumberInput
  raw_return_received_quantity: BigNumberInput
  raw_return_dismissed_quantity: BigNumberInput
  raw_written_off_quantity: BigNumberInput
  item: Pick<
    OrderLineItemDTO,
    "id" | "title" | "variant_id" | "variant_sku" | "variant_title"
  >
  order: PurchasedOrderRecord
}

export type PurchasedItemCandidateProjection = {
  order_id: string
  order_display_id: string | number
  line_item_id: string
  label: string
  variant_id: string | null
  variant_sku: string | null
  eligibility: "eligible" | "ineligible" | "already_tracked"
  ineligibility_reason: PurchasedItemIneligibilityReason | null
  eligible_commerce_quantity: number | null
  initial_quantity_base_units: number | null
  base_unit: ResearchBaseUnit | null
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
  added_to_tracking_at: Date | null
}

export type TrackedMaterialSupplyProjection = {
  supply_id: string
  source_order_line_item_id: string | null
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
  added_to_tracking_at: Date
  lot_number: string | null
  batch_number: string | null
  expires_at: Date | null
  storage_note: string | null
  status: "active" | "depleted" | "archived"
}

export type TrackedMaterialProjection = {
  tracked_material_id: string
  label: string
  product_variant_id: string | null
  status: "active"
  supplies: TrackedMaterialSupplyProjection[]
}

function conflict(reason: PurchasedItemIneligibilityReason | string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, reason)
}

function notFound(): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "resource was not found")
}

function services(container: MedusaContainer) {
  return {
    content: container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    ),
    tracking: container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    ),
  }
}

async function getActiveProfile(
  container: MedusaContainer,
  customerId: string,
  activeConsentVersion: string,
) {
  const { tracking } = services(container)
  const [profile] = await tracking.listResearchProfiles(
    { customer_id: customerId },
    { take: 1 },
  )

  if (
    !profile ||
    profile.status !== "active" ||
    profile.consent_version !== activeConsentVersion
  ) {
    conflict("research_profile_action_required")
  }

  return profile
}

function quantityDetail(item: PurchasedOrderItemRecord) {
  return {
    quantity: item.raw_quantity,
    fulfilled_quantity: item.detail.raw_fulfilled_quantity,
    return_requested_quantity: item.detail.raw_return_requested_quantity,
    return_received_quantity: item.detail.raw_return_received_quantity,
    return_dismissed_quantity: item.detail.raw_return_dismissed_quantity,
    written_off_quantity: item.detail.raw_written_off_quantity,
  }
}

async function materialProfileForVariant(
  content: ResearchContentModuleService,
  variantId: string,
  activationTime: Date,
) {
  const profiles = await content.listCalculatorMaterialProfiles(
    { product_variant_id: variantId, status: "published" },
    { order: { effective_at: "DESC", revision: "DESC" } },
  )

  return selectCurrentPublishedMaterialProfile(
    profiles as PublishedMaterialProfileRecord[],
    activationTime,
  )
}

async function unitProfileForActivation(
  content: ResearchContentModuleService,
  activation: Pick<
    ResearchSupplyActivationProjection,
    "material_profile_key" | "material_profile_revision" | "base_unit"
  >,
): Promise<ResearchUnitProfile | null> {
  const profiles = await content.listCalculatorMaterialProfiles(
    {
      profile_key: activation.material_profile_key,
      revision: activation.material_profile_revision,
    },
    { take: 2 },
  )
  const profile = profiles.length === 1 ? profiles[0] : null

  if (!profile || profile.material_base_unit !== activation.base_unit) {
    return null
  }

  try {
    return normalizeResearchUnitProfile({
      baseUnit: activation.base_unit,
      displayUnit: profile.display_unit as ResearchDisplayUnit,
      baseUnitsPerDisplayUnit: profile.base_units_per_display_unit,
      displayPrecision: profile.display_precision,
    })
  } catch {
    return null
  }
}

async function existingActivationProjection(
  tracking: ResearchTrackingModuleService,
  profileId: string,
  lineItemId: string,
): Promise<ResearchSupplyActivationProjection | null> {
  const [activation] = await tracking.listResearchSupplyActivations(
    { profile_id: profileId, source_order_line_item_id: lineItemId },
    { take: 1 },
  )

  if (!activation) {
    return null
  }

  const supply = await tracking.retrieveResearchSupply(activation.supply_id)

  return projectResearchSupplyActivation({ activation, supply })
}

async function activationProjectionById(
  tracking: ResearchTrackingModuleService,
  activationId: string,
): Promise<ResearchSupplyActivationProjection | null> {
  const [activation] = await tracking.listResearchSupplyActivations(
    { id: activationId },
    { take: 1 },
  )

  if (!activation) {
    return null
  }

  const supply = await tracking.retrieveResearchSupply(activation.supply_id)

  return projectResearchSupplyActivation({ activation, supply })
}

function toPurchasedOrderAndItem(record: PurchasedOrderItemQueryRecord): {
  order: PurchasedOrderRecord
  item: PurchasedOrderItemRecord
} {
  return {
    order: record.order,
    item: {
      ...record.item,
      raw_quantity: record.raw_quantity,
      detail: {
        raw_fulfilled_quantity: record.raw_fulfilled_quantity,
        raw_return_requested_quantity: record.raw_return_requested_quantity,
        raw_return_received_quantity: record.raw_return_received_quantity,
        raw_return_dismissed_quantity: record.raw_return_dismissed_quantity,
        raw_written_off_quantity: record.raw_written_off_quantity,
      },
    },
  }
}

async function projectCandidate(
  container: MedusaContainer,
  profileId: string,
  order: PurchasedOrderRecord,
  item: PurchasedOrderItemRecord,
  eligibleSalesChannelIds: string[],
): Promise<PurchasedItemCandidateProjection> {
  const { content, tracking } = services(container)
  const label = normalizeActivationLabel(
    item.title || item.variant_title || item.variant_sku || "",
  )
  const base = {
    order_id: order.id,
    order_display_id: order.display_id,
    line_item_id: item.id,
    label,
    variant_id: item.variant_id ?? null,
    variant_sku: item.variant_sku ?? null,
  }
  const existing = await existingActivationProjection(
    tracking,
    profileId,
    item.id,
  )

  if (existing) {
    const unitProfile = await unitProfileForActivation(content, existing)

    return {
      ...base,
      eligibility: "already_tracked",
      ineligibility_reason: "already_tracked",
      eligible_commerce_quantity: existing.eligible_commerce_quantity,
      initial_quantity_base_units: existing.initial_quantity_base_units,
      base_unit: existing.base_unit,
      display_unit: unitProfile?.displayUnit ?? null,
      base_units_per_display_unit:
        unitProfile?.baseUnitsPerDisplayUnit ?? null,
      display_precision: unitProfile?.displayPrecision ?? null,
      added_to_tracking_at: existing.added_to_tracking_at,
    }
  }

  if (
    !order.sales_channel_id ||
    !eligibleSalesChannelIds.includes(order.sales_channel_id)
  ) {
    return ineligible(base, "unsupported_order_source")
  }

  const quantity = evaluateEligibleCommerceQuantity(
    quantityDetail(item),
    order.status === "canceled" || Boolean(order.canceled_at),
  )

  if (!quantity.eligible) {
    return ineligible(base, quantity.reason)
  }

  if (!item.variant_id) {
    return ineligible(base, "material_profile_unavailable")
  }

  const [material] = await tracking.listTrackedMaterials(
    { profile_id: profileId, product_variant_id: item.variant_id },
    { take: 1 },
  )

  if (material?.status === "archived") {
    return ineligible(base, "archived_material_action_required")
  }

  const profile = await materialProfileForVariant(
    content,
    item.variant_id,
    new Date(),
  )

  if (!profile) {
    return ineligible(base, "material_profile_unavailable")
  }

  const initialQuantity = calculateInitialSupplyBaseUnits(
    quantity.commerceQuantity,
    profile.materialQuantityBaseUnits,
  )

  if (!initialQuantity) {
    return ineligible(base, "quantity_unavailable")
  }

  return {
    ...base,
    eligibility: "eligible",
    ineligibility_reason: null,
    eligible_commerce_quantity: quantity.commerceQuantity,
    initial_quantity_base_units: initialQuantity,
    base_unit: profile.materialBaseUnit,
    display_unit: profile.displayUnit,
    base_units_per_display_unit: profile.baseUnitsPerDisplayUnit,
    display_precision: profile.displayPrecision,
    added_to_tracking_at: null,
  }
}

function ineligible(
  base: Pick<
    PurchasedItemCandidateProjection,
    | "order_id"
    | "order_display_id"
    | "line_item_id"
    | "label"
    | "variant_id"
    | "variant_sku"
  >,
  reason: PurchasedItemIneligibilityReason,
): PurchasedItemCandidateProjection {
  return {
    ...base,
    eligibility: "ineligible",
    ineligibility_reason: reason,
    eligible_commerce_quantity: null,
    initial_quantity_base_units: null,
    base_unit: null,
    display_unit: null,
    base_units_per_display_unit: null,
    display_precision: null,
    added_to_tracking_at: null,
  }
}

export async function listPurchasedSupplyCandidates(input: {
  container: MedusaContainer
  customerId: string
  activeConsentVersion: string
  eligibleSalesChannelIds: string[]
  limit: number
  offset: number
}): Promise<{ items: PurchasedItemCandidateProjection[]; count: number }> {
  const profile = await getActiveProfile(
    input.container,
    input.customerId,
    input.activeConsentVersion,
  )
  const query = input.container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: ownedOrders } = await query.graph({
    entity: "order",
    fields: ["id", "items.detail.id"],
    filters: { customer_id: input.customerId },
  })
  const ownedOrderItemIds = (
    ownedOrders as Array<{ items?: Array<{ detail?: { id: string } }> }>
  ).flatMap((order) =>
    (order.items ?? []).flatMap((item) =>
      item.detail?.id ? [item.detail.id] : [],
    ),
  )

  if (!ownedOrderItemIds.length) {
    return { items: [], count: 0 }
  }

  const { data, metadata } = await query.graph({
    entity: "order_item",
    fields: [...PURCHASED_ORDER_ITEM_FIELDS],
    filters: { id: ownedOrderItemIds },
    pagination: {
      take: input.limit,
      skip: input.offset,
      order: { created_at: "DESC" },
    },
  })
  const records = data as unknown as PurchasedOrderItemQueryRecord[]
  const candidates = await Promise.all(
    records.map((record) => {
      const { order, item } = toPurchasedOrderAndItem(record)

      return projectCandidate(
        input.container,
        profile.id,
        order,
        item,
        input.eligibleSalesChannelIds,
      )
    }),
  )

  return { items: candidates, count: metadata?.count ?? records.length }
}

export async function retrieveOwnedPurchasedOrderItem(input: {
  container: MedusaContainer
  customerId: string
  orderId: string
  lineItemId: string
}): Promise<{ order: PurchasedOrderRecord; item: PurchasedOrderItemRecord }> {
  const query = input.container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: ownedOrders } = await query.graph({
    entity: "order",
    fields: ["id", "items.id", "items.detail.id"],
    filters: { id: input.orderId, customer_id: input.customerId },
    pagination: { take: 1 },
  })

  if (!ownedOrders.length) {
    notFound()
  }

  const ownedLine = (
    ownedOrders[0] as unknown as {
      items?: Array<{ id: string; detail?: { id: string } }>
    }
  ).items?.find((item) => item.id === input.lineItemId)

  if (!ownedLine?.detail?.id) {
    notFound()
  }

  const { data } = await query.graph({
    entity: "order_item",
    fields: [...PURCHASED_ORDER_ITEM_FIELDS],
    filters: {
      id: ownedLine.detail.id,
    },
    pagination: { take: 1 },
  })
  const record = (data as unknown as PurchasedOrderItemQueryRecord[])[0]

  if (!record) {
    notFound()
  }

  return toPurchasedOrderAndItem(record)
}

export async function listTrackedMaterialsAndSupplies(input: {
  container: MedusaContainer
  customerId: string
  activeConsentVersion: string
  limit: number
  offset: number
}): Promise<{ materials: TrackedMaterialProjection[]; count: number }> {
  const profile = await getActiveProfile(
    input.container,
    input.customerId,
    input.activeConsentVersion,
  )
  const { content, tracking } = services(input.container)
  const [materials, count] = await tracking.listAndCountTrackedMaterials(
    { profile_id: profile.id, status: "active" },
    {
      relations: ["supplies", "supply_activations"],
      take: input.limit,
      skip: input.offset,
      order: { activated_at: "DESC" },
    },
  )

  return {
    count,
    materials: await Promise.all(materials.map(async (material) => ({
      tracked_material_id: material.id,
      label: material.label,
      product_variant_id: material.product_variant_id,
      status: "active" as const,
      supplies: await Promise.all(material.supplies.map(async (supply) => {
        const activation = material.supply_activations.find(
          (candidate) => candidate.supply_id === supply.id,
        )
        const unitProfile = activation
          ? await unitProfileForActivation(
              content,
              projectResearchSupplyActivation({ activation, supply }),
            )
          : null

        return {
          supply_id: supply.id,
          source_order_line_item_id: supply.source_order_line_item_id,
          initial_quantity_base_units: supply.initial_quantity_base_units,
          remaining_quantity_base_units: supply.remaining_quantity_base_units,
          base_unit: supply.base_unit,
          display_unit: unitProfile?.displayUnit ?? null,
          base_units_per_display_unit:
            unitProfile?.baseUnitsPerDisplayUnit ?? null,
          display_precision: unitProfile?.displayPrecision ?? null,
          added_to_tracking_at: activation?.activated_at ?? supply.acquired_at,
          lot_number: supply.lot_number,
          batch_number: supply.batch_number,
          expires_at: supply.expires_at,
          storage_note: supply.storage_note,
          status: supply.status,
        }
      })),
    }))),
  }
}

export {
  activationProjectionById,
  existingActivationProjection,
  getActiveProfile,
  materialProfileForVariant,
  quantityDetail,
}
