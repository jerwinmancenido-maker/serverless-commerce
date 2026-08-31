import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchMeasurementMutation = model
  .define("research_measurement_mutation", {
    id: model.id().primaryKey(),
    operation: model.enum(["create", "revise", "void", "restore"]),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    status: model.enum(["processing", "completed", "failed"]),
    measurement_entry_id: model.text().nullable(),
    measurement_revision_id: model.text().nullable(),
    response_payload: model.json().nullable(),
    error_code: model.text().nullable(),
    completed_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "measurement_mutations",
    }),
  })
  .indexes([
    {
      on: ["profile_id", "operation", "idempotency_key"],
      unique: true,
    },
  ])

export default ResearchMeasurementMutation
