/**
 * @file    apps/backend/src/admin/routes/compound-catalog/page.tsx
 * @module  RetiredCompoundCatalogRoute (Admin Dashboard Extension)
 * @purpose Redirects retired compound catalog route to the unified compounded-products cockpit.
 * @contracts
 *   Route: /app/compound-catalog -> /app/compounded-products
 */

import { Navigate } from "react-router-dom"

const RetiredCompoundCatalogPage = () => (
  <Navigate to="/compounded-products" replace />
)

export default RetiredCompoundCatalogPage

