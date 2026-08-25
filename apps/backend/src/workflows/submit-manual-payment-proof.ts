import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import type { SubmitManualPaymentProofInput } from "../modules/manual-payment/contracts/payment-proof"
import { createManualPaymentProofEventStep } from "./steps/create-manual-payment-proof-event"
import {
  upsertManualPaymentProofStep,
  validateManualPaymentProofSubmissionStep,
} from "./steps/submit-manual-payment-proof"

export const submitManualPaymentProofWorkflow = createWorkflow(
  "submit-manual-payment-proof",
  function (input: SubmitManualPaymentProofInput) {
    const validated = validateManualPaymentProofSubmissionStep(input)
    const submission = upsertManualPaymentProofStep(validated)
    const eventInput = transform({ submission }, ({ submission }) => ({
      proof: submission.proof,
      eventType: submission.eventType,
      actorId: submission.actorId,
    }))
    const event = createManualPaymentProofEventStep(eventInput)
    const result = transform(
      { submission, event },
      ({ submission, event }) => ({
        proof: submission.proof,
        event,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export default submitManualPaymentProofWorkflow
