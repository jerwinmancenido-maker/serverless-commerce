import { fingerprintCompoundedProductConfiguration } from "../configuration-fingerprint"
import { DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY } from "../contracts/governance"

describe("compounded product configuration fingerprint", () => {
  it("is stable when object property insertion order differs", () => {
    const first = {
      schema_version: "1" as const,
      label: "Future presentation",
      description: null,
      fields: [],
      variation_axes: [],
      sku_suggestion_policy: null,
      readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
      variant_warning_threshold: 100,
    }
    const second = {
      variant_warning_threshold: 100,
      sku_suggestion_policy: null,
      readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
      variation_axes: [],
      fields: [],
      description: null,
      label: "Future presentation",
      schema_version: "1" as const,
    }

    expect(fingerprintCompoundedProductConfiguration(first)).toBe(
      fingerprintCompoundedProductConfiguration(second),
    )
  })

  it("changes when configuration meaning changes", () => {
    const base = {
      schema_version: "1" as const,
      label: "Future presentation",
      description: null,
      fields: [],
      variation_axes: [],
      sku_suggestion_policy: null,
      readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
      variant_warning_threshold: 100,
    }

    expect(fingerprintCompoundedProductConfiguration(base)).not.toBe(
      fingerprintCompoundedProductConfiguration({
        ...base,
        variant_warning_threshold: 101,
      }),
    )
  })

  it.each([
    ["undefined", { value: undefined }],
    ["non-finite number", { value: Number.POSITIVE_INFINITY }],
    ["non-JSON object", { value: new Date("2026-01-01T00:00:00Z") }],
  ])("rejects unsupported canonical payload values: %s", (_label, value) => {
    expect(() => fingerprintCompoundedProductConfiguration(value as never)).toThrow(
      "fingerprint payload",
    )
  })

  it("rejects circular payloads rather than producing an ambiguous hash", () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(() =>
      fingerprintCompoundedProductConfiguration(circular as never),
    ).toThrow("circular reference")
  })
})
