import { PaymentSessionStatus } from "@medusajs/framework/utils"

import ManualQrPaymentProviderService from "../service"

describe("ManualQrPaymentProviderService", () => {
  const createProvider = () =>
    new ManualQrPaymentProviderService(
      {},
      {
        displayName: "Configured QR",
        instructions: "Use the configured recipient.",
        qrImageUrl: "https://assets.example.test/qr.png",
        expiresInMinutes: 60,
      },
    )

  it("initializes a public pending session without copying caller data", async () => {
    const provider = createProvider()
    const result = await provider.initiatePayment({
      amount: 100,
      currency_code: "PHP",
      data: {
        session_id: "payses_test",
        manual_qr_review_status: "approved",
        private_value: "must-not-leak",
      },
    })

    expect(result.status).toBe(PaymentSessionStatus.PENDING)
    expect(result.data).toMatchObject({
      session_id: "payses_test",
      manual_qr_review_status: "pending",
      display_name: "Configured QR",
      expires_in_minutes: 60,
      currency_code: "php",
    })
    expect(result.data).not.toHaveProperty("private_value")
  })

  it("defers authorization until a trusted approval marker exists", async () => {
    const provider = createProvider()

    await expect(
      provider.authorizePayment({
        data: { manual_qr_review_status: "pending" },
      }),
    ).resolves.toMatchObject({
      status: PaymentSessionStatus.PENDING_AUTHORIZATION,
    })

    await expect(
      provider.authorizePayment({
        data: { manual_qr_review_status: "approved" },
      }),
    ).resolves.toMatchObject({ status: PaymentSessionStatus.AUTHORIZED })
  })

  it("refuses capture before proof approval", async () => {
    const provider = createProvider()

    await expect(
      provider.capturePayment({
        data: { manual_qr_review_status: "pending" },
      }),
    ).rejects.toThrow("cannot be captured before proof approval")
  })

  it("preserves an existing capture timestamp on retries", async () => {
    const provider = createProvider()
    const capturedAt = "2026-08-25T00:00:00.000Z"
    const result = await provider.capturePayment({
      data: {
        manual_qr_review_status: "approved",
        manual_qr_captured_at: capturedAt,
      },
    })

    expect(result.data?.manual_qr_captured_at).toBe(capturedAt)
  })

  it("validates configured expiry", () => {
    expect(() =>
      ManualQrPaymentProviderService.validateOptions({
        expiresInMinutes: 0,
      }),
    ).toThrow("must be a positive integer")
  })
})
