import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { archiveCompoundProductFormatWorkflow } from "../../../../../../workflows/manage-compound-product-format"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await archiveCompoundProductFormatWorkflow(req.scope).run({
    input: {
      format_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ format: result })
}
