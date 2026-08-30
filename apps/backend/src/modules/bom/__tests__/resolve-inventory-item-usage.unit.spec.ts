import { resolveInventoryItemBomUsage } from "../resolve-inventory-item-usage"

describe("resolveInventoryItemBomUsage", () => {
  it("adds required quantities and the latest immutable audit version", () => {
    const result = resolveInventoryItemBomUsage({
      links: [
        {
          variant_id: "variant_subq",
          inventory_item_id: "inventory_bac",
          required_quantity: 1,
        },
      ],
      variants: [
        {
          id: "variant_subq",
          title: "SubQ Set / 50 mg",
          sku: "GHK-50-SUBQ",
          product: { id: "product_ghk", title: "GHK-CU" },
        },
      ],
      snapshots: [
        { variant_id: "variant_subq", version: 1 },
        { variant_id: "variant_subq", version: 3 },
        { variant_id: "variant_subq", version: 2 },
      ],
    })

    expect(result).toEqual([
      {
        variant_id: "variant_subq",
        variant_title: "SubQ Set / 50 mg",
        variant_sku: "GHK-50-SUBQ",
        product_id: "product_ghk",
        product_title: "GHK-CU",
        required_quantity: 1,
        recipe_status: "configured",
        latest_audit_version: 3,
      },
    ])
  })

  it("surfaces an orphaned native recipe link instead of hiding it", () => {
    const result = resolveInventoryItemBomUsage({
      links: [
        {
          variant_id: "variant_missing",
          inventory_item_id: "inventory_shared",
          required_quantity: 6,
        },
      ],
      variants: [],
      snapshots: [],
    })

    expect(result[0]).toMatchObject({
      variant_id: "variant_missing",
      product_id: null,
      required_quantity: 6,
      recipe_status: "missing_variant",
    })
  })

  it("sorts usage deterministically by product, variant, and ID", () => {
    const links = ["variant_b", "variant_c", "variant_a"].map(
      (variantId) => ({
        variant_id: variantId,
        inventory_item_id: "inventory_shared",
        required_quantity: 1,
      }),
    )
    const variants = [
      {
        id: "variant_b",
        title: "Vial Only",
        sku: null,
        product: { id: "product_b", title: "Compound B" },
      },
      {
        id: "variant_c",
        title: "SubQ Set",
        sku: null,
        product: { id: "product_a", title: "Compound A" },
      },
      {
        id: "variant_a",
        title: "Vial Only",
        sku: null,
        product: { id: "product_a", title: "Compound A" },
      },
    ]

    expect(
      resolveInventoryItemBomUsage({ links, variants, snapshots: [] }).map(
        (row) => row.variant_id,
      ),
    ).toEqual(["variant_c", "variant_a", "variant_b"])
  })
})
