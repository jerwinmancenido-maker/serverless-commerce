/**
 * @file    apps/backend/src/admin/routes/compounded-products/[id]/protocols/page.tsx
 * @module  LegacyProductResearchProtocolsRedirect (Admin Extension)
 * @purpose Redirects legacy nested product protocol route to the root protocols console.
 * @contracts
 *   Route: /app/compounded-products/:id/protocols -> /app/research-protocols
 */

import { Navigate } from "react-router-dom"

const LegacyProductResearchProtocolsRedirect = () => (
  <Navigate to="/app/research-protocols" replace />
)

export default LegacyProductResearchProtocolsRedirect

