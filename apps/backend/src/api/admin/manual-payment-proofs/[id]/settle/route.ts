import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { settleManualPaymentProofWorkflow } from "../../../../../workflows/settle-manual-payment-proof"
import { MANUAL_PAYMENT_MODULE } from "../../../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../../../modules/manual-payment/service"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)

  // Pre-flight: confirm proof exists before entering workflow
  const [proof] = await service.listManualPaymentProofs(
    { id: req.params.id },
    { take: 1 },
  )

  if (!proof) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Manual payment proof was not found",
    )
  }

  const { result } = await settleManualPaymentProofWorkflow(req.scope).run({
    input: {
      proofId: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    proof_id: result.proofId,
    proof_review_status: result.proofReviewStatus,
    settlement_status: result.settlementStatus,
    payment_id: result.paymentId,
    capture_id: result.captureId,
  })
}
