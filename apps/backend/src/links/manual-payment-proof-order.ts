import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"

import ManualPaymentModule from "../modules/manual-payment"

export default defineLink(
  {
    linkable: ManualPaymentModule.linkable.manualPaymentProof,
    field: "order_id",
  },
  OrderModule.linkable.order,
  {
    readOnly: true,
  },
)
