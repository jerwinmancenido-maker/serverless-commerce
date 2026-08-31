import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminModerateResearchProtocolComment } from "../../../../../../../modules/research-content/contracts/research-protocol-comment"
import { moderateResearchProtocolCommentWorkflow } from "../../../../../../../workflows/manage-research-protocol-comment"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminModerateResearchProtocolComment>,
  res: MedusaResponse,
) {
  const { result } = await moderateResearchProtocolCommentWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      comment_id: req.params.commentId,
      actor_id: req.auth_context.actor_id,
    },
  })

  res.json({ comment: result })
}
