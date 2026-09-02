import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import type { IPaymentModuleService } from "@medusajs/framework/types"

export type CaptureSettlementPaymentInput = {
  paymentId: string
  actorId: string
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
      return new StepResponse({
        paymentId: payment.id,
        captureId: payment.captures[0].id,
      })
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

    return new StepResponse({
      paymentId: capturedPayment.id,
      captureId,
    })
  },
)
