import { CUSTOMER_NOTIFICATIONS_MODULE } from "../customer-notifications"
import type { NotificationTargetKind } from "../customer-notifications/catalog"
import type CustomerNotificationsModuleService from "../customer-notifications/service"
import { emitCustomerNotificationWorkflow } from "../../workflows/manage-customer-notifications"

type CustomerNotificationType =
  | "community_reply"
  | "community_moderation"
  | "support_reply"

type NotificationPreference =
  | "community_reply_notifications"
  | "community_moderation_notifications"
  | "support_reply_notifications"

const EVENT_BY_LEGACY_TYPE = {
  community_reply: "community.reply_received",
  community_moderation: "community.moderation_completed",
  support_reply: "support.reply_received",
} as const

export const createCustomerNotification = async ({
  container,
  customerId,
  type,
  title,
  body,
  idempotencySource,
  metadata,
  preference,
  variables = {},
  targetKind,
  targetId,
  groupKey,
}: {
  container: any
  customerId: string
  type: CustomerNotificationType
  title: string
  body: string
  idempotencySource: string
  metadata: Record<string, unknown>
  preference: NotificationPreference
  variables?: Record<string, string | number>
  targetKind?: NotificationTargetKind
  targetId?: string | null
  groupKey?: string | null
}) => {
  void title
  void body
  void preference
  const eventKey = EVENT_BY_LEGACY_TYPE[type]
  const resolvedTargetKind = targetKind || (type === "support_reply" ? "support_conversation" : "community_thread")
  const resolvedTargetId = targetId || String(
    type === "support_reply" ? metadata.conversation_id || "" : metadata.thread_id || "",
  ) || null
  const { result } = await emitCustomerNotificationWorkflow(container).run({
    input: {
      customer_id: customerId,
      event_key: eventKey,
      source_id: idempotencySource,
      variables,
      target_kind: resolvedTargetKind,
      target_id: resolvedTargetId,
      secondary_target_id: null,
      group_key: groupKey || null,
      metadata,
    },
  })
  return result?.id || null
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
    CUSTOMER_NOTIFICATIONS_MODULE,
  ) as CustomerNotificationsModuleService
  const attempts = await service.listCustomerNotificationDeliveryAttempts({
    notification_id: ids,
  })
  if (attempts.length) {
    await service.deleteCustomerNotificationDeliveryAttempts(
      attempts.map((attempt) => attempt.id),
    )
  }
  await service.deleteCustomerNotifications(ids)
}
