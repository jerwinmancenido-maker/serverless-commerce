import { model } from "@medusajs/framework/utils"

import { RESEARCH_ROUTINE_STATUSES } from "../contracts/personal-routines"
import ResearchProfile from "./research-profile"
import ResearchRoutineLog from "./research-routine-log"
import ResearchRoutineRevision from "./research-routine-revision"
import ResearchRoutineStateTransition from "./research-routine-state-transition"
import TrackedMaterial from "./tracked-material"

const ResearchRoutine = model
  .define("research_routine", {
    id: model.id().primaryKey(),
    status: model.enum([...RESEARCH_ROUTINE_STATUSES]).default("active"),
    current_revision_id: model.text().nullable(),
    archived_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "routines",
    }),
    tracked_material: model.belongsTo(() => TrackedMaterial, {
      mappedBy: "routines",
    }),
    revisions: model.hasMany(() => ResearchRoutineRevision, {
      mappedBy: "routine",
    }),
    logs: model.hasMany(() => ResearchRoutineLog, {
      mappedBy: "routine",
    }),
    state_transitions: model.hasMany(() => ResearchRoutineStateTransition, {
      mappedBy: "routine",
    }),
  })
  .indexes([
    { on: ["profile_id", "status"] },
    { on: ["profile_id", "tracked_material_id"] },
  ])

export default ResearchRoutine
