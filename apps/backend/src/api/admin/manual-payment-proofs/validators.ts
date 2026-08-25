import { z } from "@medusajs/framework/zod"

import { MANUAL_PAYMENT_PROOF_STATUSES } from "../../../modules/manual-payment/contracts/payment-proof"

export const AdminListManualPaymentProofs = z.object({
  status: z.enum(MANUAL_PAYMENT_PROOF_STATUSES).optional(),
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(100).default(20),
  ),
  offset: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(0).default(0),
  ),
})

export type AdminListManualPaymentProofsType = z.infer<
  typeof AdminListManualPaymentProofs
>

export const AdminReviewManualPaymentProof = z.strictObject({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().max(500).optional().nullable(),
})

export type AdminReviewManualPaymentProofType = z.infer<
  typeof AdminReviewManualPaymentProof
>
