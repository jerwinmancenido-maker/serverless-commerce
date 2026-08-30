import {
  combinationComponentsAreComplete,
  completeRowsForAvailability,
  componentsForCombination,
  inferRecipeAxisRoles,
  updateCombinationComponents,
  withInferredRecipeAxisRoles,
} from "../combination-recipe-adapter"
import { buildDirectProductSnapshot } from "../direct-variation-snapshot"
import { emptyDirectRecipeConfiguration } from "../direct-recipe-rules"
import type { DirectVariationAxis } from "../direct-variation-snapshot"
import type { MatrixRow } from "../types"

const axes: DirectVariationAxis[] = [
  {
    id: "axis-inclusion",
    name: "Inclusion",
    values: [
      {
        id: "vial",
        label: "Vial Only",
        amount: "",
        displayUnit: "",
        materialProfileId: "",
      },
      {
        id: "set",
        label: "SubQ Set",
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
        id: "50",
        label: "50 mg",
        amount: "50",
        displayUnit: "mg",
        materialProfileId: "",
      },
      {
        id: "100",
        label: "100 mg",
        amount: "100",
        displayUnit: "mg",
        materialProfileId: "",
      },
    ],
  },
]

const snapshot = buildDirectProductSnapshot({ productTitle: "GHK-Cu", axes })
const row = (inclusion: string, content: string): MatrixRow => ({
  key: `${inclusion}-${content}`,
  title: `${inclusion} / ${content}`,
  options: [
    {
      axisKey: "inclusion",
      semanticName: "Inclusion",
      axisPosition: 0,
      valueKey: inclusion === "Vial Only" ? "vial_only" : "subq_set",
      valueLabel: inclusion,
      valuePosition: inclusion === "Vial Only" ? 0 : 1,
      measurement: null,
    },
    {
      axisKey: "net_content",
      semanticName: "Net Content",
      axisPosition: 1,
      valueKey: content === "50 mg" ? "option_50_mg" : "option_100_mg",
      valueLabel: content,
      valuePosition: content === "50 mg" ? 0 : 1,
      measurement: null,
    },
  ],
})

const rows = [
  row("Vial Only", "50 mg"),
  row("SubQ Set", "50 mg"),
  row("SubQ Set", "100 mg"),
]

describe("combination recipe adapter", () => {
  it("automatically maps net content to the finished product and inclusion to supplies", () => {
    expect(inferRecipeAxisRoles(axes)).toEqual({
      finishedProductAxisId: "axis-content",
      includedSupplyAxisId: "axis-inclusion",
      needsManualReview: false,
    })
  })

  it("corrects an old reversed mapping when semantic roles are unambiguous", () => {
    expect(
      withInferredRecipeAxisRoles(
        {
          ...emptyDirectRecipeConfiguration(),
          finishedProductAxisId: "axis-inclusion",
          includedSupplyAxisId: "axis-content",
        },
        axes,
      ),
    ).toMatchObject({
      finishedProductAxisId: "axis-content",
      includedSupplyAxisId: "axis-inclusion",
    })
  })

  it("requires manual mapping when product options do not have recognizable roles", () => {
    const genericAxes = axes.map((axis, index) => ({
      ...axis,
      name: `Option ${index + 1}`,
      values: axis.values.map((value) => ({
        ...value,
        amount: "",
        displayUnit: "" as const,
      })),
    }))

    expect(inferRecipeAxisRoles(genericAxes).needsManualReview).toBe(true)
  })

  it("stores finished product by stable net-content value and supplies by stable inclusion value", () => {
    const configuration = {
      ...emptyDirectRecipeConfiguration(),
      finishedProductAxisId: "axis-content",
      includedSupplyAxisId: "axis-inclusion",
    }
    const next = updateCombinationComponents({
      configuration,
      axes,
      snapshot,
      row: rows[1],
      rows,
      finishedProduct: [
        { inventory_item_id: "vial-50", required_display_amount: "1" },
      ],
      includedSupplies: [
        { inventory_item_id: "pad", required_display_amount: "10" },
      ],
      packaging: [
        { inventory_item_id: "mailer", required_display_amount: "1" },
      ],
    })

    expect(next.finishedProductByValueId["50"]).toEqual([
      { inventory_item_id: "vial-50", required_display_amount: "1" },
    ])
    expect(next.includedSupplyByValueId.set).toEqual([
      { inventory_item_id: "pad", required_display_amount: "10" },
    ])
    const vialOnly50 = componentsForCombination({
      configuration: next,
      axes,
      snapshot,
      row: rows[0],
      rows,
    })
    const subq100 = componentsForCombination({
      configuration: next,
      axes,
      snapshot,
      row: rows[2],
      rows,
    })

    expect(vialOnly50.finishedProduct).toHaveLength(1)
    expect(vialOnly50.includedSupplies).toHaveLength(0)
    expect(vialOnly50.scopes.finishedProduct).toMatchObject({
      sharedCombinationCount: 2,
    })
    expect(subq100.finishedProduct).toHaveLength(0)
    expect(subq100.includedSupplies).toHaveLength(1)
    expect(subq100.scopes.includedSupply).toMatchObject({
      sharedCombinationCount: 2,
    })
  })

  it("keeps recipe mappings when labels change because IDs remain stable", () => {
    const renamedAxes = axes.map((axis) =>
      axis.id === "axis-content"
        ? {
            ...axis,
            values: axis.values.map((value) =>
              value.id === "50" ? { ...value, label: "50 MG vial" } : value,
            ),
          }
        : axis,
    )
    const renamedSnapshot = buildDirectProductSnapshot({
      productTitle: "GHK-Cu",
      axes: renamedAxes,
    })
    const renamedRow = {
      ...rows[0],
      options: rows[0].options.map((option) =>
        option.axisKey === "net_content"
          ? {
              ...option,
              valueKey: "option_50_mg_vial",
              valueLabel: "50 MG vial",
            }
          : option,
      ),
    }
    const configuration = {
      ...emptyDirectRecipeConfiguration(),
      finishedProductAxisId: "axis-content",
      finishedProductByValueId: {
        "50": [{ inventory_item_id: "vial-50", required_display_amount: "1" }],
      },
    }

    expect(
      componentsForCombination({
        configuration,
        axes: renamedAxes,
        snapshot: renamedSnapshot,
        row: renamedRow,
        rows: [renamedRow],
      }).finishedProduct,
    ).toEqual(configuration.finishedProductByValueId["50"])
  })

  it("requires one finished item and positive component quantities", () => {
    const configuration = {
      ...emptyDirectRecipeConfiguration(),
      finishedProductAxisId: "axis-content",
      includedSupplyAxisId: "axis-inclusion",
      finishedProductByValueId: {
        "50": [{ inventory_item_id: "vial-50", required_display_amount: "1" }],
      },
      includedSupplyByValueId: {
        set: [{ inventory_item_id: "pad", required_display_amount: "10" }],
      },
    }
    const valid = componentsForCombination({
      configuration,
      axes,
      snapshot,
      row: rows[1],
      rows,
    })
    const invalid = componentsForCombination({
      configuration: {
        ...configuration,
        includedSupplyByValueId: {
          set: [{ inventory_item_id: "pad", required_display_amount: "0" }],
        },
      },
      axes,
      snapshot,
      row: rows[1],
      rows,
    })

    expect(combinationComponentsAreComplete(valid)).toBe(true)
    expect(combinationComponentsAreComplete(invalid)).toBe(false)
  })

  it("sends only complete combinations to stock preview", () => {
    const configuration = {
      ...emptyDirectRecipeConfiguration(),
      finishedProductAxisId: "axis-content",
      includedSupplyAxisId: "axis-inclusion",
      finishedProductByValueId: {
        "50": [{ inventory_item_id: "vial-50", required_display_amount: "1" }],
      },
      includedSupplyByValueId: {
        set: [{ inventory_item_id: "pad", required_display_amount: "10" }],
      },
      commonPackaging: [
        { inventory_item_id: "mailer", required_display_amount: "1" },
      ],
    }

    expect(
      completeRowsForAvailability({
        configuration,
        axes,
        snapshot,
        rows,
      }).map((candidate) => candidate.key),
    ).toEqual(["Vial Only-50 mg", "SubQ Set-50 mg"])
  })
})
