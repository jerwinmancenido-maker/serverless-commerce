/**
 * @file    apps/backend/src/admin/lib/merchant-product-route.ts
 * @module  MerchantProductRoute
 * @purpose Determines whether a product should route to the specialized Compounded Products Cockpit.
 * @contracts
 *   Route: /compounded-products/:id
 */

export const shouldUseMerchantProductView = (
  _metadata?: Record<string, unknown> | null,
  search = "",
) => {
  if (new URLSearchParams(search).get("view") === "advanced") {
    return false
  }

  return true
}

