/**
 * @file    apps/backend/src/admin/widgets/category-list-redirect.tsx
 * @module  CategoryListRedirect (Admin Widget Extension)
 * @purpose Intercepts legacy /app/categories list visits and seamlessly redirects to the modern SADS 2.0 Categories Studio.
 * @contracts
 *   Route:  /categories
 *   Widget: product_category.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const CategoryListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers
  if (searchParams.get("view") === "raw_table") {
    return null
  }

  const target = location.search
    ? `/categories-studio${location.search}`
    : "/categories-studio"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "product_category.list.before",
})

export default CategoryListRedirect
