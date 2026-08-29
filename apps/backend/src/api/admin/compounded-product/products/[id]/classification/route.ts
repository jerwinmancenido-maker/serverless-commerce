import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminChangeCompoundedProductClassification } from "../../../../../../modules/compounded-product/contracts/classification"
import changeCompoundedProductClassificationWorkflow from "../../../../../../workflows/change-compounded-product-classification"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminChangeCompoundedProductClassification>,
  res: MedusaResponse,
) {
  const { result } = await changeCompoundedProductClassificationWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      productId: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json(result)
}
