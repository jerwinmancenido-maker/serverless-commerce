import { model } from "@medusajs/framework/utils"

const ResearchProtocolModerationEvent = model
  .define("research_protocol_moderation_event", {
    id: model.id().primaryKey(),
    series_id: model.text(),
    thread_id: model.text().nullable(),
    comment_id: model.text().nullable(),
    action: model.text(),
    actor_id: model.text(),
    reason: model.text().nullable(),
    occurred_at: model.dateTime(),
    details: model.json<Record<string, unknown>>().nullable(),
  })
  .indexes([
    { on: ["series_id", "occurred_at"] },
    { on: ["thread_id", "occurred_at"] },
    { on: ["comment_id", "occurred_at"] },
  ])

export default ResearchProtocolModerationEvent
