import { randomBytes } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  assertCommunityEligibility,
  getCustomerProtocolEligibility,
} from "../../modules/research-content/community-access"
import {
  AdminModerateResearchProtocolCommunity,
  AdminResolveResearchProtocolReport,
  AdminUpdateResearchCommunityIdentityStatus,
  StoreCreateResearchProtocolReply,
  StoreCreateResearchProtocolThread,
  StoreEditResearchProtocolComment,
  StoreReactResearchProtocolComment,
  StoreReportResearchProtocolContent,
  StoreUpdateCommunityIdentity,
  StoreUpdateResearchProtocolSubscription,
  type AdminModerateResearchProtocolCommunity as ModerateRequest,
  type AdminResolveResearchProtocolReport as ResolveReportRequest,
  type AdminUpdateResearchCommunityIdentityStatus as IdentityStatusRequest,
  type StoreCreateResearchProtocolReply as ReplyRequest,
  type StoreCreateResearchProtocolThread as ThreadRequest,
  type StoreEditResearchProtocolComment as EditRequest,
  type StoreReactResearchProtocolComment as ReactionRequest,
  type StoreReportResearchProtocolContent as ReportRequest,
  type StoreUpdateCommunityIdentity as IdentityRequest,
  type StoreUpdateResearchProtocolSubscription as SubscriptionRequest,
} from "../../modules/research-content/contracts/research-protocol-community"
import type { ResearchProtocolVisibilityPolicyValue } from "../../modules/research-content/protocol-access"
import type ResearchContentModuleService from "../../modules/research-content/service"
import {
  createCustomerNotification,
  deleteCustomerNotifications,
} from "../../modules/research-tracking/customer-notifications"
import { emitCustomerNotificationWorkflow } from "../manage-customer-notifications"

type CustomerInput = { customer_id: string }
type SeriesInput = CustomerInput & { series_id: string }
export type UpdateCommunityIdentityWorkflowInput = CustomerInput & IdentityRequest
export type CreateProtocolThreadWorkflowInput = CustomerInput & ThreadRequest
export type CreateProtocolReplyWorkflowInput = SeriesInput & ReplyRequest & { thread_id: string }
export type EditProtocolCommentWorkflowInput = SeriesInput & EditRequest & { comment_id: string }
export type RemoveProtocolCommentWorkflowInput = SeriesInput & { comment_id: string }
export type ReactProtocolCommentWorkflowInput = SeriesInput & ReactionRequest & { comment_id: string }
export type RemoveProtocolReactionWorkflowInput = SeriesInput & { comment_id: string }
export type ReportProtocolContentWorkflowInput = SeriesInput & ReportRequest
export type UpdateProtocolSubscriptionWorkflowInput = SeriesInput & SubscriptionRequest & { thread_id: string }
export type ModerateProtocolCommunityWorkflowInput = ModerateRequest & {
  series_id: string
  actor_id: string
}
export type ResolveProtocolReportWorkflowInput = ResolveReportRequest & {
  series_id: string
  report_id: string
  actor_id: string
}
export type UpdateCommunityIdentityStatusWorkflowInput = IdentityStatusRequest & {
  series_id: string
  identity_id: string
  actor_id: string
}

type SubscriptionCompensation = {
  action: "delete" | "create" | "none"
  id: string | null
  value: Record<string, unknown> | null
}

const requireId = (value: string, message: string) => {
  const normalized = value?.trim()
  if (!normalized) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, message)
  }
  return normalized
}

const normalizeBody = (
  value: string,
  policy: ResearchProtocolVisibilityPolicyValue,
) => {
  const body = value.trim()
  if (body.length > policy.community_max_post_length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Community posts may contain at most ${policy.community_max_post_length} characters`,
    )
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(body)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Community posts contain unsupported control characters",
    )
  }
  if (!policy.community_links_enabled && /(?:https?:\/\/|www\.)/i.test(body)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Links are not enabled for this discussion",
    )
  }
  return body
}

const ensureIdentity = async (
  service: ResearchContentModuleService,
  customerId: string,
) => {
  const [existing] = await service.listResearchCommunityIdentities(
    { customer_id: customerId },
    { take: 1 },
  )
  if (existing) {
    if (existing.status === "suspended") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Community participation is suspended for this account",
      )
    }
    return existing
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const alias = `Member-${randomBytes(4).toString("hex").toUpperCase()}`
    const [collision] = await service.listResearchCommunityIdentities(
      { display_name: alias },
      { take: 1 },
    )
    if (!collision) {
      return service.createResearchCommunityIdentities({
        customer_id: customerId,
        display_name: alias,
        show_verified_badge: false,
        status: "active",
        suspended_at: null,
        suspension_reason: null,
      })
    }
  }
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "A private community alias could not be generated",
  )
}

const assertPostRate = async (
  service: ResearchContentModuleService,
  customerId: string,
  policy: ResearchProtocolVisibilityPolicyValue,
) => {
  const comments = await service.listResearchProtocolComments(
    { customer_id: customerId },
    { take: 100, order: { submitted_at: "DESC" } },
  )
  const cutoff = Date.now() - 60 * 60 * 1_000
  const recent = comments.filter(
    (comment) => new Date(comment.submitted_at).getTime() >= cutoff,
  )
  if (recent.length >= policy.community_posts_per_hour) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Community posting limit reached. Try again later.",
    )
  }
}

const assertNotDuplicate = async (
  service: ResearchContentModuleService,
  customerId: string,
  body: string,
) => {
  const comments = await service.listResearchProtocolComments(
    { customer_id: customerId },
    { take: 25, order: { submitted_at: "DESC" } },
  )
  const normalized = body.trim().toLocaleLowerCase()
  if (
    comments.some(
      (comment) => comment.body.trim().toLocaleLowerCase() === normalized,
    )
  ) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      "This post duplicates a recent submission",
    )
  }
}

const retrieveOwnedComment = async (
  service: ResearchContentModuleService,
  seriesId: string,
  commentId: string,
  customerId: string,
) => {
  const [comment] = await service.listResearchProtocolComments(
    { id: commentId, series_id: seriesId, customer_id: customerId },
    { take: 1 },
  )
  if (!comment) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Community comment was not found",
    )
  }
  return comment
}

export const updateCommunityIdentityStep = createStep(
  "update-community-identity",
  async (rawInput: UpdateCommunityIdentityWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to manage a community identity")
    const input = StoreUpdateCommunityIdentity.parse({
      display_name: rawInput.display_name,
      show_verified_badge: rawInput.show_verified_badge,
    })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    const [collision] = await service.listResearchCommunityIdentities(
      { display_name: input.display_name },
      { take: 1 },
    )
    if (collision && collision.id !== identity.id) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "That community display name is already in use",
      )
    }
    const previous = {
      id: identity.id,
      display_name: identity.display_name,
      show_verified_badge: identity.show_verified_badge,
    }
    const updated = await service.updateResearchCommunityIdentities({
      id: identity.id,
      display_name: input.display_name,
      show_verified_badge: input.show_verified_badge,
    })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .updateResearchCommunityIdentities(previous)
  },
)

export const createProtocolThreadStep = createStep(
  "create-protocol-thread",
  async (rawInput: CreateProtocolThreadWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to start a discussion")
    const input = StoreCreateResearchProtocolThread.parse({
      protocol_handle: rawInput.protocol_handle,
      kind: rawInput.kind,
      title: rawInput.title,
      body: rawInput.body,
    })
    const eligibility = await getCustomerProtocolEligibility({
      container,
      customerId,
      protocolHandle: input.protocol_handle,
    })
    assertCommunityEligibility({ ...eligibility, operation: "post" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    await assertPostRate(service, customerId, eligibility.policy)
    const body = normalizeBody(input.body, eligibility.policy)
    await assertNotDuplicate(service, customerId, body)
    const status = eligibility.policy.community_auto_hold ? "pending" : "approved"
    const now = new Date()
    const thread = await service.createResearchProtocolThreads({
      series_id: eligibility.series.id,
      community_identity_id: identity.id,
      title: input.title,
      kind: input.kind,
      status,
      is_pinned: false,
      is_locked: false,
      is_answered: false,
      submitted_at: now,
      moderated_at: null,
      moderated_by_actor_id: null,
      moderation_reason: null,
      last_activity_at: now,
    })
    const comment = await service.createResearchProtocolComments({
      series_id: eligibility.series.id,
      customer_id: customerId,
      community_identity_id: identity.id,
      thread_id: thread.id,
      parent_comment_id: null,
      author_name_snapshot: identity.display_name,
      kind: input.kind,
      body,
      status,
      submitted_at: now,
      edited_at: null,
      removed_at: null,
      moderated_at: null,
      moderated_by_actor_id: null,
      moderation_reason: null,
    })
    return new StepResponse({ thread, comment }, { threadId: thread.id, commentId: comment.id })
  },
  async (ids, { container }) => {
    if (!ids) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.deleteResearchProtocolComments(ids.commentId)
    await service.deleteResearchProtocolThreads(ids.threadId)
  },
)

export const createProtocolReplyStep = createStep(
  "create-protocol-reply",
  async (rawInput: CreateProtocolReplyWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to reply")
    const input = StoreCreateResearchProtocolReply.parse({
      body: rawInput.body,
      parent_comment_id: rawInput.parent_comment_id,
    })
    const eligibility = await getCustomerProtocolEligibility({
      container,
      customerId,
      seriesId: rawInput.series_id,
    })
    assertCommunityEligibility({ ...eligibility, operation: "post" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const [thread] = await service.listResearchProtocolThreads(
      { id: rawInput.thread_id, series_id: rawInput.series_id, status: "approved" },
      { take: 1 },
    )
    if (!thread || thread.is_locked) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        thread?.is_locked ? "This discussion is locked" : "Discussion was not found",
      )
    }
    let parentIdentityId: string | null = null
    if (input.parent_comment_id) {
      const [parent] = await service.listResearchProtocolComments(
        { id: input.parent_comment_id, thread_id: thread.id, status: "approved" },
        { take: 1 },
      )
      if (!parent) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, "Reply target was not found")
      }
      if (parent.parent_comment_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Replies can only be nested one level",
        )
      }
      parentIdentityId = parent.community_identity_id
    }
    const identity = await ensureIdentity(service, customerId)
    await assertPostRate(service, customerId, eligibility.policy)
    const body = normalizeBody(input.body, eligibility.policy)
    await assertNotDuplicate(service, customerId, body)
    const now = new Date()
    const status = eligibility.policy.community_auto_hold ? "pending" : "approved"
    const comment = await service.createResearchProtocolComments({
      series_id: rawInput.series_id,
      customer_id: customerId,
      community_identity_id: identity.id,
      thread_id: thread.id,
      parent_comment_id: input.parent_comment_id,
      author_name_snapshot: identity.display_name,
      kind: "general",
      body,
      status,
      submitted_at: now,
      edited_at: null,
      removed_at: null,
      moderated_at: null,
      moderated_by_actor_id: null,
      moderation_reason: null,
    })
    const previousActivity = thread.last_activity_at
    await service.updateResearchProtocolThreads({ id: thread.id, last_activity_at: now })
    const subscriptions = await service.listResearchProtocolSubscriptions({
      thread_id: thread.id,
    })
    const mentionNames = [...body.matchAll(/@([A-Za-z0-9_-]{2,40})/g)].map((match) => match[1])
    const mentionedIdentities = mentionNames.length
      ? await service.listResearchCommunityIdentities({ display_name: mentionNames, status: "active" })
      : []
    const mentionedIdentityIds = new Set(mentionedIdentities.map((item) => item.id))
    const directReplyIdentityIds = new Set([thread.community_identity_id, parentIdentityId].filter(Boolean) as string[])
    const recipientIdentityIds = Array.from(
      new Set(
        [
          thread.community_identity_id,
          parentIdentityId,
          ...subscriptions.map((subscription) =>
            subscription.community_identity_id,
          ),
          ...mentionedIdentities.map((mentioned) => mentioned.id),
        ].filter(Boolean) as string[],
      ),
    ).filter((identityId) => identityId !== identity.id)
    const recipients = recipientIdentityIds.length
      ? await service.listResearchCommunityIdentities({
          id: recipientIdentityIds,
          status: "active",
        })
      : []
    const notificationIds = (
      await Promise.all(
        recipients.map(async (recipient) => {
          const eventKey = mentionedIdentityIds.has(recipient.id)
            ? "community.mentioned"
            : directReplyIdentityIds.has(recipient.id)
              ? "community.reply_received"
              : "community.followed_thread_updated"
          const { result } = await emitCustomerNotificationWorkflow(container).run({
            input: {
              customer_id: recipient.customer_id,
              event_key: eventKey,
              source_id: `${comment.id}:${recipient.id}`,
              variables: { thread_title: `“${thread.title}”` },
              target_kind: "community_thread",
              target_id: thread.id,
              secondary_target_id: comment.id,
              group_key: `community-thread:${thread.id}:${recipient.customer_id}`,
              metadata: {},
            },
          })
          return result?.id || null
        }),
      )
    ).filter(Boolean) as string[]
    return new StepResponse(comment, {
      commentId: comment.id,
      threadId: thread.id,
      previousActivity,
      notificationIds,
    })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await deleteCustomerNotifications({
      container,
      ids: data.notificationIds || [],
    })
    await service.deleteResearchProtocolComments(data.commentId)
    await service.updateResearchProtocolThreads({ id: data.threadId, last_activity_at: data.previousActivity })
  },
)

export const editProtocolCommentStep = createStep(
  "edit-protocol-comment",
  async (rawInput: EditProtocolCommentWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to edit a comment")
    const input = StoreEditResearchProtocolComment.parse({ body: rawInput.body })
    const eligibility = await getCustomerProtocolEligibility({ container, customerId, seriesId: rawInput.series_id })
    assertCommunityEligibility({ ...eligibility, operation: "post" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const comment = await retrieveOwnedComment(service, rawInput.series_id, rawInput.comment_id, customerId)
    const editDeadline = new Date(comment.submitted_at).getTime() + eligibility.policy.community_edit_window_minutes * 60_000
    if (Date.now() > editDeadline) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The edit window for this comment has ended")
    }
    const body = normalizeBody(input.body, eligibility.policy)
    const edit = await service.createResearchProtocolCommentEdits({
      comment_id: comment.id,
      edited_by_customer_id: customerId,
      previous_body: comment.body,
      edited_at: new Date(),
    })
    const previous = { id: comment.id, body: comment.body, edited_at: comment.edited_at, status: comment.status }
    const updated = await service.updateResearchProtocolComments({
      id: comment.id,
      body,
      edited_at: new Date(),
      status: eligibility.policy.community_auto_hold ? "pending" : comment.status,
    })
    return new StepResponse(updated, { previous, editId: edit.id })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.updateResearchProtocolComments(data.previous)
    await service.deleteResearchProtocolCommentEdits(data.editId)
  },
)

export const removeProtocolCommentStep = createStep(
  "remove-protocol-comment",
  async (rawInput: RemoveProtocolCommentWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to remove a comment")
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const comment = await retrieveOwnedComment(service, rawInput.series_id, rawInput.comment_id, customerId)
    const previous = { id: comment.id, body: comment.body, removed_at: comment.removed_at }
    const updated = await service.updateResearchProtocolComments({
      id: comment.id,
      body: "[Removed by author]",
      removed_at: new Date(),
    })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .updateResearchProtocolComments(previous)
  },
)

export const reactProtocolCommentStep = createStep(
  "react-protocol-comment",
  async (rawInput: ReactProtocolCommentWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to react")
    const input = StoreReactResearchProtocolComment.parse({ reaction: rawInput.reaction })
    const eligibility = await getCustomerProtocolEligibility({ container, customerId, seriesId: rawInput.series_id })
    assertCommunityEligibility({ ...eligibility, operation: "read" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    const recentReactions = await service.listResearchProtocolReactions(
      { community_identity_id: identity.id },
      { take: eligibility.policy.community_reactions_per_minute + 1, order: { reacted_at: "DESC" } },
    )
    const minuteAgo = Date.now() - 60_000
    if (
      recentReactions.filter(
        (reaction) => new Date(reaction.reacted_at).getTime() >= minuteAgo,
      ).length >= eligibility.policy.community_reactions_per_minute
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Reaction limit reached. Try again shortly.",
      )
    }
    const [comment] = await service.listResearchProtocolComments(
      { id: rawInput.comment_id, series_id: rawInput.series_id, status: "approved" },
      { take: 1 },
    )
    if (!comment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Comment was not found")
    const [existing] = await service.listResearchProtocolReactions(
      { comment_id: comment.id, community_identity_id: identity.id },
      { take: 1 },
    )
    const previous = existing ? { ...existing } : null
    const reaction = existing
      ? await service.updateResearchProtocolReactions({ id: existing.id, reaction: input.reaction, reacted_at: new Date() })
      : await service.createResearchProtocolReactions({ comment_id: comment.id, community_identity_id: identity.id, reaction: input.reaction, reacted_at: new Date() })
    return new StepResponse(reaction, { created: !existing, id: reaction.id, previous })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    if (data.created) await service.deleteResearchProtocolReactions(data.id)
    else if (data.previous) await service.updateResearchProtocolReactions(data.previous)
  },
)

export const removeProtocolReactionStep = createStep(
  "remove-protocol-reaction",
  async (rawInput: RemoveProtocolReactionWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to remove a reaction")
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    const [reaction] = await service.listResearchProtocolReactions(
      { comment_id: rawInput.comment_id, community_identity_id: identity.id },
      { take: 1 },
    )
    if (!reaction) return new StepResponse(null, null)
    await service.deleteResearchProtocolReactions(reaction.id)
    return new StepResponse(null, { ...reaction })
  },
  async (previous, { container }) => {
    if (!previous) return
    await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .createResearchProtocolReactions(previous)
  },
)

export const reportProtocolContentStep = createStep(
  "report-protocol-content",
  async (rawInput: ReportProtocolContentWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to report content")
    const input = StoreReportResearchProtocolContent.parse({
      comment_id: rawInput.comment_id,
      thread_id: rawInput.thread_id,
      reason: rawInput.reason,
      details: rawInput.details,
    })
    if (Boolean(input.comment_id) === Boolean(input.thread_id)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose one comment or discussion to report")
    }
    const eligibility = await getCustomerProtocolEligibility({ container, customerId, seriesId: rawInput.series_id })
    assertCommunityEligibility({ ...eligibility, operation: "read" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    const reports = await service.listResearchProtocolReports(
      { reporter_identity_id: identity.id },
      { take: 100, order: { reported_at: "DESC" } },
    )
    const cutoff = Date.now() - 60 * 60 * 1_000
    if (reports.filter((report) => new Date(report.reported_at).getTime() >= cutoff).length >= eligibility.policy.community_reports_per_hour) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Report limit reached. Try again later.")
    }
    if (input.comment_id) {
      const [comment] = await service.listResearchProtocolComments({ id: input.comment_id, series_id: rawInput.series_id, status: "approved" }, { take: 1 })
      if (!comment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Comment was not found")
      if (comment.community_identity_id === identity.id) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You cannot report your own comment")
      const [duplicate] = await service.listResearchProtocolReports({ comment_id: comment.id, reporter_identity_id: identity.id }, { take: 1 })
      if (duplicate) throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You already reported this comment")
    }
    if (input.thread_id) {
      const [thread] = await service.listResearchProtocolThreads({ id: input.thread_id, series_id: rawInput.series_id, status: "approved" }, { take: 1 })
      if (!thread) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Discussion was not found")
      if (thread.community_identity_id === identity.id) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You cannot report your own discussion")
      const [duplicate] = await service.listResearchProtocolReports({ thread_id: thread.id, reporter_identity_id: identity.id }, { take: 1 })
      if (duplicate) throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You already reported this discussion")
    }
    const report = await service.createResearchProtocolReports({
      series_id: rawInput.series_id,
      thread_id: input.thread_id,
      comment_id: input.comment_id,
      reporter_identity_id: identity.id,
      reason: input.reason,
      details: input.details,
      status: "open",
      reported_at: new Date(),
      resolved_at: null,
      resolved_by_actor_id: null,
    })
    const targetReports = await service.listResearchProtocolReports({
      ...(input.comment_id ? { comment_id: input.comment_id } : { thread_id: input.thread_id! }),
      status: "open",
    })
    if (targetReports.length >= eligibility.policy.community_report_hide_threshold) {
      if (input.comment_id) await service.updateResearchProtocolComments({ id: input.comment_id, status: "hidden", moderation_reason: "Automatically held after community reports" })
      if (input.thread_id) await service.updateResearchProtocolThreads({ id: input.thread_id, status: "hidden", moderation_reason: "Automatically held after community reports" })
    }
    return new StepResponse(report, report.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .deleteResearchProtocolReports(id)
  },
)

export const updateProtocolSubscriptionStep = createStep(
  "update-protocol-subscription",
  async (rawInput: UpdateProtocolSubscriptionWorkflowInput, { container }) => {
    const customerId = requireId(rawInput.customer_id, "Sign in to follow a discussion")
    const input = StoreUpdateResearchProtocolSubscription.parse({
      subscribed: rawInput.subscribed,
    })
    const eligibility = await getCustomerProtocolEligibility({ container, customerId, seriesId: rawInput.series_id })
    assertCommunityEligibility({ ...eligibility, operation: "read" })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const identity = await ensureIdentity(service, customerId)
    const [thread] = await service.listResearchProtocolThreads({ id: rawInput.thread_id, series_id: rawInput.series_id, status: "approved" }, { take: 1 })
    if (!thread) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Discussion was not found")
    const [existing] = await service.listResearchProtocolSubscriptions({ series_id: rawInput.series_id, thread_id: thread.id, community_identity_id: identity.id }, { take: 1 })
    if (input.subscribed && !existing) {
      const created = await service.createResearchProtocolSubscriptions({ series_id: rawInput.series_id, thread_id: thread.id, community_identity_id: identity.id, subscribed_at: new Date() })
      const compensation: SubscriptionCompensation = { action: "delete", id: created.id, value: null }
      return new StepResponse({ subscribed: true }, compensation)
    }
    if (!input.subscribed && existing) {
      await service.deleteResearchProtocolSubscriptions(existing.id)
      const compensation: SubscriptionCompensation = { action: "create", id: null, value: { ...existing } }
      return new StepResponse({ subscribed: false }, compensation)
    }
    const compensation: SubscriptionCompensation = { action: "none", id: null, value: null }
    return new StepResponse({ subscribed: Boolean(existing) }, compensation)
  },
  async (data, { container }) => {
    if (!data || data.action === "none") return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    if (data.action === "delete" && data.id) await service.deleteResearchProtocolSubscriptions(data.id)
    if (data.action === "create" && data.value) await service.createResearchProtocolSubscriptions(data.value as any)
  },
)

export const moderateProtocolCommunityStep = createStep(
  "moderate-protocol-community",
  async (rawInput: ModerateProtocolCommunityWorkflowInput, { container }) => {
    const actorId = requireId(rawInput.actor_id, "Authenticated community moderator is required")
    const input = AdminModerateResearchProtocolCommunity.parse({
      action: rawInput.action,
      thread_id: rawInput.thread_id,
      comment_id: rawInput.comment_id,
      reason: rawInput.reason,
    })
    if (Boolean(input.comment_id) === Boolean(input.thread_id)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose one comment or discussion")
    }
    if (["reject", "hide"].includes(input.action) && !input.reason) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A moderation reason is required")
    }
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    let previous: Record<string, unknown>
    let moderatedIdentityId: string | null
    if (input.comment_id) {
      const [comment] = await service.listResearchProtocolComments({ id: input.comment_id, series_id: rawInput.series_id }, { take: 1 })
      if (!comment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Comment was not found")
      previous = { target: "comment", id: comment.id, status: comment.status, moderated_at: comment.moderated_at, moderated_by_actor_id: comment.moderated_by_actor_id, moderation_reason: comment.moderation_reason }
      moderatedIdentityId = comment.community_identity_id
      const status = input.action === "approve" || input.action === "restore" ? "approved" : input.action === "reject" ? "rejected" : "hidden"
      await service.updateResearchProtocolComments({ id: comment.id, status, moderated_at: new Date(), moderated_by_actor_id: actorId, moderation_reason: input.reason })
    } else {
      const [thread] = await service.listResearchProtocolThreads({ id: input.thread_id!, series_id: rawInput.series_id }, { take: 1 })
      if (!thread) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Discussion was not found")
      previous = { target: "thread", id: thread.id, status: thread.status, is_pinned: thread.is_pinned, is_locked: thread.is_locked, is_answered: thread.is_answered, moderated_at: thread.moderated_at, moderated_by_actor_id: thread.moderated_by_actor_id, moderation_reason: thread.moderation_reason }
      moderatedIdentityId = thread.community_identity_id
      const changes: Record<string, unknown> = { id: thread.id, moderated_at: new Date(), moderated_by_actor_id: actorId, moderation_reason: input.reason }
      if (input.action === "approve" || input.action === "restore") changes.status = "approved"
      if (input.action === "reject") changes.status = "rejected"
      if (input.action === "hide") changes.status = "hidden"
      if (input.action === "pin") changes.is_pinned = true
      if (input.action === "unpin") changes.is_pinned = false
      if (input.action === "lock") changes.is_locked = true
      if (input.action === "unlock") changes.is_locked = false
      if (input.action === "mark_answered") changes.is_answered = true
      if (input.action === "unmark_answered") changes.is_answered = false
      await service.updateResearchProtocolThreads(changes as any)
    }
    const event = await service.createResearchProtocolModerationEvents({ series_id: rawInput.series_id, thread_id: input.thread_id, comment_id: input.comment_id, action: input.action, actor_id: actorId, reason: input.reason, occurred_at: new Date(), details: null })
    const [recipient] = moderatedIdentityId
      ? await service.listResearchCommunityIdentities(
          { id: moderatedIdentityId },
          { take: 1 },
        )
      : []
    const notificationId = recipient
      ? await createCustomerNotification({
          container,
          customerId: recipient.customer_id,
          type: "community_moderation",
          title: "Community moderation update",
          body: `Your community content was ${input.action.replaceAll("_", " ")}.`,
          idempotencySource: event.id,
          metadata: {
            protocol_series_id: rawInput.series_id,
            thread_id: input.thread_id,
            comment_id: input.comment_id,
          },
          preference: "community_moderation_notifications",
          targetKind: "community_thread",
          targetId: input.thread_id || null,
        })
      : null
    return new StepResponse(
      { action: input.action },
      {
        previous,
        eventId: event.id,
        notificationIds: notificationId ? [notificationId] : [],
      },
    )
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await deleteCustomerNotifications({
      container,
      ids: data.notificationIds || [],
    })
    const { target, ...previous } = data.previous as any
    if (target === "comment") await service.updateResearchProtocolComments(previous)
    else await service.updateResearchProtocolThreads(previous)
    await service.deleteResearchProtocolModerationEvents(data.eventId)
  },
)

export const resolveProtocolReportStep = createStep(
  "resolve-protocol-report",
  async (rawInput: ResolveProtocolReportWorkflowInput, { container }) => {
    const actorId = requireId(rawInput.actor_id, "Authenticated community moderator is required")
    const input = AdminResolveResearchProtocolReport.parse({ action: rawInput.action, reason: rawInput.reason })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const [report] = await service.listResearchProtocolReports({ id: rawInput.report_id, series_id: rawInput.series_id }, { take: 1 })
    if (!report) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Community report was not found")
    const previous = { id: report.id, status: report.status, resolved_at: report.resolved_at, resolved_by_actor_id: report.resolved_by_actor_id }
    const updated = await service.updateResearchProtocolReports({ id: report.id, status: input.action === "resolve" ? "resolved" : "dismissed", resolved_at: new Date(), resolved_by_actor_id: actorId })
    const event = await service.createResearchProtocolModerationEvents({ series_id: rawInput.series_id, thread_id: report.thread_id, comment_id: report.comment_id, action: `report_${input.action}`, actor_id: actorId, reason: input.reason, occurred_at: new Date(), details: { report_id: report.id } })
    const [reporter] = await service.listResearchCommunityIdentities({ id: report.reporter_identity_id }, { take: 1 })
    const { result: notification } = reporter ? await emitCustomerNotificationWorkflow(container).run({ input: { customer_id: reporter.customer_id, event_key: "community.report_resolved", source_id: event.id, variables: {}, target_kind: "community_thread", target_id: report.thread_id || null, secondary_target_id: report.comment_id || null, metadata: {} } }) : { result: null }
    return new StepResponse(updated, { previous, eventId: event.id, notificationIds: notification?.id ? [notification.id] : [] })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await deleteCustomerNotifications({ container, ids: data.notificationIds || [] })
    await service.updateResearchProtocolReports(data.previous)
    await service.deleteResearchProtocolModerationEvents(data.eventId)
  },
)

export const updateCommunityIdentityStatusStep = createStep(
  "update-community-identity-status",
  async (rawInput: UpdateCommunityIdentityStatusWorkflowInput, { container }) => {
    const actorId = requireId(rawInput.actor_id, "Authenticated community moderator is required")
    const input = AdminUpdateResearchCommunityIdentityStatus.parse({ action: rawInput.action, reason: rawInput.reason })
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const [identity] = await service.listResearchCommunityIdentities({ id: rawInput.identity_id }, { take: 1 })
    if (!identity) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Community identity was not found")
    const previous = { id: identity.id, status: identity.status, suspended_at: identity.suspended_at, suspension_reason: identity.suspension_reason }
    const updated = await service.updateResearchCommunityIdentities({ id: identity.id, status: input.action === "suspend" ? "suspended" : "active", suspended_at: input.action === "suspend" ? new Date() : null, suspension_reason: input.action === "suspend" ? input.reason : null })
    const event = await service.createResearchProtocolModerationEvents({ series_id: rawInput.series_id, thread_id: null, comment_id: null, action: `identity_${input.action}`, actor_id: actorId, reason: input.reason, occurred_at: new Date(), details: { identity_id: identity.id } })
    return new StepResponse(updated, { previous, eventId: event.id })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.updateResearchCommunityIdentities(data.previous)
    await service.deleteResearchProtocolModerationEvents(data.eventId)
  },
)
