import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import { RESEARCH_RECURRENCE_TYPES } from "../contracts/personal-routines"
import ResearchRoutineRevision from "./research-routine-revision"

const ResearchRoutineScheduleSegment = model
  .define("research_routine_schedule_segment", {
    id: model.id().primaryKey(),
    position: model.number(),
    source_row_key: model.text().nullable(),
    label: model.text(),
    start_offset_days: model.number(),
    end_offset_days: model.number().nullable(),
    planned_quantity_base_units: model.number(),
    base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    original_amount: model.text(),
    original_unit: model.enum(["mcg", "mg", "g", "µL", "mL", "L", "IU", "piece"]),
    recurrence_type: model.enum([...RESEARCH_RECURRENCE_TYPES]),
    daily_interval: model.number().nullable(),
    weekly_interval: model.number().nullable(),
    weekdays: model.json().nullable(),
    local_times: model.json(),
    notes: model.text().nullable(),
    reference_keys: model.json().nullable(),
    routine_revision: model.belongsTo(() => ResearchRoutineRevision, {
      mappedBy: "schedule_segments",
    }),
  })
  .indexes([
    { on: ["routine_revision_id", "position"] },
    { on: ["routine_revision_id", "source_row_key"] },
  ])

export default ResearchRoutineScheduleSegment
