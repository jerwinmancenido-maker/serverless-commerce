import { Navigate, useParams } from "react-router-dom"

const LegacyResearchProtocolEditorRedirect = () => {
  const { protocolId = "" } = useParams()
  return <Navigate to={`/research-protocols/${protocolId}`} replace />
}

export default LegacyResearchProtocolEditorRedirect
