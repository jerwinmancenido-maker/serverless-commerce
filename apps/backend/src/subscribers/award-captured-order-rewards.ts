import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { awardRewardEventSafely } from "../workflows/award-reward-event"
import { manageReferralsWorkflow } from "../workflows/manage-referrals"

type CapturedPaymentEvent = {
  id: string
}

export default async function awardCapturedOrderRewards({
  event: { data },
  container,
}: SubscriberArgs<CapturedPaymentEvent>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "customer_id",
      "currency_code",
      "total",
      "payment_collections.payments.id",
      "items.product_id",
    ],
    filters: {
      payment_collections: {
        payments: { id: data.id },
      },
    } as never,
    pagination: { take: 1 },
  })
  const order = orders[0]
  if (!order?.customer_id) return

  await awardRewardEventSafely(container, {
    customer_id: order.customer_id,
    event_type: "purchase_confirmed",
    source_type: "purchase_confirmed",
    source_id: data.id,
    order_id: order.id,
    eligible_amount: Number(order.total || 0),
    status: "available",
    idempotency_key: `captured-payment:${data.id}`,
  })

  try {
    const { result } = await manageReferralsWorkflow(container).run({
      input: {
        operation: "qualify",
        customerId: order.customer_id,
        orderId: order.id,
        paymentId: data.id,
        eligibleAmount: Number(order.total || 0),
        productIds: (order.items ?? [])
          .map((item) => item?.product_id)
          .filter((id: string | null | undefined): id is string => Boolean(id)),
      },
    })
    const event = (result as { event?: {
      id: string
      referrer_customer_id: string
      referred_customer_id: string
      waiting_period_days: number
    } }).event
    if (event) {
      const status = Number(event.waiting_period_days) > 0 ? "pending" : "available"
      await awardRewardEventSafely(container, {
        customer_id: event.referrer_customer_id,
        event_type: "referral_referrer",
        source_type: "referral_referrer",
        source_id: event.id,
        order_id: order.id,
        status,
        pending_days: Number(event.waiting_period_days),
        idempotency_key: `referral-referrer:${event.id}`,
      })
      await awardRewardEventSafely(container, {
        customer_id: event.referred_customer_id,
        event_type: "referral_referred",
        source_type: "referral_referred",
        source_id: event.id,
        order_id: order.id,
        status,
        pending_days: Number(event.waiting_period_days),
        idempotency_key: `referral-referred:${event.id}`,
      })
    }
  } catch (error) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(
      `Referral qualification was not applied: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
