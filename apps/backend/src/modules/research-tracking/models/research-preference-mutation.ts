import { model } from "@medusajs/framework/utils"

import type { ResearchProfileProjection } from "../contracts/ownership"
import ResearchProfile from "./research-profile"

const ResearchPreferenceMutation = model
  .define("research_preference_mutation", {
    id: model.id().primaryKey(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    response_payload: model.json<ResearchProfileProjection>(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "preference_mutations",
    }),
  })
  .indexes([
    { on: ["profile_id", "idempotency_key"], unique: true },
    { on: ["profile_id", "created_at"] },
  ])

export default ResearchPreferenceMutation
