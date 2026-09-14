/**
 * @file    apps/backend/src/workflows/steps/validate-proof-for-settlement.ts
 * @module  ManualPaymentModule (Workflows)
 * @purpose Validate payment proof eligibility and order linkages before acquiring settlement lock.
 * @contracts
 *   Step: validateProofForSettlementStep
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../modules/manual-qr-payment/service"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"

export type ValidateProofForSettlementInput = {
  proofId: string
  actorId: string
}

export type ValidatedProofForSettlement = {
  proofId: string
  proofRevision: number
  paymentSessionId: string
  orderId: string
  actorId: string
}

export const validateProofForSettlementStep = createStep(
  "validate-proof-for-settlement",
  async (input: ValidateProofForSettlementInput, { container }) => {
    const service = container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [proof] = await service.listManualPaymentProofs(
      { id: input.proofId },
      { take: 1 },
    )

    if (!proof) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Manual payment proof was not found",
      )
    }

    if (proof.status !== "pending" && proof.status !== "approved") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Proof is not pending or approved — current status is ${proof.status}`,
      )
    }

    if (proof.provider_id !== MANUAL_QR_PAYMENT_PROVIDER_ID) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Settlement is only available for Manual QR payment proofs",
      )
    }

    // Verify payment session exists and belongs to this order
    const { data: sessions } = await query.graph({
      entity: "payment_session",
      fields: ["id", "payment_collection_id", "status"],
      filters: { id: proof.payment_session_id },
      pagination: { take: 1 },
    })

    const session = sessions?.[0]
    if (!session) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Linked payment session was not found",
      )
    }

    // Confirm order linkage
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id"],
      filters: { id: proof.order_id },
      pagination: { take: 1 },
    })

    if (!orders?.[0]) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Linked order was not found",
      )
    }

    const validated: ValidatedProofForSettlement = {
      proofId: proof.id,
      proofRevision: proof.revision,
      paymentSessionId: proof.payment_session_id,
      orderId: proof.order_id,
      actorId: input.actorId,
    }

    return new StepResponse(validated)
  },
)
