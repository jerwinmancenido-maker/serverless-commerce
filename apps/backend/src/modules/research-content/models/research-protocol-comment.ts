import { model } from "@medusajs/framework/utils"

import {
  RESEARCH_PROTOCOL_COMMENT_KINDS,
  RESEARCH_PROTOCOL_COMMENT_STATUSES,
} from "../contracts/research-protocol-comment"
import ResearchProtocolSeries from "./research-protocol-series"

const ResearchProtocolComment = model
  .define("research_protocol_comment", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    author_name_snapshot: model.text(),
    kind: model.enum([...RESEARCH_PROTOCOL_COMMENT_KINDS]).default("idea"),
    body: model.text(),
    status: model
      .enum([...RESEARCH_PROTOCOL_COMMENT_STATUSES])
      .default("pending"),
    submitted_at: model.dateTime(),
    moderated_at: model.dateTime().nullable(),
    moderated_by_actor_id: model.text().nullable(),
    moderation_reason: model.text().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "comments",
    }),
  })
  .indexes([
    { on: ["series_id", "status", "submitted_at"] },
    { on: ["customer_id", "submitted_at"] },
  ])

export default ResearchProtocolComment
