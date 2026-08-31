import { model } from "@medusajs/framework/utils"

import ResearchProtocolSeries from "./research-protocol-series"
import ResearchProtocolRecommendationEvent from "./research-protocol-recommendation-event"

export const RESEARCH_PROTOCOL_MERCHANDISING_TYPES = [
  "primary",
  "required",
  "optional",
  "compatible",
  "frequently_added",
  "bundle",
  "refill",
  "replacement",
  "alternative",
  "upgrade",
  "cross_sell",
  "reorder",
] as const

export const RESEARCH_PROTOCOL_MERCHANDISING_STATUSES = [
  "active",
  "paused",
] as const

const ResearchProtocolMerchandisingLink = model
  .define("research_protocol_merchandising_link", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    product_variant_ids: model.json<string[]>(),
    relationship_type: model.enum([...RESEARCH_PROTOCOL_MERCHANDISING_TYPES]),
    placements: model.json<string[]>(),
    priority: model.number().default(100),
    status: model
      .enum([...RESEARCH_PROTOCOL_MERCHANDISING_STATUSES])
      .default("active"),
    heading: model.text().nullable(),
    reason: model.text(),
    quick_add_enabled: model.boolean().default(true),
    hide_after_purchase: model.boolean().default(false),
    bundle_reference: model.text().nullable(),
    promotion_reference: model.text().nullable(),
    starts_at: model.dateTime().nullable(),
    ends_at: model.dateTime().nullable(),
    archived_at: model.dateTime().nullable(),
    created_by_actor_id: model.text().nullable(),
    updated_by_actor_id: model.text().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "merchandising_links",
    }),
    recommendation_events: model.hasMany(
      () => ResearchProtocolRecommendationEvent,
      { mappedBy: "merchandising_link" },
    ),
  })
  .indexes([
    { on: ["series_id", "product_id", "relationship_type"], unique: true },
    { on: ["series_id", "status", "archived_at"] },
    { on: ["product_id", "archived_at"] },
    { on: ["priority"] },
  ])

export default ResearchProtocolMerchandisingLink
