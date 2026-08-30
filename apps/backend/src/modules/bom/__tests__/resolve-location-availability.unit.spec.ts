import { MedusaError } from "@medusajs/framework/utils"

import { resolveVariantLocationAvailability } from "../resolve-location-availability"

describe("resolveVariantLocationAvailability", () => {
  it("calculates stocked minus reserved and identifies the limiting component", () => {
    expect(
      resolveVariantLocationAvailability({
        variantIds: ["variant_subq_50"],
        recipeLinks: [
          {
            variantId: "variant_subq_50",
            inventoryItemId: "ghk_50",
            requiredQuantity: 1,
          },
          {
            variantId: "variant_subq_50",
            inventoryItemId: "bac_10ml",
            requiredQuantity: 1,
          },
          {
            variantId: "variant_subq_50",
            inventoryItemId: "alcohol_pad",
            requiredQuantity: 10,
          },
        ],
        locationLevels: [
          {
            inventoryItemId: "ghk_50",
            inventoryItemTitle: "GHK-CU 50 mg vial",
            stockedQuantity: 20,
            reservedQuantity: 2,
          },
          {
            inventoryItemId: "bac_10ml",
            inventoryItemTitle: "BAC Water 10 mL",
            stockedQuantity: 8,
            reservedQuantity: 0,
          },
          {
            inventoryItemId: "alcohol_pad",
            inventoryItemTitle: "Alcohol pad",
            stockedQuantity: 100,
            reservedQuantity: 10,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        variant_id: "variant_subq_50",
        status: "calculated",
        calculated_stock: 8,
        limiting_components: [
          {
            inventory_item_id: "bac_10ml",
            inventory_item_title: "BAC Water 10 mL",
          },
        ],
      }),
    ])
  })

  it("reuses one finished-item balance without summing sibling variants", () => {
    const result = resolveVariantLocationAvailability({
      variantIds: ["vial_only_50", "subq_50"],
      recipeLinks: [
        {
          variantId: "vial_only_50",
          inventoryItemId: "ghk_50",
          requiredQuantity: 1,
        },
        {
          variantId: "subq_50",
          inventoryItemId: "ghk_50",
          requiredQuantity: 1,
        },
        {
          variantId: "subq_50",
          inventoryItemId: "syringe_1cc",
          requiredQuantity: 6,
        },
      ],
      locationLevels: [
        {
          inventoryItemId: "ghk_50",
          inventoryItemTitle: "GHK-CU 50 mg vial",
          stockedQuantity: 12,
          reservedQuantity: 2,
        },
        {
          inventoryItemId: "syringe_1cc",
          inventoryItemTitle: "1 cc syringe",
          stockedQuantity: 30,
          reservedQuantity: 0,
        },
      ],
    })

    expect(result.map((item) => item.calculated_stock)).toEqual([10, 5])
    expect(result[0].components[0].available_quantity).toBe(10)
    expect(result[1].components[0].available_quantity).toBe(10)
  })

  it("uses zero capacity when an item has no level at the selected location", () => {
    const [result] = resolveVariantLocationAvailability({
      variantIds: ["variant"],
      recipeLinks: [
        {
          variantId: "variant",
          inventoryItemId: "missing_at_location",
          requiredQuantity: 1,
        },
      ],
      locationLevels: [],
    })

    expect(result.calculated_stock).toBe(0)
    expect(result.limiting_components[0].inventory_item_id).toBe(
      "missing_at_location",
    )
  })

  it("distinguishes a missing recipe from a recipe with zero stock", () => {
    expect(
      resolveVariantLocationAvailability({
        variantIds: ["variant"],
        recipeLinks: [],
        locationLevels: [],
      }),
    ).toEqual([
      {
        variant_id: "variant",
        status: "missing_recipe",
        calculated_stock: null,
        limiting_components: [],
        components: [],
      },
    ])
  })

  it("rejects invalid location quantities", () => {
    expect(() =>
      resolveVariantLocationAvailability({
        variantIds: ["variant"],
        recipeLinks: [],
        locationLevels: [
          {
            inventoryItemId: "item",
            inventoryItemTitle: "Item",
            stockedQuantity: -1,
            reservedQuantity: 0,
          },
        ],
      }),
    ).toThrow(MedusaError)
  })
})
