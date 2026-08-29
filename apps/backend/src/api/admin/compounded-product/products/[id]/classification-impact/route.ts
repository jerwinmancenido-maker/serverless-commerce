import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { resolveCompoundedProductClassificationImpact } from "../../../../../../modules/compounded-product/classification-impact"
import type { AdminPreviewCompoundedProductClassificationChange } from "../../../../../../modules/compounded-product/contracts/classification"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminPreviewCompoundedProductClassificationChange>,
  res: MedusaResponse,
) {
  const impact = await resolveCompoundedProductClassificationImpact(req.scope, {
    ...req.validatedBody,
    productId: req.params.id,
  })

  res.json({ impact })
}
