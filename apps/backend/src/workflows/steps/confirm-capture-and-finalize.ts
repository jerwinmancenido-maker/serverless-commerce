/**
 * @file    apps/backend/src/workflows/steps/confirm-capture-and-finalize.ts
 * @module  ManualPaymentModule (Workflows)
 * @purpose Finalize payment proof and settlement projection with saga compensation rollback.
 * @contracts
 *   Step: confirmCaptureAndFinalizeStep
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import {
  normalizeManualPaymentSettlementEvent,
  toManualPaymentSettlementEventDml,
} from "../../modules/manual-payment/contracts/payment-settlement"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"

type ConfirmCaptureCompensation = {
  proofId: string
  settlementId: string
}

export type ConfirmCaptureAndFinalizeInput = {
  proofId: string
  proofRevision: number
  paymentSessionId: string
  orderId: string
  actorId: string
  settlementId: string
  attemptId: string
  paymentId: string
  captureId: string
}

export type FinalizedSettlementOutput = {
  proofReviewStatus: "approved"
  settlementStatus: "captured"
  paymentId: string
  captureId: string
}

export const confirmCaptureAndFinalizeStep = createStep(
  "confirm-capture-and-finalize",
  async (input: ConfirmCaptureAndFinalizeInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const now = new Date()

    // Re-query Medusa to confirm capture exists before finalizing
    const { data: captures } = await query.graph({
      entity: "capture",
      fields: ["id", "amount"],
      filters: { id: input.captureId },
      pagination: { take: 1 },
    })

    if (!captures?.[0]) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Expected capture was not found in Medusa after capture workflow completed",
      )
    }

    // Transition proof to approved
    const proofService = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    await proofService.updateManualPaymentProofs({
      id: input.proofId,
      status: "approved",
      reviewed_at: now,
      reviewed_by_actor_id: input.actorId,
    })

    // Write proof_approved_after_capture event
    const captureEvent = normalizeManualPaymentSettlementEvent({
      attemptId: input.attemptId,
      proofId: input.proofId,
      proofRevision: input.proofRevision,
      paymentSessionId: input.paymentSessionId,
      orderId: input.orderId,
      actorId: input.actorId,
      eventType: "proof_approved_after_capture",
      status: "captured",
      paymentId: input.paymentId,
      captureId: input.captureId,
      errorCategory: null,
    })

    await service.createManualPaymentSettlementEvents({
      ...toManualPaymentSettlementEventDml(captureEvent),
      occurred_at: now,
    })

    // Update settlement projection to captured
    await service.updateManualPaymentSettlements({
      id: input.settlementId,
      status: "captured",
      payment_id: input.paymentId,
      capture_id: input.captureId,
      capture_confirmed_at: now,
      last_error_category: null,
      failed_at: null,
    })

    const output: FinalizedSettlementOutput = {
      proofReviewStatus: "approved",
      settlementStatus: "captured",
      paymentId: input.paymentId,
      captureId: input.captureId,
    }

    return new StepResponse(output, {
      proofId: input.proofId,
      settlementId: input.settlementId,
    } satisfies ConfirmCaptureCompensation)
  },
  async (compensation: ConfirmCaptureCompensation | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    const now = new Date()
    try {
      await service.updateManualPaymentProofs({
        id: compensation.proofId,
        status: "pending",
      })
      await service.updateManualPaymentSettlements({
        id: compensation.settlementId,
        status: "failed",
        last_error_category: "internal_error",
        failed_at: now,
      })
    } catch {
      // Best-effort rollback
    }
  },
)
