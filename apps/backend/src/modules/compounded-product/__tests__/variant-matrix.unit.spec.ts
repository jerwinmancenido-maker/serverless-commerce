import type { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import {
  assertCompoundedProductVariantMatrixConfirmed,
  COMPOUNDED_PRODUCT_VARIANT_SAFETY_CEILING,
  generateCompoundedProductVariantMatrix,
} from "../variant-matrix"

type VariationAxes = CompoundedProductPresentationSnapshot["variation_axes"]

const axes: VariationAxes = [
  {
    key: "package",
    semantic_name: "Package",
    help_text: null,
    position: 0,
    values: [
      {
        key: "primary_only",
        label: "Primary only",
        position: 0,
        active: true,
        measurement: null,
      },
      {
        key: "with_accessory",
        label: "With accessory",
        position: 1,
        active: true,
        measurement: null,
      },
      {
        key: "retired_package",
        label: "Retired package",
        position: 2,
        active: false,
        measurement: null,
      },
    ],
  },
  {
    key: "net_content",
    semantic_name: "Net Content",
    help_text: null,
    position: 1,
    values: [
      {
        key: "one_mg",
        label: "1 mg",
        position: 0,
        active: true,
        measurement: {
          amount: "1",
          display_unit: "mg",
          material_profile_id: null,
        },
      },
      {
        key: "two_mg",
        label: "2 mg",
        position: 1,
        active: true,
        measurement: {
          amount: "2",
          display_unit: "mg",
          material_profile_id: null,
        },
      },
      {
        key: "three_mg",
        label: "3 mg",
        position: 2,
        active: true,
        measurement: {
          amount: "3",
          display_unit: "mg",
          material_profile_id: null,
        },
      },
    ],
  },
]

const generate = (
  input: Partial<Parameters<typeof generateCompoundedProductVariantMatrix>[0]> = {},
) =>
  generateCompoundedProductVariantMatrix({
    axes,
    warningThreshold: 20,
    serverMaximum: 100,
    ...input,
  })

describe("compounded product variant matrix", () => {
  it("deterministically generates ordered native-option combinations", () => {
    const first = generate({ axes: [...axes].reverse() })
    const second = generate()

    expect(first).toEqual(second)
    expect(first.totalCombinationCount).toBe(6)
    expect(first.resultingVariantCount).toBe(6)
    expect(first.rows.map((row) => row.title)).toEqual([
      "Primary only / 1 mg",
      "Primary only / 2 mg",
      "Primary only / 3 mg",
      "With accessory / 1 mg",
      "With accessory / 2 mg",
      "With accessory / 3 mg",
    ])
    expect(first.rows[0].options.map((option) => option.semanticName)).toEqual([
      "Package",
      "Net Content",
    ])
  })

  it("submits five rows when one row is excluded from a six-row matrix", () => {
    const selected = generate()
    const excluded = generate({
      excludedCombinationKeys: [selected.rows[1].key],
    })

    expect(selected.resultingVariantCount).toBe(6)
    expect(excluded.totalCombinationCount).toBe(6)
    expect(excluded.excludedCombinationCount).toBe(1)
    expect(excluded.resultingVariantCount).toBe(5)
    expect(excluded.rows.map((row) => row.key)).not.toContain(
      selected.rows[1].key,
    )
  })

  it("binds large-matrix confirmation to the exact fingerprint and count", () => {
    const preview = generate({ warningThreshold: 2 })

    expect(preview.requiresConfirmation).toBe(true)
    expect(preview.confirmationSatisfied).toBe(false)
    expect(() =>
      assertCompoundedProductVariantMatrixConfirmed(preview),
    ).toThrow("requires confirmation")

    const confirmed = generate({
      warningThreshold: 2,
      confirmation: {
        fingerprint: preview.fingerprint,
        resultingVariantCount: preview.resultingVariantCount,
      },
    })

    expect(confirmed.confirmationSatisfied).toBe(true)
    expect(assertCompoundedProductVariantMatrixConfirmed(confirmed)).toBe(
      confirmed,
    )

    const changed = generate({
      warningThreshold: 2,
      selectedValueKeysByAxis: {
        package: ["primary_only"],
        net_content: ["one_mg", "two_mg", "three_mg"],
      },
      confirmation: {
        fingerprint: preview.fingerprint,
        resultingVariantCount: preview.resultingVariantCount,
      },
    })

    expect(changed.fingerprint).not.toBe(preview.fingerprint)
    expect(changed.confirmationSatisfied).toBe(false)
  })

  it("generates one default row when no configurable axes are selected", () => {
    const matrix = generate({ axes: [] })

    expect(matrix.totalCombinationCount).toBe(1)
    expect(matrix.rows).toEqual([
      expect.objectContaining({ title: "", options: [] }),
    ])
  })

  it.each([
    [
      "inactive selected value",
      {
        selectedValueKeysByAxis: {
          package: ["retired_package"],
          net_content: ["one_mg"],
        },
      },
      "unknown or inactive",
    ],
    [
      "unknown excluded row",
      { excludedCombinationKeys: ["not-a-row"] },
      "does not exist",
    ],
    [
      "server maximum",
      { serverMaximum: 5, warningThreshold: 5 },
      "exceeds the server maximum",
    ],
    [
      "implementation ceiling",
      {
        serverMaximum: COMPOUNDED_PRODUCT_VARIANT_SAFETY_CEILING + 1,
        warningThreshold: 1,
      },
      "implementation safety ceiling",
    ],
  ])("rejects %s", (_label, input, message) => {
    expect(() => generate(input)).toThrow(message)
  })

  it("defensively rejects duplicate semantic and value identity", () => {
    expect(() =>
      generate({
        axes: [
          axes[0],
          {
            ...axes[1],
            semantic_name: " package ",
          },
        ],
      }),
    ).toThrow("Duplicate variation axis semantic name")

    expect(() =>
      generate({
        axes: [
          {
            ...axes[0],
            values: [axes[0].values[0], { ...axes[0].values[0] }],
          },
        ],
      }),
    ).toThrow("Duplicate variation value key")
  })
})
