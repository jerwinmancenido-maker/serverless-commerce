import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminArchiveResearchProtocol } from "../../../../../modules/research-content/contracts/research-protocol"
import { archiveResearchProtocolWorkflow } from "../../../../../workflows/manage-research-protocol"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminArchiveResearchProtocol>,
  res: MedusaResponse,
) {
  const { result } = await archiveResearchProtocolWorkflow(req.scope).run({
    input: {
      series_id: req.params.id,
      reason: req.validatedBody.reason,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ protocol: result })
}
