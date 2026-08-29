import {
  normalizeCompoundedProductStructuredMeasurement,
  normalizeCompoundedProductStructuredRatio,
} from "../structured-measurement"

describe("compounded product structured measurements", () => {
  it("normalizes fixed mass and volume measurements to exact ledger units", () => {
    expect(
      normalizeCompoundedProductStructuredMeasurement({
        amount: "1.000",
        displayUnit: "mg",
        dimension: "mass",
        displayPrecision: 3,
        provenance: "declared",
        materialProfileId: "reference-profile-01",
      }),
    ).toMatchObject({
      amount: "1",
      displayUnit: "mg",
      dimension: "mass",
      baseUnit: "microgram",
      baseUnits: 1_000,
      baseUnitsPerDisplayUnit: 1_000,
      materialProfileId: "reference-profile-01",
    })

    expect(
      normalizeCompoundedProductStructuredMeasurement({
        amount: "0.5",
        displayUnit: "mL",
        dimension: "volume",
        displayPrecision: 1,
        provenance: "calculated",
      }),
    ).toMatchObject({
      baseUnit: "microliter",
      baseUnits: 500,
    })
  })

  it("keeps product-specific IU conversion explicit and referenced", () => {
    expect(
      normalizeCompoundedProductStructuredMeasurement({
        amount: "5000",
        displayUnit: "IU",
        dimension: "potency",
        displayPrecision: 0,
        provenance: "declared",
        materialProfileId: "material-profile-01",
        sourceDocumentId: "coa-01",
        unitProfile: {
          baseUnit: "microgram",
          displayUnit: "IU",
          baseUnitsPerDisplayUnit: 2,
          displayPrecision: 0,
        },
      }),
    ).toMatchObject({
      baseUnit: "microgram",
      baseUnits: 10_000,
      materialProfileId: "material-profile-01",
      sourceDocumentId: "coa-01",
    })
  })

  it("preserves configurable count bases without treating them as units", () => {
    expect(
      normalizeCompoundedProductStructuredMeasurement({
        amount: "100",
        displayUnit: "unit",
        dimension: "count",
        displayPrecision: 0,
        provenance: "declared",
        countBasis: "actuation",
      }),
    ).toMatchObject({
      baseUnit: "piece",
      baseUnits: 100,
      countBasis: "actuation",
    })
  })

  it("keeps ratio numerator and denominator structurally distinct", () => {
    const ratio = normalizeCompoundedProductStructuredRatio({
      numerator: {
        amount: "100",
        displayUnit: "mcg",
        dimension: "mass",
        displayPrecision: 0,
        provenance: "declared",
      },
      denominator: {
        amount: "1",
        displayUnit: "unit",
        dimension: "count",
        displayPrecision: 0,
        provenance: "declared",
        countBasis: "actuation",
      },
    })

    expect(ratio.numerator).toMatchObject({
      baseUnit: "microgram",
      baseUnits: 100,
    })
    expect(ratio.denominator).toMatchObject({
      baseUnit: "piece",
      baseUnits: 1,
      countBasis: "actuation",
    })
  })

  it.each([
    [
      "cross-dimension units",
      {
        amount: "1",
        displayUnit: "mL" as const,
        dimension: "mass" as const,
        displayPrecision: 0,
        provenance: "declared" as const,
      },
      "not compatible with the mass dimension",
    ],
    [
      "IU without profile identity",
      {
        amount: "5000",
        displayUnit: "IU" as const,
        dimension: "potency" as const,
        displayPrecision: 0,
        provenance: "declared" as const,
        unitProfile: {
          baseUnit: "microgram" as const,
          displayUnit: "IU" as const,
          baseUnitsPerDisplayUnit: 1,
          displayPrecision: 0,
        },
      },
      "material profile reference",
    ],
    [
      "precision loss",
      {
        amount: "0.5",
        displayUnit: "mg" as const,
        dimension: "mass" as const,
        displayPrecision: 0,
        provenance: "declared" as const,
      },
      "exceeds the configured display precision",
    ],
  ])("rejects %s", (_label, input, message) => {
    expect(() =>
      normalizeCompoundedProductStructuredMeasurement(input),
    ).toThrow(message)
  })
})
