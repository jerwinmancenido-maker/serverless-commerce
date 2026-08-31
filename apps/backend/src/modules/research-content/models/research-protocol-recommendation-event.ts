import { model } from "@medusajs/framework/utils"

import ResearchProtocolMerchandisingLink from "./research-protocol-merchandising-link"
import ResearchProtocolSeries from "./research-protocol-series"

export const RESEARCH_PROTOCOL_RECOMMENDATION_EVENTS = [
  "impression",
  "click",
  "add_to_cart",
  "dismiss",
  "purchase",
] as const

const ResearchProtocolRecommendationEvent = model
  .define("research_protocol_recommendation_event", {
    id: model.id().primaryKey(),
    event_type: model.enum([...RESEARCH_PROTOCOL_RECOMMENDATION_EVENTS]),
    placement: model.text(),
    product_id: model.text(),
    product_variant_id: model.text().nullable(),
    customer_id: model.text().nullable(),
    protocol_revision_id: model.text().nullable(),
    occurred_at: model.dateTime(),
    context: model.json().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "recommendation_events",
    }),
    merchandising_link: model.belongsTo(
      () => ResearchProtocolMerchandisingLink,
      { mappedBy: "recommendation_events" },
    ),
  })
  .indexes([
    { on: ["series_id", "occurred_at"] },
    { on: ["merchandising_link_id", "event_type", "occurred_at"] },
    { on: ["customer_id", "occurred_at"] },
    { on: ["product_id", "event_type", "occurred_at"] },
  ])

export default ResearchProtocolRecommendationEvent
