import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import ManualPaymentModule from "../modules/manual-payment"

export default defineLink(
  {
    linkable: ManualPaymentModule.linkable.manualPaymentProof,
    field: "customer_id",
  },
  CustomerModule.linkable.customer,
  {
    readOnly: true,
  },
)
