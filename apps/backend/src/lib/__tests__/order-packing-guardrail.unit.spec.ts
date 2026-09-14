/**
 * @file    apps/backend/src/lib/__tests__/order-packing-guardrail.unit.spec.ts
 * @module  OrderPackingGuardrailTests
 * @purpose Unit test verification of the strict No-Pay, No-Pack guardrail truth table.
 */

import { evaluateOrderPackingGuardrail } from "../order-packing-guardrail"

describe("OrderPackingGuardrail Specification & Truth Table", () => {
  describe("Terminal State Short-Circuiting", () => {
    it("should unconditionally block packing for canceled orders even if payment was captured", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "canceled",
        payment_status: "captured",
      })

      expect(result.isTerminal).toBe(true)
      expect(result.canPack).toBe(false)
      expect(result.isPaid).toBe(true)
    })

    it("should unconditionally block packing for canceled orders even if admin confirmed", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "canceled",
        payment_status: "awaiting",
        metadata: { confirmed_for_packing: true },
      })

      expect(result.isTerminal).toBe(true)
      expect(result.canPack).toBe(false)
      expect(result.isConfirmed).toBe(true)
    })

    it("should unconditionally block packing for refunded orders even if previously confirmed", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "completed",
        payment_status: "refunded",
        metadata: { confirmed_for_packing: true },
      })

      expect(result.isTerminal).toBe(true)
      expect(result.canPack).toBe(false)
    })

    it("should unconditionally block packing for refunded orders with normal status", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "pending",
        payment_status: "refunded",
      })

      expect(result.isTerminal).toBe(true)
      expect(result.canPack).toBe(false)
    })
  })

  describe("Standard Unpaid Orders (Strict No-Pay Lock)", () => {
    it("should block packing for awaiting payment orders", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "pending",
        payment_status: "awaiting",
      })

      expect(result.isTerminal).toBe(false)
      expect(result.isPaid).toBe(false)
      expect(result.isConfirmed).toBe(false)
      expect(result.canPack).toBe(false)
    })

    it("should block packing for not_paid status orders", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "pending",
        payment_status: "not_paid",
      })

      expect(result.canPack).toBe(false)
      expect(result.isPaid).toBe(false)
    })

    it("should safely handle undefined or null order inputs", () => {
      expect(evaluateOrderPackingGuardrail(null).canPack).toBe(false)
      expect(evaluateOrderPackingGuardrail(undefined).canPack).toBe(false)
    })
  })

  describe("Order #28 Regression Scenario (Completed Status with Awaiting Payment)", () => {
    it("should strictly BLOCK packing when completed order has awaiting payment and no confirmation", () => {
      // Prior bug: order.status === 'completed' falsely evaluated to canPack = true
      const result = evaluateOrderPackingGuardrail({
        status: "completed",
        payment_status: "awaiting",
        metadata: {},
      })

      expect(result.isPaid).toBe(false)
      expect(result.isConfirmed).toBe(false)
      expect(result.canPack).toBe(false)
    })

    it("should UNLOCK packing when completed order has explicit admin confirmation metadata", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "completed",
        payment_status: "awaiting",
        metadata: { confirmed_for_packing: true },
      })

      expect(result.isPaid).toBe(false)
      expect(result.isConfirmed).toBe(true)
      expect(result.canPack).toBe(true)
    })
  })

  describe("Paid Orders Clearance", () => {
    it("should clear packing when payment is captured on standard order", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "pending",
        payment_status: "captured",
      })

      expect(result.isTerminal).toBe(false)
      expect(result.isPaid).toBe(true)
      expect(result.canPack).toBe(true)
    })

    it("should clear packing when payment is captured on completed order", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "completed",
        payment_status: "captured",
      })

      expect(result.isTerminal).toBe(false)
      expect(result.isPaid).toBe(true)
      expect(result.canPack).toBe(true)
    })
  })

  describe("Administrative Manual Confirmation Override", () => {
    it("should allow packing for unpaid order when explicit confirmed_for_packing metadata is set", () => {
      const result = evaluateOrderPackingGuardrail({
        status: "pending",
        payment_status: "awaiting",
        metadata: {
          confirmed_for_packing: true,
          confirmed_by: "STATION-PK-01",
        },
      })

      expect(result.isTerminal).toBe(false)
      expect(result.isPaid).toBe(false)
      expect(result.isConfirmed).toBe(true)
      expect(result.canPack).toBe(true)
    })
  })
})
