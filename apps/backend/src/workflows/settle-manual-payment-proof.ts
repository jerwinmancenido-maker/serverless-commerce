import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "crypto"

import { acquireSettlementLockStep } from "./steps/acquire-settlement-lock"
import { validateProofForSettlementStep } from "./steps/validate-proof-for-settlement"
import { reconcilePriorSettlementAttemptStep } from "./steps/reconcile-prior-settlement-attempt"
import { persistSettlementAttemptAuditStep } from "./steps/persist-settlement-attempt-audit"
import { setProviderReviewMarkerStep } from "./steps/set-provider-review-marker"
import { authorizeSettlementSessionStep } from "./steps/authorize-settlement-session"
import { captureSettlementPaymentStep } from "./steps/capture-settlement-payment"
import { confirmCaptureAndFinalizeStep } from "./steps/confirm-capture-and-finalize"

export type SettleManualPaymentProofInput = {
  proofId: string
  actorId: string
}

export const settleManualPaymentProofWorkflow = createWorkflow(
  "settle-manual-payment-proof",
  function (input: SettleManualPaymentProofInput) {
    // Step 1: Validate proof before acquiring lock (no state change)
    const validated = validateProofForSettlementStep({
      proofId: input.proofId,
      actorId: input.actorId,
    })

    // Step 2: Acquire lock scoped to payment session
    acquireSettlementLockStep({
      paymentSessionId: validated.paymentSessionId,
    })

    // Step 3: Idempotency — check for prior settlement and Medusa captures
    const reconcile = reconcilePriorSettlementAttemptStep(validated)

    // Step 4: Persist audit record (creates or updates settlement projection)
    const attemptId = transform({}, () => randomUUID())
    const auditResult = persistSettlementAttemptAuditStep(
      transform({ validated, reconcile, attemptId }, (d) => ({
        ...d.validated,
        reconcile: d.reconcile,
        attemptId: d.attemptId,
      })),
    )

    // Step 5: Set provider-trusted approved marker on payment session
    setProviderReviewMarkerStep(
      transform({ validated }, (d) => ({
        paymentSessionId: d.validated.paymentSessionId,
        approve: true as const,
      })),
    )

    // Step 6: Authorize payment session directly via Payment Module
    const authorization = authorizeSettlementSessionStep(
      transform({ validated }, (d) => ({
        paymentSessionId: d.validated.paymentSessionId,
      })),
    )

    // Step 7: Capture authorized payment directly via Payment Module
    const captureResult = captureSettlementPaymentStep(
      transform({ authorization, input }, (d) => ({
        paymentId: d.authorization.paymentId,
        actorId: d.input.actorId,
      })),
    )

    // Step 8: Confirm capture in Medusa + finalize proof/audit
    const finalized = confirmCaptureAndFinalizeStep(
      transform(
        { validated, auditResult, authorization, captureResult, input },
        (d) => ({
          proofId: d.validated.proofId,
          proofRevision: d.validated.proofRevision,
          paymentSessionId: d.validated.paymentSessionId,
          orderId: d.validated.orderId,
          actorId: d.input.actorId,
          settlementId: d.auditResult.settlementId,
          attemptId: d.auditResult.attemptId,
          paymentId: d.authorization.paymentId,
          captureId: d.captureResult.captureId,
        }),
      ),
    )

    return new WorkflowResponse(
      transform({ finalized, validated }, (d) => ({
        proofId: d.validated.proofId,
        proofReviewStatus: d.finalized.proofReviewStatus,
        settlementStatus: d.finalized.settlementStatus,
        paymentId: d.finalized.paymentId,
        captureId: d.finalized.captureId,
      })),
    )
  },
)

export default settleManualPaymentProofWorkflow
