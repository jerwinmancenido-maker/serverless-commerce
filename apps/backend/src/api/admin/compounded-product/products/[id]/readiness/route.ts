import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { resolveCompoundedProductReadiness } from "../../../../../../modules/compounded-product/resolve-product-readiness"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const readiness = await resolveCompoundedProductReadiness(
    req.scope,
    req.params.id,
  )

  res.status(200).json(readiness)
}
