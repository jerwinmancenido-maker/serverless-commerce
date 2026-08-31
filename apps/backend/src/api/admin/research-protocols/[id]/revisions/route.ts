import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminCreateResearchProtocolRevision } from "../../../../../modules/research-content/contracts/research-protocol"
import { createResearchProtocolRevisionWorkflow } from "../../../../../workflows/manage-research-protocol"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateResearchProtocolRevision>,
  res: MedusaResponse,
) {
  const { result } = await createResearchProtocolRevisionWorkflow(
    req.scope,
  ).run({
    input: {
      series_id: req.params.id,
      reason: req.validatedBody.reason,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(201).json({ revision: result })
}
