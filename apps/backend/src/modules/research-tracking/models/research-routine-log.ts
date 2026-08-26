import { model } from "@medusajs/framework/utils"

import { RESEARCH_LOG_STATUSES } from "../contracts/personal-routines"
import ResearchProfile from "./research-profile"
import ResearchRoutine from "./research-routine"
import ResearchRoutineLogRevision from "./research-routine-log-revision"

const ResearchRoutineLog = model
  .define("research_routine_log", {
    id: model.id().primaryKey(),
    occurrence_id: model.text(),
    status: model.enum([...RESEARCH_LOG_STATUSES]).default("confirmed"),
    current_revision_id: model.text().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "routine_logs",
    }),
    routine: model.belongsTo(() => ResearchRoutine, {
      mappedBy: "logs",
    }),
    revisions: model.hasMany(() => ResearchRoutineLogRevision, {
      mappedBy: "log",
    }),
  })
  .indexes([
    { on: ["profile_id", "status"] },
    { on: ["profile_id", "occurrence_id"], unique: true },
  ])

export default ResearchRoutineLog
