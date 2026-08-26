import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"
import ResearchRoutine from "./research-routine"
import ResearchRoutineMutation from "./research-routine-mutation"

const ResearchRoutineStateTransition = model
  .define("research_routine_state_transition", {
    id: model.id().primaryKey(),
    operation: model.enum(["archive", "resume"]),
    effective_date: model.dateTime(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "routine_state_transitions",
    }),
    routine: model.belongsTo(() => ResearchRoutine, {
      mappedBy: "state_transitions",
    }),
    mutation: model.belongsTo(() => ResearchRoutineMutation),
  })
  .indexes([{ on: ["routine_id", "effective_date"] }])

export default ResearchRoutineStateTransition
