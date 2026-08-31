import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import { RESEARCH_RECURRENCE_TYPES } from "../contracts/personal-routines"
import ResearchRoutine from "./research-routine"
import ResearchRoutineScheduleSegment from "./research-routine-schedule-segment"

const ResearchRoutineRevision = model
  .define("research_routine_revision", {
    id: model.id().primaryKey(),
    label: model.text(),
    planned_quantity_base_units: model.number(),
    base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    timezone: model.text(),
    recurrence_type: model.enum([...RESEARCH_RECURRENCE_TYPES]),
    daily_interval: model.number().nullable(),
    weekly_interval: model.number().nullable(),
    weekdays: model.json().nullable(),
    local_time: model.text(),
    start_date: model.dateTime(),
    end_date: model.dateTime().nullable(),
    effective_from_date: model.dateTime(),
    superseded_revision_id: model.text().nullable(),
    source_protocol_series_id: model.text().nullable(),
    source_protocol_revision_id: model.text().nullable(),
    source_protocol_level_key: model.text().nullable(),
    source_profile_access_id: model.text().nullable(),
    source_order_id: model.text().nullable(),
    source_product_id: model.text().nullable(),
    source_product_variant_id: model.text().nullable(),
    source_schedule_snapshot: model.json().nullable(),
    calculator_result_snapshot: model.json().nullable(),
    customer_modified_schedule: model.boolean().default(false),
    routine: model.belongsTo(() => ResearchRoutine, {
      mappedBy: "revisions",
    }),
    schedule_segments: model.hasMany(() => ResearchRoutineScheduleSegment, {
      mappedBy: "routine_revision",
    }),
  })
  .indexes([{ on: ["routine_id", "created_at"] }])

export default ResearchRoutineRevision
