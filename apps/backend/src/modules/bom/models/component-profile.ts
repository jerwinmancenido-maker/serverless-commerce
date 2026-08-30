import { model } from "@medusajs/framework/utils"

import { BOM_BASE_UNITS } from "../contracts/inventory-kit"
import {
  BOM_COMPONENT_CLASSIFICATIONS,
  BOM_SUPPLIER_UNITS,
} from "../contracts/component-profile"

const ComponentProfile = model.define("component_profile", {
  id: model.id().primaryKey(),
  inventory_item_id: model.text().unique(),
  base_unit: model.enum([...BOM_BASE_UNITS]),
  display_unit: model.text(),
  base_units_per_display_unit: model.number(),
  display_precision: model.number().default(0),
  reorder_threshold_base_units: model.number().default(0),
  classification: model
    .enum([...BOM_COMPONENT_CLASSIFICATIONS])
    .default("included_supply"),
  supplier_unit: model.enum([...BOM_SUPPLIER_UNITS]).default("piece"),
  inventory_units_per_supplier_unit: model.number().default(1),
  category: model.text(),
  lot_tracking_required: model.boolean().default(false),
  expiry_tracking_required: model.boolean().default(false),
})

export default ComponentProfile
