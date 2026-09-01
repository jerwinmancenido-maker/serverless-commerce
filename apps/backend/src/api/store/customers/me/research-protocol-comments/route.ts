import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { StoreCreateResearchProtocolComment } from "../../../../../modules/research-content/contracts/research-protocol-comment"
import { createProtocolThreadWorkflow } from "../../../../../workflows/manage-research-protocol-community"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchProtocolComment>,
  res: MedusaResponse,
) {
  const title = req.validatedBody.body.trim().replace(/\s+/g, " ").slice(0, 100)
  const { result } = await createProtocolThreadWorkflow(req.scope).run({
    input: {
      protocol_handle: req.validatedBody.protocol_handle,
      kind: req.validatedBody.kind,
      title: title.length >= 5 ? title : "Community discussion",
      body: req.validatedBody.body,
      customer_id: req.auth_context.actor_id,
    },
  })

  res.status(201).json({
    comment: {
      id: result.comment.id,
      kind: result.comment.kind,
      body: result.comment.body,
      status: result.comment.status,
      submitted_at: result.comment.submitted_at,
    },
  })
}
