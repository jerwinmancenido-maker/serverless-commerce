import { AdminPreviewConfiguredRecipeAvailability } from "../contracts/product-creation"

const rowKey = "a".repeat(64)

const validRequest = {
  location_id: "sloc_shared",
  matrix_rows: [
    {
      key: rowKey,
      options: [
        { axis_key: "inclusion", value_key: "vial_only" },
        { axis_key: "net_content", value_key: "fifty_mg" },
      ],
    },
  ],
  recipe_rules: [
    {
      key: "finished_50",
      label: "50 mg finished vial",
      kind: "finished_product" as const,
      position: 0,
      match: { axis_key: "net_content", value_key: "fifty_mg" },
      components: [
        {
          inventory_item_id: "ghk_50",
          required_display_amount: "1",
        },
      ],
    },
  ],
}

describe("AdminPreviewConfiguredRecipeAvailability", () => {
  it("accepts a location-scoped draft recipe preview", () => {
    expect(AdminPreviewConfiguredRecipeAvailability.parse(validRequest)).toEqual(
      validRequest,
    )
  })

  it("rejects duplicate matrix rows", () => {
    expect(() =>
      AdminPreviewConfiguredRecipeAvailability.parse({
        ...validRequest,
        matrix_rows: [validRequest.matrix_rows[0], validRequest.matrix_rows[0]],
      }),
    ).toThrow()
  })

  it("rejects fields outside the preview contract", () => {
    expect(() =>
      AdminPreviewConfiguredRecipeAvailability.parse({
        ...validRequest,
        mutate_inventory: true,
      }),
    ).toThrow()
  })
})
