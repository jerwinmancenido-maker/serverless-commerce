import {
  normalizeResearchQuantity,
  normalizeResearchUnitProfile,
  RESEARCH_MAX_BASE_UNITS,
} from "../research-quantity"

describe("research quantity contract", () => {
  it("accepts a positive integer quantity in a supported base unit", () => {
    expect(
      normalizeResearchQuantity({
        baseUnits: 10_000,
        baseUnit: "microgram",
      }),
    ).toEqual({
      baseUnits: 10_000,
      baseUnit: "microgram",
    })
  })

  it.each([0, -1, 1.5, RESEARCH_MAX_BASE_UNITS + 1])(
    "rejects invalid base-unit quantity %s",
    (baseUnits) => {
      expect(() =>
        normalizeResearchQuantity({
          baseUnits,
          baseUnit: "piece",
        }),
      ).toThrow(
        `baseUnits must be a positive integer no greater than ${RESEARCH_MAX_BASE_UNITS}`,
      )
    },
  )

  it("rejects an unsupported unit at runtime", () => {
    expect(() =>
      normalizeResearchQuantity({
        baseUnits: 1,
        baseUnit: "milligram" as never,
      }),
    ).toThrow("baseUnit must be microgram, microliter, or piece")
  })

  it.each([
    ["mcg", "microgram", 1],
    ["mg", "microgram", 1_000],
    ["mL", "microliter", 1_000],
    ["unit", "piece", 1],
  ] as const)(
    "accepts the fixed %s conversion",
    (displayUnit, baseUnit, baseUnitsPerDisplayUnit) => {
      expect(
        normalizeResearchUnitProfile({
          baseUnit,
          displayUnit,
          baseUnitsPerDisplayUnit,
          displayPrecision: 2,
        }),
      ).toEqual({
        baseUnit,
        displayUnit,
        baseUnitsPerDisplayUnit,
        displayPrecision: 2,
      })
    },
  )

  it("requires an explicit product-specific conversion for IU", () => {
    expect(
      normalizeResearchUnitProfile({
        baseUnit: "microliter",
        displayUnit: "IU",
        baseUnitsPerDisplayUnit: 10,
        displayPrecision: 0,
      }),
    ).toEqual({
      baseUnit: "microliter",
      displayUnit: "IU",
      baseUnitsPerDisplayUnit: 10,
      displayPrecision: 0,
    })

    expect(() =>
      normalizeResearchUnitProfile({
        baseUnit: "piece",
        displayUnit: "IU",
        baseUnitsPerDisplayUnit: 1,
        displayPrecision: 0,
      }),
    ).toThrow("product-specific microgram or microliter conversion")
  })

  it("rejects mismatched fixed conversions", () => {
    expect(() =>
      normalizeResearchUnitProfile({
        baseUnit: "microgram",
        displayUnit: "mg",
        baseUnitsPerDisplayUnit: 1,
        displayPrecision: 2,
      }),
    ).toThrow("mg requires 1000 microgram base units")
  })
})
