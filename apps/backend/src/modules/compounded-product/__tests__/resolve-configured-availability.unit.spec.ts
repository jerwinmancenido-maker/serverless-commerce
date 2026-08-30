import type { NormalizedCompoundedProductRecipeRule } from "../recipe-rules"
import { resolveConfiguredRecipeLocationAvailability } from "../resolve-configured-availability"

const component = (inventoryItemId: string, requiredQuantity: number) => ({
  inventoryItemId,
  requiredQuantity,
  requiredDisplayAmount: String(requiredQuantity),
  displayUnit: "piece" as const,
  baseUnit: "piece" as const,
})

const rules: NormalizedCompoundedProductRecipeRule[] = [
  {
    key: "finished_50",
    label: "50 mg finished vial",
    kind: "finished_product",
    position: 0,
    match: { axis_key: "net_content", value_key: "50_mg" },
    components: [component("ghk_50", 1)],
  },
  {
    key: "vial_only",
    label: "Vial only",
    kind: "variation_value",
    position: 1,
    match: { axis_key: "inclusion", value_key: "vial_only" },
    components: [],
  },
  {
    key: "subq",
    label: "SubQ Set",
    kind: "variation_value",
    position: 2,
    match: { axis_key: "inclusion", value_key: "subq" },
    components: [component("syringe_1cc", 6)],
  },
]

describe("resolveConfiguredRecipeLocationAvailability", () => {
  it("previews each draft row while reusing the same finished-vial balance", () => {
    const result = resolveConfiguredRecipeLocationAvailability({
      rows: [
        {
          key: "vial-only-50",
          options: [
            { axisKey: "inclusion", valueKey: "vial_only" },
            { axisKey: "net_content", valueKey: "50_mg" },
          ],
        },
        {
          key: "subq-50",
          options: [
            { axisKey: "inclusion", valueKey: "subq" },
            { axisKey: "net_content", valueKey: "50_mg" },
          ],
        },
      ],
      rules,
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

    expect(result.map((variant) => variant.calculated_stock)).toEqual([10, 5])
    expect(result[0].components[0].available_quantity).toBe(10)
    expect(
      result[1].components.find(
        (component) => component.inventory_item_id === "ghk_50",
      )?.available_quantity,
    ).toBe(10)
    expect(result[1].limiting_components).toEqual([
      {
        inventory_item_id: "syringe_1cc",
        inventory_item_title: "1 cc syringe",
      },
    ])
  })
})
