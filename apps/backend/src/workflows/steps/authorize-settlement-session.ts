import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import type { IPaymentModuleService } from "@medusajs/framework/types"

export type AuthorizeSettlementSessionInput = {
  paymentSessionId: string
}

export const authorizeSettlementSessionStep = createStep(
  "authorize-settlement-session",
  async (input: AuthorizeSettlementSessionInput, { container }) => {
    const paymentModule = container.resolve<IPaymentModuleService>(Modules.PAYMENT)

    // Check if there is already an active (uncanceled) payment for this session
    const [existingPayment] = await paymentModule.listPayments(
      { payment_session_id: input.paymentSessionId, canceled_at: null as any },
      { take: 1 },
    )

    if (existingPayment?.id) {
      return new StepResponse(
        { paymentId: existingPayment.id },
        { paymentId: null as string | null }, // Don't cancel an existing pre-authorized payment
      )
    }

    const payment = await paymentModule.authorizePaymentSession(
      input.paymentSessionId,
      {},
    )

    if (!payment?.id) {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        "Failed to authorize payment session",
      )
    }

    return new StepResponse(
      { paymentId: payment.id },
      { paymentId: payment.id as string | null },
    )
  },
  async (compensationInput, { container }) => {
    if (compensationInput?.paymentId) {
      const paymentModule = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
      await paymentModule.cancelPayment(compensationInput.paymentId).catch(() => {})
    }
  },
)
