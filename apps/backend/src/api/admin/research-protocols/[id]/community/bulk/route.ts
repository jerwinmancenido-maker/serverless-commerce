import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { AdminBulkModerateResearchProtocolCommunity } from "../../../../../../modules/research-content/contracts/research-protocol-community"
import { moderateProtocolCommunityWorkflow } from "../../../../../../workflows/manage-research-protocol-community"

export async function POST(req: AuthenticatedMedusaRequest<AdminBulkModerateResearchProtocolCommunity>, res: MedusaResponse) {
  const { action, reason, thread_ids: threadIds, comment_ids: commentIds } = req.validatedBody
  for (const threadId of threadIds) {
    await moderateProtocolCommunityWorkflow(req.scope).run({ input: { action, reason, thread_id: threadId, comment_id: null, series_id: req.params.id, actor_id: req.auth_context.actor_id } })
  }
  for (const commentId of commentIds) {
    await moderateProtocolCommunityWorkflow(req.scope).run({ input: { action, reason, thread_id: null, comment_id: commentId, series_id: req.params.id, actor_id: req.auth_context.actor_id } })
  }
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ moderated: { threads: threadIds.length, comments: commentIds.length } })
}
