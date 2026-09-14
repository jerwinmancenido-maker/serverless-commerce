/**
 * @file    apps/backend/src/subscribers/bind-order-research-protocols.ts
 * @module  BindOrderResearchProtocolsSubscriber (Research Protocol Module)
 * @purpose Event subscriber listening to order.placed to bind purchased protocol access tokens with idempotency protection.
 * @contracts
 *   Event:    order.placed
 *   Workflow: bindOrderResearchProtocolsWorkflow
 */

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { bindOrderResearchProtocolsWorkflow } from "../workflows/bind-order-research-protocols"

export default async function bindOrderResearchProtocols({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: { id: data.id },
      pagination: { take: 1 },
    })

    const order = orders[0] as { id: string; metadata?: Record<string, unknown> | null } | undefined
    if (!order) {
      logger.warn(`Order ${data.id} not found during protocol binding subscriber execution.`)
      return
    }

    // Idempotency check: prevent duplicate token generation on message redelivery
    if (order.metadata?.protocols_bound === true) {
      logger.info(`Protocols already bound for order ${data.id}. Skipping duplicate event.`)
      return
    }

    await bindOrderResearchProtocolsWorkflow(container).run({ input: { order_id: data.id } })

    const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)
    await orderService.updateOrders([
      {
        id: order.id,
        metadata: {
          ...(order.metadata || {}),
          protocols_bound: true,
          protocols_bound_at: new Date().toISOString(),
        },
      },
    ])

    logger.info(`Successfully bound research protocols for order ${data.id}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Failed to bind research protocols for order ${data.id}: ${message}`, err as Error)
  }
}

export const config: SubscriberConfig = { event: "order.placed" }

