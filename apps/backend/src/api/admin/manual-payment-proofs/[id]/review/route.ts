import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import reviewManualPaymentProofWorkflow from "../../../../../workflows/review-manual-payment-proof"
import type { AdminReviewManualPaymentProofType } from "../../validators"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminReviewManualPaymentProofType>,
  res: MedusaResponse,
) {
  const { decision, reason } = req.validatedBody
  const { result } = await reviewManualPaymentProofWorkflow(req.scope).run({
    input: {
      proofId: req.params.id,
      decision,
      reason,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(200).json({ manual_payment_proof: result.proof })
}
