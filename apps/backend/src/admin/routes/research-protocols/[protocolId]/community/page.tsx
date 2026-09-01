import { useParams } from "react-router-dom"

import { CommunityModeration } from "../../community-moderation"

const ResearchProtocolCommunityPage = () => {
  const { protocolId = "" } = useParams()
  return <CommunityModeration protocolId={protocolId} />
}

export default ResearchProtocolCommunityPage
