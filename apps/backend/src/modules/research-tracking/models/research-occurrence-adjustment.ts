import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"
import ResearchRoutine from "./research-routine"
import ResearchRoutineRevision from "./research-routine-revision"

const ResearchOccurrenceAdjustment = model
  .define("research_occurrence_adjustment", {
    id: model.id().primaryKey(),
    occurrence_id: model.text(),
    operation: model.enum(["skip", "reschedule", "restore"]),
    planned_local_date: model.dateTime(),
    planned_local_time: model.text(),
    rescheduled_local_date: model.dateTime().nullable(),
    rescheduled_local_time: model.text().nullable(),
    timezone: model.text(),
    note: model.text().nullable(),
    routine_schedule_segment_id: model.text().nullable(),
    protocol_revision_id: model.text().nullable(),
    prior_adjustment_id: model.text().nullable(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "occurrence_adjustments",
    }),
    routine: model.belongsTo(() => ResearchRoutine),
    routine_revision: model.belongsTo(() => ResearchRoutineRevision),
  })
  .indexes([
    { on: ["profile_id", "occurrence_id", "created_at"] },
    { on: ["profile_id", "idempotency_key"], unique: true },
  ])

export default ResearchOccurrenceAdjustment
