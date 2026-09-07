import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MANUAL_PAYMENT_MODULE } from "../modules/manual-payment"
import type ManualPaymentModuleService from "../modules/manual-payment/service"
import { expireUnpaidOrderWorkflow } from "../workflows/expire-unpaid-orders"

export default async function processExpiredUnpaidOrders(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const manualPaymentService = container.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE
  )

  const expirationHours = Number(process.env.UNPAID_ORDER_EXPIRATION_HOURS || 24)
  const now = new Date()

  try {
    // Query active orders awaiting payment
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "created_at", "customer_id", "status", "payment_status", "metadata"],
      filters: {
        payment_status: "awaiting",
        status: { $ne: "canceled" },
      } as never,
      pagination: { take: 50 },
    })

    if (!orders || orders.length === 0) {
      return
    }

    let expiredCount = 0

    for (const order of orders) {
      // Determine expiration deadline
      const customExpiresAt = order.metadata?.expires_at
        ? new Date(String(order.metadata.expires_at))
        : null
      const defaultExpiresAt = new Date(
        new Date(order.created_at).getTime() + expirationHours * 60 * 60 * 1000
      )
      const expiresAt = customExpiresAt || defaultExpiresAt

      if (now > expiresAt) {
        // Race condition check: Check if a payment proof is currently pending staff review
        const proofs = await manualPaymentService.listManualPaymentProofs(
          { order_id: order.id },
          { take: 1 }
        )

        const activeProof = proofs[0]
        if (activeProof && activeProof.status === "pending") {
          // Proof is submitted and under review — DO NOT auto-cancel!
          continue
        }

        try {
          await expireUnpaidOrderWorkflow(container).run({
            input: {
              order_id: order.id,
              reason: "unpaid_timeout",
            },
          })
          expiredCount++
          logger.info(
            `[Auto-Expiration Engine] Cancelled unpaid order #${order.id} and released reserved BOM stock.`
          )
        } catch (cancelError) {
          logger.warn(
            `[Auto-Expiration Engine] Failed to cancel order #${order.id}: ${
              cancelError instanceof Error ? cancelError.message : String(cancelError)
            }`
          )
        }
      }
    }

    if (expiredCount > 0) {
      logger.info(
        `[Auto-Expiration Engine] Successfully processed and released stock for ${expiredCount} expired unpaid orders.`
      )
    }
  } catch (error) {
    logger.error(
      `[Auto-Expiration Engine] Job failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config = {
  name: "expire-unpaid-orders",
  schedule: "*/15 * * * *",
}
