import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import { RESEARCH_LOG_OPERATIONS } from "../contracts/personal-routines"
import ResearchRoutineLog from "./research-routine-log"
import ResearchProfile from "./research-profile"
import ResearchRoutine from "./research-routine"
import ResearchRoutineRevision from "./research-routine-revision"
import ResearchSupply from "./research-supply"
import ResearchSupplyAdjustment from "./research-supply-adjustment"

const ResearchRoutineLogRevision = model
  .define("research_routine_log_revision", {
    id: model.id().primaryKey(),
    occurrence_id: model.text(),
    local_date: model.dateTime(),
    local_time: model.text(),
    timezone: model.text(),
    confirmed_quantity_base_units: model.number(),
    base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    operation: model.enum([...RESEARCH_LOG_OPERATIONS]),
    prior_revision_id: model.text().nullable(),
    profile: model.belongsTo(() => ResearchProfile),
    routine: model.belongsTo(() => ResearchRoutine),
    log: model.belongsTo(() => ResearchRoutineLog, {
      mappedBy: "revisions",
    }),
    routine_revision: model.belongsTo(() => ResearchRoutineRevision),
    supply: model.belongsTo(() => ResearchSupply, {
      mappedBy: "routine_log_revisions",
    }),
    adjustments: model.hasMany(() => ResearchSupplyAdjustment, {
      mappedBy: "log_revision",
    }),
  })
  .indexes([{ on: ["log_id", "created_at"] }])

export default ResearchRoutineLogRevision
