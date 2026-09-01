import { model } from "@medusajs/framework/utils"

const ResearchProtocolSubscription = model
  .define("research_protocol_subscription", {
    id: model.id().primaryKey(),
    series_id: model.text(),
    thread_id: model.text().nullable(),
    community_identity_id: model.text(),
    subscribed_at: model.dateTime(),
  })
  .indexes([
    { on: ["series_id", "thread_id", "community_identity_id"], unique: true },
    { on: ["community_identity_id", "subscribed_at"] },
  ])

export default ResearchProtocolSubscription

