import { z } from "@medusajs/framework/zod"

export const RESEARCH_PROTOCOL_COMMENT_KINDS = [
  "idea",
  "recommendation",
  "question",
  "general",
] as const

export const RESEARCH_PROTOCOL_COMMENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "hidden",
] as const

export const StoreCreateResearchProtocolComment = z.strictObject({
  protocol_handle: z.string().trim().min(1).max(160),
  kind: z.enum(RESEARCH_PROTOCOL_COMMENT_KINDS).default("idea"),
  body: z.string().trim().min(3).max(2_000),
})

export const AdminListResearchProtocolComments = z.strictObject({
  status: z.enum(RESEARCH_PROTOCOL_COMMENT_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const AdminModerateResearchProtocolComment = z.strictObject({
  action: z.enum(["approve", "reject", "hide"]),
  reason: z.string().trim().max(1_000).nullable().default(null),
})

export type StoreCreateResearchProtocolComment = z.infer<
  typeof StoreCreateResearchProtocolComment
>
export type AdminListResearchProtocolComments = z.infer<
  typeof AdminListResearchProtocolComments
>
export type AdminModerateResearchProtocolComment = z.infer<
  typeof AdminModerateResearchProtocolComment
>
