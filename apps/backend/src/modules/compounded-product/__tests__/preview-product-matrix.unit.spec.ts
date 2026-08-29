import { fingerprintCompoundedProductConfiguration } from "../configuration-fingerprint"
import type { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import { DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY } from "../contracts/governance"
import { previewCompoundedProductVariantMatrix } from "../preview-product-matrix"

const snapshot: CompoundedProductPresentationSnapshot = {
  schema_version: "1",
  label: "Configured presentation",
  description: null,
  fields: [],
  variation_axes: [
    {
      key: "package",
      semantic_name: "Package",
      help_text: null,
      position: 0,
      values: [
        {
          key: "one",
          label: "One",
          position: 0,
          active: true,
          measurement: null,
        },
        {
          key: "two",
          label: "Two",
          position: 1,
          active: true,
          measurement: null,
        },
      ],
    },
  ],
  sku_suggestion_policy: null,
  readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
  variant_warning_threshold: 1,
}

const fingerprint = fingerprintCompoundedProductConfiguration(snapshot)

describe("previewCompoundedProductVariantMatrix", () => {
  it("returns an authoritative bounded matrix without satisfying confirmation", () => {
    const result = previewCompoundedProductVariantMatrix({
      request: {
        presentation_revision_id: "revision_1",
        expected_configuration_fingerprint: fingerprint,
        selected_value_keys_by_axis: { package: ["one", "two"] },
        excluded_combination_keys: [],
      },
      revision: {
        id: "revision_1",
        status: "active",
        snapshot,
        fingerprint,
      },
      serverMaximum: 10,
    })

    expect(result.matrix.resultingVariantCount).toBe(2)
    expect(result.matrix.requiresConfirmation).toBe(true)
    expect(result.matrix.confirmationSatisfied).toBe(false)
  })

  it("rejects an inactive or changed configuration revision", () => {
    expect(() =>
      previewCompoundedProductVariantMatrix({
        request: {
          presentation_revision_id: "revision_1",
          expected_configuration_fingerprint: fingerprint,
          selected_value_keys_by_axis: { package: ["one"] },
          excluded_combination_keys: [],
        },
        revision: {
          id: "revision_1",
          status: "superseded",
          snapshot,
          fingerprint,
        },
        serverMaximum: 10,
      }),
    ).toThrow("configuration_revision_inactive")

    expect(() =>
      previewCompoundedProductVariantMatrix({
        request: {
          presentation_revision_id: "revision_1",
          expected_configuration_fingerprint: "a".repeat(64),
          selected_value_keys_by_axis: { package: ["one"] },
          excluded_combination_keys: [],
        },
        revision: {
          id: "revision_1",
          status: "active",
          snapshot,
          fingerprint,
        },
        serverMaximum: 10,
      }),
    ).toThrow("configuration_revision_changed")
  })
})
