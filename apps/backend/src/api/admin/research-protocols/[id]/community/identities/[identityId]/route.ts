import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { AdminUpdateResearchCommunityIdentityStatus } from "../../../../../../../modules/research-content/contracts/research-protocol-community"
import { updateCommunityIdentityStatusWorkflow } from "../../../../../../../workflows/manage-research-protocol-community"

export async function POST(req: AuthenticatedMedusaRequest<AdminUpdateResearchCommunityIdentityStatus>, res: MedusaResponse) {
  const { result } = await updateCommunityIdentityStatusWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: req.params.id, identity_id: req.params.identityId, actor_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ identity: { id: result.id, status: result.status } })
}
