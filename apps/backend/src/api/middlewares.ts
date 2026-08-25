import { defineMiddlewares } from "@medusajs/framework/http"

import { adminBomMiddlewares } from "./admin/bom/middlewares"
import { adminManualPaymentProofMiddlewares } from "./admin/manual-payment-proofs/middlewares"
import { storeManualPaymentProofMiddlewares } from "./store/customers/me/orders/[id]/manual-payment-proof/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminBomMiddlewares,
    ...adminManualPaymentProofMiddlewares,
    ...storeManualPaymentProofMiddlewares,
  ],
})
