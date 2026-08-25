import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import ResearchTrackingModule from "../modules/research-tracking"

export default defineLink(
  {
    linkable: ResearchTrackingModule.linkable.researchProfile,
    field: "customer_id",
  },
  CustomerModule.linkable.customer,
  {
    readOnly: true,
  },
)
