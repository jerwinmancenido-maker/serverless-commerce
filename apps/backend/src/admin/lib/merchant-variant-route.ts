/**
 * @file    apps/backend/src/admin/lib/merchant-variant-route.ts
 * @module  MerchantVariantRoute
 * @purpose Determines navigation and redirect paths for product variants into the Compounded Cockpit.
 */

export const resolveMerchantVariantRedirectUrl = (
  productId?: string | null,
  variantId?: string | null,
  search = "",
): string | null => {
  if (!productId) {
    return null
  }

  const params = new URLSearchParams(search)
  if (params.get("view") === "advanced") {
    return null
  }

  const targetVariant = variantId ? `?variant=${variantId}` : ""
  return `/compounded-products/${productId}${targetVariant}`
}
