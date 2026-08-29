import { normalizeCompoundedProductRecipe } from "../bom-recipe"

describe("compounded product BOM recipe normalization", () => {
  it("converts configured display quantities into authoritative ledger units", () => {
    expect(
      normalizeCompoundedProductRecipe({
        request: {
          components: [
            {
              inventory_item_id: "inventory_active",
              required_display_amount: "1.5",
            },
            {
              inventory_item_id: "inventory_container",
              required_display_amount: "1",
            },
          ],
          note: null,
        },
        profiles: [
          {
            inventory_item_id: "inventory_container",
            base_unit: "piece",
            display_unit: "piece",
            base_units_per_display_unit: 1,
            display_precision: 0,
          },
          {
            inventory_item_id: "inventory_active",
            base_unit: "microgram",
            display_unit: "mg",
            base_units_per_display_unit: 1_000,
            display_precision: 3,
          },
        ],
      }),
    ).toEqual([
      {
        inventoryItemId: "inventory_active",
        requiredQuantity: 1_500,
        requiredDisplayAmount: "1.5",
        displayUnit: "mg",
        baseUnit: "microgram",
      },
      {
        inventoryItemId: "inventory_container",
        requiredQuantity: 1,
        requiredDisplayAmount: "1",
        displayUnit: "piece",
        baseUnit: "piece",
      },
    ])
  })

  it("requires an explicit configured component profile", () => {
    expect(() =>
      normalizeCompoundedProductRecipe({
        request: {
          components: [
            {
              inventory_item_id: "inventory_missing",
              required_display_amount: "1",
            },
          ],
          note: null,
        },
        profiles: [],
      }),
    ).toThrow("Component profile was not found")
  })

  it("uses a product-specific IU conversion instead of a universal factor", () => {
    expect(
      normalizeCompoundedProductRecipe({
        request: {
          components: [
            {
              inventory_item_id: "inventory_iu",
              required_display_amount: "250",
            },
          ],
          note: null,
        },
        profiles: [
          {
            inventory_item_id: "inventory_iu",
            base_unit: "microgram",
            display_unit: "IU",
            base_units_per_display_unit: 2,
            display_precision: 0,
          },
        ],
      })[0],
    ).toMatchObject({
      requiredQuantity: 500,
      displayUnit: "IU",
      baseUnit: "microgram",
    })
  })
})
