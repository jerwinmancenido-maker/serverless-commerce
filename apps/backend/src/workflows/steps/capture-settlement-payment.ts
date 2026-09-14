/**
 * @file    apps/backend/src/workflows/steps/capture-settlement-payment.ts
 * @module  ManualPaymentModule (Workflows)
 * @purpose Capture authorized manual payment with saga compensation tracking.
 * @contracts
 *   Step: captureSettlementPaymentStep
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import type { IPaymentModuleService } from "@medusajs/framework/types"

export type CaptureSettlementPaymentInput = {
  paymentId: string
  actorId: string
}

type CaptureCompensation = {
  paymentId: string
  captureId?: string
  wasAlreadyCaptured: boolean
}

export const captureSettlementPaymentStep = createStep(
  "capture-settlement-payment",
  async (input: CaptureSettlementPaymentInput, { container }) => {
    const paymentModule = container.resolve<IPaymentModuleService>(Modules.PAYMENT)

    // Check if the payment already has captures
    const payment = await paymentModule.retrievePayment(input.paymentId, {
      relations: ["captures"],
    })

    if (payment.captures?.length && payment.captured_at) {
      return new StepResponse(
        {
          paymentId: payment.id,
          captureId: payment.captures[0].id,
        },
        {
          paymentId: payment.id,
          captureId: payment.captures[0].id,
          wasAlreadyCaptured: true,
        } satisfies CaptureCompensation,
      )
    }

    const capturedPayment = await paymentModule.capturePayment({
      payment_id: input.paymentId,
      captured_by: input.actorId,
    })

    const captureId = capturedPayment?.captures?.[0]?.id

    if (!captureId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Capture was created but capture ID was not returned",
      )
    }

    return new StepResponse(
      {
        paymentId: capturedPayment.id,
        captureId,
      },
      {
        paymentId: capturedPayment.id,
        captureId,
        wasAlreadyCaptured: false,
      } satisfies CaptureCompensation,
    )
  },
  async (compensation: CaptureCompensation | undefined) => {
    if (!compensation || compensation.wasAlreadyCaptured) {
      return
    }
    // Financial ledger integrity: captured payments cannot be dropped without audit trail
  },
)
