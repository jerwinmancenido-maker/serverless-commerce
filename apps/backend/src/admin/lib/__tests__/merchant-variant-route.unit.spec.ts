/**
 * @file    apps/backend/src/admin/lib/__tests__/merchant-variant-route.unit.spec.ts
 * @module  MerchantVariantRouteUnitSpec
 * @purpose Unit tests verifying URL resolution and redirect logic for product variants into the Compounded Cockpit.
 */

import { resolveMerchantVariantRedirectUrl } from "../merchant-variant-route"

describe("resolveMerchantVariantRedirectUrl", () => {
  it("resolves to compounded products path when product id is present", () => {
    expect(resolveMerchantVariantRedirectUrl("prod_123")).toBe(
      "/compounded-products/prod_123",
    )
  })

  it("appends target variant query parameter when variant id is present", () => {
    expect(resolveMerchantVariantRedirectUrl("prod_123", "variant_456")).toBe(
      "/compounded-products/prod_123?variant=variant_456",
    )
  })

  it("returns null when product id is undefined or null", () => {
    expect(resolveMerchantVariantRedirectUrl(undefined)).toBeNull()
    expect(resolveMerchantVariantRedirectUrl(null)).toBeNull()
    expect(resolveMerchantVariantRedirectUrl("")).toBeNull()
  })

  it("bypasses redirect when explicit view=advanced query parameter is present", () => {
    expect(
      resolveMerchantVariantRedirectUrl(
        "prod_123",
        "variant_456",
        "?view=advanced",
      ),
    ).toBeNull()
    expect(
      resolveMerchantVariantRedirectUrl(
        "prod_123",
        "variant_456",
        "?tab=general&view=advanced",
      ),
    ).toBeNull()
  })
})
