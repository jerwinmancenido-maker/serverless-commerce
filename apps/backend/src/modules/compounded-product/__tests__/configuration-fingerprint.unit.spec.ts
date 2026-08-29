import { fingerprintCompoundedProductConfiguration } from "../configuration-fingerprint"

describe("compounded product configuration fingerprint", () => {
  it("is stable when object property insertion order differs", () => {
    const first = {
      schema_version: "1" as const,
      label: "Future presentation",
      description: null,
      fields: [],
      variation_axes: [],
      sku_suggestion_policy: null,
      variant_warning_threshold: 100,
    }
    const second = {
      variant_warning_threshold: 100,
      sku_suggestion_policy: null,
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
      variant_warning_threshold: 100,
    }

    expect(fingerprintCompoundedProductConfiguration(base)).not.toBe(
      fingerprintCompoundedProductConfiguration({
        ...base,
        variant_warning_threshold: 101,
      }),
    )
  })
})
