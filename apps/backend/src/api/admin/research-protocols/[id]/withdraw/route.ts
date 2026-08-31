import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminWithdrawResearchProtocol } from "../../../../../modules/research-content/contracts/research-protocol"
import { withdrawResearchProtocolWorkflow } from "../../../../../workflows/manage-research-protocol"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminWithdrawResearchProtocol>,
  res: MedusaResponse,
) {
  const { result } = await withdrawResearchProtocolWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ revision: result })
}
