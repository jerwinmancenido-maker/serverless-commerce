import {
  normalizeManualPaymentSettlementAttempt,
  normalizeManualPaymentSettlementEvent,
} from "../contracts/payment-settlement"

const validAttempt = {
  attemptId: "attempt_test",
  proofId: "proof_test",
  proofRevision: 1,
  paymentSessionId: "payses_test",
  orderId: "order_test",
  actorId: "usr_test",
}

describe("manual payment settlement contract", () => {
  it("normalizes an accepted settlement attempt", () => {
    expect(
      normalizeManualPaymentSettlementAttempt({
        ...validAttempt,
        attemptId: " attempt_test ",
        actorId: " usr_test ",
      }),
    ).toEqual(validAttempt)
  })

  it("rejects a settlement attempt without a positive proof revision", () => {
    expect(() =>
      normalizeManualPaymentSettlementAttempt({
        ...validAttempt,
        proofRevision: 0,
      }),
    ).toThrow("proofRevision must be a positive integer")
  })

  it("accepts a retry that resumes at capture", () => {
    expect(
      normalizeManualPaymentSettlementEvent({
        ...validAttempt,
        eventType: "settlement_requested",
        status: "capturing",
        paymentId: " pay_test ",
      }),
    ).toMatchObject({
      eventType: "settlement_requested",
      status: "capturing",
      paymentId: "pay_test",
    })
  })

  it("requires payment and capture identifiers for capture confirmation", () => {
    expect(() =>
      normalizeManualPaymentSettlementEvent({
        ...validAttempt,
        eventType: "capture_confirmed",
        status: "captured",
        paymentId: "pay_test",
      }),
    ).toThrow("requires a captured payment and capture")
  })

  it("requires a sanitized category for settlement failures", () => {
    expect(() =>
      normalizeManualPaymentSettlementEvent({
        ...validAttempt,
        eventType: "settlement_failed",
        status: "failed",
      }),
    ).toThrow("requires a sanitized error category")
  })

  it("normalizes a valid capture confirmation", () => {
    expect(
      normalizeManualPaymentSettlementEvent({
        ...validAttempt,
        eventType: "capture_confirmed",
        status: "captured",
        paymentId: " pay_test ",
        captureId: " cap_test ",
      }),
    ).toEqual({
      ...validAttempt,
      eventType: "capture_confirmed",
      status: "captured",
      paymentId: "pay_test",
      captureId: "cap_test",
      errorCategory: null,
    })
  })
})
