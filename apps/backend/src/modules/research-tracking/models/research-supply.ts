import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import { RESEARCH_SUPPLY_STATUSES } from "../contracts/tracking"
import TrackedMaterial from "./tracked-material"

const ResearchSupply = model
  .define("research_supply", {
    id: model.id().primaryKey(),
    source_order_line_item_id: model.text().nullable(),
    initial_quantity_base_units: model.number(),
    remaining_quantity_base_units: model.number(),
    base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    acquired_at: model.dateTime(),
    lot_number: model.text().nullable(),
    batch_number: model.text().nullable(),
    expires_at: model.dateTime().nullable(),
    storage_note: model.text().nullable(),
    status: model.enum([...RESEARCH_SUPPLY_STATUSES]).default("active"),
    tracked_material: model.belongsTo(() => TrackedMaterial, {
      mappedBy: "supplies",
    }),
  })
  .indexes([
    { on: ["tracked_material_id", "status"] },
    { on: ["source_order_line_item_id"], unique: true },
  ])

export default ResearchSupply
