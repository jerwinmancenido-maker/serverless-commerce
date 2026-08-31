import { model } from "@medusajs/framework/utils"

import ResearchMeasurementEntry from "./research-measurement-entry"

const ResearchMeasurementRevision = model
  .define("research_measurement_revision", {
    id: model.id().primaryKey(),
    revision_number: model.number(),
    measured_at: model.dateTime(),
    local_date: model.dateTime(),
    local_time: model.text(),
    timezone: model.text(),
    original_value: model.text(),
    original_unit: model.enum(["kg", "lb", "cm", "in", "percent"]),
    normalized_value: model.text(),
    normalized_unit: model.enum(["kg", "cm", "percent"]),
    secondary_value: model.text().nullable(),
    note: model.text().nullable(),
    allowlist_version: model.text(),
    source: model.enum(["customer", "activity", "journal"]).default("customer"),
    routine_id: model.text().nullable(),
    protocol_revision_id: model.text().nullable(),
    profile_protocol_access_id: model.text().nullable(),
    tracked_material_id: model.text().nullable(),
    routine_log_id: model.text().nullable(),
    prior_revision_id: model.text().nullable(),
    measurement_entry: model.belongsTo(() => ResearchMeasurementEntry, {
      mappedBy: "revisions",
    }),
  })
  .indexes([
    { on: ["measurement_entry_id", "revision_number"], unique: true },
    { on: ["measurement_entry_id", "created_at"] },
  ])

export default ResearchMeasurementRevision
