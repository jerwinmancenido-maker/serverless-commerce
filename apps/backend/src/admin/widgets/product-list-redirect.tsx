/**
 * @file    apps/backend/src/admin/widgets/product-list-redirect.tsx
 * @module  ProductListRedirect (Admin Extension)
 * @purpose Intercepts legacy /app/products list visits and seamlessly redirects to the modern Buildable Products Cockpit.
 * @contracts
 *   Route:  /products
 *   Widget: product.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const ProductListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers
  if (searchParams.get("view") === "advanced") {
    return null
  }

  // Preserve any search/filter query parameters
  const target = location.search
    ? `/buildable-products${location.search}`
    : "/buildable-products"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductListRedirect
