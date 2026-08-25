import { uploadFilesStep } from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { createManualPaymentProofEventStep } from "./steps/create-manual-payment-proof-event"
import {
  type CustomerManualPaymentProofInput,
  prepareCustomerManualPaymentProofStep,
} from "./steps/prepare-customer-manual-payment-proof"
import {
  upsertManualPaymentProofStep,
  validateManualPaymentProofSubmissionStep,
} from "./steps/submit-manual-payment-proof"

export const uploadCustomerManualPaymentProofWorkflow = createWorkflow(
  "upload-customer-manual-payment-proof",
  function (input: CustomerManualPaymentProofInput) {
    const prepared = prepareCustomerManualPaymentProofStep(input)
    const uploadInput = transform({ prepared }, ({ prepared }) => ({
      files: [prepared.upload],
    }))
    const changed = when(
      { prepared },
      ({ prepared }) => prepared.shouldUpload,
    ).then(() => {
      const files = uploadFilesStep(uploadInput)
      const submissionInput = transform(
        { files, prepared },
        ({ files, prepared }) => ({
          ...prepared.submission,
          fileId: files[0].id,
        }),
      )
      const validated =
        validateManualPaymentProofSubmissionStep(submissionInput)
      const submission = upsertManualPaymentProofStep(validated)
      const eventInput = transform({ submission }, ({ submission }) => ({
        proof: submission.proof,
        eventType: submission.eventType,
        actorId: submission.actorId,
      }))
      const event = createManualPaymentProofEventStep(eventInput)

      return transform({ submission, event }, ({ submission, event }) => ({
        proof: submission.proof,
        event,
      }))
    })
    const result = transform(
      { prepared, changed },
      ({ prepared, changed }) => ({
        proof: changed?.proof ?? prepared.existingProof,
        event: changed?.event ?? null,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export default uploadCustomerManualPaymentProofWorkflow
