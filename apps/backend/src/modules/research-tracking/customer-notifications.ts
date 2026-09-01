import { createHash } from "node:crypto"

import { RESEARCH_TRACKING_MODULE } from "."
import type ResearchTrackingModuleService from "./service"

type CustomerNotificationType =
  | "community_reply"
  | "community_moderation"
  | "support_reply"

type NotificationPreference =
  | "community_reply_notifications"
  | "community_moderation_notifications"
  | "support_reply_notifications"

export const createCustomerNotification = async ({
  container,
  customerId,
  type,
  title,
  body,
  idempotencySource,
  metadata,
  preference,
}: {
  container: any
  customerId: string
  type: CustomerNotificationType
  title: string
  body: string
  idempotencySource: string
  metadata: Record<string, unknown>
  preference: NotificationPreference
}) => {
  const service = container.resolve(
    RESEARCH_TRACKING_MODULE,
  ) as ResearchTrackingModuleService
  const [profile] = await service.listResearchProfiles(
    { customer_id: customerId, status: "active" },
    { take: 1 },
  )
  if (!profile) return null
  const [preferences] = await service.listResearchReminderPreferences(
    { profile_id: profile.id },
    { take: 1 },
  )
  if (preferences && preferences[preference] === false) return null

  const key = `private:${type}:${createHash("sha256")
    .update(`${customerId}:${idempotencySource}`)
    .digest("hex")}`
  const [existing] = await service.listResearchNotifications(
    { idempotency_key: key },
    { take: 1 },
  )
  if (existing) return existing.id

  const now = new Date()
  const notification = await service.createResearchNotifications({
    profile_id: profile.id,
    routine_id: null,
    routine_revision_id: null,
    occurrence_id: null,
    type,
    channel: "in_app",
    title,
    body,
    status: "unread",
    scheduled_for: now,
    available_at: now,
    delivered_at: now,
    read_at: null,
    dismissed_at: null,
    snoozed_until: null,
    source_local_date: null,
    source_local_time: null,
    timezone: preferences?.timezone || "Asia/Manila",
    idempotency_key: key,
    template_version: `${type}-v1`,
    metadata,
  })
  await service.createResearchNotificationDeliveryAttempts({
    notification_id: notification.id,
    channel: "in_app",
    status: "delivered",
    attempted_at: now,
    provider_reference: null,
    error_code: null,
    detail: "Stored in the private in-app notification inbox.",
  })
  return notification.id
}

export const deleteCustomerNotifications = async ({
  container,
  ids,
}: {
  container: any
  ids: string[]
}) => {
  if (!ids.length) return
  const service = container.resolve(
    RESEARCH_TRACKING_MODULE,
  ) as ResearchTrackingModuleService
  const attempts = await service.listResearchNotificationDeliveryAttempts({
    notification_id: ids,
  })
  if (attempts.length) {
    await service.deleteResearchNotificationDeliveryAttempts(
      attempts.map((attempt) => attempt.id),
    )
  }
  await service.deleteResearchNotifications(ids)
}
