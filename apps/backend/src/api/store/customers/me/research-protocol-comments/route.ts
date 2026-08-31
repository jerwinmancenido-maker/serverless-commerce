import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { StoreCreateResearchProtocolComment } from "../../../../../modules/research-content/contracts/research-protocol-comment"
import { createResearchProtocolCommentWorkflow } from "../../../../../workflows/manage-research-protocol-comment"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchProtocolComment>,
  res: MedusaResponse,
) {
  const { result } = await createResearchProtocolCommentWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  })

  res.status(201).json({
    comment: {
      id: result.id,
      kind: result.kind,
      body: result.body,
      status: result.status,
      submitted_at: result.submitted_at,
    },
  })
}
