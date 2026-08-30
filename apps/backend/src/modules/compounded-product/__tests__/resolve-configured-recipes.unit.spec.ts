import { MedusaError } from "@medusajs/framework/utils"

import type { NormalizedCompoundedProductRecipeRule } from "../recipe-rules"
import { resolveConfiguredCompoundedProductRecipes } from "../resolve-configured-recipes"
import type { CompoundedProductVariantMatrix } from "../variant-matrix"

const component = (inventoryItemId: string, requiredQuantity: number) => ({
  inventoryItemId,
  requiredQuantity,
  requiredDisplayAmount: String(requiredQuantity),
  displayUnit: "piece" as const,
  baseUnit: "piece" as const,
})

const matrix: CompoundedProductVariantMatrix = {
  fingerprint: "matrix",
  totalCombinationCount: 4,
  excludedCombinationCount: 0,
  resultingVariantCount: 4,
  warningThreshold: 100,
  requiresConfirmation: false,
  confirmationSatisfied: true,
  rows: [
    {
      key: "vial-only-50",
      title: "Vial Only / 50 mg",
      options: [
        {
          axisKey: "inclusion",
          semanticName: "Inclusion",
          axisPosition: 0,
          valueKey: "vial_only",
          valueLabel: "Vial Only",
          valuePosition: 0,
          measurement: null,
        },
        {
          axisKey: "net_content",
          semanticName: "Net Content",
          axisPosition: 1,
          valueKey: "50_mg",
          valueLabel: "50 mg",
          valuePosition: 0,
          measurement: null,
        },
      ],
    },
    {
      key: "vial-bac-50",
      title: "Vial + BAC / 50 mg",
      options: [
        {
          axisKey: "inclusion",
          semanticName: "Inclusion",
          axisPosition: 0,
          valueKey: "vial_bac",
          valueLabel: "Vial + BAC",
          valuePosition: 1,
          measurement: null,
        },
        {
          axisKey: "net_content",
          semanticName: "Net Content",
          axisPosition: 1,
          valueKey: "50_mg",
          valueLabel: "50 mg",
          valuePosition: 0,
          measurement: null,
        },
      ],
    },
    {
      key: "vial-only-100",
      title: "Vial Only / 100 mg",
      options: [
        {
          axisKey: "inclusion",
          semanticName: "Inclusion",
          axisPosition: 0,
          valueKey: "vial_only",
          valueLabel: "Vial Only",
          valuePosition: 0,
          measurement: null,
        },
        {
          axisKey: "net_content",
          semanticName: "Net Content",
          axisPosition: 1,
          valueKey: "100_mg",
          valueLabel: "100 mg",
          valuePosition: 1,
          measurement: null,
        },
      ],
    },
    {
      key: "vial-bac-100",
      title: "Vial + BAC / 100 mg",
      options: [
        {
          axisKey: "inclusion",
          semanticName: "Inclusion",
          axisPosition: 0,
          valueKey: "vial_bac",
          valueLabel: "Vial + BAC",
          valuePosition: 1,
          measurement: null,
        },
        {
          axisKey: "net_content",
          semanticName: "Net Content",
          axisPosition: 1,
          valueKey: "100_mg",
          valueLabel: "100 mg",
          valuePosition: 1,
          measurement: null,
        },
      ],
    },
  ],
}

const rules: NormalizedCompoundedProductRecipeRule[] = [
  {
    key: "finished_50",
    label: "50 mg finished vial",
    kind: "finished_product",
    position: 0,
    match: { axis_key: "net_content", value_key: "50_mg" },
    components: [component("inventory-ghk-50", 1)],
  },
  {
    key: "finished_100",
    label: "100 mg finished vial",
    kind: "finished_product",
    position: 1,
    match: { axis_key: "net_content", value_key: "100_mg" },
    components: [component("inventory-ghk-100", 1)],
  },
  {
    key: "vial_only",
    label: "Vial only",
    kind: "variation_value",
    position: 2,
    match: { axis_key: "inclusion", value_key: "vial_only" },
    components: [],
  },
  {
    key: "vial_bac",
    label: "Vial plus BAC",
    kind: "variation_value",
    position: 3,
    match: { axis_key: "inclusion", value_key: "vial_bac" },
    components: [component("inventory-bac-10ml", 1)],
  },
  {
    key: "packaging",
    label: "Common packaging",
    kind: "common_packaging",
    position: 4,
    components: [component("inventory-mailer", 1)],
  },
]

describe("resolveConfiguredCompoundedProductRecipes", () => {
  it("reuses each finished item across inclusion choices and adds selected supplies", () => {
    expect(
      resolveConfiguredCompoundedProductRecipes({ matrix, rules }),
    ).toEqual([
      {
        matrixRowKey: "vial-only-50",
        components: [
          { inventoryItemId: "inventory-ghk-50", requiredQuantity: 1 },
          { inventoryItemId: "inventory-mailer", requiredQuantity: 1 },
        ],
      },
      {
        matrixRowKey: "vial-bac-50",
        components: [
          { inventoryItemId: "inventory-bac-10ml", requiredQuantity: 1 },
          { inventoryItemId: "inventory-ghk-50", requiredQuantity: 1 },
          { inventoryItemId: "inventory-mailer", requiredQuantity: 1 },
        ],
      },
      {
        matrixRowKey: "vial-only-100",
        components: [
          { inventoryItemId: "inventory-ghk-100", requiredQuantity: 1 },
          { inventoryItemId: "inventory-mailer", requiredQuantity: 1 },
        ],
      },
      {
        matrixRowKey: "vial-bac-100",
        components: [
          { inventoryItemId: "inventory-bac-10ml", requiredQuantity: 1 },
          { inventoryItemId: "inventory-ghk-100", requiredQuantity: 1 },
          { inventoryItemId: "inventory-mailer", requiredQuantity: 1 },
        ],
      },
    ])
  })

  it("merges duplicate inventory items contributed by multiple rules", () => {
    const duplicatePackaging = [
      ...rules,
      {
        key: "more_packaging",
        label: "More common packaging",
        kind: "common_packaging" as const,
        position: 5,
        components: [component("inventory-mailer", 2)],
      },
    ]

    const resolved = resolveConfiguredCompoundedProductRecipes({
      matrix,
      rules: duplicatePackaging,
    })

    expect(resolved[0].components).toContainEqual({
      inventoryItemId: "inventory-mailer",
      requiredQuantity: 3,
    })
  })

  it("rejects a row without exactly one finished product rule", () => {
    expect(() =>
      resolveConfiguredCompoundedProductRecipes({
        matrix,
        rules: rules.filter((rule) => rule.key !== "finished_100"),
      }),
    ).toThrow(MedusaError)
  })

  it("returns no recipes when configuration has no rules", () => {
    expect(
      resolveConfiguredCompoundedProductRecipes({ matrix, rules: [] }),
    ).toEqual([])
  })
})
