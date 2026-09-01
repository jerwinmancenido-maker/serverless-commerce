import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { IPaymentModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import { manageRewardsWorkflow } from "../workflows/manage-rewards"
import { manageReferralsWorkflow } from "../workflows/manage-referrals"

type RefundCreatedEvent = { id: string }

export default async function reverseRefundedOrderRewards({
  event: { data },
  container,
}: SubscriberArgs<RefundCreatedEvent>) {
  const paymentService = container.resolve<IPaymentModuleService>(
    Modules.PAYMENT,
  )
  const refunds = await paymentService.listRefunds(
    { id: data.id },
    { relations: ["payment"] },
  )
  const refund = refunds[0]
  if (!refund?.payment?.id) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "payment_collections.payments.id"],
    filters: {
      payment_collections: { payments: { id: refund.payment.id } },
    } as never,
    pagination: { take: 1 },
  })
  const order = orders[0]
  if (!order?.customer_id) return

  const paymentRefunds = await paymentService.listRefunds({
    payment_id: refund.payment.id,
  })
  const cumulativeRefundedAmount = paymentRefunds.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  )
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await manageRewardsWorkflow(container).run({
      input: {
        operation: "reverse_purchase",
        customer_id: order.customer_id,
        order_id: order.id,
        refund_id: refund.id,
        eligible_refunded_amount: cumulativeRefundedAmount,
        idempotency_key: `purchase-refund:${refund.id}`,
      },
    })
  } catch (error) {
    logger.warn(
      `Refund reward reversal was not applied: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    )
  }

  try {
    const { result } = await manageReferralsWorkflow(container).run({
      input: {
        operation: "reverse",
        orderId: order.id,
        reversalId: refund.id,
      },
    })
    const event = (result as { event?: {
      id: string
      referrer_customer_id: string
      referred_customer_id: string
    } }).event
    if (event) {
      for (const [customerId, sourceType] of [
        [event.referrer_customer_id, "referral_referrer"],
        [event.referred_customer_id, "referral_referred"],
      ] as const) {
        await manageRewardsWorkflow(container).run({
          input: {
            operation: "reverse_event",
            customer_id: customerId,
            source_type: sourceType,
            source_id: event.id,
            reversal_source_id: refund.id,
            order_id: order.id,
            idempotency_key: `referral-refund:${refund.id}:${sourceType}`,
          },
        })
      }
    }
  } catch (error) {
    logger.warn(
      `Referral reward reversal was not applied: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "refund.created",
}
