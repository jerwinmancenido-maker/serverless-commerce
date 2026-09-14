/**
 * @file    apps/backend/src/admin/routes/research-protocols/[protocolId]/community/page.tsx
 * @module  ResearchProtocolCommunityRoute (Admin Dashboard Extension)
 * @purpose Admin dashboard route for community protocol discussion moderation and comment review.
 * @contracts
 *   API:     GET/POST /admin/research-protocols/:id/community/*
 *   Service: ResearchProtocolModuleService
 */

import { useParams } from "react-router-dom"

import { CommunityModeration } from "../../community-moderation"

const ResearchProtocolCommunityPage = () => {
  const { protocolId = "" } = useParams()
  return <CommunityModeration protocolId={protocolId} />
}

export default ResearchProtocolCommunityPage
