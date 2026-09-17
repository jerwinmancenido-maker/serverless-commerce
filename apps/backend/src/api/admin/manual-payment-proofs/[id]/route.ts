/**
 * @file    apps/backend/src/api/admin/manual-payment-proofs/[id]/route.ts
 * @module  AdminManualPaymentProofDetailsRoute (Manual Payment Module)
 * @purpose Retrieve manual payment proof details with linked order, customer, and settlement history.
 * @contracts
 *   API:     GET /admin/manual-payment-proofs/:id
 *   Service: ManualPaymentModuleService · Query
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MANUAL_PAYMENT_MODULE } from "../../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../../modules/manual-payment/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE,
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const proof = await service.retrieveManualPaymentProof(req.params.id)
  const events = await service.listManualPaymentProofEvents(
    { proof_id: proof.id },
    { order: { occurred_at: "ASC" } },
  )
  const [settlement] = await service.listManualPaymentSettlements(
    { proof_id: proof.id, proof_revision: proof.revision },
    { take: 1 },
  )

  let orderData: Record<string, any> | null = null
  if (proof.order_id) {
    try {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "total",
          "status",
          "currency_code",
          "created_at",
          "customer.id",
          "customer.first_name",
          "customer.last_name",
          "customer.email",
          "customer.phone",
          "items.id",
          "items.title",
          "items.quantity",
          "items.unit_price",
        ],
        filters: { id: proof.order_id },
        pagination: { take: 1 },
      })
      orderData = orders?.[0] ?? null
    } catch {
      orderData = null
    }
  }

  res.json({
    manual_payment_proof: {
      ...proof,
      settlement_status: settlement?.status ?? "not_started",
    },
    order: orderData,
    events,
    settlement: settlement
      ? {
          status: settlement.status,
          payment_id: settlement.payment_id,
          capture_id: settlement.capture_id,
          last_error_category: settlement.last_error_category,
        }
      : null,
  })
}

