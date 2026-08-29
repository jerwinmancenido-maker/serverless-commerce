import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  createCompoundedProductRevisionStep,
  pointCompoundedProductPresentationToDraftStep,
  prepareCompoundedProductPresentationRevisionStep,
  type ReviseCompoundedProductPresentationWorkflowInput,
  validateCompoundedProductPresentationRevisionStep,
} from "./steps/revise-compounded-product-presentation"

export const reviseCompoundedProductPresentationWorkflow = createWorkflow(
  "revise-compounded-product-presentation",
  function (input: ReviseCompoundedProductPresentationWorkflowInput) {
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

    return new WorkflowResponse({
      presentation,
      current_revision: revision,
    })
  },
)

export default reviseCompoundedProductPresentationWorkflow
