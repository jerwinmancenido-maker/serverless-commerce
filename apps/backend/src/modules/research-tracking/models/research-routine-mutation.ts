import { model } from "@medusajs/framework/utils"

import { RESEARCH_MUTATION_STATUSES } from "../contracts/personal-routines"
import ResearchProfile from "./research-profile"

const ResearchRoutineMutation = model
  .define("research_routine_mutation", {
    id: model.id().primaryKey(),
    operation: model.text(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    status: model.enum([...RESEARCH_MUTATION_STATUSES]),
    result_type: model.text().nullable(),
    result_id: model.text().nullable(),
    response_payload: model.json().nullable(),
    error_code: model.text().nullable(),
    completed_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "routine_mutations",
    }),
  })
  .indexes([{ on: ["profile_id", "operation", "idempotency_key"], unique: true }])

export default ResearchRoutineMutation
