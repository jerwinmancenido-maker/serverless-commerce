import { model } from "@medusajs/framework/utils"

import { RESEARCH_PROTOCOL_COMMENT_KINDS } from "../contracts/research-protocol-comment"

const ResearchProtocolThread = model
  .define("research_protocol_thread", {
    id: model.id().primaryKey(),
    series_id: model.text(),
    community_identity_id: model.text(),
    title: model.text(),
    kind: model.enum([...RESEARCH_PROTOCOL_COMMENT_KINDS]).default("question"),
    status: model.enum(["pending", "approved", "rejected", "hidden"]).default("pending"),
    is_pinned: model.boolean().default(false),
    is_locked: model.boolean().default(false),
    is_answered: model.boolean().default(false),
    submitted_at: model.dateTime(),
    moderated_at: model.dateTime().nullable(),
    moderated_by_actor_id: model.text().nullable(),
    moderation_reason: model.text().nullable(),
    last_activity_at: model.dateTime(),
  })
  .indexes([
    { on: ["series_id", "status", "last_activity_at"] },
    { on: ["community_identity_id", "submitted_at"] },
    { on: ["series_id", "is_pinned", "last_activity_at"] },
  ])

export default ResearchProtocolThread

