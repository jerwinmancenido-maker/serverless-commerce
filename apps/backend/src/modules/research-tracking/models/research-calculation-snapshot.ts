import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchCalculationSnapshot = model
  .define("research_calculation_snapshot", {
    id: model.id().primaryKey(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "calculation_snapshots",
    }),
    mode: model.enum(["quick", "protocol", "compare"]),
    title: model.text(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    protocol_series_id: model.text().nullable(),
    protocol_revision_id: model.text().nullable(),
    profile_protocol_access_id: model.text().nullable(),
    routine_id: model.text().nullable(),
    journal_entry_id: model.text().nullable(),
    input_snapshot: model.json(),
    result_snapshot: model.json(),
    unit_context_snapshot: model.json(),
    saved_at: model.dateTime(),
    archived_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["profile_id", "idempotency_key"], unique: true },
    { on: ["profile_id", "saved_at"] },
    { on: ["profile_id", "routine_id"] },
    { on: ["profile_id", "journal_entry_id"] },
  ])

export default ResearchCalculationSnapshot
