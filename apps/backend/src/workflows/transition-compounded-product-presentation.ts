import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  prepareCompoundedProductPresentationTransitionStep,
  supersedePreviousCompoundedProductRevisionStep,
  transitionCompoundedProductPresentationRecordStep,
  transitionCompoundedProductRevisionStep,
  type TransitionCompoundedProductPresentationWorkflowInput,
} from "./steps/transition-compounded-product-presentation"

export const transitionCompoundedProductPresentationWorkflow = createWorkflow(
  "transition-compounded-product-presentation",
  function (input: TransitionCompoundedProductPresentationWorkflowInput) {
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

    return new WorkflowResponse({
      presentation,
      current_revision: revision,
    })
  },
)

export default transitionCompoundedProductPresentationWorkflow
