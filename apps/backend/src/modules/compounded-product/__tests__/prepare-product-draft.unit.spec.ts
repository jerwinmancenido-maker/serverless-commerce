import { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import { AdminCreateCompoundedProductDraft } from "../contracts/product-creation"
import { prepareCompoundedProductDraft } from "../prepare-product-draft"
import { resolveCompoundedProductVariantServerMaximum } from "../readiness-policy"
import { generateCompoundedProductVariantMatrix } from "../variant-matrix"

const snapshot = CompoundedProductPresentationSnapshot.parse({
  schema_version: "1",
  label: "Configurable research compound",
  description: null,
  variant_warning_threshold: 20,
  sku_suggestion_policy: null,
  fields: [
    {
      key: "net_mass",
      label: "Net mass",
      help_text: null,
      position: 0,
      requirement: "draft",
      metadata_target: { scope: "product", key: "net_mass" },
      kind: "measurement",
      dimension: "mass",
      allowed_display_units: ["mcg", "mg", "g"],
      allow_product_specific_iu: false,
    },
    {
      key: "metered_output",
      label: "Metered output",
      help_text: null,
      position: 1,
      requirement: "optional",
      metadata_target: { scope: "variant", key: "metered_output" },
      kind: "ratio",
      numerator_dimension: "potency",
      numerator_allowed_display_units: ["IU"],
      denominator_dimension: "count",
      denominator_allowed_display_units: ["unit"],
      denominator_count_bases: [
        { key: "actuation", label: "Actuation", position: 0, active: true },
      ],
      allow_product_specific_iu: true,
    },
  ],
  variation_axes: [
    {
      key: "inclusion",
      semantic_name: "Inclusion",
      help_text: null,
      position: 0,
      values: [
        { key: "container_only", label: "Container only", position: 0 },
        { key: "with_diluent", label: "With diluent", position: 1 },
      ],
    },
    {
      key: "net_content",
      semantic_name: "Net Content",
      help_text: null,
      position: 1,
      values: [
        {
          key: "five_mg",
          label: "5 mg",
          position: 0,
          measurement: {
            amount: "5",
            display_unit: "mg",
            material_profile_id: null,
          },
        },
      ],
    },
  ],
})

function buildRequest() {
  const matrix = generateCompoundedProductVariantMatrix({
    axes: snapshot.variation_axes,
    warningThreshold: snapshot.variant_warning_threshold,
    serverMaximum: 100,
  })

  return AdminCreateCompoundedProductDraft.parse({
    idempotency_key: "draft-request-0001",
    presentation_revision_id: "cppr_test",
    expected_configuration_fingerprint: "a".repeat(64),
    product: {
      title: "Configurable Compound",
      shipping_profile_id: "sp_test",
      configured_values: {
        net_mass: {
          amount: "5",
          displayUnit: "mg",
          dimension: "mass",
          displayPrecision: 0,
          provenance: "declared",
        },
      },
    },
    variants: matrix.rows.map((row, index) => ({
      matrix_row_key: row.key,
      sku: `COMPOUND-${index + 1}`,
      image_urls:
        index === 0 ? ["https://assets.example.test/compound-one.png"] : [],
      configured_values: {
        metered_output: {
          numerator: {
            amount: "100",
            displayUnit: "IU",
            dimension: "potency",
            displayPrecision: 0,
            provenance: "declared",
            materialProfileId: "profile-test",
            unitProfile: {
              displayUnit: "IU",
              baseUnit: "microgram",
              baseUnitsPerDisplayUnit: 1,
              displayPrecision: 0,
            },
          },
          denominator: {
            amount: "1",
            displayUnit: "unit",
            dimension: "count",
            displayPrecision: 0,
            provenance: "declared",
            countBasis: "actuation",
          },
        },
      },
    })),
  })
}

describe("compounded product draft preparation", () => {
  it("creates a native draft from configured axes and structured units", () => {
    const prepared = prepareCompoundedProductDraft({
      request: buildRequest(),
      snapshot,
      configurationFingerprint: "a".repeat(64),
      serverMaximum: 100,
    })

    expect(prepared.nativeProduct.status).toBe("draft")
    expect(prepared.nativeProduct.options).toEqual([
      {
        title: "Inclusion",
        values: ["Container only", "With diluent"],
      },
      { title: "Net Content", values: ["5 mg"] },
    ])
    expect(prepared.nativeProduct.variants).toHaveLength(2)
    expect(prepared.nativeProduct.metadata?.net_mass).toMatchObject({
      displayUnit: "mg",
      baseUnit: "microgram",
      baseUnits: 5_000,
    })
    expect(
      prepared.nativeProduct.variants?.[0]?.metadata?.metered_output,
    ).toMatchObject({
      numerator: { displayUnit: "IU", materialProfileId: "profile-test" },
      denominator: { displayUnit: "unit", countBasis: "actuation" },
    })
    expect(
      prepared.nativeProduct.variants?.[0]?.metadata?.compounded_product,
    ).toMatchObject({
      schema_version: "1",
      image_urls: ["https://assets.example.test/compound-one.png"],
    })
  })

  it("rejects a draft whose submitted rows do not match the matrix", () => {
    const request = buildRequest()
    request.variants.pop()

    expect(() =>
      prepareCompoundedProductDraft({
        request,
        snapshot,
        configurationFingerprint: "a".repeat(64),
        serverMaximum: 100,
      }),
    ).toThrow("Variant submissions must match every resulting matrix row")
  })

  it("rejects fields supplied to the wrong configured persistence scope", () => {
    const request = buildRequest()
    request.product.configured_values.metered_output =
      request.variants[0].configured_values.metered_output

    expect(() =>
      prepareCompoundedProductDraft({
        request,
        snapshot,
        configurationFingerprint: "a".repeat(64),
        serverMaximum: 100,
      }),
    ).toThrow("metered_output belongs to variant metadata")
  })

  it("rejects configuration fields that would overwrite one metadata target", () => {
    const conflictingSnapshot = structuredClone(snapshot)
    conflictingSnapshot.fields.push({
      key: "alternate_mass",
      label: "Alternate mass",
      help_text: null,
      position: 2,
      requirement: "optional",
      metadata_target: { scope: "product", key: "net_mass" },
      kind: "measurement",
      dimension: "mass",
      allowed_display_units: ["mg"],
      allow_product_specific_iu: false,
    })

    expect(() =>
      prepareCompoundedProductDraft({
        request: buildRequest(),
        snapshot: conflictingSnapshot,
        configurationFingerprint: "a".repeat(64),
        serverMaximum: 100,
      }),
    ).toThrow("Duplicate configured persistence target: product:net_mass")
  })

  it("rejects duplicate currencies within one variant", () => {
    const request = buildRequest()
    const raw = {
      ...request,
      variants: request.variants.map((variant, index) => ({
        ...variant,
        prices:
          index === 0
            ? [
                { amount: "1000", currency_code: "php" },
                { amount: "1200", currency_code: "PHP" },
              ]
            : [],
      })),
    }

    expect(() => AdminCreateCompoundedProductDraft.parse(raw)).toThrow(
      "Duplicate price currency: php",
    )
  })
})

describe("compounded product deployment policy", () => {
  it("enforces the non-bypassable matrix ceiling", () => {
    expect(() =>
      resolveCompoundedProductVariantServerMaximum({
        COMPOUNDED_PRODUCT_VARIANT_SERVER_MAXIMUM: "1001",
      }),
    ).toThrow("must be an integer from 1 through 1000")
  })
})
