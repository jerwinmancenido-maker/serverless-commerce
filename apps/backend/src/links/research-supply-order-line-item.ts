import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"

import ResearchTrackingModule from "../modules/research-tracking"

export default defineLink(
  {
    linkable: ResearchTrackingModule.linkable.researchSupply,
    field: "source_order_line_item_id",
  },
  OrderModule.linkable.orderLineItem,
  {
    readOnly: true,
  },
)
