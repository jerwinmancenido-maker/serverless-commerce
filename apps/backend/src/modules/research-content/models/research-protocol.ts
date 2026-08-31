import { model } from "@medusajs/framework/utils"

import {
  RESEARCH_CONTENT_STATUSES,
  RESEARCH_EVIDENCE_SCOPES,
} from "../contracts/content"
import ResearchProtocolSeries from "./research-protocol-series"

const ResearchProtocol = model
  .define("research_protocol", {
    id: model.id().primaryKey(),
    protocol_key: model.text(),
    revision: model.number(),
    schema_version: model.number().default(1),
    title: model.text(),
    summary: model.text().nullable(),
    content: model.json<Record<string, unknown>>(),
    status: model.enum([...RESEARCH_CONTENT_STATUSES]).default("draft"),
    evidence_scope: model.enum([...RESEARCH_EVIDENCE_SCOPES]),
    effective_at: model.dateTime().nullable(),
    published_at: model.dateTime().nullable(),
    withdrawn_at: model.dateTime().nullable(),
    created_by_actor_id: model.text().nullable(),
    published_by_actor_id: model.text().nullable(),
    decision_reason: model.text().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "revisions",
    }),
  })
  .indexes([
    { on: ["protocol_key", "revision"], unique: true },
    { on: ["series_id", "revision"], unique: true },
    { on: ["series_id", "status"] },
  ])

export default ResearchProtocol
