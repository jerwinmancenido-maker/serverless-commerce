import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../modules/research-content"
import { getCustomerProtocolEligibility, assertCommunityEligibility } from "../../../../../../../modules/research-content/community-access"
import type { StoreCreateResearchProtocolThread, StoreListResearchProtocolThreads } from "../../../../../../../modules/research-content/contracts/research-protocol-community"
import { buildCommunityThreadViews } from "../../../../../../../modules/research-content/community-view"
import type ResearchContentModuleService from "../../../../../../../modules/research-content/service"
import { createProtocolThreadWorkflow } from "../../../../../../../workflows/manage-research-protocol-community"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.validatedQuery as StoreListResearchProtocolThreads
  const eligibility = await getCustomerProtocolEligibility({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    protocolHandle: req.params.handle,
  })
  assertCommunityEligibility({ ...eligibility, operation: "read" })
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [identity] = await service.listResearchCommunityIdentities(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  const allThreads = await service.listResearchProtocolThreads(
    { series_id: eligibility.series.id, ...(query.kind ? { kind: query.kind } : {}) },
    { take: 250, order: { is_pinned: "DESC", last_activity_at: "DESC" } },
  )
  const eligibleThreads = allThreads.filter(
    (thread) => thread.status === "approved" || thread.community_identity_id === identity?.id,
  )
  const views = await buildCommunityThreadViews({
    service,
    threads: eligibleThreads,
    currentIdentityId: identity?.id || null,
    policy: eligibility.policy,
  })
  const followed = query.followed ? views.filter((thread) => thread.followed) : views
  const threads = followed.slice(query.offset, query.offset + query.limit)
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ threads, count: followed.length, limit: query.limit, offset: query.offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchProtocolThread>,
  res: MedusaResponse,
) {
  const { result } = await createProtocolThreadWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      protocol_handle: req.params.handle,
      customer_id: req.auth_context.actor_id,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.status(201).json({
    thread: { id: result.thread.id, status: result.thread.status },
    comment: { id: result.comment.id, status: result.comment.status },
  })
}
