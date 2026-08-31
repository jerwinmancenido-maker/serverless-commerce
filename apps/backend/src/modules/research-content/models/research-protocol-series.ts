import { model } from "@medusajs/framework/utils"

import ResearchProtocol from "./research-protocol"
import ResearchProtocolAuditEvent from "./research-protocol-audit-event"
import ResearchProtocolProductLink from "./research-protocol-product-link"
import ResearchProtocolComment from "./research-protocol-comment"
import ResearchProtocolMerchandisingLink from "./research-protocol-merchandising-link"
import ResearchProtocolRecommendationEvent from "./research-protocol-recommendation-event"

const ResearchProtocolSeries = model
  .define("research_protocol_series", {
    id: model.id().primaryKey(),
    protocol_key: model.text(),
    purpose: model.text().nullable(),
    archived_at: model.dateTime().nullable(),
    created_by_actor_id: model.text().nullable(),
    updated_by_actor_id: model.text().nullable(),
    revisions: model.hasMany(() => ResearchProtocol, {
      mappedBy: "series",
    }),
    product_links: model.hasMany(() => ResearchProtocolProductLink, {
      mappedBy: "series",
    }),
    audit_events: model.hasMany(() => ResearchProtocolAuditEvent, {
      mappedBy: "series",
    }),
    comments: model.hasMany(() => ResearchProtocolComment, {
      mappedBy: "series",
    }),
    merchandising_links: model.hasMany(
      () => ResearchProtocolMerchandisingLink,
      { mappedBy: "series" },
    ),
    recommendation_events: model.hasMany(
      () => ResearchProtocolRecommendationEvent,
      { mappedBy: "series" },
    ),
  })
  .indexes([
    { on: ["protocol_key"], unique: true },
    { on: ["archived_at"] },
  ])

export default ResearchProtocolSeries
