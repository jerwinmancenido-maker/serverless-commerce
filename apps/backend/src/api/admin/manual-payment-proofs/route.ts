import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MANUAL_PAYMENT_MODULE } from "../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../modules/manual-payment/service"
import type { AdminListManualPaymentProofsType } from "./validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE,
  )
  const { order_id, status, limit, offset } =
    req.validatedQuery as AdminListManualPaymentProofsType
  const filters: Record<string, any> = {}
  if (order_id) filters.order_id = order_id
  if (status) filters.status = status

  const [proofs, count] = await service.listAndCountManualPaymentProofs(
    filters,
    {
      take: limit,
      skip: offset,
      order: { submitted_at: "DESC" },
    },
  )

  res.json({ manual_payment_proofs: proofs, count, limit, offset })
}
