import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import ResearchProfile from "./research-profile"
import ResearchSupply from "./research-supply"
import ResearchSupplyActivationRequest from "./research-supply-activation-request"
import TrackedMaterial from "./tracked-material"

const ResearchSupplyActivation = model
  .define("research_supply_activation", {
    id: model.id().primaryKey(),
    source_order_id: model.text(),
    source_order_line_item_id: model.text(),
    source_product_variant_id: model.text(),
    eligible_commerce_quantity: model.number(),
    material_profile_key: model.text(),
    material_profile_revision: model.number(),
    material_quantity_base_units: model.number(),
    material_base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    activated_at: model.dateTime(),
    label_snapshot: model.text(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "supply_activations",
    }),
    tracked_material: model.belongsTo(() => TrackedMaterial, {
      mappedBy: "supply_activations",
    }),
    supply: model.belongsTo(() => ResearchSupply, {
      mappedBy: "activations",
    }),
    requests: model.hasMany(() => ResearchSupplyActivationRequest, {
      mappedBy: "activation",
    }),
  })
  .indexes([
    { on: ["source_order_line_item_id"], unique: true },
    { on: ["supply_id"], unique: true },
    { on: ["profile_id", "idempotency_key"], unique: true },
    { on: ["profile_id", "activated_at"] },
  ])

export default ResearchSupplyActivation
