import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  createCompoundedProductPresentationRecordStep,
  createCompoundedProductPresentationRevisionStep,
  setCompoundedProductCurrentRevisionStep,
  type CreateCompoundedProductPresentationWorkflowInput,
  validateCompoundedProductPresentationStep,
} from "./steps/create-compounded-product-presentation"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const createCompoundedProductPresentationWorkflow = createWorkflow(
  "create-compounded-product-presentation",
  function (input: CreateCompoundedProductPresentationWorkflowInput) {
    const validated = validateCompoundedProductPresentationStep(input)
    const presentation = createCompoundedProductPresentationRecordStep(validated)
    const revisionInput = transform(
      { presentation, validated },
      ({ presentation, validated }) => ({
        presentationId: presentation.id,
        snapshot: validated.snapshot,
        actorId: validated.actorId,
      }),
    )
    const revision = createCompoundedProductPresentationRevisionStep(revisionInput)
    const pointerInput = transform(
      { presentation, revision },
      ({ presentation, revision }) => ({
        presentationId: presentation.id,
        revisionId: revision.id,
      }),
    )
    const updatedPresentation =
      setCompoundedProductCurrentRevisionStep(pointerInput)
    const auditInput = transform(
      { input, updatedPresentation, revision },
      ({ input, updatedPresentation, revision }) => [
        {
          event_type: "configuration_created" as const,
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: null,
          variant_id: null,
          presentation_id: updatedPresentation.id,
          presentation_revision_id: revision.id,
          registration_id: null,
          correlation_id: null,
          decision: {
            key: updatedPresentation.key,
            revision: revision.revision,
            fingerprint: revision.fingerprint,
          },
        },
      ],
    )
    createCompoundedProductGovernanceAuditEventsStep(auditInput)

    return new WorkflowResponse({
      presentation: updatedPresentation,
      current_revision: revision,
    })
  },
)

export default createCompoundedProductPresentationWorkflow
