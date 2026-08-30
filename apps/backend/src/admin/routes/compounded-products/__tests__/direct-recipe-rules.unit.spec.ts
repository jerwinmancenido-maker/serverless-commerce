import {
  buildDirectRecipeRules,
  configuredRecipeCoverageIsComplete,
  emptyDirectRecipeConfiguration,
} from "../direct-recipe-rules"
import {
  buildDirectProductSnapshot,
  type DirectVariationAxis,
} from "../direct-variation-snapshot"

const axes: DirectVariationAxis[] = [
  {
    id: "axis-inclusion",
    name: "Inclusion",
    values: [
      {
        id: "value-vial-only",
        label: "Vial only",
        amount: "",
        displayUnit: "",
        materialProfileId: "",
      },
      {
        id: "value-set",
        label: "Research set",
        amount: "",
        displayUnit: "",
        materialProfileId: "",
      },
    ],
  },
  {
    id: "axis-content",
    name: "Net Content",
    values: [
      {
        id: "value-50",
        label: "50 mg",
        amount: "50",
        displayUnit: "mg",
        materialProfileId: "",
      },
      {
        id: "value-100",
        label: "100 mg",
        amount: "100",
        displayUnit: "mg",
        materialProfileId: "",
      },
    ],
  },
]

describe("direct compounded-product recipe rules", () => {
  it("maps configurable axes and shared inventory components without product names", () => {
    const snapshot = buildDirectProductSnapshot({
      productTitle: "Configurable product",
      axes,
    })
    const configuration = emptyDirectRecipeConfiguration()
    configuration.finishedProductAxisId = "axis-content"
    configuration.includedSupplyAxisId = "axis-inclusion"
    configuration.finishedProductByValueId = {
      "value-50": [
        {
          inventory_item_id: "inventory_finished_50",
          required_display_amount: "1",
        },
      ],
      "value-100": [
        {
          inventory_item_id: "inventory_finished_100",
          required_display_amount: "1",
        },
      ],
    }
    configuration.includedSupplyByValueId = {
      "value-set": [
        {
          inventory_item_id: "inventory_supply",
          required_display_amount: "6",
        },
      ],
    }
    configuration.commonPackaging = [
      {
        inventory_item_id: "inventory_mailer",
        required_display_amount: "1",
      },
    ]

    expect(
      buildDirectRecipeRules({ configuration, axes, snapshot }),
    ).toEqual([
      expect.objectContaining({
        kind: "finished_product",
        match: { axis_key: "net_content", value_key: "option_50_mg" },
        components: [
          {
            inventory_item_id: "inventory_finished_50",
            required_display_amount: "1",
          },
        ],
      }),
      expect.objectContaining({
        kind: "finished_product",
        match: { axis_key: "net_content", value_key: "option_100_mg" },
      }),
      expect.objectContaining({
        kind: "variation_value",
        match: { axis_key: "inclusion", value_key: "vial_only" },
        components: [],
      }),
      expect.objectContaining({
        kind: "variation_value",
        match: { axis_key: "inclusion", value_key: "research_set" },
        components: [
          {
            inventory_item_id: "inventory_supply",
            required_display_amount: "6",
          },
        ],
      }),
      expect.objectContaining({
        kind: "common_packaging",
        components: [
          {
            inventory_item_id: "inventory_mailer",
            required_display_amount: "1",
          },
        ],
      }),
    ])
  })

  it("requires exactly one finished-product rule for every generated row", () => {
    const snapshot = buildDirectProductSnapshot({
      productTitle: "Configurable product",
      axes,
    })
    const configuration = emptyDirectRecipeConfiguration()
    configuration.finishedProductAxisId = "axis-content"
    configuration.finishedProductByValueId = {
      "value-50": [
        {
          inventory_item_id: "inventory_finished_50",
          required_display_amount: "1",
        },
      ],
      "value-100": [
        {
          inventory_item_id: "inventory_finished_100",
          required_display_amount: "1",
        },
      ],
    }
    const rules = buildDirectRecipeRules({ configuration, axes, snapshot })
    const rows = [
      {
        options: [
          { axisKey: "inclusion", valueKey: "vial_only" },
          { axisKey: "net_content", valueKey: "option_50_mg" },
        ],
      },
      {
        options: [
          { axisKey: "inclusion", valueKey: "research_set" },
          { axisKey: "net_content", valueKey: "option_100_mg" },
        ],
      },
    ]

    expect(configuredRecipeCoverageIsComplete({ rules, rows })).toBe(true)
    expect(
      configuredRecipeCoverageIsComplete({
        rules: rules.filter(
          (rule) =>
            rule.kind !== "finished_product" ||
            rule.match.value_key !== "option_100_mg",
        ),
        rows,
      }),
    ).toBe(false)
  })
})
