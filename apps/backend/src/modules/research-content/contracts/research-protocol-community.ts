import { z } from "@medusajs/framework/zod"

import {
  RESEARCH_PROTOCOL_COMMENT_KINDS,
  RESEARCH_PROTOCOL_COMMENT_STATUSES,
} from "./research-protocol-comment"

const Id = z.string().trim().min(1).max(255)

export const StoreUpdateCommunityIdentity = z.strictObject({
  display_name: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[\p{L}\p{N} _.-]+$/u),
  show_verified_badge: z.boolean().default(false),
})

export const StoreCreateResearchProtocolThread = z.strictObject({
  protocol_handle: z.string().trim().min(1).max(160),
  kind: z.enum(RESEARCH_PROTOCOL_COMMENT_KINDS).default("question"),
  title: z.string().trim().min(5).max(180),
  body: z.string().trim().min(3).max(5_000),
})

export const StoreCreateResearchProtocolReply = z.strictObject({
  body: z.string().trim().min(3).max(5_000),
  parent_comment_id: Id.nullable().default(null),
})

export const StoreEditResearchProtocolComment = z.strictObject({
  body: z.string().trim().min(3).max(5_000),
})

export const StoreReactResearchProtocolComment = z.strictObject({
  reaction: z.enum(["helpful", "like"]),
})

export const StoreReportResearchProtocolContent = z.strictObject({
  comment_id: Id.nullable().default(null),
  thread_id: Id.nullable().default(null),
  reason: z.enum(["spam", "privacy", "harassment", "misleading", "other"]),
  details: z.string().trim().max(1_000).nullable().default(null),
})

export const StoreUpdateResearchProtocolSubscription = z.strictObject({
  subscribed: z.boolean(),
})

export const StoreListResearchProtocolThreads = z.strictObject({
  kind: z.enum(RESEARCH_PROTOCOL_COMMENT_KINDS).optional(),
  followed: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const StoreRemoveResearchProtocolComment = z.strictObject({})

export const AdminModerateResearchProtocolCommunity = z.strictObject({
  action: z.enum([
    "approve",
    "reject",
    "hide",
    "restore",
    "pin",
    "unpin",
    "lock",
    "unlock",
    "mark_answered",
    "unmark_answered",
  ]),
  thread_id: Id.nullable().default(null),
  comment_id: Id.nullable().default(null),
  reason: z.string().trim().max(1_000).nullable().default(null),
})

export const AdminListResearchProtocolCommunity = z.strictObject({
  status: z.enum(RESEARCH_PROTOCOL_COMMENT_STATUSES).optional(),
  q: z.string().trim().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const AdminResolveResearchProtocolReport = z.strictObject({
  action: z.enum(["resolve", "dismiss"]),
  reason: z.string().trim().min(3).max(1_000),
})

export const AdminUpdateResearchCommunityIdentityStatus = z.strictObject({
  action: z.enum(["suspend", "restore"]),
  reason: z.string().trim().min(3).max(1_000),
})

export const AdminBulkModerateResearchProtocolCommunity = z.strictObject({
  action: z.enum(["approve", "reject", "hide", "restore"]),
  thread_ids: z.array(Id).max(100).default([]),
  comment_ids: z.array(Id).max(100).default([]),
  reason: z.string().trim().max(1_000).nullable().default(null),
})

export type StoreUpdateCommunityIdentity = z.infer<
  typeof StoreUpdateCommunityIdentity
>
export type StoreCreateResearchProtocolThread = z.infer<
  typeof StoreCreateResearchProtocolThread
>
export type StoreCreateResearchProtocolReply = z.infer<
  typeof StoreCreateResearchProtocolReply
>
export type StoreEditResearchProtocolComment = z.infer<
  typeof StoreEditResearchProtocolComment
>
export type StoreReactResearchProtocolComment = z.infer<
  typeof StoreReactResearchProtocolComment
>
export type StoreReportResearchProtocolContent = z.infer<
  typeof StoreReportResearchProtocolContent
>
export type StoreUpdateResearchProtocolSubscription = z.infer<
  typeof StoreUpdateResearchProtocolSubscription
>
export type StoreListResearchProtocolThreads = z.infer<
  typeof StoreListResearchProtocolThreads
>
export type StoreRemoveResearchProtocolComment = z.infer<
  typeof StoreRemoveResearchProtocolComment
>
export type AdminModerateResearchProtocolCommunity = z.infer<
  typeof AdminModerateResearchProtocolCommunity
>
export type AdminListResearchProtocolCommunity = z.infer<
  typeof AdminListResearchProtocolCommunity
>
export type AdminResolveResearchProtocolReport = z.infer<
  typeof AdminResolveResearchProtocolReport
>
export type AdminUpdateResearchCommunityIdentityStatus = z.infer<
  typeof AdminUpdateResearchCommunityIdentityStatus
>
export type AdminBulkModerateResearchProtocolCommunity = z.infer<
  typeof AdminBulkModerateResearchProtocolCommunity
>
