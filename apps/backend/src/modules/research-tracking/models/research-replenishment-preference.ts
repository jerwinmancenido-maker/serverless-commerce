import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchReplenishmentPreference = model
  .define("research_replenishment_preference", {
    id: model.id().primaryKey(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "replenishment_preferences",
    }),
    routine_id: model.text(),
    state: model.enum(["visible", "snoozed", "dismissed"]).default("visible"),
    remind_at: model.dateTime().nullable(),
    last_action_at: model.dateTime(),
  })
  .indexes([{ on: ["profile_id", "routine_id"], unique: true }])

export default ResearchReplenishmentPreference
