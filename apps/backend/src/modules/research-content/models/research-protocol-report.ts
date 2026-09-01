import { model } from "@medusajs/framework/utils"

const ResearchProtocolReport = model
  .define("research_protocol_report", {
    id: model.id().primaryKey(),
    series_id: model.text(),
    thread_id: model.text().nullable(),
    comment_id: model.text().nullable(),
    reporter_identity_id: model.text(),
    reason: model.enum(["spam", "privacy", "harassment", "misleading", "other"]),
    details: model.text().nullable(),
    status: model.enum(["open", "resolved", "dismissed"]).default("open"),
    reported_at: model.dateTime(),
    resolved_at: model.dateTime().nullable(),
    resolved_by_actor_id: model.text().nullable(),
  })
  .indexes([
    { on: ["series_id", "status", "reported_at"] },
    { on: ["comment_id", "reporter_identity_id"], unique: true },
    { on: ["thread_id", "reporter_identity_id"], unique: true },
  ])

export default ResearchProtocolReport
