import { model } from "@medusajs/framework/utils"

import { RESEARCH_LOG_OPERATIONS } from "../contracts/personal-routines"
import ResearchProfile from "./research-profile"
import ResearchRoutineLog from "./research-routine-log"
import ResearchRoutineLogRevision from "./research-routine-log-revision"
import ResearchRoutineMutation from "./research-routine-mutation"
import ResearchSupply from "./research-supply"

const ResearchSupplyAdjustment = model
  .define("research_supply_adjustment", {
    id: model.id().primaryKey(),
    quantity_delta_base_units: model.number(),
    operation: model.enum([...RESEARCH_LOG_OPERATIONS]),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "supply_adjustments",
    }),
    supply: model.belongsTo(() => ResearchSupply, {
      mappedBy: "adjustments",
    }),
    log: model.belongsTo(() => ResearchRoutineLog),
    log_revision: model.belongsTo(() => ResearchRoutineLogRevision, {
      mappedBy: "adjustments",
    }),
    mutation: model.belongsTo(() => ResearchRoutineMutation),
  })
  .indexes([
    { on: ["profile_id", "created_at"] },
    { on: ["supply_id", "created_at"] },
    { on: ["log_revision_id"] },
  ])

export default ResearchSupplyAdjustment
