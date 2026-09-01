import { z } from "@medusajs/framework/zod"

import {
  RESEARCH_PROTOCOL_MERCHANDISING_STATUSES,
  RESEARCH_PROTOCOL_MERCHANDISING_TYPES,
} from "../models/research-protocol-merchandising-link"
import { RESEARCH_PROTOCOL_RECOMMENDATION_EVENTS } from "../models/research-protocol-recommendation-event"

export const RESEARCH_PROTOCOL_MERCHANDISING_PLACEMENTS = [
  "protocol",
  "my_protocols",
  "start_tracking",
  "dashboard",
  "today",
  "calendar",
  "replenishment",
  "after_activity",
  "order_confirmation",
  "order_details",
  "cart",
  "product_page",
] as const

const RequiredId = z.string().trim().min(1).max(255)

export const AdminCreateResearchProtocolMerchandisingLink = z.strictObject({
  product_id: RequiredId,
  product_variant_ids: z.array(RequiredId).max(250).default([]),
  relationship_type: z.enum(RESEARCH_PROTOCOL_MERCHANDISING_TYPES),
  placements: z
    .array(z.enum(RESEARCH_PROTOCOL_MERCHANDISING_PLACEMENTS))
    .min(1)
    .max(RESEARCH_PROTOCOL_MERCHANDISING_PLACEMENTS.length),
  priority: z.number().int().min(0).max(10_000).default(100),
  status: z.enum(RESEARCH_PROTOCOL_MERCHANDISING_STATUSES).default("active"),
  heading: z.string().trim().max(120).nullable().default(null),
  reason: z.string().trim().min(3).max(500),
  quick_add_enabled: z.boolean().default(true),
  hide_after_purchase: z.boolean().default(false),
  bundle_reference: z.string().trim().max(255).nullable().default(null),
  promotion_reference: z.string().trim().max(255).nullable().default(null),
  starts_at: z.iso.datetime().nullable().default(null),
  ends_at: z.iso.datetime().nullable().default(null),
})

export const AdminUpdateResearchProtocolMerchandisingLink =
  AdminCreateResearchProtocolMerchandisingLink.omit({ product_id: true })

export const AdminArchiveResearchProtocolMerchandisingLink = z.strictObject({
  reason: z.string().trim().min(3).max(500),
})

export const StoreListResearchProtocolRecommendations = z.strictObject({
  placement: z.enum(RESEARCH_PROTOCOL_MERCHANDISING_PLACEMENTS),
  limit: z.coerce.number().int().min(1).max(12).default(6),
  exclude_product_ids: z
    .string()
    .trim()
    .max(5_000)
    .optional()
    .transform((value) =>
      value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [],
    ),
})

export const StoreRecordResearchProtocolRecommendationEvent = z.strictObject({
  merchandising_link_id: RequiredId,
  event_type: z.enum(RESEARCH_PROTOCOL_RECOMMENDATION_EVENTS),
  placement: z.enum(RESEARCH_PROTOCOL_MERCHANDISING_PLACEMENTS),
  product_id: RequiredId,
  product_variant_id: RequiredId.nullable().default(null),
  protocol_revision_id: RequiredId.nullable().default(null),
  context: z.record(z.string(), z.unknown()).nullable().default(null),
})

export type AdminCreateResearchProtocolMerchandisingLink = z.infer<
  typeof AdminCreateResearchProtocolMerchandisingLink
>
export type AdminUpdateResearchProtocolMerchandisingLink = z.infer<
  typeof AdminUpdateResearchProtocolMerchandisingLink
>
export type AdminArchiveResearchProtocolMerchandisingLink = z.infer<
  typeof AdminArchiveResearchProtocolMerchandisingLink
>
export type StoreRecordResearchProtocolRecommendationEvent = z.infer<
  typeof StoreRecordResearchProtocolRecommendationEvent
>
