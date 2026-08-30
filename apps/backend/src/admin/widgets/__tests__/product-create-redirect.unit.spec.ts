import { shouldRedirectProductCreate } from "../../lib/product-create-route"

describe("product create redirect", () => {
  it.each([
    "/products/create",
    "/products/create/",
    "/app/products/create",
    "/app/products/create/",
  ])("redirects the native create route %s", (pathname) => {
    expect(shouldRedirectProductCreate(pathname)).toBe(true)
  })

  it.each([
    "/products",
    "/products/prod_123",
    "/compounded-products",
    "/products/create-variant",
  ])("does not redirect unrelated route %s", (pathname) => {
    expect(shouldRedirectProductCreate(pathname)).toBe(false)
  })
})
