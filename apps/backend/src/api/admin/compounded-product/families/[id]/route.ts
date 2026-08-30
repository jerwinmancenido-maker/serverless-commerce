import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminUpdateCompoundFamilyBody } from "../../../../../modules/compounded-product/contracts/compound-family"
import { updateCompoundFamilyWorkflow } from "../../../../../workflows/manage-compound-family"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateCompoundFamilyBody>,
  res: MedusaResponse,
) {
  const { result } = await updateCompoundFamilyWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      family_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ family: result })
}
