import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import type {
  ManualPaymentProofEventType,
  ManualPaymentProofStatus,
} from "../../modules/manual-payment/contracts/payment-proof"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"

export type CreateManualPaymentProofEventInput = {
  proof: {
    id: string
    payment_session_id: string
    order_id: string
    revision: number
    status: ManualPaymentProofStatus
    file_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    checksum_sha256: string
  }
  eventType: ManualPaymentProofEventType | null
  actorId: string
  reason?: string | null
}

export const createManualPaymentProofEventStep = createStep(
  "create-manual-payment-proof-event",
  async (input: CreateManualPaymentProofEventInput, { container }) => {
    if (!input.eventType) {
      return new StepResponse(null)
    }

    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    const event = await service.createManualPaymentProofEvents({
      proof_id: input.proof.id,
      payment_session_id: input.proof.payment_session_id,
      order_id: input.proof.order_id,
      revision: input.proof.revision,
      event_type: input.eventType,
      status: input.proof.status,
      file_id: input.proof.file_id,
      file_name: input.proof.file_name,
      mime_type: input.proof.mime_type,
      size_bytes: input.proof.size_bytes,
      checksum_sha256: input.proof.checksum_sha256,
      actor_id: input.actorId,
      reason: input.reason ?? null,
      occurred_at: new Date(),
    })

    return new StepResponse(event, event.id)
  },
  async (eventId: string | null | undefined, { container }) => {
    if (!eventId) {
      return
    }

    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    await service.deleteManualPaymentProofEvents(eventId)
  },
)
