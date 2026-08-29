import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  prepareCompoundedProductPresentationTransitionStep,
  supersedePreviousCompoundedProductRevisionStep,
  transitionCompoundedProductPresentationRecordStep,
  transitionCompoundedProductRevisionStep,
  type TransitionCompoundedProductPresentationWorkflowInput,
} from "./steps/transition-compounded-product-presentation"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const transitionCompoundedProductPresentationWorkflow = createWorkflow(
  "transition-compounded-product-presentation",
  function (input: TransitionCompoundedProductPresentationWorkflowInput) {
    const revisionLockInput = transform({ input }, ({ input }) => ({
      key: `compounded-product-config-revision:${input.expected_current_revision_id}`,
      timeout: 10,
      ttl: 120,
    }))

    acquireLockStep(revisionLockInput)
    const prepared = prepareCompoundedProductPresentationTransitionStep(input)
    const revision = transitionCompoundedProductRevisionStep(prepared)
    const supersedeInput = transform(
      { prepared, revision },
      ({ prepared }) => ({
        previousActive: prepared.previousActive,
        target_status: prepared.target_status,
      }),
    )
    const superseded =
      supersedePreviousCompoundedProductRevisionStep(supersedeInput)
    const presentationInput = transform(
      { prepared, revision, superseded },
      ({ prepared }) => ({
        presentationId: prepared.presentationId,
        target_status: prepared.target_status,
        previousPresentationStatus: prepared.previousPresentationStatus,
      }),
    )
    const presentation =
      transitionCompoundedProductPresentationRecordStep(presentationInput)

    const auditInput = transform(
      { input, presentation, revision },
      ({ input, presentation, revision }) => [
        {
          event_type: "configuration_status_transitioned" as const,
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: null,
          variant_id: null,
          presentation_id: presentation.id,
          presentation_revision_id: revision.id,
          registration_id: null,
          correlation_id: null,
          decision: {
            target_status: input.target_status,
            reason: input.reason,
          },
        },
      ],
    )
    releaseLockStep(revisionLockInput)
    createCompoundedProductGovernanceAuditEventsStep(auditInput)

    return new WorkflowResponse({
      presentation,
      current_revision: revision,
    })
  },
)

export default transitionCompoundedProductPresentationWorkflow
