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

  res.json({ manual_payment_proof: proof, events })
}
