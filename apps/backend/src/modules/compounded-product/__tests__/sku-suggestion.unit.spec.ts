import { generateCompoundedProductSku } from "../sku-suggestion"

const row = {
  key: "a".repeat(64),
  title: "Vial + BAC / 10 mg",
  options: [
    {
      axisKey: "inclusion",
      axisPosition: 0,
      semanticName: "Inclusion",
      valueKey: "vial-bac",
      valueLabel: "Vial + BAC",
      valuePosition: 0,
      measurement: null,
    },
    {
      axisKey: "net-content",
      axisPosition: 1,
      semanticName: "Net Content",
      valueKey: "10-mg",
      valueLabel: "10 mg",
      valuePosition: 0,
      measurement: null,
    },
  ],
}

describe("generateCompoundedProductSku", () => {
  it("preserves an explicit administrator SKU", () => {
    expect(
      generateCompoundedProductSku({
        explicitSku: "  CUSTOM-SKU  ",
        productTitle: "BPC-157",
        presentationLabel: "Vial",
        row,
        idempotencyKey: "request-1",
        policy: null,
      }),
    ).toBe("CUSTOM-SKU")
  })

  it("generates a readable stable SKU when blank", () => {
    const input = {
      explicitSku: "",
      productTitle: "BPC-157",
      presentationLabel: "Lyophilized Vial",
      row,
      idempotencyKey: "request-1",
      policy: null,
    }

    const first = generateCompoundedProductSku(input)
    const replay = generateCompoundedProductSku(input)

    expect(first).toBe(replay)
    expect(first).toMatch(
      /^BPC-157-LYOPHILIZED-VIAL-VIAL-BAC-10-MG-[A-F0-9]{16}$/,
    )
  })

  it("uses configured template, separator, and normalization", () => {
    const sku = generateCompoundedProductSku({
      explicitSku: null,
      productTitle: "GHK-Cu",
      productHandle: "ghk-cu",
      presentationLabel: "Nasal",
      row,
      idempotencyKey: "request-2",
      policy: {
        template: "{presentation}_{product}_{options}",
        separator: "_",
        normalization: "lowercase",
      },
    })

    expect(sku).toMatch(/^nasal_ghk_cu_vial_bac_10_mg_[a-f0-9]{16}$/)
  })

  it("changes the stable suffix for another request", () => {
    const base = {
      explicitSku: "",
      productTitle: "BPC-157",
      presentationLabel: "Vial",
      row,
      policy: null,
    }

    expect(
      generateCompoundedProductSku({ ...base, idempotencyKey: "request-1" }),
    ).not.toBe(
      generateCompoundedProductSku({ ...base, idempotencyKey: "request-2" }),
    )
  })

  it("preserves the uniqueness suffix within Medusa's SKU length limit", () => {
    const sku = generateCompoundedProductSku({
      explicitSku: "",
      productTitle: "X".repeat(400),
      presentationLabel: "Vial",
      row,
      idempotencyKey: "request-long",
      policy: null,
    })

    expect(sku).toHaveLength(255)
    expect(sku).toMatch(/-[A-F0-9]{16}$/)
  })
})
