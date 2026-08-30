import {
  buildCompoundedProductReadinessReport,
  compoundedProductRecipeIsReady,
  type CompoundedProductReadinessFacts,
} from "../product-readiness"

const facts = (): CompoundedProductReadinessFacts => ({
  registration_exists: true,
  compound_format_assigned: true,
  compound_format_active: true,
  configuration_revision_active: true,
  sales_channels_ready: true,
  structured_measurements_valid: true,
  audit_available: true,
  policy: {
    schema_version: "1",
    require_price: true,
    require_sales_channel: true,
    require_bom_for_managed_inventory: true,
    require_valid_structured_measurements: true,
    require_governance_audit: true,
  },
  variants: [
    {
      id: "variant_1",
      sku: "VARIANT-1",
      title: "1 mg",
      manage_inventory: true,
      has_price: true,
      recipe_components: [
        {
          inventory_item_id: "inventory_1",
          required_quantity: 1_000,
        },
      ],
      recipe_ready: true,
    },
  ],
})

describe("compounded product readiness report", () => {
  it("does not treat Medusa's unprofiled default inventory link as a BOM recipe", () => {
    expect(
      compoundedProductRecipeIsReady({
        manageInventory: true,
        recipeComponents: [
          { inventory_item_id: "native_default_inventory_item" },
        ],
        profiledInventoryItemIds: new Set(),
      }),
    ).toBe(false)
  })

  it("reports ready only when every configured publication invariant passes", () => {
    expect(buildCompoundedProductReadinessReport(facts())).toMatchObject({
      ready: true,
      blockers: [],
    })
  })

  it("reports the BOM blocker for a managed variant without a recipe", () => {
    const input = facts()
    input.variants[0].recipe_components = []
    input.variants[0].recipe_ready = false

    expect(buildCompoundedProductReadinessReport(input)).toMatchObject({
      ready: false,
      blockers: ["bom_recipe_missing"],
    })
  })

  it("does not require a recipe when native inventory management is disabled", () => {
    const input = facts()
    input.variants[0].manage_inventory = false
    input.variants[0].recipe_components = []
    input.variants[0].recipe_ready = true

    expect(buildCompoundedProductReadinessReport(input)).toMatchObject({
      ready: true,
      blockers: [],
    })
  })
})
