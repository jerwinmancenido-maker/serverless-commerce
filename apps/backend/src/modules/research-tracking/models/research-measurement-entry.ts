import { model } from "@medusajs/framework/utils"

import ResearchMeasurementRevision from "./research-measurement-revision"
import ResearchProfile from "./research-profile"

const ResearchMeasurementEntry = model
  .define("research_measurement_entry", {
    id: model.id().primaryKey(),
    metric_type: model.enum(["weight", "waist", "body_fat"]),
    status: model.enum(["active", "voided"]).default("active"),
    current_revision_id: model.text().nullable(),
    voided_at: model.dateTime().nullable(),
    restored_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "measurement_entries",
    }),
    revisions: model.hasMany(() => ResearchMeasurementRevision, {
      mappedBy: "measurement_entry",
    }),
  })
  .indexes([
    { on: ["profile_id", "metric_type", "created_at"] },
    { on: ["profile_id", "status"] },
  ])

export default ResearchMeasurementEntry
