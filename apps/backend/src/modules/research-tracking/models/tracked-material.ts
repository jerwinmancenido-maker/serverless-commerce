import { model } from "@medusajs/framework/utils"

import {
  TRACKED_MATERIAL_SOURCES,
  TRACKED_MATERIAL_STATUSES,
} from "../contracts/tracking"
import ResearchProfile from "./research-profile"
import ResearchSupply from "./research-supply"
import ResearchSupplyActivation from "./research-supply-activation"

const TrackedMaterial = model
  .define("tracked_material", {
    id: model.id().primaryKey(),
    product_variant_id: model.text().nullable(),
    label: model.text(),
    source: model.enum([...TRACKED_MATERIAL_SOURCES]),
    status: model.enum([...TRACKED_MATERIAL_STATUSES]).default("active"),
    activated_at: model.dateTime(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "tracked_materials",
    }),
    supplies: model.hasMany(() => ResearchSupply, {
      mappedBy: "tracked_material",
    }),
    supply_activations: model.hasMany(() => ResearchSupplyActivation, {
      mappedBy: "tracked_material",
    }),
  })
  .indexes([
    { on: ["profile_id", "status"] },
    { on: ["profile_id", "product_variant_id"], unique: true },
  ])

export default TrackedMaterial
