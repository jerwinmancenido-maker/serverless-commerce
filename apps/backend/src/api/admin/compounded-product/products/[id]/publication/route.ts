import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminChangeCompoundedProductPublication } from "../../../../../../modules/compounded-product/contracts/audit"
import changeCompoundedProductPublicationWorkflow from "../../../../../../workflows/change-compounded-product-publication"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminChangeCompoundedProductPublication>,
  res: MedusaResponse,
) {
  const { result } = await changeCompoundedProductPublicationWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      productId: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(result.accepted ? 200 : 409).json(result)
}
