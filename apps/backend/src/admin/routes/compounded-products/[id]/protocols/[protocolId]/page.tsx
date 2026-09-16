/**
 * @file    apps/backend/src/admin/routes/compounded-products/[id]/protocols/[protocolId]/page.tsx
 * @module  LegacyResearchProtocolEditorRedirect (Admin Extension)
 * @purpose Redirects legacy nested product protocol editor route to the root protocols editor.
 * @contracts
 *   Route: /app/compounded-products/:id/protocols/:protocolId -> /app/research-protocols/:protocolId
 */

import { Navigate, useParams } from "react-router-dom"

const LegacyResearchProtocolEditorRedirect = () => {
  const { protocolId = "" } = useParams()
  return <Navigate to={`/research-protocols/${protocolId}`} replace />
}

export default LegacyResearchProtocolEditorRedirect

