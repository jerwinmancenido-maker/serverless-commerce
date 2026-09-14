/**
 * @file    apps/backend/src/admin/routes/bom/page.tsx
 * @module  LegacyBomRedirect (Admin Dashboard Extension)
 * @purpose Redirects legacy BOM route to the buildable products cockpit.
 * @contracts
 *   Route: /app/bom -> /app/buildable-products
 */

import { Navigate } from "react-router-dom"

const LegacyBomRedirect = () => (
  <Navigate replace to="/app/buildable-products" />
)

export default LegacyBomRedirect

