/**
 * @file    apps/backend/src/workflows/expire-unpaid-orders.ts
 * @module  ExpireUnpaidOrdersWorkflow (Order & Payment Operations)
 * @purpose Cancels unpaid orders, releases inventory reservations, expires pending payment proofs, and revokes research protocol tokens.
 * @contracts
 *   Workflow: expireUnpaidOrderWorkflow
 *   Steps: validateUnpaidOrderEligibilityStep · cancelOrderAndReleaseBOMStep · revokeOrderResearchProtocolsStep · finalizeUnpaidOrderCancellationStep
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"

import { MANUAL_PAYMENT_MODULE } from "../modules/manual-payment"
import type ManualPaymentModuleService from "../modules/manual-payment/service"
import { revokeOrderResearchProtocolsStep } from "./steps/revoke-order-research-protocols"

export type ExpireUnpaidOrderInput = {
  order_id: string
  reason?: "unpaid_timeout" | "customer_requested" | "rejected_timeout" | string
  actor_id?: string
}

export type ExpireUnpaidOrderResult = {
  order_id: string
  status: "canceled"
  reason: string
}

type OrderRecord = {
  id: string
  status: string
  payment_status?: string
  customer_id?: string | null
  metadata?: Record<string, unknown> | null
}

export const validateUnpaidOrderEligibilityStep = createStep(
  "validate-unpaid-order-eligibility",
  async (input: ExpireUnpaidOrderInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "status", "payment_status", "customer_id", "metadata"],
      filters: { id: input.order_id },
      pagination: { take: 1 },
    })

    const order = orders[0] as OrderRecord | undefined
    if (!order) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order ${input.order_id} not found`)
    }

    if (order.status === "canceled") {
      return new StepResponse({ order, alreadyCanceled: true })
    }

    // Safety check: Cannot cancel if payment is already captured
    if (order.payment_status === "captured" || order.payment_status === "partially_captured") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot cancel order ${input.order_id} with payment status: ${order.payment_status}`
      )
    }

    // Safety check: Check if manual payment proof is currently under review or already approved
    const manualPaymentService = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE
    )
    const proofs = await manualPaymentService.listManualPaymentProofs(
      { order_id: input.order_id },
      { take: 1 }
    )

    const activeProof = proofs[0]
    if (
      activeProof &&
      (activeProof.status === "pending" || activeProof.status === "approved")
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot cancel order ${input.order_id}: payment proof is currently ${
          activeProof.status === "pending" ? "pending review" : "already approved"
        }`
      )
    }

    return new StepResponse({ order, alreadyCanceled: false })
  }
)

export const cancelOrderAndReleaseBOMStep = createStep(
  "cancel-order-and-release-bom",
  async (input: { order_id: string }, { container }) => {
    // Native Medusa cancelOrderWorkflow automatically releases inventory reservations
    const { result } = await cancelOrderWorkflow(container).run({
      input: { order_id: input.order_id },
    })
    return new StepResponse(result)
  }
)

export const finalizeUnpaidOrderCancellationStep = createStep(
  "finalize-unpaid-order-cancellation",
  async (
    input: { order_id: string; reason: string },
    { container }
  ) => {
    const manualPaymentService = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE
    )

    // Mark any open proof as expired
    const proofs = await manualPaymentService.listManualPaymentProofs(
      { order_id: input.order_id },
      { take: 1 }
    )
    if (proofs.length > 0 && proofs[0].status !== "approved") {
      await manualPaymentService.updateManualPaymentProofs({
        id: proofs[0].id,
        status: "expired",
      })
    }

    return new StepResponse({
      order_id: input.order_id,
      status: "canceled" as const,
      reason: input.reason,
    })
  }
)

export const expireUnpaidOrderWorkflow = createWorkflow(
  "expire-unpaid-order",
  function (input: ExpireUnpaidOrderInput) {
    validateUnpaidOrderEligibilityStep(input)
    cancelOrderAndReleaseBOMStep({ order_id: input.order_id })
    revokeOrderResearchProtocolsStep({
      order_id: input.order_id,
      reason: "order_expired_unpaid",
    })
    const finalizeInput = transform({ input }, ({ input }) => ({
      order_id: input.order_id,
      reason: input.reason || "unpaid_timeout",
    }))
    const result = finalizeUnpaidOrderCancellationStep(finalizeInput)

    return new WorkflowResponse(result)
  }
)

export default expireUnpaidOrderWorkflow
