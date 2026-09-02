import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import {
  normalizeManualPaymentSettlementEvent,
  toManualPaymentSettlementEventDml,
} from "../../modules/manual-payment/contracts/payment-settlement"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"
import type { ValidatedProofForSettlement } from "./validate-proof-for-settlement"
import type { ReconcileResult } from "./reconcile-prior-settlement-attempt"

export type PersistSettlementAuditInput = ValidatedProofForSettlement & {
  reconcile: ReconcileResult
  attemptId: string
}

export type PersistSettlementAuditOutput = {
  settlementId: string
  attemptId: string
}

export const persistSettlementAttemptAuditStep = createStep(
  "persist-settlement-attempt-audit",
  async (input: PersistSettlementAuditInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)

    const now = new Date()

    // Upsert the settlement projection
    let settlement: { id: string }
    if (input.reconcile.existingSettlementId) {
      const updated = await service.updateManualPaymentSettlements({
        id: input.reconcile.existingSettlementId,
        status: "authorizing",
        current_attempt_id: input.attemptId,
        attempt_count: (input.reconcile.attemptCount ?? 0) + 1,
        requested_at: now,
        last_attempted_by_actor_id: input.actorId,
        last_error_category: null,
        failed_at: null,
      })
      settlement = Array.isArray(updated) ? updated[0] : updated
    } else {
      const created = await service.createManualPaymentSettlements({
        proof_id: input.proofId,
        proof_revision: input.proofRevision,
        payment_session_id: input.paymentSessionId,
        order_id: input.orderId,
        status: "authorizing",
        attempt_count: 1,
        current_attempt_id: input.attemptId,
        requested_at: now,
        last_attempted_by_actor_id: input.actorId,
      })
      settlement = Array.isArray(created) ? created[0] : created
    }

    // Write immutable audit event
    const eventInput = normalizeManualPaymentSettlementEvent({
      attemptId: input.attemptId,
      proofId: input.proofId,
      proofRevision: input.proofRevision,
      paymentSessionId: input.paymentSessionId,
      orderId: input.orderId,
      actorId: input.actorId,
      eventType: "settlement_requested",
      status: "authorizing",
      paymentId: null,
      captureId: null,
      errorCategory: null,
    })

    await service.createManualPaymentSettlementEvents({
      ...toManualPaymentSettlementEventDml(eventInput),
      occurred_at: now,
    })

    return new StepResponse(
      { settlementId: settlement.id, attemptId: input.attemptId },
      {
        settlementId: settlement.id,
        attemptId: input.attemptId,
        proofId: input.proofId,
        proofRevision: input.proofRevision,
        paymentSessionId: input.paymentSessionId,
        orderId: input.orderId,
        actorId: input.actorId,
      },
    )
  },
  // Compensation: write a settlement_failed audit event (never delete)
  async (compensationInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    const now = new Date()

    try {
      await service.updateManualPaymentSettlements({
        id: compensationInput.settlementId,
        status: "failed",
        last_error_category: "internal_error",
        failed_at: now,
      })

      const failureEvent = normalizeManualPaymentSettlementEvent({
        attemptId: compensationInput.attemptId,
        proofId: compensationInput.proofId,
        proofRevision: compensationInput.proofRevision,
        paymentSessionId: compensationInput.paymentSessionId,
        orderId: compensationInput.orderId,
        actorId: compensationInput.actorId,
        eventType: "settlement_failed",
        status: "failed",
        paymentId: null,
        captureId: null,
        errorCategory: "internal_error",
      })

      await service.createManualPaymentSettlementEvents({
        ...toManualPaymentSettlementEventDml(failureEvent),
        occurred_at: now,
      })
    } catch {
      // Best-effort — do not throw from compensation
    }
  },
)
