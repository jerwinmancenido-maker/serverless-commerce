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

    return new WorkflowResponse({
      presentation: updatedPresentation,
      current_revision: revision,
    })
  },
)

export default createCompoundedProductPresentationWorkflow
