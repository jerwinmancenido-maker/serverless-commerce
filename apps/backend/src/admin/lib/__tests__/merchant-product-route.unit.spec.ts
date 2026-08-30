import { shouldUseMerchantProductView } from "../merchant-product-route"

describe("merchant product detail routing", () => {
  it("uses the peptide merchant view for governed products", () => {
    expect(
      shouldUseMerchantProductView({
        compounded_product: {
          schema_version: "1",
          presentation_revision_id: "revision_1",
        },
      }),
    ).toBe(true)
  })

  it("leaves ordinary Medusa products on the native detail page", () => {
    expect(shouldUseMerchantProductView(null)).toBe(false)
    expect(shouldUseMerchantProductView({})).toBe(false)
    expect(shouldUseMerchantProductView({ compounded_product: "invalid" })).toBe(
      false,
    )
  })

  it("allows an explicit advanced Medusa detail view", () => {
    expect(
      shouldUseMerchantProductView(
        { compounded_product: { schema_version: "1" } },
        "?view=advanced",
      ),
    ).toBe(false)
  })
})
