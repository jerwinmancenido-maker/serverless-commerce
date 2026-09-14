/**
 * @file    apps/backend/src/api/admin/bom/orders/[id]/deduct-components/route.ts
 * @module  AdminOrderBomDeductRoute (BOM Module)
 * @purpose Admin endpoint to trigger or verify constituent BOM stock deduction for an order.
 * @contracts
 *   API:     POST /admin/bom/orders/:id/deduct-components
 *   Workflow: deductOrderBomComponentsWorkflow
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deductOrderBomComponentsWorkflow } from "../../../../../../workflows/deduct-order-bom-components"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const orderId = req.params.id

  const { result } = await deductOrderBomComponentsWorkflow(req.scope).run({
    input: { order_id: orderId },
  })

  res.status(200).json({ result })
}
