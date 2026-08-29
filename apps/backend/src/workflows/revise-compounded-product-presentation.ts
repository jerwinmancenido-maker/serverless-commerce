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
  createCompoundedProductRevisionStep,
  pointCompoundedProductPresentationToDraftStep,
  prepareCompoundedProductPresentationRevisionStep,
  type ReviseCompoundedProductPresentationWorkflowInput,
  validateCompoundedProductPresentationRevisionStep,
} from "./steps/revise-compounded-product-presentation"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const reviseCompoundedProductPresentationWorkflow = createWorkflow(
  "revise-compounded-product-presentation",
  function (input: ReviseCompoundedProductPresentationWorkflowInput) {
    const revisionLockInput = transform({ input }, ({ input }) => ({
      key: `compounded-product-config-revision:${input.expected_current_revision_id}`,
      timeout: 10,
      ttl: 120,
    }))

    acquireLockStep(revisionLockInput)
    const validated = validateCompoundedProductPresentationRevisionStep(input)
    const prepared = prepareCompoundedProductPresentationRevisionStep(validated)
    const revision = createCompoundedProductRevisionStep(prepared)
    const pointerInput = transform(
      { prepared, revision },
      ({ prepared, revision }) => ({
        presentationId: prepared.presentationId,
        revisionId: revision.id,
        nextRevision: prepared.nextRevision,
        previousStatus: prepared.previousStatus,
        previousRevisionId: prepared.previousRevisionId,
        previousLatestRevision: prepared.previousLatestRevision,
      }),
    )
    const presentation =
      pointCompoundedProductPresentationToDraftStep(pointerInput)

    const auditInput = transform(
      { input, presentation, revision },
      ({ input, presentation, revision }) => [
        {
          event_type: "configuration_revised" as const,
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: null,
          variant_id: null,
          presentation_id: presentation.id,
          presentation_revision_id: revision.id,
          registration_id: null,
          correlation_id: null,
          decision: {
            revision: revision.revision,
            fingerprint: revision.fingerprint,
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

export default reviseCompoundedProductPresentationWorkflow
