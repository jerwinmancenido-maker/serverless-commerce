import {
  buildDirectProductSnapshot,
  prepareAutomaticDirectProductSnapshot,
} from "../direct-variation-snapshot"

const axis = (
  name: string,
  labels: string[],
  id = name || "axis",
) => ({
  id,
  name,
  values: labels.map((label, index) => ({
    id: `${id}-${index}`,
    label,
    amount: "",
    displayUnit: "" as const,
    materialProfileId: "",
  })),
})

describe("direct compounded-product variation keys", () => {
  it("prefixes numeric option labels with a schema-safe internal key", () => {
    const snapshot = buildDirectProductSnapshot({
      productTitle: "Configured compound",
      axes: [axis("Inclusion", ["1", "2", "3"]), axis("Net Content", ["10", "20"])],
    })

    expect(snapshot.variation_axes[0].values.map((value) => value.key)).toEqual([
      "option_1",
      "option_2",
      "option_3",
    ])
    expect(snapshot.variation_axes[1].values.map((value) => value.key)).toEqual([
      "option_10",
      "option_20",
    ])
  })

  it("keeps customer labels unchanged while normalizing internal keys", () => {
    const snapshot = buildDirectProductSnapshot({
      productTitle: "BPC-157",
      axes: [axis("Net Content", ["10 mg", "500 mcg", "1,000 IU"])],
    })

    expect(snapshot.variation_axes[0].values).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "option_10_mg", label: "10 mg" }),
        expect.objectContaining({ key: "option_500_mcg", label: "500 mcg" }),
        expect.objectContaining({ key: "option_1_000_iu", label: "1,000 IU" }),
      ]),
    )
  })

  it("bounds long generated keys and keeps collisions unique", () => {
    const sharedPrefix = `A${"b".repeat(80)}`
    const snapshot = buildDirectProductSnapshot({
      productTitle: "Configured compound",
      axes: [axis("Presentation", [`${sharedPrefix} one`, `${sharedPrefix} two`])],
    })
    const keys = snapshot.variation_axes[0].values.map((value) => value.key)

    expect(keys[0]).toHaveLength(64)
    expect(keys[1]).toHaveLength(64)
    expect(new Set(keys).size).toBe(2)
    expect(keys.every((key) => /^[a-z][a-z0-9_]*$/.test(key))).toBe(true)
  })
})

describe("automatic product combinations", () => {
  it("prepares the matrix as soon as every variation is complete", () => {
    const result = prepareAutomaticDirectProductSnapshot({
      productTitle: "BPC-157",
      axes: [
        axis("Inclusion", ["Vial Only", "Vial + BAC"]),
        axis("Net Content", ["5 mg", "10 mg"]),
      ],
    })

    expect(result.validationMessage).toBeNull()
    expect(result.snapshot?.variation_axes).toHaveLength(2)
    expect(
      result.snapshot?.variation_axes.reduce(
        (total, variation) => total * variation.values.length,
        1,
      ),
    ).toBe(4)
  })

  it("waits while a visible variation is incomplete", () => {
    const result = prepareAutomaticDirectProductSnapshot({
      productTitle: "BPC-157",
      axes: [axis("Inclusion", ["Vial Only"]), axis("", [""])],
    })

    expect(result.snapshot).toBeNull()
    expect(result.validationMessage).toBe(
      "Variation 2 needs a name and at least one option.",
    )
  })

  it("supports a product with no variation axes as one default combination", () => {
    const result = prepareAutomaticDirectProductSnapshot({
      productTitle: "Single presentation",
      axes: [],
    })

    expect(result.validationMessage).toBeNull()
    expect(result.snapshot?.variation_axes).toEqual([])
  })

  it("surfaces duplicate options without requesting a matrix", () => {
    const result = prepareAutomaticDirectProductSnapshot({
      productTitle: "BPC-157",
      axes: [axis("Net Content", ["10 mg", "10 MG"])],
    })

    expect(result.snapshot).toBeNull()
    expect(result.validationMessage).toBe(
      "Net Content contains duplicate option 10 MG",
    )
  })
})
