import type { ResearchProtocolVisibilityPolicyValue } from "./protocol-access"
import type ResearchContentModuleService from "./service"

export const buildCommunityThreadViews = async ({
  service,
  threads,
  currentIdentityId,
  policy,
}: {
  service: ResearchContentModuleService
  threads: any[]
  currentIdentityId: string | null
  policy: ResearchProtocolVisibilityPolicyValue
}) => {
  const threadIds = threads.map((thread) => thread.id)
  const identityIds = Array.from(
    new Set(threads.map((thread) => thread.community_identity_id)),
  )
  const [comments, identities, subscriptions] = await Promise.all([
    threadIds.length
      ? service.listResearchProtocolComments(
          { thread_id: threadIds },
          { order: { submitted_at: "ASC" } },
        )
      : [],
    identityIds.length
      ? service.listResearchCommunityIdentities({ id: identityIds })
      : [],
    currentIdentityId && threadIds.length
      ? service.listResearchProtocolSubscriptions({
          thread_id: threadIds,
          community_identity_id: currentIdentityId,
        })
      : [],
  ])
  const identityById = new Map<string, any>(
    (identities as any[]).map((identity) => [identity.id, identity] as const),
  )
  const subscribedThreadIds = new Set(
    subscriptions.map((subscription) => subscription.thread_id),
  )
  const approvedComments = comments.filter(
    (comment) =>
      comment.status === "approved" ||
      comment.community_identity_id === currentIdentityId,
  )
  const commentsByThread = new Map<string, typeof approvedComments>()
  for (const comment of approvedComments) {
    if (!comment.thread_id) continue
    commentsByThread.set(comment.thread_id, [
      ...(commentsByThread.get(comment.thread_id) || []),
      comment,
    ])
  }

  return threads.map((thread) => {
    const identity = identityById.get(thread.community_identity_id)
    const threadComments = commentsByThread.get(thread.id) || []
    const firstComment = threadComments.find(
      (comment) => comment.parent_comment_id === null,
    )
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
      reply_count: Math.max(threadComments.length - (firstComment ? 1 : 0), 0),
      followed: subscribedThreadIds.has(thread.id),
      owned_by_customer: thread.community_identity_id === currentIdentityId,
      author: {
        alias: identity?.display_name || "Community member",
        verified_customer:
          Boolean(identity?.show_verified_badge) &&
          policy.purchaser_badge_enabled &&
          policy.community_post_scope === "purchaser",
      },
      preview: firstComment
        ? {
            id: firstComment.id,
            body: firstComment.body,
            edited_at: firstComment.edited_at,
            removed: Boolean(firstComment.removed_at),
          }
        : null,
    }
  })
}

export const buildCommunityCommentViews = async ({
  service,
  comments,
  currentIdentityId,
  policy,
}: {
  service: ResearchContentModuleService
  comments: any[]
  currentIdentityId: string | null
  policy: ResearchProtocolVisibilityPolicyValue
}) => {
  const identityIds = Array.from(
    new Set(
      comments
        .map((comment) => comment.community_identity_id)
        .filter(Boolean),
    ),
  ) as string[]
  const commentIds = comments.map((comment) => comment.id)
  const [identities, reactions, currentReactions] = await Promise.all([
    identityIds.length
      ? service.listResearchCommunityIdentities({ id: identityIds })
      : [],
    commentIds.length
      ? service.listResearchProtocolReactions({ comment_id: commentIds })
      : [],
    currentIdentityId && commentIds.length
      ? service.listResearchProtocolReactions({
          comment_id: commentIds,
          community_identity_id: currentIdentityId,
        })
      : [],
  ])
  const identityById = new Map<string, any>(
    (identities as any[]).map((identity) => [identity.id, identity] as const),
  )
  const currentReactionByComment = new Map<string, string>(
    (currentReactions as any[]).map(
      (reaction) => [reaction.comment_id, reaction.reaction] as const,
    ),
  )
  const reactionCounts = new Map<string, { helpful: number; like: number }>()
  for (const reaction of reactions) {
    const counts = reactionCounts.get(reaction.comment_id) || {
      helpful: 0,
      like: 0,
    }
    counts[reaction.reaction as "helpful" | "like"] += 1
    reactionCounts.set(reaction.comment_id, counts)
  }
  return comments.map((comment) => {
    const identity = comment.community_identity_id
      ? identityById.get(comment.community_identity_id)
      : null
    return {
      id: comment.id,
      parent_comment_id: comment.parent_comment_id,
      kind: comment.kind,
      body: comment.removed_at ? "[Removed by author]" : comment.body,
      status: comment.status,
      submitted_at: comment.submitted_at,
      edited_at: comment.edited_at,
      removed: Boolean(comment.removed_at),
      owned_by_customer: comment.community_identity_id === currentIdentityId,
      author: {
        alias: identity?.display_name || "Community member",
        verified_customer:
          Boolean(identity?.show_verified_badge) &&
          policy.purchaser_badge_enabled &&
          policy.community_post_scope === "purchaser",
      },
      reactions: reactionCounts.get(comment.id) || { helpful: 0, like: 0 },
      customer_reaction: currentReactionByComment.get(comment.id) || null,
    }
  })
}
