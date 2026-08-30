import { resolveBuildableProductRows } from "../resolve-buildable-products"

describe("resolveBuildableProductRows", () => {
  it("distinguishes an incomplete recipe from valid zero stock", () => {
    const rows = resolveBuildableProductRows({
      variants: [
        { id: "variant_missing", title: "Missing", sku: null },
        { id: "variant_zero", title: "Zero", sku: "ZERO" },
      ],
      availability: [
        {
          variant_id: "variant_missing",
          status: "missing_recipe",
          calculated_stock: null,
          limiting_components: [],
          components: [],
        },
        {
          variant_id: "variant_zero",
          status: "calculated",
          calculated_stock: 0,
          limiting_components: [
            {
              inventory_item_id: "item_bac",
              inventory_item_title: "BAC water",
            },
          ],
          components: [],
        },
      ],
    })

    expect(rows[0]).toMatchObject({
      recipe_status: "missing_recipe",
      calculated_stock: null,
    })
    expect(rows[1]).toMatchObject({
      recipe_status: "configured",
      calculated_stock: 0,
    })
  })

  it("preserves product identity and sorts tied limiting items", () => {
    const [row] = resolveBuildableProductRows({
      variants: [
        {
          id: "variant_1",
          title: "Set",
          sku: "SET-1",
          product: { id: "product_1", title: "Research set" },
        },
      ],
      availability: [
        {
          variant_id: "variant_1",
          status: "calculated",
          calculated_stock: 8,
          limiting_components: [
            { inventory_item_id: "item_z", inventory_item_title: "Z item" },
            { inventory_item_id: "item_a", inventory_item_title: "A item" },
          ],
          components: [],
        },
      ],
    })

    expect(row).toMatchObject({
      product_id: "product_1",
      product_title: "Research set",
      variant_id: "variant_1",
      sku: "SET-1",
      recipe_status: "configured",
      calculated_stock: 8,
    })
    expect(row.limiting_items.map((item) => item.inventory_item_id)).toEqual([
      "item_a",
      "item_z",
    ])
  })
})
