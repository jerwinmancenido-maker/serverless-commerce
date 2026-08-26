import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import { RESEARCH_RECURRENCE_TYPES } from "../contracts/personal-routines"
import ResearchRoutine from "./research-routine"

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
    routine: model.belongsTo(() => ResearchRoutine, {
      mappedBy: "revisions",
    }),
  })
  .indexes([{ on: ["routine_id", "created_at"] }])

export default ResearchRoutineRevision
