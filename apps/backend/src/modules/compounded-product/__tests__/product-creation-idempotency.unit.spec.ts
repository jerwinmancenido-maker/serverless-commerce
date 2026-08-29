import {
  completeCompoundedProductCreationRequest,
  createCompoundedProductCreationPayloadFingerprint,
  failCompoundedProductCreationRequest,
  normalizeCompoundedProductIdempotencyClaim,
  resolveCompoundedProductCreationRequest,
  type CompoundedProductCreationRequestRecord,
} from "../product-creation-idempotency"

const fingerprint = createCompoundedProductCreationPayloadFingerprint({
  configuration_revision_id: "revision-01",
  product: { title: "Configurable compound" },
  variants: [{ options: { package: "primary" } }],
})

const request = (
  overrides: Partial<CompoundedProductCreationRequestRecord> = {},
): CompoundedProductCreationRequestRecord => ({
  id: "request-01",
  operation: "create_product",
  idempotency_key: "request-key-0001",
  request_fingerprint_sha256: fingerprint,
  status: "in_progress",
  actor_id: "user-01",
  native_product_id: null,
  response_payload: null,
  error_code: null,
  completed_at: null,
  failed_at: null,
  ...overrides,
})

describe("compounded product creation idempotency", () => {
  it("canonicalizes the complete payload independently of object key order", () => {
    const reordered = createCompoundedProductCreationPayloadFingerprint({
      variants: [{ options: { package: "primary" } }],
      product: { title: "Configurable compound" },
      configuration_revision_id: "revision-01",
    })
    const changed = createCompoundedProductCreationPayloadFingerprint({
      variants: [{ options: { package: "secondary" } }],
      product: { title: "Configurable compound" },
      configuration_revision_id: "revision-01",
    })

    expect(reordered).toBe(fingerprint)
    expect(changed).not.toBe(fingerprint)
  })

  it("normalizes a server-validated idempotency claim", () => {
    expect(
      normalizeCompoundedProductIdempotencyClaim({
        operation: "create_product",
        idempotency_key: " request-key-0001 ",
        request_fingerprint_sha256: fingerprint,
        actor_id: " user-01 ",
      }),
    ).toEqual({
      operation: "create_product",
      idempotency_key: "request-key-0001",
      request_fingerprint_sha256: fingerprint,
      actor_id: "user-01",
    })
  })

  it("distinguishes in-progress, successful replay, and recorded failure", () => {
    expect(
      resolveCompoundedProductCreationRequest(request(), fingerprint).action,
    ).toBe("in_progress")

    expect(
      resolveCompoundedProductCreationRequest(
        request({
          status: "succeeded",
          native_product_id: "prod-01",
          response_payload: { product_id: "prod-01" },
          completed_at: new Date("2026-08-29T00:00:00Z"),
        }),
        fingerprint,
      ).action,
    ).toBe("replay")

    expect(
      resolveCompoundedProductCreationRequest(
        request({
          status: "failed",
          error_code: "native_product_conflict",
          failed_at: new Date("2026-08-29T00:00:00Z"),
        }),
        fingerprint,
      ).action,
    ).toBe("failed")
  })

  it("rejects reuse of a key with a different canonical payload", () => {
    const differentFingerprint =
      createCompoundedProductCreationPayloadFingerprint({ changed: true })

    expect(() =>
      resolveCompoundedProductCreationRequest(request(), differentFingerprint),
    ).toThrow("idempotency_key_conflict")
  })

  it("builds explicit terminal records from an in-progress request", () => {
    const completedAt = new Date("2026-08-29T01:00:00Z")
    const failedAt = new Date("2026-08-29T02:00:00Z")

    expect(
      completeCompoundedProductCreationRequest({
        request: request(),
        nativeProductId: "prod-01",
        responsePayload: { product_id: "prod-01" },
        completedAt,
      }),
    ).toMatchObject({
      status: "succeeded",
      native_product_id: "prod-01",
      response_payload: { product_id: "prod-01" },
      completed_at: completedAt,
      failed_at: null,
    })

    expect(
      failCompoundedProductCreationRequest({
        request: request(),
        errorCode: "native_product_conflict",
        failedAt,
      }),
    ).toMatchObject({
      status: "failed",
      native_product_id: null,
      response_payload: null,
      error_code: "native_product_conflict",
      completed_at: null,
      failed_at: failedAt,
    })
  })

  it("rejects malformed or incomplete claims and terminal records", () => {
    expect(() =>
      normalizeCompoundedProductIdempotencyClaim({
        operation: "create_product",
        idempotency_key: "short",
        request_fingerprint_sha256: fingerprint,
        actor_id: "user-01",
      }),
    ).toThrow()

    expect(() =>
      resolveCompoundedProductCreationRequest(
        request({ status: "succeeded" }),
        fingerprint,
      ),
    ).toThrow("missing its result")

    expect(() =>
      resolveCompoundedProductCreationRequest(
        request({ status: "failed" }),
        fingerprint,
      ),
    ).toThrow("missing failure details")
  })
})
