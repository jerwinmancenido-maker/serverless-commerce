import {
  convertResearchDisplayAmountToBaseUnits,
  convertResearchFixedDisplayAmountToBaseUnits,
  getResearchDisplayUnitDimension,
  normalizeResearchDecimalAmount,
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
    ["g", "microgram", 1_000_000],
    ["µL", "microliter", 1],
    ["mL", "microliter", 1_000],
    ["piece", "piece", 1],
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

  it.each([
    ["1", "mg", 1_000, "microgram"],
    ["0.5", "mL", 500, "microliter"],
    ["2", "unit", 2, "piece"],
  ] as const)(
    "converts %s %s to exact integer base units",
    (amount, displayUnit, baseUnits, baseUnit) => {
      expect(
        convertResearchFixedDisplayAmountToBaseUnits({
          amount,
          displayUnit,
        }),
      ).toEqual({ baseUnit, baseUnits })
    },
  )

  it("leaves IU conversion to an explicit product-specific profile", () => {
    expect(
      convertResearchFixedDisplayAmountToBaseUnits({
        amount: "5000",
        displayUnit: "IU",
      }),
    ).toBeNull()
  })

  it("normalizes exact decimal identity without floating-point arithmetic", () => {
    expect(normalizeResearchDecimalAmount("1.000")).toBe("1")
    expect(normalizeResearchDecimalAmount("0.0500")).toBe("0.05")
  })

  it("resolves the authoritative dimension for every supported display unit", () => {
    expect(getResearchDisplayUnitDimension("mg")).toBe("mass")
    expect(getResearchDisplayUnitDimension("mL")).toBe("volume")
    expect(getResearchDisplayUnitDimension("IU")).toBe("potency")
    expect(getResearchDisplayUnitDimension("unit")).toBe("count")
  })

  it("converts IU only through an explicit product-specific unit profile", () => {
    expect(
      convertResearchDisplayAmountToBaseUnits({
        amount: "25",
        displayUnit: "IU",
        unitProfile: {
          baseUnit: "microgram",
          displayUnit: "IU",
          baseUnitsPerDisplayUnit: 2,
          displayPrecision: 0,
        },
      }),
    ).toEqual({ baseUnit: "microgram", baseUnits: 50 })

    expect(() =>
      convertResearchDisplayAmountToBaseUnits({
        amount: "25",
        displayUnit: "IU",
      }),
    ).toThrow("explicit product-specific unit profile")
  })

  it("rejects an unsupported fixed display unit at runtime", () => {
    expect(() =>
      convertResearchFixedDisplayAmountToBaseUnits({
        amount: "1",
        displayUnit: "milligram" as never,
      }),
    ).toThrow("displayUnit must be one of")
  })

  it.each([
    ["0.0001", "mg", "whole number of microgram base units"],
    [
      String(RESEARCH_MAX_BASE_UNITS + 1),
      "mcg",
      `no greater than ${RESEARCH_MAX_BASE_UNITS}`,
    ],
  ] as const)(
    "rejects non-ledger-safe fixed quantity %s %s",
    (amount, displayUnit, message) => {
      expect(() =>
        convertResearchFixedDisplayAmountToBaseUnits({
          amount,
          displayUnit,
        }),
      ).toThrow(message)
    },
  )
})
