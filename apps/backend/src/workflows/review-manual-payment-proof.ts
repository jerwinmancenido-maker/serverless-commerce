import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import type { ReviewManualPaymentProofInput } from "../modules/manual-payment/contracts/payment-proof"
import { createManualPaymentProofEventStep } from "./steps/create-manual-payment-proof-event"
import {
  reviewManualPaymentProofStep,
  validateManualPaymentProofReviewStep,
} from "./steps/review-manual-payment-proof"

export const reviewManualPaymentProofWorkflow = createWorkflow(
  "review-manual-payment-proof",
  function (input: ReviewManualPaymentProofInput) {
    const validated = validateManualPaymentProofReviewStep(input)
    const review = reviewManualPaymentProofStep(validated)
    const eventInput = transform({ review }, ({ review }) => ({
      proof: review.proof,
      eventType: review.eventType,
      actorId: review.actorId,
      reason: review.reason,
    }))
    const event = createManualPaymentProofEventStep(eventInput)
    const result = transform({ review, event }, ({ review, event }) => ({
      proof: review.proof,
      event,
    }))

    return new WorkflowResponse(result)
  },
)

export default reviewManualPaymentProofWorkflow
