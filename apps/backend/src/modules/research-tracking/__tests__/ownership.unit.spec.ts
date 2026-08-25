import {
  assertMatchingResearchFingerprint,
  assertPrivacyPriorProfileStatus,
  createResearchRequestFingerprint,
  normalizeCancelResearchProfileDeletionInput,
  normalizeCloseResearchProfileInput,
  normalizeCreateResearchProfileInput,
  normalizeRecordResearchConsentInput,
  normalizeResearchIdempotencyKey,
  normalizeResearchNoticeSha256,
  normalizeResearchTimezone,
  normalizeRequestResearchProfileDeletionInput,
  normalizeUpdateResearchProfilePreferencesInput,
  projectResearchConsentEvent,
} from "../contracts/ownership"

const noticeSha256 = "a".repeat(64)

describe("research tracking ownership contract", () => {
  it("normalizes a valid profile creation request", () => {
    expect(
      normalizeCreateResearchProfileInput({
        customerId: "cus_test",
        timezone: "Asia/Manila",
        locale: "en-PH",
        requestedConsentVersion: "2026-08-25.v1",
        activeConsentVersion: "2026-08-25.v1",
        noticeSha256,
        accepted: true,
        idempotencyKey: "profile:create:1",
      }),
    ).toMatchObject({
      customerId: "cus_test",
      timezone: "Asia/Manila",
      locale: "en-PH",
      requestedConsentVersion: "2026-08-25.v1",
      noticeSha256,
      accepted: true,
      idempotencyKey: "profile:create:1",
    })
  })

  it("rejects stale consent", () => {
    expect(() =>
      normalizeCreateResearchProfileInput({
        customerId: "cus_test",
        timezone: "Asia/Manila",
        locale: "en-PH",
        requestedConsentVersion: "2026-08-25.v1",
        activeConsentVersion: "2026-08-25.v2",
        noticeSha256,
        accepted: true,
        idempotencyKey: "profile:create:1",
      }),
    ).toThrow("consent version is no longer current")
  })

  it("rejects consent that was not explicitly accepted", () => {
    expect(() =>
      normalizeCreateResearchProfileInput({
        customerId: "cus_test",
        timezone: "Asia/Manila",
        locale: "en-PH",
        requestedConsentVersion: "2026-08-25.v1",
        activeConsentVersion: "2026-08-25.v1",
        noticeSha256,
        accepted: false,
        idempotencyKey: "profile:create:1",
      }),
    ).toThrow("accepted must be true")
  })

  it.each(["UTC+8", "Manila", "", "Mars/Olympus"])(
    "rejects invalid IANA timezone %s",
    (timezone) => {
      expect(() => normalizeResearchTimezone(timezone)).toThrow(
        "timezone must be a valid IANA timezone",
      )
    },
  )

  it("accepts IANA timezones", () => {
    expect(normalizeResearchTimezone("Asia/Manila")).toBe("Asia/Manila")
    expect(normalizeResearchTimezone("UTC")).toBe("UTC")
  })

  it.each(["short", "has spaces", "bad/key", "x".repeat(129)])(
    "rejects invalid idempotency key %s",
    (key) => {
      expect(() => normalizeResearchIdempotencyKey(key)).toThrow(
        "idempotencyKey must be 8-128 characters",
      )
    },
  )

  it("normalizes a notice digest to lowercase", () => {
    expect(normalizeResearchNoticeSha256("A".repeat(64))).toBe(noticeSha256)
  })

  it("keeps the consent notice digest out of workflow projections", () => {
    const projection = projectResearchConsentEvent({
      event_type: "accepted",
      consent_version: "2026-08-25.v1",
      occurred_at: new Date("2026-08-25T00:00:00.000Z"),
    })

    expect(projection).toEqual({
      event_type: "accepted",
      consent_version: "2026-08-25.v1",
      occurred_at: new Date("2026-08-25T00:00:00.000Z"),
    })
    expect(projection).not.toHaveProperty("notice_sha256")
  })

  it("requires at least one preference", () => {
    expect(() =>
      normalizeUpdateResearchProfilePreferencesInput({
        customerId: "cus_test",
        idempotencyKey: "prefs:update:1",
      }),
    ).toThrow("timezone or locale is required")
  })

  it("creates deterministic, operation-specific fingerprints", () => {
    const first = createResearchRequestFingerprint("operation-a", ["value"])
    const replay = createResearchRequestFingerprint("operation-a", ["value"])
    const other = createResearchRequestFingerprint("operation-b", ["value"])

    expect(first).toBe(replay)
    expect(first).not.toBe(other)
  })

  it("changes the consent fingerprint when the notice digest changes", () => {
    const first = normalizeRecordResearchConsentInput({
      customerId: "cus_test",
      requestedConsentVersion: "2026-08-25.v1",
      activeConsentVersion: "2026-08-25.v1",
      noticeSha256,
      accepted: true,
      idempotencyKey: "consent:record:1",
    })
    const changed = normalizeRecordResearchConsentInput({
      customerId: "cus_test",
      requestedConsentVersion: "2026-08-25.v1",
      activeConsentVersion: "2026-08-25.v1",
      noticeSha256: "b".repeat(64),
      accepted: true,
      idempotencyKey: "consent:record:1",
    })

    expect(first.requestFingerprintSha256).not.toBe(
      changed.requestFingerprintSha256,
    )
  })

  it("rejects idempotency-key reuse with different input", () => {
    expect(() =>
      assertMatchingResearchFingerprint("stored", "different"),
    ).toThrow("idempotency key was already used with different input")
  })

  it("normalizes an acknowledged cancellation", () => {
    expect(
      normalizeCancelResearchProfileDeletionInput({
        customerId: "cus_test",
        acknowledgeCancellation: true,
        idempotencyKey: "delete:cancel:1",
      }),
    ).toMatchObject({
      customerId: "cus_test",
      idempotencyKey: "delete:cancel:1",
    })
  })

  it.each([
    ["close", () =>
      normalizeCloseResearchProfileInput({
        customerId: "cus_test",
        acknowledgeClosure: false,
        idempotencyKey: "profile:close:1",
      })],
    ["delete", () =>
      normalizeRequestResearchProfileDeletionInput({
        customerId: "cus_test",
        acknowledgeDeletionRequest: false,
        idempotencyKey: "delete:request:1",
      })],
  ])("requires explicit acknowledgement for %s", (_operation, normalize) => {
    expect(normalize).toThrow("acknowledgement must be true")
  })

  it("allows deletion requests only from active or closed profiles", () => {
    expect(assertPrivacyPriorProfileStatus("active")).toBe("active")
    expect(assertPrivacyPriorProfileStatus("closed")).toBe("closed")
    expect(() =>
      assertPrivacyPriorProfileStatus("deletion_requested"),
    ).toThrow("profile cannot enter deletion_requested")
  })
})
