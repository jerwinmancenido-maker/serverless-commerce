import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { archiveCompoundFamilyWorkflow } from "../../../../../../workflows/manage-compound-family"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await archiveCompoundFamilyWorkflow(req.scope).run({
    input: {
      family_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ family: result })
}
