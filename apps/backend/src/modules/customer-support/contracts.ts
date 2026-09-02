import { z } from "@medusajs/framework/zod"

export const SUPPORT_CATEGORIES = ["order", "payment", "shipping", "product", "protocol_access", "account", "rewards", "technical", "other"] as const
export const SUPPORT_STATUSES = ["new", "open", "waiting_for_customer", "resolved", "closed"] as const
export const SUPPORT_PRIORITIES = ["low", "normal", "high", "urgent"] as const

export const StoreCreateSupportConversation = z.strictObject({
  subject: z.string().trim().min(5).max(180),
  category: z.enum(SUPPORT_CATEGORIES),
  body: z.string().trim().min(3).max(10_000),
  order_id: z.string().trim().min(1).max(255).nullable().default(null),
  protocol_series_id: z.string().trim().min(1).max(255).nullable().default(null),
  client_request_id: z.string().trim().min(8).max(100).optional(),
})
export const StoreCreateSupportReply = z.strictObject({
  body: z.string().trim().min(3).max(10_000),
  client_request_id: z.string().trim().min(8).max(100).optional(),
})
export const StorePostThreadMessage = z.strictObject({
  body: z.string().trim().min(1).max(10_000),
  client_request_id: z.string().trim().min(8).max(100).optional(),
  order_id: z.string().trim().min(1).max(255).nullable().optional(),
  protocol_series_id: z.string().trim().min(1).max(255).nullable().optional(),
  category: z.enum(SUPPORT_CATEGORIES).optional(),
})
export const StoreMutateSupportConversation = z.strictObject({ action: z.enum(["close", "reopen"]) })
export const StoreMarkSupportRead = z.strictObject({
  conversation_id: z.string().trim().min(1).max(255).optional(),
  all: z.boolean().default(false),
})
export const AdminUpdateSupportConversation = z.strictObject({
  status: z.enum(SUPPORT_STATUSES).optional(),
  reason: z.string().trim().max(1_000).nullable().default(null),
})
export const AdminPrioritizeSupportConversation = z.strictObject({
  priority: z.enum(SUPPORT_PRIORITIES),
  reason: z.string().trim().max(1_000).nullable().default(null),
})
export const AdminAssignSupportConversation = z.strictObject({
  assigned_to_actor_id: z.string().trim().min(1).max(255).nullable(),
  reason: z.string().trim().max(1_000).nullable().default(null),
})
export const AdminCreateSupportMessage = z.strictObject({ body: z.string().trim().min(3).max(10_000) })
export const AdminCreateSupportInternalNote = z.strictObject({ body: z.string().trim().min(3).max(10_000) })
export const AdminListSupportConversations = z.strictObject({
  status: z.enum(SUPPORT_STATUSES).optional(),
  priority: z.enum(SUPPORT_PRIORITIES).optional(),
  assigned_to_actor_id: z.string().trim().max(255).optional(),
  category: z.enum(SUPPORT_CATEGORIES).optional(),
  unread: z.coerce.boolean().optional(),
  order_id: z.string().trim().max(255).optional(),
  protocol_series_id: z.string().trim().max(255).optional(),
  updated_from: z.string().datetime().optional(),
  updated_to: z.string().datetime().optional(),
  q: z.string().trim().max(255).optional(),
  queue: z.enum(["new", "unread", "unassigned", "assigned_to_me", "waiting_for_customer", "high_priority", "resolved", "closed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

const SupportBusinessHoursDay = z.strictObject({
  day: z.number().int().min(0).max(6),
  open: z.boolean(),
  opens_at: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
  closes_at: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
})

export const AdminUpdateSupportSettings = z.strictObject({
  support_enabled: z.boolean(),
  side_panel_enabled: z.boolean(),
  display_name: z.string().trim().min(2).max(80),
  response_time_message: z.string().trim().min(3).max(240),
  timezone: z.string().trim().min(3).max(80),
  offline_message: z.string().trim().min(3).max(500),
  business_hours_enabled: z.boolean(),
  business_hours: z.array(SupportBusinessHoursDay).max(7),
  attachment_uploads_enabled: z.boolean(),
  maximum_attachment_size_bytes: z.number().int().min(1024).max(25 * 1024 * 1024),
  allowed_mime_types: z.array(z.enum(["image/jpeg", "image/png", "application/pdf"])).min(1),
  customer_message_limit_per_hour: z.number().int().min(1).max(100),
  email_notifications_enabled: z.boolean(),
  auto_acknowledgement_enabled: z.boolean(),
  auto_acknowledgement_text: z.string().trim().min(3).max(1_000),
  retention_days: z.number().int().min(1).max(3_650).nullable(),
})

export const AdminUpsertSupportCategory = z.strictObject({
  key: z.enum(SUPPORT_CATEGORIES),
  label: z.string().trim().min(2).max(80),
  guidance: z.string().trim().max(500).nullable().default(null),
  enabled: z.boolean(),
  sort_order: z.number().int().min(0).max(10_000),
  default_priority: z.enum(SUPPORT_PRIORITIES),
})

export const AdminUpsertSupportSavedResponse = z.strictObject({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(10_000),
  category: z.enum(SUPPORT_CATEGORIES).nullable().default(null),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(10_000).default(0),
})

export type StoreCreateSupportConversation = z.infer<typeof StoreCreateSupportConversation>
export type StoreCreateSupportReply = z.infer<typeof StoreCreateSupportReply>
export type StorePostThreadMessage = z.infer<typeof StorePostThreadMessage>
export type StoreMutateSupportConversation = z.infer<typeof StoreMutateSupportConversation>
export type StoreMarkSupportRead = z.infer<typeof StoreMarkSupportRead>
export type AdminUpdateSupportConversation = z.infer<typeof AdminUpdateSupportConversation>
export type AdminPrioritizeSupportConversation = z.infer<typeof AdminPrioritizeSupportConversation>
export type AdminAssignSupportConversation = z.infer<typeof AdminAssignSupportConversation>
export type AdminCreateSupportMessage = z.infer<typeof AdminCreateSupportMessage>
export type AdminCreateSupportInternalNote = z.infer<typeof AdminCreateSupportInternalNote>
export type AdminListSupportConversations = z.infer<typeof AdminListSupportConversations>
export type AdminUpdateSupportSettings = z.infer<typeof AdminUpdateSupportSettings>
export type AdminUpsertSupportCategory = z.infer<typeof AdminUpsertSupportCategory>
export type AdminUpsertSupportSavedResponse = z.infer<
  typeof AdminUpsertSupportSavedResponse
>

// Workflow inputs include authenticated identifiers that must never be accepted
// from the public request body. Build the validated public payload explicitly so
// strict request schemas can remain strict at the HTTP boundary.
export const parseStoreCreateSupportConversationPayload = (
  input: StoreCreateSupportConversation,
) =>
  StoreCreateSupportConversation.parse({
    subject: input.subject,
    category: input.category,
    body: input.body,
    order_id: input.order_id,
    protocol_series_id: input.protocol_series_id,
    client_request_id: input.client_request_id,
  })

export const parseStoreCreateSupportReplyPayload = (
  input: StoreCreateSupportReply,
) =>
  StoreCreateSupportReply.parse({
    body: input.body,
    client_request_id: input.client_request_id,
  })

export const parseStorePostThreadMessagePayload = (
  input: StorePostThreadMessage,
) =>
  StorePostThreadMessage.parse({
    body: input.body,
    client_request_id: input.client_request_id,
    order_id: input.order_id,
    protocol_series_id: input.protocol_series_id,
    category: input.category,
  })

export const parseStoreMutateSupportConversationPayload = (
  input: StoreMutateSupportConversation,
) => StoreMutateSupportConversation.parse({ action: input.action })
