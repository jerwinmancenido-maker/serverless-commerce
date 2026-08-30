import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  createProductsWorkflow,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  claimCompoundedProductCreationStep,
  completeCompoundedProductCreationStep,
  prepareCompoundedProductDraftStep,
  registerCompoundedProductDraftStep,
  type CreateCompoundedProductDraftWorkflowInput,
} from "./steps/create-compounded-product-draft"
import applyConfiguredCompoundedProductRecipesWorkflow from "./apply-configured-compounded-product-recipes"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const createCompoundedProductDraftWorkflow = createWorkflow(
  "create-compounded-product-draft",
  function (input: CreateCompoundedProductDraftWorkflowInput) {
    const configurationLockInput = transform({ input }, ({ input }) => ({
      key: `compounded-product-config-revision:${input.presentation_revision_id}`,
      timeout: 10,
      ttl: 120,
    }))

    acquireLockStep(configurationLockInput).config({
      name: "acquire-compounded-product-configuration-lock",
    })
    const prepared = prepareCompoundedProductDraftStep(input)
    const lockInput = transform({ prepared }, ({ prepared }) => ({
      key: `compounded-product-create:${prepared.request.idempotency_key}`,
      timeout: 10,
      ttl: 120,
    }))

    acquireLockStep(lockInput)
    const claim = claimCompoundedProductCreationStep(prepared)
    const nativeInput = transform({ prepared, claim }, ({ prepared, claim }) => ({
      products: [prepared.nativeProduct],
      additional_data: {
        compounded_product_creation_request_id: claim.request.id,
      },
    }))
    const createdProducts = when(
      "create-native-compounded-product",
      { claim },
      ({ claim }) => claim.action === "create",
    ).then(() => createProductsWorkflow.runAsStep({ input: nativeInput }))
    const registrationInput = transform(
      { createdProducts, prepared },
      ({ createdProducts, prepared }) => ({
        nativeProductId: createdProducts?.[0]?.id || "",
        prepared,
      }),
    )
    const registration = when(
      "register-native-compounded-product",
      { claim },
      ({ claim }) => claim.action === "create",
    ).then(() => registerCompoundedProductDraftStep(registrationInput))
    const recipeInput = transform(
      { createdProducts, prepared, registration },
      ({ createdProducts, prepared, registration }) => ({
        productId: createdProducts?.[0]?.id || "",
        registrationId: registration?.id || "",
        presentationRevisionId: prepared.presentationRevisionId,
        actorId: prepared.actorId,
        snapshot: prepared.configurationSnapshot,
        matrix: prepared.matrix,
      }),
    )
    const configuredRecipes = when(
      "apply-configured-compounded-product-recipes",
      { claim },
      ({ claim }) => claim.action === "create",
    ).then(() =>
      applyConfiguredCompoundedProductRecipesWorkflow.runAsStep({
        input: recipeInput,
      }),
    )
    const completionInput = transform(
      { claim, configuredRecipes, createdProducts, registration, prepared },
      ({ claim, createdProducts, registration, prepared }) => ({
        requestId: claim.request.id,
        nativeProductId: createdProducts?.[0]?.id || "",
        registrationId: registration?.id || "",
        variantCount: prepared.matrix.resultingVariantCount,
        matrixFingerprint: prepared.matrix.fingerprint,
      }),
    )
    const completed = when(
      "complete-compounded-product-creation",
      { claim },
      ({ claim }) => claim.action === "create",
    ).then(() => completeCompoundedProductCreationStep(completionInput))
    const auditInput = transform(
      { claim, completed, prepared, registration },
      ({ claim, completed, prepared, registration }) => {
        if (claim.action !== "create" || !completed || !registration) {
          return []
        }

        const common = {
          outcome: "succeeded" as const,
          actor_id: prepared.actorId,
          product_id: completed.responsePayload.product_id,
          variant_id: null,
          presentation_id: null,
          presentation_revision_id: prepared.presentationRevisionId,
          registration_id: registration.id,
          correlation_id: prepared.request.idempotency_key,
        }
        const draftEvent = {
          ...common,
          event_type: "product_draft_created" as const,
          decision: {
            variant_count: prepared.matrix.resultingVariantCount,
            matrix_fingerprint: prepared.matrix.fingerprint,
            product_status: "draft",
          },
        }
        const registrationEvent = {
          ...common,
          event_type: "governed_registration_created" as const,
          decision: {
            catalog_kind: registration.catalog_kind,
            governed_product_type_id:
              registration.governed_product_type_id,
            contract_schema_version: registration.contract_schema_version,
            configuration_fingerprint:
              registration.configuration_fingerprint,
            readiness_policy_revision:
              registration.readiness_policy_revision,
          },
        }

        const revisionDecisionEvent = prepared.revisionResolution
          ? {
              ...common,
              event_type:
                prepared.revisionResolution.action === "retain"
                  ? ("configuration_revision_retained" as const)
                  : ("configuration_revision_migrated" as const),
              decision: {
                action: prepared.revisionResolution.action,
                from_revision_id:
                  prepared.revisionResolution.from_revision_id,
                to_revision_id: prepared.revisionResolution.to_revision_id,
                impact_fingerprint:
                  prepared.revisionResolution.impact_fingerprint,
                reason: prepared.revisionResolution.reason,
                payload_fingerprint: prepared.payloadFingerprint,
              },
            }
          : null

        const baseEvents = revisionDecisionEvent
          ? [revisionDecisionEvent, registrationEvent, draftEvent]
          : [registrationEvent, draftEvent]

        if (!prepared.matrix.requiresConfirmation) {
          return baseEvents
        }

        return [
          {
            ...common,
            event_type: "large_matrix_confirmed" as const,
            decision: {
              variant_count: prepared.matrix.resultingVariantCount,
              matrix_fingerprint: prepared.matrix.fingerprint,
              warning_threshold:
                prepared.configurationSnapshot.variant_warning_threshold,
            },
          },
          ...baseEvents,
        ]
      },
    )
    createCompoundedProductGovernanceAuditEventsStep(auditInput)
    releaseLockStep(lockInput)
    releaseLockStep(configurationLockInput).config({
      name: "release-compounded-product-configuration-lock",
    })

    const response = transform(
      { claim, completed },
      ({ claim, completed }) => ({
        replayed: claim.action === "replay",
        result:
          completed?.responsePayload || claim.request.response_payload || null,
      }),
    )

    return new WorkflowResponse(response)
  },
)

export default createCompoundedProductDraftWorkflow
