import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MANUAL_PAYMENT_MODULE } from "../../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../../modules/manual-payment/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE,
  )
  const proof = await service.retrieveManualPaymentProof(req.params.id)
  const events = await service.listManualPaymentProofEvents(
    { proof_id: proof.id },
    { order: { occurred_at: "ASC" } },
  )
  const [settlement] = await service.listManualPaymentSettlements(
    { proof_id: proof.id, proof_revision: proof.revision },
    { take: 1 },
  )

  res.json({
    manual_payment_proof: {
      ...proof,
      settlement_status: settlement?.status ?? "not_started",
    },
    events,
    settlement: settlement
      ? {
          status: settlement.status,
          payment_id: settlement.payment_id,
          capture_id: settlement.capture_id,
          last_error_category: settlement.last_error_category,
        }
      : null,
  })
}
