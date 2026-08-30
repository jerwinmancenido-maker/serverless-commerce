import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminUpdateCompoundProductFormatBody } from "../../../../../modules/compounded-product/contracts/compound-product-format"
import { updateCompoundProductFormatWorkflow } from "../../../../../workflows/manage-compound-product-format"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateCompoundProductFormatBody>,
  res: MedusaResponse,
) {
  const { result } = await updateCompoundProductFormatWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      format_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ format: result })
}
