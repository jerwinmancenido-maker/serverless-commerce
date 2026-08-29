import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import { fingerprintCompoundedProductConfiguration } from "../../modules/compounded-product/configuration-fingerprint"
import { validateCompoundedProductRevisionDecision } from "../../modules/compounded-product/configuration-revision-impact"
import {
  AdminCreateCompoundedProductDraft,
  type AdminCreateCompoundedProductDraft as AdminCreateCompoundedProductDraftInput,
} from "../../modules/compounded-product/contracts/product-creation"
import { CompoundedProductPresentationSnapshot } from "../../modules/compounded-product/contracts/configuration"
import {
  createCompoundedProductCreationPayloadFingerprint,
  resolveCompoundedProductCreationRequest,
  type CompoundedProductCreationRequestRecord,
} from "../../modules/compounded-product/product-creation-idempotency"
import { prepareCompoundedProductDraft } from "../../modules/compounded-product/prepare-product-draft"
import { resolveCompoundedProductVariantServerMaximum } from "../../modules/compounded-product/readiness-policy"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type CreateCompoundedProductDraftWorkflowInput =
  AdminCreateCompoundedProductDraftInput & {
    actorId: string
  }

export type PreparedCompoundedProductDraftWorkflowInput = ReturnType<
  typeof prepareCompoundedProductDraft
> & {
  request: AdminCreateCompoundedProductDraftInput
  actorId: string
  presentationRevisionId: string
  configurationSnapshot: CompoundedProductPresentationSnapshot
  configurationFingerprint: string
  payloadFingerprint: string
  readinessPolicy: {
    revision: string
    snapshot: CompoundedProductPresentationSnapshot["readiness_policy"]
  }
  revisionResolution:
    AdminCreateCompoundedProductDraftInput["configuration_revision_resolution"]
}

export type ClaimedCompoundedProductCreation = {
  action: "create" | "replay"
  request: CompoundedProductCreationRequestRecord
  createdClaim: boolean
}

type ClaimCompensation = { requestId: string | null }

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function unexpected(message: string): never {
  throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
}

function asCreationRequest(
  value: unknown,
): CompoundedProductCreationRequestRecord {
  return value as CompoundedProductCreationRequestRecord
}

export const prepareCompoundedProductDraftStep = createStep(
  "prepare-compounded-product-draft",
  async (rawInput: CreateCompoundedProductDraftWorkflowInput, { container }) => {
    const { actorId, ...requestInput } = rawInput
    const request = AdminCreateCompoundedProductDraft.parse(requestInput)

    if (!actorId?.trim()) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Authenticated Admin actor is required",
      )
    }
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [revision] = await service.listPresentationConfigurationRevisions(
      { id: request.presentation_revision_id },
      { take: 1 },
    )

    if (!revision) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Compounded product presentation revision was not found",
      )
    }

    const [presentation] =
      await service.listPresentationConfigurations(
        { id: revision.presentation_id },
        { take: 1 },
      )

    if (!presentation || !presentation.current_revision_id) {
      conflict("configuration_revision_presentation_inactive")
    }

    const [currentRevision] =
      await service.listPresentationConfigurationRevisions(
        { id: presentation.current_revision_id },
        { take: 1 },
      )

    if (
      presentation.status !== "active" ||
      !currentRevision ||
      currentRevision.status !== "active"
    ) {
      conflict("configuration_revision_presentation_inactive")
    }

    let decisionFromRevision: typeof revision | null = null
    const resolution = request.configuration_revision_resolution

    if (
      resolution?.action === "migrate" &&
      resolution.from_revision_id !== revision.id
    ) {
      const [fromRevision] =
        await service.listPresentationConfigurationRevisions(
          { id: resolution.from_revision_id },
          { take: 1 },
        )
      decisionFromRevision = fromRevision || null
    }

    const revisionResolution = validateCompoundedProductRevisionDecision({
      requestedRevision: revision,
      currentRevision,
      decisionFromRevision,
      resolution,
    })

    const configurationSnapshot = CompoundedProductPresentationSnapshot.parse(
      revision.snapshot,
    )
    const configurationFingerprint =
      fingerprintCompoundedProductConfiguration(configurationSnapshot)

    if (
      configurationFingerprint !== revision.fingerprint ||
      request.expected_configuration_fingerprint !== revision.fingerprint
    ) {
      conflict("configuration_revision_changed")
    }

    const readinessPolicy = {
      revision: revision.id,
      snapshot: configurationSnapshot.readiness_policy,
    }

    if (request.product.type_id) {
      const [classificationMapping] =
        await service.listGovernedProductTypeMappings(
          {
            product_type_id: request.product.type_id,
            presentation_id: revision.presentation_id,
            status: "active",
          },
          { take: 1 },
        )

      if (!classificationMapping) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "The selected product type is not governed by this presentation",
        )
      }
    }
    const prepared = prepareCompoundedProductDraft({
      request,
      snapshot: configurationSnapshot,
      configurationFingerprint,
      serverMaximum: resolveCompoundedProductVariantServerMaximum(),
    })
    const { idempotency_key: _idempotencyKey, ...fingerprintedRequest } = request
    const payloadFingerprint =
      createCompoundedProductCreationPayloadFingerprint({
        request: fingerprintedRequest,
        configuration_fingerprint: configurationFingerprint,
        readiness_policy_revision: readinessPolicy.revision,
        readiness_policy_snapshot: readinessPolicy.snapshot,
      })

    return new StepResponse<PreparedCompoundedProductDraftWorkflowInput>({
      ...prepared,
      request,
      actorId,
      presentationRevisionId: revision.id,
      configurationSnapshot,
      configurationFingerprint,
      payloadFingerprint,
      readinessPolicy,
      revisionResolution,
    })
  },
)

export const claimCompoundedProductCreationStep = createStep(
  "claim-compounded-product-creation",
  async (
    input: PreparedCompoundedProductDraftWorkflowInput,
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const findExisting = async () => {
      const [existing] = await service.listProductCreationRequests(
        {
          operation: "create_product",
          idempotency_key: input.request.idempotency_key,
        },
        { take: 1 },
      )

      return existing ? asCreationRequest(existing) : null
    }
    let existing = await findExisting()

    if (existing) {
      if (existing.actor_id !== input.actorId) {
        conflict("idempotency_key_actor_conflict")
      }

      const resolution = resolveCompoundedProductCreationRequest(
        existing,
        input.payloadFingerprint,
      )

      if (resolution.action === "replay") {
        return new StepResponse<
          ClaimedCompoundedProductCreation,
          ClaimCompensation
        >(
          {
            action: "replay",
            request: resolution.request,
            createdClaim: false,
          },
          { requestId: null },
        )
      }

      conflict(`idempotency_request_${resolution.action}`)
    }

    try {
      const request = await service.createProductCreationRequests({
        operation: "create_product",
        idempotency_key: input.request.idempotency_key,
        request_fingerprint_sha256: input.payloadFingerprint,
        status: "in_progress",
        actor_id: input.actorId,
        native_product_id: null,
        response_payload: null,
        error_code: null,
        completed_at: null,
        failed_at: null,
      })

      return new StepResponse<
        ClaimedCompoundedProductCreation,
        ClaimCompensation
      >(
        {
          action: "create",
          request: asCreationRequest(request),
          createdClaim: true,
        },
        { requestId: request.id },
      )
    } catch (error) {
      existing = await findExisting()

      if (!existing) {
        throw error
      }

      if (existing.actor_id !== input.actorId) {
        conflict("idempotency_key_actor_conflict")
      }

      const resolution = resolveCompoundedProductCreationRequest(
        existing,
        input.payloadFingerprint,
      )

      if (resolution.action === "replay") {
        return new StepResponse<
          ClaimedCompoundedProductCreation,
          ClaimCompensation
        >(
          {
            action: "replay",
            request: resolution.request,
            createdClaim: false,
          },
          { requestId: null },
        )
      }

      conflict(`idempotency_request_${resolution.action}`)
    }
  },
  async (compensation: ClaimCompensation | undefined, { container }) => {
    if (!compensation?.requestId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [request] = await service.listProductCreationRequests(
      { id: compensation.requestId },
      { take: 1 },
    )

    if (request?.status === "in_progress") {
      await service.updateProductCreationRequests({
        id: request.id,
        status: "failed",
        native_product_id: null,
        response_payload: null,
        error_code: "workflow_compensated",
        completed_at: null,
        failed_at: new Date(),
      })
    }
  },
)

export const registerCompoundedProductDraftStep = createStep(
  "register-compounded-product-draft",
  async (
    input: {
      nativeProductId: string
      prepared: PreparedCompoundedProductDraftWorkflowInput
    },
    { container },
  ) => {
    if (!input.nativeProductId) {
      unexpected("Native product creation did not return a product ID")
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const registration = await service.createGovernedProductRegistrations({
      product_id: input.nativeProductId,
      governed_product_type_id: input.prepared.request.product.type_id,
      catalog_kind: "compounded",
      contract_schema_version: "1",
      configuration_snapshot: input.prepared.configurationSnapshot,
      configuration_fingerprint: input.prepared.configurationFingerprint,
      readiness_policy_revision: input.prepared.readinessPolicy.revision,
      readiness_policy_snapshot: input.prepared.readinessPolicy.snapshot,
      state: "draft",
      created_by_actor_id: input.prepared.actorId,
      updated_by_actor_id: input.prepared.actorId,
      published_at: null,
      withdrawn_at: null,
      presentation_revision_id: input.prepared.presentationRevisionId,
    })

    return new StepResponse(registration, registration.id)
  },
  async (registrationId: string | undefined, { container }) => {
    if (!registrationId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deleteGovernedProductRegistrations(registrationId)
  },
)

export const completeCompoundedProductCreationStep = createStep(
  "complete-compounded-product-creation",
  async (
    input: {
      requestId: string
      nativeProductId: string
      registrationId: string
      variantCount: number
      matrixFingerprint: string
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const responsePayload = {
      product_id: input.nativeProductId,
      registration_id: input.registrationId,
      product_status: "draft",
      variant_count: input.variantCount,
      matrix_fingerprint: input.matrixFingerprint,
    }
    const request = await service.updateProductCreationRequests({
      id: input.requestId,
      status: "succeeded",
      native_product_id: input.nativeProductId,
      response_payload: responsePayload,
      error_code: null,
      completed_at: new Date(),
      failed_at: null,
    })

    return new StepResponse(
      { request, responsePayload },
      { requestId: request.id },
    )
  },
  async (
    compensation: { requestId: string } | undefined,
    { container },
  ) => {
    if (!compensation?.requestId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [request] = await service.listProductCreationRequests(
      { id: compensation.requestId },
      { take: 1 },
    )

    if (request?.status === "succeeded") {
      await service.updateProductCreationRequests({
        id: request.id,
        status: "in_progress",
        native_product_id: null,
        response_payload: null,
        error_code: null,
        completed_at: null,
        failed_at: null,
      })
    }
  },
)
