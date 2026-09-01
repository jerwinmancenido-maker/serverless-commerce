import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type { AdminListResearchProtocolCommunity, AdminModerateResearchProtocolCommunity } from "../../../../../modules/research-content/contracts/research-protocol-community"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import { moderateProtocolCommunityWorkflow } from "../../../../../workflows/manage-research-protocol-community"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.validatedQuery as AdminListResearchProtocolCommunity
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const allThreads = await service.listResearchProtocolThreads(
    { series_id: req.params.id, ...(query.status ? { status: query.status } : {}) },
    { take: 500, order: { submitted_at: "DESC" } },
  )
  const threadIds = allThreads.map((thread) => thread.id)
  const comments = threadIds.length ? await service.listResearchProtocolComments({ thread_id: threadIds }, { order: { submitted_at: "ASC" } }) : []
  const identityIds = Array.from(new Set(allThreads.map((thread) => thread.community_identity_id)))
  const identities = identityIds.length ? await service.listResearchCommunityIdentities({ id: identityIds }) : []
  const reports = await service.listResearchProtocolReports({ series_id: req.params.id }, { take: 500, order: { reported_at: "DESC" } })
  const identityById = new Map((identities as any[]).map((identity) => [identity.id, identity] as const))
  const commentsByThread = new Map<string, any[]>()
  for (const comment of comments) {
    if (!comment.thread_id) continue
    commentsByThread.set(comment.thread_id, [...(commentsByThread.get(comment.thread_id) || []), comment])
  }
  const reportCountByThread = new Map<string, number>()
  for (const report of reports.filter((item) => item.status === "open")) {
    if (report.thread_id) reportCountByThread.set(report.thread_id, (reportCountByThread.get(report.thread_id) || 0) + 1)
  }
  const q = query.q?.toLocaleLowerCase()
  const filtered = allThreads.filter((thread) => {
    if (!q) return true
    const identity = identityById.get(thread.community_identity_id)
    return [thread.title, identity?.display_name, ...(commentsByThread.get(thread.id) || []).map((comment) => comment.body)].some((value) => String(value || "").toLocaleLowerCase().includes(q))
  })
  const paged = filtered.slice(query.offset, query.offset + query.limit)
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    threads: paged.map((thread) => {
      const identity = identityById.get(thread.community_identity_id)
      return {
        id: thread.id,
        title: thread.title,
        kind: thread.kind,
        status: thread.status,
        is_pinned: thread.is_pinned,
        is_locked: thread.is_locked,
        is_answered: thread.is_answered,
        submitted_at: thread.submitted_at,
        last_activity_at: thread.last_activity_at,
        report_count: reportCountByThread.get(thread.id) || 0,
        identity: identity ? { id: identity.id, alias: identity.display_name, status: identity.status } : null,
        comments: (commentsByThread.get(thread.id) || []).map((comment) => ({
          id: comment.id,
          parent_comment_id: comment.parent_comment_id,
          body: comment.body,
          status: comment.status,
          submitted_at: comment.submitted_at,
          edited_at: comment.edited_at,
          removed_at: comment.removed_at,
        })),
      }
    }),
    reports: reports.map((report) => ({ id: report.id, thread_id: report.thread_id, comment_id: report.comment_id, reason: report.reason, details: report.details, status: report.status, reported_at: report.reported_at })),
    count: filtered.length,
    limit: query.limit,
    offset: query.offset,
  })
}

export async function POST(req: AuthenticatedMedusaRequest<AdminModerateResearchProtocolCommunity>, res: MedusaResponse) {
  const { result } = await moderateProtocolCommunityWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: req.params.id, actor_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ moderation: result })
}
