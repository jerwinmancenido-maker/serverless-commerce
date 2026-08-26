import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  assertActivationFingerprint,
  calculateInitialSupplyBaseUnits,
  evaluateEligibleCommerceQuantity,
  normalizeActivatePurchasedSupplyInput,
  normalizeActivationLabel,
  projectResearchSupplyActivation,
  type ActivatePurchasedSupplyInput,
  type NormalizedActivatePurchasedSupplyInput,
  type ResearchSupplyActivationProjection,
} from "../../modules/research-tracking/contracts/purchased-supplies"
import {
  activationProjectionById,
  existingActivationProjection,
  getActiveProfile,
  materialProfileForVariant,
  quantityDetail,
  retrieveOwnedPurchasedOrderItem,
} from "../../modules/research-tracking/queries/purchased-supplies"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type TrackedMaterialInput = {
  profile_id: string
  product_variant_id: string
  label: string
  source: "purchased"
  status: "active"
  activated_at: Date
}

type ResearchSupplyInput = {
  source_order_line_item_id: string
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  acquired_at: Date
  lot_number: null
  batch_number: null
  expires_at: null
  storage_note: null
  status: "active"
}

type ResearchSupplyActivationInput = {
  profile_id: string
  source_order_id: string
  source_order_line_item_id: string
  source_product_variant_id: string
  eligible_commerce_quantity: number
  material_profile_key: string
  material_profile_revision: number
  material_quantity_base_units: number
  material_base_unit: "microgram" | "microliter" | "piece"
  idempotency_key: string
  request_fingerprint_sha256: string
  activated_at: Date
  label_snapshot: string
}

type ResearchSupplyActivationRequestInput = {
  profile_id: string
  idempotency_key: string
  request_fingerprint_sha256: string
  accepted_at: Date
}

export type PreparedPurchasedSupplyActivation = {
  shouldCreate: boolean
  shouldRecordRequest: boolean
  existingProjection: ResearchSupplyActivationProjection | null
  profileId: string
  productVariantId: string
  trackedMaterialId: string | null
  materialLockKey: string
  trackedMaterialInput: TrackedMaterialInput
  supplyInput: ResearchSupplyInput
  activationInput: ResearchSupplyActivationInput
  requestInput: ResearchSupplyActivationRequestInput
}

function trackingService(
  container: MedusaContainer,
): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function conflict(reason: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, reason)
}

function notFound(): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "resource was not found")
}

function inconsistentActivationEvidence(): never {
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "purchased supply activation evidence is inconsistent",
  )
}

export const normalizePurchasedSupplyActivationStep = createStep(
  "normalize-purchased-supply-activation",
  async (input: ActivatePurchasedSupplyInput) =>
    new StepResponse(normalizeActivatePurchasedSupplyInput(input)),
)

export const preparePurchasedSupplyActivationStep = createStep(
  "prepare-purchased-supply-activation",
  async (input: NormalizedActivatePurchasedSupplyInput, { container }) => {
    const service = trackingService(container)
    const profile = await getActiveProfile(
      container,
      input.customerId,
      input.activeConsentVersion,
    )
    const [keyRequest] = await service.listResearchSupplyActivationRequests(
      { profile_id: profile.id, idempotency_key: input.idempotencyKey },
      { take: 1 },
    )

    if (keyRequest) {
      try {
        assertActivationFingerprint(
          keyRequest.request_fingerprint_sha256,
          input.requestFingerprintSha256,
        )
      } catch {
        conflict("idempotency_key_conflict")
      }

      const keyActivation = await service.retrieveResearchSupplyActivation(
        keyRequest.activation_id,
      )

      if (
        keyActivation.source_order_id !== input.orderId ||
        keyActivation.source_order_line_item_id !== input.lineItemId
      ) {
        conflict("idempotency_key_conflict")
      }

      const projection = await existingActivationProjection(
        service, profile.id, input.lineItemId,
      )

      if (!projection) {
        inconsistentActivationEvidence()
      }

      return new StepResponse<PreparedPurchasedSupplyActivation>({
        shouldCreate: false,
        shouldRecordRequest: false,
        existingProjection: projection,
        profileId: profile.id,
        productVariantId: keyActivation.source_product_variant_id,
        trackedMaterialId: keyActivation.tracked_material_id,
        materialLockKey: `research-material:${profile.id}:${keyActivation.source_product_variant_id}`,
        trackedMaterialInput: {
          profile_id: profile.id,
          product_variant_id: keyActivation.source_product_variant_id,
          label: keyActivation.label_snapshot,
          source: "purchased",
          status: "active",
          activated_at: keyActivation.activated_at,
        },
        supplyInput: {
          source_order_line_item_id: input.lineItemId,
          initial_quantity_base_units: projection.initial_quantity_base_units,
          remaining_quantity_base_units:
            projection.remaining_quantity_base_units,
          base_unit: projection.base_unit,
          acquired_at: projection.added_to_tracking_at,
          lot_number: null,
          batch_number: null,
          expires_at: null,
          storage_note: null,
          status: "active",
        },
        activationInput: {
          profile_id: profile.id,
          source_order_id: input.orderId,
          source_order_line_item_id: input.lineItemId,
          source_product_variant_id: keyActivation.source_product_variant_id,
          eligible_commerce_quantity:
            projection.eligible_commerce_quantity,
          material_profile_key: keyActivation.material_profile_key,
          material_profile_revision: keyActivation.material_profile_revision,
          material_quantity_base_units:
            keyActivation.material_quantity_base_units,
          material_base_unit: keyActivation.material_base_unit,
          idempotency_key: keyActivation.idempotency_key,
          request_fingerprint_sha256:
            keyActivation.request_fingerprint_sha256,
          activated_at: keyActivation.activated_at,
          label_snapshot: keyActivation.label_snapshot,
        },
        requestInput: {
          profile_id: profile.id,
          idempotency_key: keyRequest.idempotency_key,
          request_fingerprint_sha256: keyRequest.request_fingerprint_sha256,
          accepted_at: keyRequest.accepted_at,
        },
      })
    }

    const [lineActivation] = await service.listResearchSupplyActivations(
      { source_order_line_item_id: input.lineItemId },
      { take: 1 },
    )

    if (lineActivation) {
      if (
        lineActivation.profile_id !== profile.id ||
        lineActivation.source_order_id !== input.orderId
      ) {
        notFound()
      }

      const projection = await existingActivationProjection(
        service,
        profile.id,
        input.lineItemId,
      )

      if (!projection) {
        inconsistentActivationEvidence()
      }

      return new StepResponse<PreparedPurchasedSupplyActivation>({
        shouldCreate: false,
        shouldRecordRequest: true,
        existingProjection: projection,
        profileId: profile.id,
        productVariantId: lineActivation.source_product_variant_id,
        trackedMaterialId: lineActivation.tracked_material_id,
        materialLockKey: `research-material:${profile.id}:${lineActivation.source_product_variant_id}`,
        trackedMaterialInput: {
          profile_id: profile.id,
          product_variant_id: lineActivation.source_product_variant_id,
          label: lineActivation.label_snapshot,
          source: "purchased",
          status: "active",
          activated_at: lineActivation.activated_at,
        },
        supplyInput: {
          source_order_line_item_id: input.lineItemId,
          initial_quantity_base_units: projection.initial_quantity_base_units,
          remaining_quantity_base_units:
            projection.remaining_quantity_base_units,
          base_unit: projection.base_unit,
          acquired_at: projection.added_to_tracking_at,
          lot_number: null,
          batch_number: null,
          expires_at: null,
          storage_note: null,
          status: "active",
        },
        activationInput: {
          profile_id: profile.id,
          source_order_id: input.orderId,
          source_order_line_item_id: input.lineItemId,
          source_product_variant_id: lineActivation.source_product_variant_id,
          eligible_commerce_quantity:
            projection.eligible_commerce_quantity,
          material_profile_key: lineActivation.material_profile_key,
          material_profile_revision: lineActivation.material_profile_revision,
          material_quantity_base_units:
            lineActivation.material_quantity_base_units,
          material_base_unit: lineActivation.material_base_unit,
          idempotency_key: lineActivation.idempotency_key,
          request_fingerprint_sha256:
            lineActivation.request_fingerprint_sha256,
          activated_at: lineActivation.activated_at,
          label_snapshot: lineActivation.label_snapshot,
        },
        requestInput: {
          profile_id: profile.id,
          idempotency_key: input.idempotencyKey,
          request_fingerprint_sha256: input.requestFingerprintSha256,
          accepted_at: new Date(),
        },
      })
    }

    const { order, item } = await retrieveOwnedPurchasedOrderItem({
      container,
      customerId: input.customerId,
      orderId: input.orderId,
      lineItemId: input.lineItemId,
    })

    if (
      !order.sales_channel_id ||
      !input.eligibleSalesChannelIds.includes(order.sales_channel_id)
    ) {
      conflict("unsupported_order_source")
    }

    const quantity = evaluateEligibleCommerceQuantity(
      quantityDetail(item),
      order.status === "canceled" || Boolean(order.canceled_at),
    )

    if (!quantity.eligible) {
      conflict(quantity.reason)
    }

    if (!item.variant_id) {
      conflict("material_profile_unavailable")
    }

    const activationTime = new Date()
    const materialProfile = await materialProfileForVariant(
      container.resolve(RESEARCH_CONTENT_MODULE),
      item.variant_id,
      activationTime,
    )

    if (!materialProfile) {
      conflict("material_profile_unavailable")
    }

    const initialQuantity = calculateInitialSupplyBaseUnits(
      quantity.commerceQuantity,
      materialProfile.materialQuantityBaseUnits,
    )

    if (!initialQuantity) {
      conflict("quantity_unavailable")
    }

    const [trackedMaterial] = await service.listTrackedMaterials(
      { profile_id: profile.id, product_variant_id: item.variant_id },
      { take: 1 },
    )

    if (trackedMaterial?.status === "archived") {
      conflict("archived_material_action_required")
    }

    const label = normalizeActivationLabel(
      item.title || item.variant_title || item.variant_sku || "",
    )

    return new StepResponse<PreparedPurchasedSupplyActivation>({
      shouldCreate: true,
      shouldRecordRequest: true,
      existingProjection: null,
      profileId: profile.id,
      productVariantId: item.variant_id,
      trackedMaterialId: trackedMaterial?.id ?? null,
      materialLockKey: `research-material:${profile.id}:${item.variant_id}`,
      trackedMaterialInput: {
        profile_id: profile.id,
        product_variant_id: item.variant_id,
        label,
        source: "purchased",
        status: "active",
        activated_at: activationTime,
      },
      supplyInput: {
        source_order_line_item_id: input.lineItemId,
        initial_quantity_base_units: initialQuantity,
        remaining_quantity_base_units: initialQuantity,
        base_unit: materialProfile.materialBaseUnit,
        acquired_at: activationTime,
        lot_number: null,
        batch_number: null,
        expires_at: null,
        storage_note: null,
        status: "active",
      },
      activationInput: {
        profile_id: profile.id,
        source_order_id: input.orderId,
        source_order_line_item_id: input.lineItemId,
        source_product_variant_id: item.variant_id,
        eligible_commerce_quantity: quantity.commerceQuantity,
        material_profile_key: materialProfile.profileKey,
        material_profile_revision: materialProfile.revision,
        material_quantity_base_units:
          materialProfile.materialQuantityBaseUnits,
        material_base_unit: materialProfile.materialBaseUnit,
        idempotency_key: input.idempotencyKey,
        request_fingerprint_sha256: input.requestFingerprintSha256,
        activated_at: activationTime,
        label_snapshot: label,
      },
      requestInput: {
        profile_id: profile.id,
        idempotency_key: input.idempotencyKey,
        request_fingerprint_sha256: input.requestFingerprintSha256,
        accepted_at: activationTime,
      },
    })
  },
)

export const createPurchasedTrackedMaterialStep = createStep(
  "create-purchased-tracked-material",
  async (input: TrackedMaterialInput, { container }) => {
    const created = await trackingService(container).createTrackedMaterials(input)

    return new StepResponse(created, created.id)
  },
  async (createdId: string | undefined, { container }) => {
    if (createdId) {
      await trackingService(container).deleteTrackedMaterials(createdId)
    }
  },
)

type PersistPurchasedSupplyActivationInput = {
  prepared: PreparedPurchasedSupplyActivation
  trackedMaterialId: string
}

type PersistPurchasedSupplyActivationCompensation =
  | { kind: "created"; requestId: string; activationId: string; supplyId: string }
  | { kind: "request"; requestId: string }
  | { kind: "none" }

async function retrieveActivationForRequest(
  service: ResearchTrackingModuleService,
  input: PersistPurchasedSupplyActivationInput,
): Promise<ResearchSupplyActivationProjection | null> {
  const [request] = await service.listResearchSupplyActivationRequests(
    {
      profile_id: input.prepared.profileId,
      idempotency_key: input.prepared.requestInput.idempotency_key,
    },
    { take: 1 },
  )

  if (!request) {
    return null
  }

  try {
    assertActivationFingerprint(
      request.request_fingerprint_sha256,
      input.prepared.requestInput.request_fingerprint_sha256,
    )
  } catch {
    conflict("idempotency_key_conflict")
  }

  const activation = await service.retrieveResearchSupplyActivation(
    request.activation_id,
  )

  if (
    activation.source_order_id !== input.prepared.activationInput.source_order_id ||
    activation.source_order_line_item_id !==
      input.prepared.activationInput.source_order_line_item_id
  ) {
    conflict("idempotency_key_conflict")
  }

  return activationProjectionById(service, activation.id)
}

async function recordAcceptedActivationRequest(input: {
  service: ResearchTrackingModuleService
  prepared: PreparedPurchasedSupplyActivation
  activationId: string
}) {
  try {
    return await input.service.createResearchSupplyActivationRequests({
      ...input.prepared.requestInput,
      activation_id: input.activationId,
    })
  } catch (error) {
    const projection = await retrieveActivationForRequest(input.service, {
      prepared: input.prepared,
      trackedMaterialId: input.prepared.trackedMaterialId ?? "",
    })

    if (projection) {
      return null
    }

    throw error
  }
}

export const persistPurchasedSupplyActivationStep = createStep(
  "persist-purchased-supply-activation",
  async (input: PersistPurchasedSupplyActivationInput, { container }) => {
    const service = trackingService(container)
    const replay = await retrieveActivationForRequest(service, input)

    if (replay) {
      return new StepResponse(
        { created: false, activation: replay },
        { kind: "none" as const },
      )
    }

    if (input.prepared.existingProjection) {
      const request = await recordAcceptedActivationRequest({
        service,
        prepared: input.prepared,
        activationId: input.prepared.existingProjection.activation_id,
      })

      return new StepResponse(
        { created: false, activation: input.prepared.existingProjection },
        request
          ? { kind: "request" as const, requestId: request.id }
          : { kind: "none" as const },
      )
    }

    try {
      const created = await service.createPurchasedSupplyActivation({
        supply: {
          ...input.prepared.supplyInput,
          tracked_material_id: input.trackedMaterialId,
        },
        activation: {
          ...input.prepared.activationInput,
          tracked_material_id: input.trackedMaterialId,
        },
        request: input.prepared.requestInput,
      })
      const projection = projectResearchSupplyActivation({
        activation: {
          ...created.activation,
          tracked_material_id: input.trackedMaterialId,
        },
        supply: created.supply,
      })

      return new StepResponse(
        { created: true, activation: projection },
        {
          kind: "created" as const,
          requestId: created.request.id,
          activationId: created.activation.id,
          supplyId: created.supply.id,
        },
      )
    } catch (error) {
      const lineReplay = await existingActivationProjection(
        service,
        input.prepared.profileId,
        input.prepared.activationInput.source_order_line_item_id,
      )

      if (!lineReplay) {
        throw error
      }

      const request = await recordAcceptedActivationRequest({
        service,
        prepared: input.prepared,
        activationId: lineReplay.activation_id,
      })

      return new StepResponse(
        { created: false, activation: lineReplay },
        request
          ? { kind: "request" as const, requestId: request.id }
          : { kind: "none" as const },
      )
    }
  },
  async (
    compensation: PersistPurchasedSupplyActivationCompensation,
    { container },
  ) => {
    if (compensation.kind === "none") {
      return
    }

    const service = trackingService(container)

    if (compensation.kind === "created") {
      await service.deletePurchasedSupplyActivation(compensation)
      return
    }

    await service.deleteResearchSupplyActivationRequests(compensation.requestId)
  },
)
