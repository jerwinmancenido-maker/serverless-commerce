import { z } from "@medusajs/framework/zod"

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_EVENT_KEYS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TARGET_KINDS,
} from "./catalog"

const optionalDate = z.iso.datetime().nullable().optional()

export const StoreListCustomerNotifications = z.object({
  status: z.enum(["scheduled", "unread", "read", "snoozed", "archived"]).optional(),
  category: z.enum(NOTIFICATION_CATEGORIES).optional(),
  event_key: z.enum(NOTIFICATION_EVENT_KEYS).optional(),
  from: optionalDate,
  to: optionalDate,
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type StoreListCustomerNotifications = z.infer<typeof StoreListCustomerNotifications>

export const StoreMutateCustomerNotification = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark_read") }),
  z.object({ action: z.literal("mark_unread") }),
  z.object({ action: z.literal("archive") }),
  z.object({ action: z.literal("open") }),
  z.object({ action: z.literal("snooze"), snoozed_until: z.iso.datetime() }),
])
export type StoreMutateCustomerNotification = z.infer<typeof StoreMutateCustomerNotification>

export const StoreBulkCustomerNotificationAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark_all_read"), category: z.enum(NOTIFICATION_CATEGORIES).optional() }),
  z.object({ action: z.literal("archive"), ids: z.array(z.string().min(1)).min(1).max(100) }),
])
export type StoreBulkCustomerNotificationAction = z.infer<typeof StoreBulkCustomerNotificationAction>

export const StoreUpdateCustomerNotificationPreferences = z.object({
  preferences: z.array(z.object({
    event_key: z.enum(NOTIFICATION_EVENT_KEYS),
    enabled: z.boolean(),
  })).max(NOTIFICATION_EVENT_KEYS.length),
})
export type StoreUpdateCustomerNotificationPreferences = z.infer<typeof StoreUpdateCustomerNotificationPreferences>

export const AdminListCustomerNotificationOperations = z.object({
  event_key: z.enum(NOTIFICATION_EVENT_KEYS).optional(),
  status: z.enum(["delivered", "failed", "skipped", "retry_pending"]).optional(),
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})
export type AdminListCustomerNotificationOperations = z.infer<typeof AdminListCustomerNotificationOperations>

export const AdminUpdateCustomerNotificationTemplate = z.object({
  title_template: z.string().trim().min(1).max(160),
  body_template: z.string().trim().min(1).max(500),
  action_label: z.string().trim().min(1).max(80).nullable(),
  priority: z.enum(NOTIFICATION_PRIORITIES),
  default_enabled: z.boolean(),
  enabled: z.boolean(),
  retention_days: z.number().int().min(1).max(3650),
  change_reason: z.string().trim().min(3).max(500),
})
export type AdminUpdateCustomerNotificationTemplate = z.infer<typeof AdminUpdateCustomerNotificationTemplate>

export const AdminSendCustomerNotificationTest = z.object({
  customer_id: z.string().min(1),
})
export type AdminSendCustomerNotificationTest = z.infer<typeof AdminSendCustomerNotificationTest>

export const EmitCustomerNotification = z.object({
  customer_id: z.string().min(1),
  event_key: z.enum(NOTIFICATION_EVENT_KEYS),
  source_id: z.string().min(1).max(500),
  variables: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  target_kind: z.enum(NOTIFICATION_TARGET_KINDS),
  target_id: z.string().max(500).nullable().optional(),
  secondary_target_id: z.string().max(500).nullable().optional(),
  scheduled_for: optionalDate,
  available_at: optionalDate,
  expires_at: optionalDate,
  group_key: z.string().max(500).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  is_test: z.boolean().optional(),
})
export type EmitCustomerNotification = z.infer<typeof EmitCustomerNotification>
