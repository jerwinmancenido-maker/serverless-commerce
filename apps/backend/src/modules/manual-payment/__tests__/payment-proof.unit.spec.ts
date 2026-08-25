import {
  MANUAL_PAYMENT_PROOF_MAX_BYTES,
  decideManualPaymentProofReview,
  decideManualPaymentProofSubmission,
  normalizeManualPaymentProofReview,
  normalizeManualPaymentProofSubmission,
} from "../contracts/payment-proof"
import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../manual-qr-payment/service"

const validSubmission = {
  paymentSessionId: "payses_test",
  orderId: "order_test",
  customerId: "cus_test",
  providerId: MANUAL_QR_PAYMENT_PROVIDER_ID,
  fileId: "file_test",
  fileName: "proof.png",
  mimeType: "image/png",
  sizeBytes: 1024,
  checksumSha256: "a".repeat(64),
  actorId: "cus_test",
}

describe("manual payment proof contract", () => {
  it("normalizes an accepted proof submission", () => {
    expect(
      normalizeManualPaymentProofSubmission({
        ...validSubmission,
        fileName: " proof.png ",
        mimeType: "IMAGE/PNG",
        checksumSha256: "A".repeat(64),
      }),
    ).toEqual(validSubmission)
  })

  it("rejects a non-Manual QR provider", () => {
    expect(() =>
      normalizeManualPaymentProofSubmission({
        ...validSubmission,
        providerId: "pp_system_default",
      }),
    ).toThrow("does not use the Manual QR provider")
  })

  it("rejects an unsupported file type", () => {
    expect(() =>
      normalizeManualPaymentProofSubmission({
        ...validSubmission,
        mimeType: "image/svg+xml",
      }),
    ).toThrow("PNG, JPEG, or PDF")
  })

  it("rejects oversized proof metadata", () => {
    expect(() =>
      normalizeManualPaymentProofSubmission({
        ...validSubmission,
        sizeBytes: MANUAL_PAYMENT_PROOF_MAX_BYTES + 1,
      }),
    ).toThrow("between 1 byte and 10 MiB")
  })

  it("requires a rejection reason", () => {
    expect(() =>
      normalizeManualPaymentProofReview({
        proofId: "proof_test",
        decision: "rejected",
        actorId: "usr_test",
      }),
    ).toThrow("rejection reason is required")
  })

  it("normalizes a valid rejection review", () => {
    expect(
      normalizeManualPaymentProofReview({
        proofId: " proof_test ",
        decision: "rejected",
        reason: " Receipt is unreadable. ",
        actorId: " usr_test ",
      }),
    ).toEqual({
      proofId: "proof_test",
      decision: "rejected",
      reason: "Receipt is unreadable.",
      actorId: "usr_test",
    })
  })

  it("rejects an approval carrying a rejection reason", () => {
    expect(() =>
      normalizeManualPaymentProofReview({
        proofId: "proof_test",
        decision: "approved",
        reason: "not applicable",
        actorId: "usr_test",
      }),
    ).toThrow("approval cannot include a rejection reason")
  })

  it("treats an identical pending submission as idempotent", () => {
    expect(
      decideManualPaymentProofSubmission(
        {
          status: "pending",
          fileId: validSubmission.fileId,
          checksumSha256: validSubmission.checksumSha256,
        },
        validSubmission,
      ),
    ).toBe("idempotent")
  })

  it("rejects a different file while proof is pending", () => {
    expect(() =>
      decideManualPaymentProofSubmission(
        {
          status: "pending",
          fileId: validSubmission.fileId,
          checksumSha256: validSubmission.checksumSha256,
        },
        {
          fileId: "file_replacement",
          checksumSha256: "b".repeat(64),
        },
      ),
    ).toThrow("cannot replace a pending submission")
  })

  it("permits resubmission after rejection", () => {
    expect(
      decideManualPaymentProofSubmission(
        {
          status: "rejected",
          fileId: validSubmission.fileId,
          checksumSha256: validSubmission.checksumSha256,
        },
        {
          fileId: "file_replacement",
          checksumSha256: "b".repeat(64),
        },
      ),
    ).toBe("resubmit")
  })

  it("treats an identical completed review as idempotent", () => {
    expect(
      decideManualPaymentProofReview(
        { status: "rejected", rejectionReason: "Unreadable" },
        { decision: "rejected", reason: "Unreadable" },
      ),
    ).toBe("idempotent")
  })

  it("rejects a conflicting completed review", () => {
    expect(() =>
      decideManualPaymentProofReview(
        { status: "approved", rejectionReason: null },
        { decision: "rejected", reason: "Conflicting decision" },
      ),
    ).toThrow("approved proof cannot transition to rejected")
  })
})
