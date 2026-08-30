import { merchantProductErrorMessage } from "../admin-product-error"

describe("merchantProductErrorMessage", () => {
  it.each([
    "Variant row 5b014dd1 must resolve exactly one finished product; resolved 0",
    "Invalid string: must match pattern /^[a-z][a-z0-9_]*$/",
    "Product prod_01M18Q failed",
  ])("replaces technical backend details: %s", (message) => {
    expect(
      merchantProductErrorMessage(new Error(message), "Review the form"),
    ).toBe("Review the form")
  })

  it("preserves concise merchant-facing errors", () => {
    expect(
      merchantProductErrorMessage(
        new Error("Product title is required"),
        "Review the form",
      ),
    ).toBe("Product title is required")
  })
})
