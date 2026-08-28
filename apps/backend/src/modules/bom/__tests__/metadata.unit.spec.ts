import {
  normalizeComponentProfileInput,
  type SetComponentProfileInput,
} from "../contracts/component-profile"
import {
  createRecipeSnapshotHash,
  normalizeRecipeSnapshotComponents,
} from "../contracts/recipe-audit"

const validProfile: SetComponentProfileInput = {
  inventoryItemId: "iitem_active",
  baseUnit: "microgram",
  displayUnit: "mg",
  baseUnitsPerDisplayUnit: 1_000,
  displayPrecision: 2,
  reorderThresholdBaseUnits: 50_000,
  category: "active ingredient",
  lotTrackingRequired: true,
  expiryTrackingRequired: true,
}

describe("BOM component profile contract", () => {
  it("normalizes identifiers and configurable labels", () => {
    expect(
      normalizeComponentProfileInput({
        ...validProfile,
        inventoryItemId: "  iitem_active  ",
        displayUnit: "  mg  ",
        category: "  active ingredient  ",
      }),
    ).toEqual(validProfile)
  })

  it.each([
    ["baseUnitsPerDisplayUnit", 0],
    ["baseUnitsPerDisplayUnit", 1.5],
    ["baseUnitsPerDisplayUnit", Number.MAX_SAFE_INTEGER + 1],
    ["displayPrecision", -1],
    ["displayPrecision", 1.5],
    ["reorderThresholdBaseUnits", -1],
    ["reorderThresholdBaseUnits", 1.5],
    ["reorderThresholdBaseUnits", 2_147_483_648],
  ] as const)("rejects invalid %s values", (field, value) => {
    expect(() =>
      normalizeComponentProfileInput({
        ...validProfile,
        [field]: value,
      }),
    ).toThrow(field)
  })

  it("rejects unsupported ledger units", () => {
    expect(() =>
      normalizeComponentProfileInput({
        ...validProfile,
        baseUnit: "milligram" as "microgram",
      }),
    ).toThrow("baseUnit")
  })

  it("supports product-specific IU profiles", () => {
    expect(
      normalizeComponentProfileInput({
        ...validProfile,
        baseUnit: "microliter",
        displayUnit: "IU",
        baseUnitsPerDisplayUnit: 10,
        displayPrecision: 0,
      }),
    ).toMatchObject({
      baseUnit: "microliter",
      displayUnit: "IU",
      baseUnitsPerDisplayUnit: 10,
    })
  })

  it("rejects mismatched display-unit conversions", () => {
    expect(() =>
      normalizeComponentProfileInput({
        ...validProfile,
        displayUnit: "mL",
      }),
    ).toThrow("mL requires 1000 microliter base units")
  })
})

describe("BOM recipe audit contract", () => {
  const components = [
    {
      inventoryItemId: "iitem_vial",
      requiredQuantity: 1,
      baseUnit: "piece" as const,
      displayUnit: "piece",
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
    },
    {
      inventoryItemId: "iitem_active",
      requiredQuantity: 10_000,
      baseUnit: "microgram" as const,
      displayUnit: "mg",
      baseUnitsPerDisplayUnit: 1_000,
      displayPrecision: 2,
    },
  ]

  it("sorts snapshot components into a deterministic representation", () => {
    expect(normalizeRecipeSnapshotComponents(components)).toEqual([
      components[1],
      components[0],
    ])
  })

  it("produces the same hash regardless of component input order", () => {
    expect(createRecipeSnapshotHash(components)).toBe(
      createRecipeSnapshotHash([...components].reverse()),
    )
  })

  it("changes the hash when operational quantities or unit metadata change", () => {
    const originalHash = createRecipeSnapshotHash(components)

    expect(
      createRecipeSnapshotHash([
        { ...components[0], requiredQuantity: 2 },
        components[1],
      ]),
    ).not.toBe(originalHash)
    expect(
      createRecipeSnapshotHash([
        components[0],
        { ...components[1], displayUnit: "mcg" },
      ]),
    ).not.toBe(originalHash)
  })
})
