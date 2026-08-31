import { model } from "@medusajs/framework/utils"

import { RESEARCH_PROTOCOL_AUDIT_EVENT_TYPES } from "../contracts/content"
import ResearchProtocolSeries from "./research-protocol-series"

const ResearchProtocolAuditEvent = model
  .define("research_protocol_audit_event", {
    id: model.id().primaryKey(),
    revision_id: model.text().nullable(),
    product_link_id: model.text().nullable(),
    event_type: model.enum([...RESEARCH_PROTOCOL_AUDIT_EVENT_TYPES]),
    actor_id: model.text(),
    reason: model.text().nullable(),
    details: model.json<Record<string, unknown>>().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "audit_events",
    }),
  })
  .indexes([{ on: ["series_id", "created_at"] }])

export default ResearchProtocolAuditEvent
