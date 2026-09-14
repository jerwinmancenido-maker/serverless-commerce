import { shouldUseMerchantProductView } from "../merchant-product-route"

describe("merchant product detail routing", () => {
  it("uses the modern merchant view for all products by default", () => {
    expect(
      shouldUseMerchantProductView({
        compounded_product: {
          schema_version: "1",
          presentation_revision_id: "revision_1",
        },
      }),
    ).toBe(true)
    expect(shouldUseMerchantProductView(null)).toBe(true)
    expect(shouldUseMerchantProductView({})).toBe(true)
    expect(shouldUseMerchantProductView({ compounded_product: "invalid" })).toBe(
      true,
    )
  })

  it("allows an explicit advanced Medusa detail view escape hatch", () => {
    expect(
      shouldUseMerchantProductView(
        { compounded_product: { schema_version: "1" } },
        "?view=advanced",
      ),
    ).toBe(false)
    expect(shouldUseMerchantProductView(null, "?view=advanced")).toBe(false)
    expect(shouldUseMerchantProductView({}, "?view=advanced")).toBe(false)
  })
})

