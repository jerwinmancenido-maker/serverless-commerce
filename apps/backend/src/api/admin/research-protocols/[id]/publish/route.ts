import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminPublishResearchProtocol } from "../../../../../modules/research-content/contracts/research-protocol"
import { publishResearchProtocolWorkflow } from "../../../../../workflows/manage-research-protocol"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminPublishResearchProtocol>,
  res: MedusaResponse,
) {
  const { result } = await publishResearchProtocolWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ revision: result })
}
