/**
 * @file    apps/backend/src/admin/routes/compounded-product-configurations/page.tsx
 * @module  LegacyProductConfigurationRoute (Admin Dashboard Extension)
 * @purpose Redirects legacy configuration route to the unified compounded-products cockpit.
 * @contracts
 *   Route: /app/compounded-product-configurations -> /app/compounded-products
 */

import { Navigate } from "react-router-dom"

const LegacyProductConfigurationPage = () => (
  <Navigate to="/app/compounded-products" replace />
)

export default LegacyProductConfigurationPage

