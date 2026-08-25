import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../../../modules/research-tracking"
import { projectResearchPrivacyRequest } from "../../../../../../../../modules/research-tracking/contracts/ownership"
import type ResearchTrackingModuleService from "../../../../../../../../modules/research-tracking/service"
import { setResearchPrivateNoStore } from "../../../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )

  if (!profile) {
    return res.json({ privacy_request: null })
  }

  const [request] = await service.listResearchPrivacyRequests(
    {
      profile_id: profile.id,
      status: ["requested", "processing"],
    },
    { order: { requested_at: "DESC" }, take: 1 },
  )

  res.json({
    privacy_request: request ? projectResearchPrivacyRequest(request) : null,
  })
}
