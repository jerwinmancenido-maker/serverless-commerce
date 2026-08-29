import {
  AdminCreateCompoundedProductPresentation,
  AdminCreateCompoundedProductPresentationRevision,
  CompoundedProductPresentationSnapshot,
} from "../contracts/configuration"
import { RESEARCH_MAX_BASE_UNITS } from "../../../lib/research-quantity"

const validSnapshot = {
  schema_version: "1" as const,
  label: "Configurable presentation",
  description: null,
  fields: [
    {
      key: "net_content",
      label: "Net content",
      help_text: null,
      position: 0,
      requirement: "publication" as const,
      metadata_target: {
        scope: "variant" as const,
        key: "net_content",
      },
      kind: "measurement" as const,
      dimension: "mass" as const,
      allowed_display_units: ["mcg", "mg", "g"] as const,
      allow_product_specific_iu: false,
    },
  ],
  variation_axes: [
    {
      key: "package",
      semantic_name: "Package",
      help_text: null,
      position: 0,
      values: [
        {
          key: "primary_only",
          label: "Primary container only",
          position: 0,
          active: true,
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
          key: "one_milligram",
          label: "1 mg",
          position: 0,
          active: true,
          measurement: {
            amount: "1",
            display_unit: "mg" as const,
            material_profile_id: null,
          },
        },
      ],
    },
    {
      key: "container",
      semantic_name: "Container",
      help_text: null,
      position: 2,
      values: [
        {
          key: "standard",
          label: "Standard",
          position: 0,
          active: true,
          measurement: null,
        },
      ],
    },
  ],
  sku_suggestion_policy: null,
  variant_warning_threshold: 100,
}

describe("compounded product configuration API contract", () => {
  it("accepts a future presentation with three configurable variation axes", () => {
    const result = AdminCreateCompoundedProductPresentation.parse({
      key: "future_presentation",
      snapshot: validSnapshot,
    })

    expect(result.key).toBe("future_presentation")
    expect(result.snapshot.variation_axes).toHaveLength(3)
  })

  it("rejects duplicate field, axis, and value identities or positions", () => {
    const result = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      fields: [validSnapshot.fields[0], { ...validSnapshot.fields[0] }],
      variation_axes: [
        validSnapshot.variation_axes[0],
        {
          ...validSnapshot.variation_axes[0],
          values: [
            validSnapshot.variation_axes[0].values[0],
            { ...validSnapshot.variation_axes[0].values[0] },
          ],
        },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Duplicate key: net_content",
        "Duplicate position: 0",
        "Duplicate key: package",
        "Duplicate key: primary_only",
      ]),
    )
  })

  it("rejects duplicate semantic names, display values, and normalized measurements", () => {
    const duplicateSemantics = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      variation_axes: [
        validSnapshot.variation_axes[0],
        {
          ...validSnapshot.variation_axes[1],
          semantic_name: " package ",
        },
      ],
    })
    const duplicateDisplayValues =
      CompoundedProductPresentationSnapshot.safeParse({
        ...validSnapshot,
        variation_axes: [
          {
            ...validSnapshot.variation_axes[0],
            values: [
              validSnapshot.variation_axes[0].values[0],
              {
                ...validSnapshot.variation_axes[0].values[0],
                key: "another_package",
                label: " primary container only ",
                position: 1,
              },
            ],
          },
        ],
      })
    const equivalentMeasurements =
      CompoundedProductPresentationSnapshot.safeParse({
        ...validSnapshot,
        variation_axes: [
          {
            ...validSnapshot.variation_axes[1],
            values: [
              validSnapshot.variation_axes[1].values[0],
              {
                ...validSnapshot.variation_axes[1].values[0],
                key: "one_thousand_micrograms",
                label: "1,000 mcg",
                position: 1,
                measurement: {
                  amount: "1000",
                  display_unit: "mcg" as const,
                  material_profile_id: null,
                },
              },
            ],
          },
        ],
      })

    expect(duplicateSemantics.success).toBe(false)
    expect(duplicateDisplayValues.success).toBe(false)
    expect(equivalentMeasurements.success).toBe(false)
    expect(
      equivalentMeasurements.error?.issues.map((issue) => issue.message),
    ).toContain("Duplicate normalized measurement value")
  })

  it("rejects duplicate configured single-select values", () => {
    const result = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      fields: [
        {
          key: "physical_form",
          label: "Physical form",
          help_text: null,
          position: 0,
          requirement: "draft" as const,
          metadata_target: null,
          kind: "single_select" as const,
          values: [
            {
              key: "powder",
              label: "Powder",
              position: 0,
              active: true,
            },
            {
              key: "lyophilized_powder",
              label: " powder ",
              position: 1,
              active: true,
            },
          ],
        },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "Duplicate display value: powder",
    )
  })

  it("keeps measurement dimensions separate and requires an IU profile", () => {
    const incompatible = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      fields: [
        {
          ...validSnapshot.fields[0],
          allowed_display_units: ["mL"],
        },
      ],
    })
    const missingIuProfile = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      fields: [
        {
          ...validSnapshot.fields[0],
          dimension: "potency",
          allowed_display_units: ["IU"],
          allow_product_specific_iu: false,
        },
      ],
    })

    expect(incompatible.success).toBe(false)
    expect(incompatible.error?.issues[0]?.message).toContain(
      "not compatible with the mass dimension",
    )
    expect(missingIuProfile.success).toBe(false)
    expect(missingIuProfile.error?.issues[0]?.message).toContain(
      "product-specific material profile",
    )
  })

  it("requires positive normalized quantities and a profile on IU values", () => {
    for (const amount of ["0", "-5", "NaN", "1e3"]) {
      const result = CompoundedProductPresentationSnapshot.safeParse({
        ...validSnapshot,
        variation_axes: [
          {
            ...validSnapshot.variation_axes[1],
            values: [
              {
                ...validSnapshot.variation_axes[1].values[0],
                measurement: {
                  amount,
                  display_unit: "mg" as const,
                  material_profile_id: null,
                },
              },
            ],
          },
        ],
      })

      expect(result.success).toBe(false)
    }

    const missingProfile = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      variation_axes: [
        {
          ...validSnapshot.variation_axes[1],
          values: [
            {
              ...validSnapshot.variation_axes[1].values[0],
              measurement: {
                amount: "5000",
                display_unit: "IU" as const,
                material_profile_id: null,
              },
            },
          ],
        },
      ],
    })

    expect(missingProfile.success).toBe(false)
    expect(
      missingProfile.error?.issues.map((issue) => issue.message),
    ).toContain("IU requires an explicit product-specific material profile")
  })

  it.each([
    ["0.0001", "mg"],
    [String(RESEARCH_MAX_BASE_UNITS + 1), "mcg"],
  ] as const)(
    "rejects non-ledger-safe fixed quantity %s %s",
    (amount, displayUnit) => {
      const result = CompoundedProductPresentationSnapshot.safeParse({
        ...validSnapshot,
        variation_axes: [
          {
            ...validSnapshot.variation_axes[1],
            values: [
              {
                ...validSnapshot.variation_axes[1].values[0],
                measurement: {
                  amount,
                  display_unit: displayUnit,
                  material_profile_id: null,
                },
              },
            ],
          },
        ],
      })

      expect(result.success).toBe(false)
    },
  )

  it("supports configurable count bases such as nasal actuations", () => {
    const result = CompoundedProductPresentationSnapshot.parse({
      ...validSnapshot,
      fields: [
        {
          key: "active_per_actuation",
          label: "Active content per actuation",
          help_text: null,
          position: 0,
          requirement: "publication" as const,
          metadata_target: null,
          kind: "ratio" as const,
          numerator_dimension: "mass" as const,
          numerator_allowed_display_units: ["mcg" as const],
          denominator_dimension: "count" as const,
          denominator_allowed_display_units: ["unit" as const],
          denominator_count_bases: [
            {
              key: "actuation",
              label: "Actuation",
              position: 0,
              active: true,
            },
          ],
          allow_product_specific_iu: false,
        },
      ],
    })

    expect(result.fields[0]).toMatchObject({
      kind: "ratio",
      denominator_count_bases: [
        {
          key: "actuation",
          label: "Actuation",
        },
      ],
    })
  })

  it("rejects count bases on a non-count ratio denominator", () => {
    const result = CompoundedProductPresentationSnapshot.safeParse({
      ...validSnapshot,
      fields: [
        {
          key: "mass_ratio",
          label: "Mass ratio",
          help_text: null,
          position: 0,
          requirement: "publication" as const,
          metadata_target: null,
          kind: "ratio" as const,
          numerator_dimension: "mass" as const,
          numerator_allowed_display_units: ["mg" as const],
          denominator_dimension: "mass" as const,
          denominator_allowed_display_units: ["mg" as const],
          denominator_count_bases: [
            {
              key: "actuation",
              label: "Actuation",
              position: 0,
              active: true,
            },
          ],
          allow_product_specific_iu: false,
        },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "Denominator count bases require the count measurement dimension",
    )
  })

  it("requires optimistic revision identity and an explicit reason", () => {
    expect(() =>
      AdminCreateCompoundedProductPresentationRevision.parse({
        expected_current_revision_id: null,
        snapshot: validSnapshot,
        reason: "Add a new configurable field",
      }),
    ).toThrow()

    expect(() =>
      AdminCreateCompoundedProductPresentationRevision.parse({
        expected_current_revision_id: "revision_01",
        snapshot: validSnapshot,
        reason: "Add a new configurable field",
      }),
    ).not.toThrow()

    expect(() =>
      AdminCreateCompoundedProductPresentationRevision.parse({
        expected_current_revision_id: "revision_01",
        snapshot: validSnapshot,
        reason: "",
      }),
    ).toThrow()
  })
})
