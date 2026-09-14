/**
 * @file    apps/backend/src/subscribers/award-captured-order-rewards.ts
 * @module  AwardCapturedOrderRewardsSubscriber (Rewards & Loyalty Module)
 * @purpose Event subscriber listening to payment.captured to award loyalty rewards and qualify referrals with idempotency protection.
 * @contracts
 *   Event:    payment.captured
 *   Workflow: awardRewardEventSafely · manageReferralsWorkflow · emitCustomerNotificationWorkflow
 */

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { awardRewardEventSafely } from "../workflows/award-reward-event"
import { manageReferralsWorkflow } from "../workflows/manage-referrals"
import { emitCustomerNotificationWorkflow } from "../workflows/manage-customer-notifications"

type CapturedPaymentEvent = {
  id: string
}

export default async function awardCapturedOrderRewards({
  event: { data },
  container,
}: SubscriberArgs<CapturedPaymentEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "currency_code",
        "total",
        "metadata",
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
    if (!order?.customer_id || (order.metadata?.captured_payments_awarded as string[] | undefined)?.includes(data.id)) return

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
      await Promise.all([
        event.referrer_customer_id,
        event.referred_customer_id,
      ].map((customerId) => emitCustomerNotificationWorkflow(container).run({ input: {
        customer_id: customerId,
        event_key: "reward.referral_completed",
        source_id: `${event.id}:${customerId}`,
        variables: {},
        target_kind: "rewards",
        target_id: null,
        metadata: {},
      } })))
      }
    } catch (error) {
      logger.warn(
        `Referral qualification was not applied: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      )
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Error processing captured order rewards for payment ${data.id}: ${message}`, err as Error)
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
