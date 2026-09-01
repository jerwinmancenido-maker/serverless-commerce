import { MedusaError } from "@medusajs/framework/utils"

export const NOTIFICATION_CATEGORIES = [
  "support",
  "community",
  "protocols",
  "research",
  "rewards",
  "system",
] as const

export const NOTIFICATION_PRIORITIES = ["low", "normal", "high", "urgent"] as const

export const NOTIFICATION_TARGET_KINDS = [
  "support_conversation",
  "community_thread",
  "protocol",
  "research_hub_section",
  "rewards",
  "notifications",
] as const

export const NOTIFICATION_EVENT_KEYS = [
  "support.reply_received",
  "support.status_changed",
  "support.conversation_resolved",
  "support.conversation_reopened",
  "community.reply_received",
  "community.mentioned",
  "community.followed_thread_updated",
  "community.moderation_completed",
  "community.report_resolved",
  "protocol.access_granted",
  "protocol.revision_published",
  "protocol.current_revision_withdrawn",
  "protocol.access_changed",
  "research.routine_reminder",
  "research.daily_summary",
  "research.weekly_summary",
  "research.progress_prompt",
  "research.journal_prompt",
  "research.replenishment_reminder",
  "research.goal_completed",
  "research.streak_milestone",
  "reward.points_earned",
  "reward.points_available",
  "reward.points_redeemed",
  "reward.points_reversed",
  "reward.points_expiring",
  "reward.referral_completed",
  "system.test",
] as const

export type NotificationEventKey = (typeof NOTIFICATION_EVENT_KEYS)[number]
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]
export type NotificationTargetKind = (typeof NOTIFICATION_TARGET_KINDS)[number]

export type NotificationCatalogEntry = {
  event_key: NotificationEventKey
  display_name: string
  category: NotificationCategory
  enabled: boolean
  priority: NotificationPriority
  default_enabled: boolean
  customer_can_disable: boolean
  retention_days: number
  title_template: string
  body_template: string
  action_label: string | null
  allowed_variables: string[]
  snoozable: boolean
}

const entry = (
  value: Omit<NotificationCatalogEntry, "enabled" | "retention_days" | "allowed_variables"> & {
    enabled?: boolean
    retention_days?: number
    allowed_variables?: string[]
  },
): NotificationCatalogEntry => ({
  enabled: true,
  retention_days: 180,
  allowed_variables: [],
  ...value,
})

export const NOTIFICATION_EVENT_CATALOG: Record<NotificationEventKey, NotificationCatalogEntry> = {
  "support.reply_received": entry({ event_key: "support.reply_received", display_name: "Support reply", category: "support", priority: "high", default_enabled: true, customer_can_disable: false, title_template: "Support replied", body_template: "There is a new reply to {{subject}}.", action_label: "Open conversation", allowed_variables: ["subject"], snoozable: false }),
  "support.status_changed": entry({ event_key: "support.status_changed", display_name: "Support status update", category: "support", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Support conversation updated", body_template: "Your support conversation is now {{status}}.", action_label: "View update", allowed_variables: ["status"], snoozable: false }),
  "support.conversation_resolved": entry({ event_key: "support.conversation_resolved", display_name: "Support conversation resolved", category: "support", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Support conversation resolved", body_template: "Your support conversation was marked resolved.", action_label: "View conversation", snoozable: false }),
  "support.conversation_reopened": entry({ event_key: "support.conversation_reopened", display_name: "Support conversation reopened", category: "support", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Support conversation reopened", body_template: "Your support conversation is open again.", action_label: "View conversation", snoozable: false }),
  "community.reply_received": entry({ event_key: "community.reply_received", display_name: "Community reply", category: "community", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "New community reply", body_template: "There is a new reply in {{thread_title}}.", action_label: "View discussion", allowed_variables: ["thread_title"], snoozable: false }),
  "community.mentioned": entry({ event_key: "community.mentioned", display_name: "Community mention", category: "community", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "You were mentioned", body_template: "Your private community alias was mentioned in {{thread_title}}.", action_label: "View mention", allowed_variables: ["thread_title"], snoozable: false }),
  "community.followed_thread_updated": entry({ event_key: "community.followed_thread_updated", display_name: "Followed discussion update", category: "community", priority: "low", default_enabled: true, customer_can_disable: true, title_template: "A followed discussion was updated", body_template: "There is new activity in {{thread_title}}.", action_label: "View discussion", allowed_variables: ["thread_title"], snoozable: false }),
  "community.moderation_completed": entry({ event_key: "community.moderation_completed", display_name: "Community moderation outcome", category: "community", priority: "high", default_enabled: true, customer_can_disable: false, title_template: "Community review completed", body_template: "A moderation decision is available for your community content.", action_label: "View decision", snoozable: false }),
  "community.report_resolved": entry({ event_key: "community.report_resolved", display_name: "Community report resolved", category: "community", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Community report resolved", body_template: "A decision is available for a report you submitted.", action_label: "View decision", snoozable: false }),
  "protocol.access_granted": entry({ event_key: "protocol.access_granted", display_name: "Protocol access granted", category: "protocols", priority: "high", default_enabled: true, customer_can_disable: false, title_template: "Protocol access is ready", body_template: "Your preserved order-linked revision is now available.", action_label: "Open protocol", snoozable: false }),
  "protocol.revision_published": entry({ event_key: "protocol.revision_published", display_name: "New protocol revision", category: "protocols", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "A newer protocol revision is available", body_template: "A newer current revision of {{protocol_title}} is available. Your order-linked revision remains preserved.", action_label: "Review update", allowed_variables: ["protocol_title"], snoozable: false }),
  "protocol.current_revision_withdrawn": entry({ event_key: "protocol.current_revision_withdrawn", display_name: "Protocol revision withdrawn", category: "protocols", priority: "urgent", default_enabled: true, customer_can_disable: false, title_template: "Protocol revision update", body_template: "The current revision of {{protocol_title}} was withdrawn. Review the protocol page for the latest status.", action_label: "Review protocol", allowed_variables: ["protocol_title"], snoozable: false }),
  "protocol.access_changed": entry({ event_key: "protocol.access_changed", display_name: "Protocol access changed", category: "protocols", priority: "urgent", default_enabled: true, customer_can_disable: false, title_template: "Protocol access changed", body_template: "The access status for {{protocol_title}} changed.", action_label: "Review access", allowed_variables: ["protocol_title"], snoozable: false }),
  "research.routine_reminder": entry({ event_key: "research.routine_reminder", display_name: "Routine reminder", category: "research", priority: "normal", default_enabled: true, customer_can_disable: true, retention_days: 30, title_template: "Routine reminder", body_template: "{{routine_title}} is scheduled for {{scheduled_time}}.", action_label: "Open Today", allowed_variables: ["routine_title", "scheduled_time"], snoozable: true }),
  "research.daily_summary": entry({ event_key: "research.daily_summary", display_name: "Daily summary", category: "research", priority: "low", default_enabled: false, customer_can_disable: true, retention_days: 30, title_template: "Your daily Research Hub summary", body_template: "You have {{count}} scheduled activities today.", action_label: "Open Today", allowed_variables: ["count"], snoozable: false }),
  "research.weekly_summary": entry({ event_key: "research.weekly_summary", display_name: "Weekly summary", category: "research", priority: "low", default_enabled: false, customer_can_disable: true, retention_days: 60, title_template: "Your weekly Research Hub summary", body_template: "Your weekly activity summary is ready.", action_label: "View progress", snoozable: false }),
  "research.progress_prompt": entry({ event_key: "research.progress_prompt", display_name: "Progress prompt", category: "research", priority: "low", default_enabled: false, customer_can_disable: true, retention_days: 30, title_template: "Record your progress", body_template: "Add a progress update when you are ready.", action_label: "Open Progress", snoozable: true }),
  "research.journal_prompt": entry({ event_key: "research.journal_prompt", display_name: "Journal prompt", category: "research", priority: "low", default_enabled: false, customer_can_disable: true, retention_days: 30, title_template: "Journal check-in", body_template: "Add a private Journal entry when you are ready.", action_label: "Open Journal", snoozable: true }),
  "research.replenishment_reminder": entry({ event_key: "research.replenishment_reminder", display_name: "Replenishment reminder", category: "research", priority: "normal", default_enabled: true, customer_can_disable: true, retention_days: 60, title_template: "Plan your replenishment", body_template: "A tracked supply may need attention soon.", action_label: "Review supplies", snoozable: true }),
  "research.goal_completed": entry({ event_key: "research.goal_completed", display_name: "Goal completed", category: "research", priority: "low", default_enabled: true, customer_can_disable: true, retention_days: 90, title_template: "Goal completed", body_template: "You completed {{goal_title}}.", action_label: "View goals", allowed_variables: ["goal_title"], snoozable: false }),
  "research.streak_milestone": entry({ event_key: "research.streak_milestone", display_name: "Streak milestone", category: "research", priority: "low", default_enabled: true, customer_can_disable: true, retention_days: 90, title_template: "Streak milestone", body_template: "You reached a {{streak_count}}-activity streak.", action_label: "View progress", allowed_variables: ["streak_count"], snoozable: false }),
  "reward.points_earned": entry({ event_key: "reward.points_earned", display_name: "Points earned", category: "rewards", priority: "low", default_enabled: true, customer_can_disable: true, title_template: "Points earned", body_template: "{{points}} points were added to your rewards activity.", action_label: "View rewards", allowed_variables: ["points"], snoozable: false }),
  "reward.points_available": entry({ event_key: "reward.points_available", display_name: "Points available", category: "rewards", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Points are now available", body_template: "{{points}} pending points are now available.", action_label: "View rewards", allowed_variables: ["points"], snoozable: false }),
  "reward.points_redeemed": entry({ event_key: "reward.points_redeemed", display_name: "Points redeemed", category: "rewards", priority: "normal", default_enabled: true, customer_can_disable: false, title_template: "Points redeemed", body_template: "{{points}} points were redeemed from your rewards account.", action_label: "View rewards", allowed_variables: ["points"], snoozable: false }),
  "reward.points_reversed": entry({ event_key: "reward.points_reversed", display_name: "Points reversed", category: "rewards", priority: "high", default_enabled: true, customer_can_disable: false, title_template: "Rewards balance adjusted", body_template: "{{points}} points were reversed. Review your rewards activity for details.", action_label: "Review rewards", allowed_variables: ["points"], snoozable: false }),
  "reward.points_expiring": entry({ event_key: "reward.points_expiring", display_name: "Points expiring", category: "rewards", priority: "normal", default_enabled: true, customer_can_disable: true, title_template: "Points expiring soon", body_template: "{{points}} points are scheduled to expire on {{date}}.", action_label: "View rewards", allowed_variables: ["points", "date"], snoozable: false }),
  "reward.referral_completed": entry({ event_key: "reward.referral_completed", display_name: "Referral completed", category: "rewards", priority: "low", default_enabled: true, customer_can_disable: true, title_template: "Referral reward completed", body_template: "Your referral reward is now recorded.", action_label: "View rewards", snoozable: false }),
  "system.test": entry({ event_key: "system.test", display_name: "Test notification", category: "system", priority: "low", default_enabled: true, customer_can_disable: false, retention_days: 7, title_template: "Notification Center test", body_template: "This is an owner-sent test notification.", action_label: "Open notifications", snoozable: false }),
}

export const getNotificationCatalogEntry = (eventKey: string) => {
  const entryValue = NOTIFICATION_EVENT_CATALOG[eventKey as NotificationEventKey]
  if (!entryValue) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown notification event: ${eventKey}`,
    )
  }
  return entryValue
}

const variablePattern = /{{\s*([a-zA-Z0-9_]+)\s*}}/g

export const listTemplateVariables = (value: string) =>
  [...value.matchAll(variablePattern)].map((match) => match[1])

export const validateTemplateVariables = ({
  title,
  body,
  allowed,
}: {
  title: string
  body: string
  allowed: string[]
}) => {
  const unknown = [...new Set([...listTemplateVariables(title), ...listTemplateVariables(body)])]
    .filter((variable) => !allowed.includes(variable))
  if (unknown.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown template variables: ${unknown.join(", ")}`,
    )
  }
}

export const validateNotificationTemplate = ({
  title,
  body,
  allowed,
}: {
  title: string
  body: string
  allowed: string[]
}) => {
  validateTemplateVariables({ title, body, allowed })
  if (/<\/?[a-z][^>]*>/i.test(`${title} ${body}`)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "HTML is not allowed in notification templates",
    )
  }
}

export const renderNotificationTemplate = (
  template: string,
  variables: Record<string, string | number>,
) => template.replace(variablePattern, (_match, key: string) => {
  if (!(key in variables)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Missing template variable: ${key}`,
    )
  }
  return String(variables[key])
})

export const NOTIFICATION_PRIVATE_METADATA_KEYS = [
  "legacy_notification_id",
  "legacy_profile_id",
  "occurrence_id",
  "lead_minutes",
  "is_test",
] as const

export const sanitizeNotificationMetadata = (metadata?: Record<string, unknown> | null) => {
  if (!metadata) return null
  const safe: Record<string, unknown> = {}
  for (const key of NOTIFICATION_PRIVATE_METADATA_KEYS) {
    const value = metadata[key]
    if (["string", "number", "boolean"].includes(typeof value)) safe[key] = value
  }
  return Object.keys(safe).length ? safe : null
}
