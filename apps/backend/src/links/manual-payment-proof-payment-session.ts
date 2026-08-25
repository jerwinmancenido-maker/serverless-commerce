import { defineLink } from "@medusajs/framework/utils"
import PaymentModule from "@medusajs/medusa/payment"

import ManualPaymentModule from "../modules/manual-payment"

export default defineLink(
  {
    linkable: ManualPaymentModule.linkable.manualPaymentProof,
    field: "payment_session_id",
  },
  PaymentModule.linkable.paymentSession,
  {
    readOnly: true,
  },
)
