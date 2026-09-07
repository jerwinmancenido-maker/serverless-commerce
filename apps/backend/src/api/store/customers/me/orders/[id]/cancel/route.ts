import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { expireUnpaidOrderWorkflow } from "../../../../../../../workflows/expire-unpaid-orders"

type OrderRecord = {
  id: string
  status: string
  payment_status?: string
  customer_id?: string | null
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Customer authentication is required"
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "status", "payment_status", "customer_id"],
    filters: { id: req.params.id, customer_id: customerId },
    pagination: { take: 1 },
  })

  const order = orders[0] as OrderRecord | undefined
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order was not found")
  }

  if (order.status === "canceled") {
    return res.status(200).json({
      success: true,
      order_id: order.id,
      status: "canceled",
      message: "Order was already canceled",
    })
  }

  if (order.payment_status && order.payment_status !== "awaiting") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Cannot cancel order with payment status '${order.payment_status}'. Please contact customer support.`
    )
  }

  const { result } = await expireUnpaidOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      reason: "customer_requested",
      actor_id: customerId,
    },
  })

  return res.status(200).json({
    success: true,
    order_id: result.order_id,
    status: result.status,
    message: "Your compound reservation has been released and the order has been cancelled.",
  })
}
