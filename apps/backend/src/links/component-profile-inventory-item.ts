import { defineLink } from "@medusajs/framework/utils"
import InventoryModule from "@medusajs/medusa/inventory"

import PepstackBomModule from "../modules/bom"

export default defineLink(
  {
    linkable: PepstackBomModule.linkable.componentProfile,
    field: "inventory_item_id",
  },
  InventoryModule.linkable.inventoryItem,
  {
    readOnly: true,
  },
)
