/**
 * @file    apps/backend/src/api/store/customers/me/orders/[id]/manual-payment-proof/middlewares.ts
 * @module  StoreManualPaymentProofMiddlewares (Store API)
 * @purpose Configure upload parsing and rate limiting for payment proof submissions.
 * @contracts
 *   Matcher: /store/customers/me/orders/:id/manual-payment-proof
 */

import type { MiddlewareRoute } from "@medusajs/framework/http"
import multer from "multer"

import { MANUAL_PAYMENT_PROOF_MAX_BYTES } from "../../../../../../../modules/manual-payment/contracts/payment-proof"
import { createRateLimiter } from "../../../../../../../lib/rate-limiter"

const proofRateLimiter = createRateLimiter({
  windowMs: 10 * 60_000,
  max: 10,
  message: "Too many payment proof upload attempts. Please wait a few minutes before trying again.",
})

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
    middlewares: [proofRateLimiter, proofUpload.single("proof")],
  },
]

