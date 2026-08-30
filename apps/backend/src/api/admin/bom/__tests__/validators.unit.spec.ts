import {
  AdminGetBomAvailability,
  AdminSetComponentProfile,
} from "../validators"

const validProfile = {
  inventory_item_id: "iitem_active",
  base_unit: "microgram",
  display_unit: "mg",
  base_units_per_display_unit: 1_000,
  display_precision: 2,
  reorder_threshold_base_units: 50_000,
  classification: "finished_product",
  supplier_unit: "box",
  inventory_units_per_supplier_unit: 100,
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
    ["unknown classification", { classification: "compound" }],
    ["unknown supplier unit", { supplier_unit: "case" }],
    ["zero receiving conversion", { inventory_units_per_supplier_unit: 0 }],
    [
      "fractional receiving conversion",
      { inventory_units_per_supplier_unit: 1.5 },
    ],
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

  it("accepts a location-scoped availability request", () => {
    expect(
      AdminGetBomAvailability.parse({
        variant_ids: "variant_vial_50,variant_subq_50",
        location_id: "sloc_shared",
      }),
    ).toEqual({
      variant_ids: "variant_vial_50,variant_subq_50",
      location_id: "sloc_shared",
    })
  })

  it.each([
    [{ variant_ids: "", location_id: "sloc_shared" }],
    [{ variant_ids: "variant_vial_50", location_id: "" }],
    [
      {
        variant_ids: "variant_vial_50",
        location_id: "sloc_shared",
        inventory_quantity: 10,
      },
    ],
  ])("rejects an invalid availability request", (input) => {
    expect(() => AdminGetBomAvailability.parse(input)).toThrow()
  })
})
