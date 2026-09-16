/**
 * @file    apps/backend/src/admin/widgets/product-list-redirect.tsx
 * @module  ProductListRedirect (Admin Widget Extension)
 * @purpose Intercepts legacy /app/products visits and seamlessly redirects to the modern SADS 2.0 Products Registry.
 * @contracts
 *   Route:  /products
 *   Widget: product.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const ProductListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers who explicitly want the raw Medusa table
  if (searchParams.get("view") === "raw_table") {
    return null
  }

  const target = location.search
    ? `/products-registry${location.search}`
    : "/products-registry"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductListRedirect
