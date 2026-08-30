import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminAssignCompoundFamilyBody } from "../../../../../../modules/compounded-product/contracts/compound-family"
import { assignCompoundFamilyWorkflow } from "../../../../../../workflows/manage-compound-family"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminAssignCompoundFamilyBody>,
  res: MedusaResponse,
) {
  const { result } = await assignCompoundFamilyWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      family_id: req.validatedBody.family_id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ registration: result })
}
