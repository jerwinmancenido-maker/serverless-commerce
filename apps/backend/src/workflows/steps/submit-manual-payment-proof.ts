import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import {
  decideManualPaymentProofSubmission,
  normalizeManualPaymentProofSubmission,
  type ManualPaymentProofEventType,
  type SubmitManualPaymentProofInput,
} from "../../modules/manual-payment/contracts/payment-proof"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"

type ProofValues = {
  payment_session_id: string
  order_id: string
  customer_id: string
  provider_id: string
  file_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  checksum_sha256: string
  status: "pending" | "approved" | "rejected" | "expired"
  revision: number
  submitted_at: Date
  expires_at: Date | null
  reviewed_at: Date | null
  submitted_by_actor_id: string
  reviewed_by_actor_id: string | null
  rejection_reason: string | null
}

type ExistingProof = ProofValues & {
  id: string
}

type SubmitProofResult = {
  proof: ExistingProof
  eventType: ManualPaymentProofEventType | null
  actorId: string
}

type SubmitProofCompensation = {
  createdId?: string
  previous?: ExistingProof
}

function snapshotProof(proof: ExistingProof): ExistingProof {
  return {
    id: proof.id,
    payment_session_id: proof.payment_session_id,
    order_id: proof.order_id,
    customer_id: proof.customer_id,
    provider_id: proof.provider_id,
    file_id: proof.file_id,
    file_name: proof.file_name,
    mime_type: proof.mime_type,
    size_bytes: proof.size_bytes,
    checksum_sha256: proof.checksum_sha256,
    status: proof.status,
    revision: proof.revision,
    submitted_at: proof.submitted_at,
    expires_at: proof.expires_at,
    reviewed_at: proof.reviewed_at,
    submitted_by_actor_id: proof.submitted_by_actor_id,
    reviewed_by_actor_id: proof.reviewed_by_actor_id,
    rejection_reason: proof.rejection_reason,
  }
}

export const validateManualPaymentProofSubmissionStep = createStep(
  "validate-manual-payment-proof-submission",
  async (input: SubmitManualPaymentProofInput) =>
    new StepResponse(normalizeManualPaymentProofSubmission(input)),
)

export const upsertManualPaymentProofStep = createStep<
  SubmitManualPaymentProofInput,
  SubmitProofResult,
  SubmitProofCompensation
>(
  "upsert-manual-payment-proof",
  async (input: SubmitManualPaymentProofInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    const [existing] = await service.listManualPaymentProofs(
      { payment_session_id: input.paymentSessionId },
      { take: 1 },
    )

    if (existing) {
      const transition = decideManualPaymentProofSubmission(
        {
          status: existing.status,
          fileId: existing.file_id,
          checksumSha256: existing.checksum_sha256,
        },
        input,
      )

      if (transition === "idempotent") {
        return new StepResponse(
          {
            proof: existing,
            eventType: null,
            actorId: input.actorId,
          },
          {},
        )
      }

      const previous = snapshotProof(existing)
      const updated = await service.updateManualPaymentProofs({
        id: existing.id,
        order_id: input.orderId,
        customer_id: input.customerId,
        provider_id: input.providerId,
        file_id: input.fileId,
        file_name: input.fileName,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        checksum_sha256: input.checksumSha256,
        status: "pending",
        revision: existing.revision + 1,
        submitted_at: new Date(),
        reviewed_at: null,
        submitted_by_actor_id: input.actorId,
        reviewed_by_actor_id: null,
        rejection_reason: null,
      })

      return new StepResponse<SubmitProofResult, SubmitProofCompensation>(
        {
          proof: updated,
          eventType: "resubmitted",
          actorId: input.actorId,
        } satisfies SubmitProofResult,
        { previous } satisfies SubmitProofCompensation,
      )
    }

    const created = await service.createManualPaymentProofs({
      payment_session_id: input.paymentSessionId,
      order_id: input.orderId,
      customer_id: input.customerId,
      provider_id: input.providerId,
      file_id: input.fileId,
      file_name: input.fileName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      checksum_sha256: input.checksumSha256,
      status: "pending",
      revision: 1,
      submitted_at: new Date(),
      expires_at: null,
      reviewed_at: null,
      submitted_by_actor_id: input.actorId,
      reviewed_by_actor_id: null,
      rejection_reason: null,
    })

    return new StepResponse<SubmitProofResult, SubmitProofCompensation>(
      {
        proof: created,
        eventType: "submitted",
        actorId: input.actorId,
      } satisfies SubmitProofResult,
      { createdId: created.id } satisfies SubmitProofCompensation,
    )
  },
  async (compensation: SubmitProofCompensation, { container }) => {
    if (!compensation.createdId && !compensation.previous) {
      return
    }

    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )

    if (compensation.createdId) {
      await service.deleteManualPaymentProofs(compensation.createdId)
      return
    }

    if (compensation.previous) {
      await service.updateManualPaymentProofs(compensation.previous)
    }
  },
)
