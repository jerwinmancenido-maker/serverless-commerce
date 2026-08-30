import { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import { validateAndNormalizeCompoundedProductRecipeRules } from "../recipe-rules"

const axes = [
  {
    key: "inclusion",
    semantic_name: "Inclusion",
    help_text: null,
    position: 0,
    values: [
      {
        key: "vial_only",
        label: "Vial only",
        position: 0,
        active: true,
        measurement: null,
      },
      {
        key: "with_supplies",
        label: "With supplies",
        position: 1,
        active: true,
        measurement: null,
      },
    ],
  },
  {
    key: "net_content",
    semantic_name: "Net Content",
    help_text: null,
    position: 1,
    values: [
      {
        key: "fifty_mg",
        label: "50 mg",
        position: 0,
        active: true,
        measurement: {
          amount: "50",
          display_unit: "mg" as const,
          material_profile_id: null,
        },
      },
    ],
  },
]

const recipeRules = [
  {
    key: "finished_fifty_mg",
    label: "Finished product for 50 mg",
    kind: "finished_product" as const,
    position: 0,
    match: { axis_key: "net_content", value_key: "fifty_mg" },
    components: [
      {
        inventory_item_id: "inventory_finished",
        required_display_amount: "1",
      },
    ],
  },
  {
    key: "inclusion_vial_only",
    label: "Vial only supplies",
    kind: "variation_value" as const,
    position: 1,
    match: { axis_key: "inclusion", value_key: "vial_only" },
    components: [],
  },
  {
    key: "inclusion_with_supplies",
    label: "Included supplies",
    kind: "variation_value" as const,
    position: 2,
    match: { axis_key: "inclusion", value_key: "with_supplies" },
    components: [
      {
        inventory_item_id: "inventory_supply",
        required_display_amount: "6",
      },
    ],
  },
  {
    key: "common_packaging",
    label: "Common packaging",
    kind: "common_packaging" as const,
    position: 3,
    components: [
      {
        inventory_item_id: "inventory_packaging",
        required_display_amount: "1",
      },
    ],
  },
]

const baseSnapshot = {
  schema_version: "1" as const,
  label: "Direct product configuration",
  description: null,
  fields: [],
  variation_axes: axes,
  recipe_rules: recipeRules,
  sku_suggestion_policy: null,
  readiness_policy: {
    schema_version: "1" as const,
    require_price: true,
    require_sales_channel: true,
    require_bom_for_managed_inventory: true,
    require_valid_structured_measurements: true,
    require_governance_audit: true,
  },
  variant_warning_threshold: 100,
}

const profiles = [
  {
    inventory_item_id: "inventory_finished",
    base_unit: "piece" as const,
    display_unit: "piece",
    base_units_per_display_unit: 1,
    display_precision: 0,
    classification: "finished_product" as const,
  },
  {
    inventory_item_id: "inventory_supply",
    base_unit: "piece" as const,
    display_unit: "piece",
    base_units_per_display_unit: 1,
    display_precision: 0,
    classification: "included_supply" as const,
  },
  {
    inventory_item_id: "inventory_packaging",
    base_unit: "piece" as const,
    display_unit: "piece",
    base_units_per_display_unit: 1,
    display_precision: 0,
    classification: "packaging" as const,
  },
]

describe("compounded product recipe rules", () => {
  it("accepts finished-product, zero-supply, included-supply, and common-packaging rules", () => {
    const parsed = CompoundedProductPresentationSnapshot.parse(baseSnapshot)
    const normalized = validateAndNormalizeCompoundedProductRecipeRules({
      rules: parsed.recipe_rules,
      profiles,
    })

    expect(normalized).toHaveLength(4)
    expect(normalized[0].components[0]).toMatchObject({
      inventoryItemId: "inventory_finished",
      requiredQuantity: 1,
    })
    expect(normalized[1].components).toEqual([])
    expect(normalized[2].components[0]).toMatchObject({
      inventoryItemId: "inventory_supply",
      requiredQuantity: 6,
    })
  })

  it("rejects references to unknown variation axes or values", () => {
    const unknownAxis = CompoundedProductPresentationSnapshot.safeParse({
      ...baseSnapshot,
      recipe_rules: [
        {
          ...recipeRules[0],
          match: { axis_key: "missing_axis", value_key: "fifty_mg" },
        },
      ],
    })
    const unknownValue = CompoundedProductPresentationSnapshot.safeParse({
      ...baseSnapshot,
      recipe_rules: [
        {
          ...recipeRules[0],
          match: { axis_key: "net_content", value_key: "missing_value" },
        },
      ],
    })

    expect(unknownAxis.error?.issues[0]?.message).toContain(
      "unknown variation axis",
    )
    expect(unknownValue.error?.issues[0]?.message).toContain(
      "unknown variation value",
    )
  })

  it("rejects a component whose inventory classification does not match its rule", () => {
    const parsed = CompoundedProductPresentationSnapshot.parse(baseSnapshot)

    expect(() =>
      validateAndNormalizeCompoundedProductRecipeRules({
        rules: parsed.recipe_rules,
        profiles: profiles.map((profile) =>
          profile.inventory_item_id === "inventory_finished"
            ? { ...profile, classification: "included_supply" as const }
            : profile,
        ),
      }),
    ).toThrow("must be classified as finished_product")
  })

  it("rejects duplicate rule targets and duplicate components within a rule", () => {
    const result = CompoundedProductPresentationSnapshot.safeParse({
      ...baseSnapshot,
      recipe_rules: [
        recipeRules[0],
        {
          ...recipeRules[0],
          key: "duplicate_finished_rule",
          position: 4,
          components: [
            recipeRules[0].components[0],
            recipeRules[0].components[0],
          ],
        },
      ],
    })

    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Duplicate recipe rule target",
        "Duplicate recipe component: inventory_finished",
      ]),
    )
  })
})
