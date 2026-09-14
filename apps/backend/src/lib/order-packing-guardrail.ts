/**
 * @file    apps/backend/src/lib/order-packing-guardrail.ts
 * @module  OrderPackingGuardrail (Fulfillment Invariant)
 * @purpose Evaluates deterministic "No-Pay, No-Pack" clearance and terminal order states.
 * @contracts
 *   Service: OrderFulfillmentDispatch · OrderCockpitDetailRoute · OrdersCockpitList
 */

export interface OrderPackingGuardrailEvaluation {
  /**
   * Terminal state: true if canceled or refunded.
   * Terminal orders can NEVER be packed or confirmed under any circumstance.
   */
  isTerminal: boolean

  /**
   * Paid state: true strictly if payment_status === "captured".
   */
  isPaid: boolean

  /**
   * Confirmed state: true if explicit admin confirmation metadata exists,
   * OR if order status is completed without unpaid indicators.
   */
  isConfirmed: boolean

  /**
   * Operational clearance: true ONLY if non-terminal AND (paid OR confirmed).
   */
  canPack: boolean
}

export type OrderGuardrailInput = {
  status?: string | null
  payment_status?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * Evaluates the strict mathematical guardrail for order packing and courier dispatch.
 * Enforces zero-tolerance for unpaid or terminal orders.
 */
export function evaluateOrderPackingGuardrail(order?: OrderGuardrailInput | null): OrderPackingGuardrailEvaluation {
  if (!order) {
    return {
      isTerminal: false,
      isPaid: false,
      isConfirmed: false,
      canPack: false,
    }
  }

  // 1. Terminal Short-Circuit: Canceled or Refunded orders are unconditionally blocked
  const isTerminal = order.status === "canceled" || order.payment_status === "refunded"

  // 2. Strict Payment Verification: Only captured funds qualify as paid
  const isPaid = order.payment_status === "captured"

  // 3. Admin Confirmation: Explicit station override or legacy completed order with non-unpaid state
  const isConfirmed = Boolean(order.metadata?.confirmed_for_packing) ||
    (order.status === "completed" && order.payment_status !== "awaiting" && order.payment_status !== "not_paid")

  // 4. Mathematical Invariant: Packaging and dispatch require non-terminal clearance
  const canPack = !isTerminal && (isPaid || isConfirmed)

  return {
    isTerminal,
    isPaid,
    isConfirmed,
    canPack,
  }
}
