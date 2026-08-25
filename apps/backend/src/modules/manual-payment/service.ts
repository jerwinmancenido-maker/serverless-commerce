import { MedusaError, MedusaService } from "@medusajs/framework/utils"

import ManualPaymentProof from "./models/manual-payment-proof"
import ManualPaymentProofEvent from "./models/manual-payment-proof-event"

class ManualPaymentModuleService extends MedusaService({
  ManualPaymentProof,
  ManualPaymentProofEvent,
}) {
  override updateManualPaymentProofEvents = async (
    ..._updates: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment proof audit events are immutable",
    )
  }
}

export default ManualPaymentModuleService
