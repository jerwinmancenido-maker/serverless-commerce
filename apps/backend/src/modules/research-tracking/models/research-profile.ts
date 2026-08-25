import { model } from "@medusajs/framework/utils"

import { RESEARCH_PROFILE_STATUSES } from "../contracts/tracking"
import TrackedMaterial from "./tracked-material"

const ResearchProfile = model.define("research_profile", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  timezone: model.text(),
  locale: model.text().default("en-PH"),
  consent_version: model.text(),
  consented_at: model.dateTime(),
  status: model.enum([...RESEARCH_PROFILE_STATUSES]).default("active"),
  tracked_materials: model.hasMany(() => TrackedMaterial, {
    mappedBy: "profile",
  }),
})

export default ResearchProfile
