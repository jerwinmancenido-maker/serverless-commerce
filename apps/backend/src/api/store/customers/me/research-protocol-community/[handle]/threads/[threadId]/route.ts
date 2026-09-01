import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../../modules/research-content"
import { assertCommunityEligibility, getCustomerProtocolEligibility } from "../../../../../../../../modules/research-content/community-access"
import { buildCommunityCommentViews, buildCommunityThreadViews } from "../../../../../../../../modules/research-content/community-view"
import type ResearchContentModuleService from "../../../../../../../../modules/research-content/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const eligibility = await getCustomerProtocolEligibility({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    protocolHandle: req.params.handle,
  })
  assertCommunityEligibility({ ...eligibility, operation: "read" })
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [identity] = await service.listResearchCommunityIdentities({ customer_id: req.auth_context.actor_id }, { take: 1 })
  const [thread] = await service.listResearchProtocolThreads(
    { id: req.params.threadId, series_id: eligibility.series.id },
    { take: 1 },
  )
  if (!thread || (thread.status !== "approved" && thread.community_identity_id !== identity?.id)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Discussion was not found")
  }
  const comments = await service.listResearchProtocolComments(
    { thread_id: thread.id },
    { order: { submitted_at: "ASC" } },
  )
  const visibleComments = comments.filter(
    (comment) => comment.status === "approved" || comment.community_identity_id === identity?.id,
  )
  const [threadView] = await buildCommunityThreadViews({ service, threads: [thread], currentIdentityId: identity?.id || null, policy: eligibility.policy })
  const commentViews = await buildCommunityCommentViews({ service, comments: visibleComments, currentIdentityId: identity?.id || null, policy: eligibility.policy })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    thread: { ...threadView, comments: commentViews },
    notice: "Community discussion — separate from the official protocol.",
  })
}
