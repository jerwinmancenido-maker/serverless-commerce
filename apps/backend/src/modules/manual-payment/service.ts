import { MedusaError, MedusaService } from "@medusajs/framework/utils"

import ManualPaymentProof from "./models/manual-payment-proof"
import ManualPaymentProofEvent from "./models/manual-payment-proof-event"
import ManualPaymentSettlement from "./models/manual-payment-settlement"
import ManualPaymentSettlementEvent from "./models/manual-payment-settlement-event"

class ManualPaymentModuleService extends MedusaService({
  ManualPaymentProof,
  ManualPaymentProofEvent,
  ManualPaymentSettlement,
  ManualPaymentSettlementEvent,
}) {
  override updateManualPaymentProofEvents = async (
    ..._updates: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment proof audit events are immutable",
    )
  }

  override updateManualPaymentSettlementEvents = async (
    ..._updates: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment settlement audit events are immutable",
    )
  }

  override deleteManualPaymentSettlementEvents = async (
    ..._ids: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment settlement audit events are immutable",
    )
  }

  override softDeleteManualPaymentSettlementEvents = async (
    ..._ids: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment settlement audit events are immutable",
    )
  }

  override restoreManualPaymentSettlementEvents = async (
    ..._ids: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "manual payment settlement audit events are immutable",
    )
  }
}

export default ManualPaymentModuleService
