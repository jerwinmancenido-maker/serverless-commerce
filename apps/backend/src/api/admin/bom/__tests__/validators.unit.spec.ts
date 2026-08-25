import { AdminSetComponentProfile } from "../validators"

const validProfile = {
  inventory_item_id: "iitem_active",
  base_unit: "microgram",
  display_unit: "mg",
  base_units_per_display_unit: 1_000,
  display_precision: 2,
  reorder_threshold_base_units: 50_000,
  category: "active ingredient",
  lot_tracking_required: true,
  expiry_tracking_required: true,
}

describe("Admin BOM API validation", () => {
  it("accepts a complete component profile", () => {
    expect(AdminSetComponentProfile.parse(validProfile)).toEqual(validProfile)
  })

  it.each([
    ["fractional conversion", { base_units_per_display_unit: 1.5 }],
    ["negative threshold", { reorder_threshold_base_units: -1 }],
    ["empty category", { category: "   " }],
    ["unknown base unit", { base_unit: "milligram" }],
  ])("rejects %s", (_label, invalidValues) => {
    expect(() =>
      AdminSetComponentProfile.parse({
        ...validProfile,
        ...invalidValues,
      }),
    ).toThrow()
  })

  it("rejects fields outside the public contract", () => {
    expect(() =>
      AdminSetComponentProfile.parse({
        ...validProfile,
        inventory_quantity: 1_000,
      }),
    ).toThrow()
  })
})
