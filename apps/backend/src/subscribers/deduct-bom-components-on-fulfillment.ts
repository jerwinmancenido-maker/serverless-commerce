/**
 * @file    apps/backend/src/subscribers/deduct-bom-components-on-fulfillment.ts
 * @module  DeductBomComponentsOnFulfillmentSubscriber (BOM Module)
 * @purpose Event subscriber listening to order fulfillment to trigger automatic constituent stock deduction with idempotency protection.
 * @contracts
 *   Event:    order.fulfillment_created
 *   Workflow: deductOrderBomComponentsWorkflow
 */

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deductOrderBomComponentsWorkflow } from "../workflows/deduct-order-bom-components"

type FulfillmentEvent = {
  id: string
  order_id?: string
}

export default async function deductBomComponentsOnFulfillment({
  event: { data },
  container,
}: SubscriberArgs<FulfillmentEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: data.order_id
        ? { id: data.order_id }
        : ({ fulfillments: { id: data.id } } as never),
      pagination: { take: 1 },
    })
    const order = orders[0] as { id: string; metadata?: Record<string, unknown> | null } | undefined
    const targetOrderId = order?.id || data.order_id

    if (!targetOrderId) {
      logger.warn(`Could not resolve order for fulfillment ${data.id}. Skipping BOM deduction.`)
      return
    }

    // Idempotency check: verify if this fulfillment already had BOM stock deducted
    const existingDeductions = (order?.metadata?.bom_fulfillment_ids || []) as string[]
    if (existingDeductions.includes(data.id)) {
      logger.info(
        `BOM components already deducted for fulfillment ${data.id} on order ${targetOrderId}. Skipping duplicate event.`
      )
      return
    }

    await deductOrderBomComponentsWorkflow(container).run({
      input: {
        order_id: targetOrderId,
        fulfillment_id: data.id,
      },
    })

    logger.info(`Successfully processed BOM inventory deduction for fulfillment ${data.id}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Error processing BOM inventory deduction for fulfillment ${data.id}: ${message}`, err as Error)
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}

