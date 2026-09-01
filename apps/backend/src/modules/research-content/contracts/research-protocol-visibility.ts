import { z } from "@medusajs/framework/zod"

export const RESEARCH_PROTOCOL_ACCESS_LEVELS = [
  "public",
  "member",
  "purchaser",
  "admin",
] as const

export const RESEARCH_PROTOCOL_COMMUNITY_SCOPES = [
  "member",
  "purchaser",
] as const

export const ResearchProtocolVisibilityValues = z.strictObject({
  public_page_enabled: z.boolean().default(true),
  public_summary: z.string().trim().max(2_000).nullable().default(null),
  public_quick_reference: z.boolean().default(false),
  public_faqs: z.boolean().default(true),
  public_references: z.boolean().default(true),
  public_products: z.boolean().default(true),
  public_recommendations: z.boolean().default(true),
  member_full_content: z.boolean().default(false),
  community_read_scope: z
    .enum(RESEARCH_PROTOCOL_COMMUNITY_SCOPES)
    .default("purchaser"),
  community_post_scope: z
    .enum(RESEARCH_PROTOCOL_COMMUNITY_SCOPES)
    .default("purchaser"),
  purchaser_badge_enabled: z.boolean().default(true),
  community_edit_window_minutes: z.number().int().min(0).max(1_440).default(15),
  community_max_post_length: z.number().int().min(200).max(20_000).default(5_000),
  community_posts_per_hour: z.number().int().min(1).max(100).default(6),
  community_reports_per_hour: z.number().int().min(1).max(100).default(10),
  community_reactions_per_minute: z.number().int().min(1).max(300).default(30),
  community_links_enabled: z.boolean().default(false),
  community_attachments_enabled: z.boolean().default(false),
  community_auto_hold: z.boolean().default(true),
  community_report_hide_threshold: z.number().int().min(1).max(100).default(3),
  search_indexable: z.boolean().default(true),
  field_visibility: z
    .record(z.string(), z.enum(RESEARCH_PROTOCOL_ACCESS_LEVELS))
    .default({}),
})

export const AdminUpdateResearchProtocolVisibility =
  ResearchProtocolVisibilityValues.extend({
    reason: z.string().trim().min(3).max(2_000),
  })

export type ResearchProtocolVisibilityValues = z.infer<
  typeof ResearchProtocolVisibilityValues
>

export type AdminUpdateResearchProtocolVisibility = z.infer<
  typeof AdminUpdateResearchProtocolVisibility
>

export type ResearchProtocolAccessLevel =
  (typeof RESEARCH_PROTOCOL_ACCESS_LEVELS)[number]
