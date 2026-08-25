import {
  normalizeResearchQuantity,
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
})
