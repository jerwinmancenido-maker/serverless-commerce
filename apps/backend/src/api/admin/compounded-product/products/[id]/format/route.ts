import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminAssignCompoundProductFormatBody } from "../../../../../../modules/compounded-product/contracts/compound-product-format"
import { assignCompoundProductFormatWorkflow } from "../../../../../../workflows/manage-compound-product-format"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminAssignCompoundProductFormatBody>,
  res: MedusaResponse,
) {
  const { result } = await assignCompoundProductFormatWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      format_id: req.validatedBody.format_id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ registration: result })
}
