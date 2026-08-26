import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"
import ResearchSupplyActivation from "./research-supply-activation"

const ResearchSupplyActivationRequest = model
  .define("research_supply_activation_request", {
    id: model.id().primaryKey(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    accepted_at: model.dateTime(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "supply_activation_requests",
    }),
    activation: model.belongsTo(() => ResearchSupplyActivation, {
      mappedBy: "requests",
    }),
  })
  .indexes([
    { on: ["profile_id", "idempotency_key"], unique: true },
    { on: ["activation_id", "accepted_at"] },
  ])

export default ResearchSupplyActivationRequest
