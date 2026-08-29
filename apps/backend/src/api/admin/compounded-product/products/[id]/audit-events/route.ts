import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../../../modules/compounded-product"
import type CompoundedProductModuleService from "../../../../../../modules/compounded-product/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const events = await service.listGovernanceAuditEvents(
    { product_id: req.params.id },
    { order: { created_at: "DESC" }, take: 100 },
  )

  res.status(200).json({ audit_events: events })
}
