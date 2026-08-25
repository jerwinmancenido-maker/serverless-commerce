import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import {
  decideManualPaymentProofReview,
  normalizeManualPaymentProofReview,
  type ManualPaymentProofEventType,
  type ReviewManualPaymentProofInput,
} from "../../modules/manual-payment/contracts/payment-proof"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"

type ReviewedProofResult = {
  proof: {
    id: string
    payment_session_id: string
    order_id: string
    revision: number
    status: "pending" | "approved" | "rejected" | "expired"
    file_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    checksum_sha256: string
  }
  eventType: ManualPaymentProofEventType | null
  actorId: string
  reason: string | null
}

type ReviewCompensation =
  | { noop: true }
  | {
      id: string
      status: "pending" | "approved" | "rejected" | "expired"
      reviewed_at: Date | null
      reviewed_by_actor_id: string | null
      rejection_reason: string | null
    }

export const validateManualPaymentProofReviewStep = createStep(
  "validate-manual-payment-proof-review",
  async (input: ReviewManualPaymentProofInput) =>
    new StepResponse(normalizeManualPaymentProofReview(input)),
)

export const reviewManualPaymentProofStep = createStep<
  ReviewManualPaymentProofInput,
  ReviewedProofResult,
  ReviewCompensation
>(
  "review-manual-payment-proof",
  async (input: ReviewManualPaymentProofInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    const proof = await service.retrieveManualPaymentProof(input.proofId)
    const reason = input.reason ?? null
    const transition = decideManualPaymentProofReview(
      {
        status: proof.status,
        rejectionReason: proof.rejection_reason,
      },
      input,
    )

    if (transition === "idempotent") {
      return new StepResponse(
        {
          proof,
          eventType: null,
          actorId: input.actorId,
          reason,
        },
        { noop: true },
      )
    }

    const compensation: ReviewCompensation = {
      id: proof.id,
      status: proof.status,
      reviewed_at: proof.reviewed_at,
      reviewed_by_actor_id: proof.reviewed_by_actor_id,
      rejection_reason: proof.rejection_reason,
    }
    const updated = await service.updateManualPaymentProofs({
      id: proof.id,
      status: input.decision,
      reviewed_at: new Date(),
      reviewed_by_actor_id: input.actorId,
      rejection_reason: reason,
    })

    return new StepResponse<ReviewedProofResult, ReviewCompensation>(
      {
        proof: updated,
        eventType: input.decision,
        actorId: input.actorId,
        reason,
      } satisfies ReviewedProofResult,
      compensation,
    )
  },
  async (compensation: ReviewCompensation, { container }) => {
    if ("noop" in compensation) {
      return
    }

    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    await service.updateManualPaymentProofs(compensation)
  },
)
