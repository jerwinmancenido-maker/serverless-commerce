import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Modules } from "@medusajs/framework/utils"

export type SetProviderReviewMarkerInput = {
  paymentSessionId: string
  approve: true
}

export const setProviderReviewMarkerStep = createStep(
  "set-provider-review-marker",
  async (input: SetProviderReviewMarkerInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const paymentModule = container.resolve(Modules.PAYMENT)

    // Fetch current session data to preserve non-provider fields
    const { data: sessions } = await query.graph({
      entity: "payment_session",
      fields: ["id", "data", "status", "currency_code", "amount"],
      filters: { id: input.paymentSessionId },
      pagination: { take: 1 },
    })

    const session = sessions?.[0]
    const priorData = session?.data ?? {}
    const currencyCode = session?.currency_code || "php"
    const amount = session?.amount ?? 0

    // Set the trusted approved marker that the Manual QR provider checks
    await paymentModule.updatePaymentSession({
      id: input.paymentSessionId,
      currency_code: currencyCode,
      amount: amount,
      data: {
        ...priorData,
        manual_qr_review_status: "approved",
        _provider_review_approved: true,
      },
    })

    return new StepResponse(
      { paymentSessionId: input.paymentSessionId },
      // Compensation input: restore original data
      {
        paymentSessionId: input.paymentSessionId,
        currencyCode,
        amount,
        priorData,
      },
    )
  },
  // Compensation: restore previous session data
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }
    const { paymentSessionId, currencyCode, amount, priorData } = compensationData
    const paymentModule = container.resolve(Modules.PAYMENT)
    try {
      await paymentModule.updatePaymentSession({
        id: paymentSessionId,
        currency_code: currencyCode,
        amount: amount,
        data: priorData,
      })
    } catch {
      // Best-effort
    }
  },
)
