import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../modules/research-content"
import type { StoreUpdateCommunityIdentity } from "../../../../../../modules/research-content/contracts/research-protocol-community"
import type ResearchContentModuleService from "../../../../../../modules/research-content/service"
import { updateCommunityIdentityWorkflow } from "../../../../../../workflows/manage-research-protocol-community"

const responseIdentity = (identity: any) =>
  identity
    ? {
        display_name: identity.display_name,
        show_verified_badge: identity.show_verified_badge,
        status: identity.status,
      }
    : null

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [identity] = await service.listResearchCommunityIdentities(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ identity: responseIdentity(identity) })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateCommunityIdentity>,
  res: MedusaResponse,
) {
  const { result } = await updateCommunityIdentityWorkflow(req.scope).run({
    input: { ...req.validatedBody, customer_id: req.auth_context.actor_id },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ identity: responseIdentity(result) })
}
