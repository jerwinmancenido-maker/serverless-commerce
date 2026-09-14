/**
 * @file    apps/backend/src/workflows/steps/reconcile-prior-settlement-attempt.ts
 * @module  ManualPaymentModule (Workflows)
 * @purpose Reconcile existing settlement attempts and verify prior captures idempotently.
 * @contracts
 *   Step: reconcilePriorSettlementAttemptStep
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"
import type { ValidatedProofForSettlement } from "./validate-proof-for-settlement"

export type ReconcileResult = {
  existingSettlementId: string | null
  alreadyCaptured: boolean
  terminalResult: TerminalSettlementResult | null
  paymentId: string | null
  captureId: string | null
  attemptCount: number
}

export type TerminalSettlementResult = {
  proofId: string
  proofRevision: number
  settlementStatus: string
  paymentId: string | null
  captureId: string | null
}

export const reconcilePriorSettlementAttemptStep = createStep(
  "reconcile-prior-settlement-attempt",
  async (input: ValidatedProofForSettlement, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Check for an existing settlement projection for this proof revision
    const [existing] = await service.listManualPaymentSettlements(
      {
        proof_id: input.proofId,
        proof_revision: input.proofRevision,
      },
      { take: 1 },
    )

    if (!existing) {
      return new StepResponse({
        existingSettlementId: null,
        alreadyCaptured: false,
        terminalResult: null,
        paymentId: null,
        captureId: null,
        attemptCount: 0,
      } as ReconcileResult)
    }

    // Already captured — reconcile against Medusa's actual capture records
    if (existing.status === "captured" && existing.capture_id) {
      const { data: captures } = await query.graph({
        entity: "capture",
        fields: ["id", "amount", "created_at"],
        filters: { id: existing.capture_id },
        pagination: { take: 1 },
      })

      if (captures?.[0]) {
        // Medusa confirms the capture — return terminal result to short-circuit
        return new StepResponse({
          existingSettlementId: existing.id,
          alreadyCaptured: true,
          terminalResult: {
            proofId: input.proofId,
            proofRevision: input.proofRevision,
            settlementStatus: "captured",
            paymentId: existing.payment_id,
            captureId: existing.capture_id,
          },
          paymentId: existing.payment_id,
          captureId: existing.capture_id,
          attemptCount: existing.attempt_count ?? 0,
        } as ReconcileResult)
      }
    }

    // Authorized but not captured — surface the existing payment_id for retry
    return new StepResponse({
      existingSettlementId: existing.id,
      alreadyCaptured: false,
      terminalResult: null,
      paymentId: existing.payment_id,
      captureId: null,
      attemptCount: existing.attempt_count ?? 0,
    } as ReconcileResult)
  },
)
