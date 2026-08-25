import { model } from "@medusajs/framework/utils"

import { BOM_BASE_UNITS } from "../contracts/inventory-kit"

const ComponentProfile = model.define("component_profile", {
  id: model.id().primaryKey(),
  inventory_item_id: model.text().unique(),
  base_unit: model.enum([...BOM_BASE_UNITS]),
  display_unit: model.text(),
  base_units_per_display_unit: model.number(),
  display_precision: model.number().default(0),
  reorder_threshold_base_units: model.number().default(0),
  category: model.text(),
  lot_tracking_required: model.boolean().default(false),
  expiry_tracking_required: model.boolean().default(false),
})

export default ComponentProfile
