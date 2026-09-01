import { model } from "@medusajs/framework/utils"

const ResearchProtocolReaction = model
  .define("research_protocol_reaction", {
    id: model.id().primaryKey(),
    comment_id: model.text(),
    community_identity_id: model.text(),
    reaction: model.enum(["helpful", "like"]),
    reacted_at: model.dateTime(),
  })
  .indexes([
    { on: ["comment_id", "community_identity_id"], unique: true },
    { on: ["comment_id", "reaction"] },
  ])

export default ResearchProtocolReaction

