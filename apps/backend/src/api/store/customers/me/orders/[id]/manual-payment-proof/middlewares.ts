import type { MiddlewareRoute } from "@medusajs/framework/http"
import multer from "multer"

import { MANUAL_PAYMENT_PROOF_MAX_BYTES } from "../../../../../../../modules/manual-payment/contracts/payment-proof"

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MANUAL_PAYMENT_PROOF_MAX_BYTES,
  },
})

export const storeManualPaymentProofMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/orders/:id/manual-payment-proof",
    methods: ["POST"],
    middlewares: [proofUpload.single("proof")],
  },
]
