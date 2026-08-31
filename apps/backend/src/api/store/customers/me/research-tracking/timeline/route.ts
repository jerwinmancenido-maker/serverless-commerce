import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { listOwnedResearchTimeline } from "../../../../../../modules/research-tracking/queries/timeline"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const timeline = await listOwnedResearchTimeline({
    container: req.scope,
    customerId: req.auth_context.actor_id,
  })
  res.json({ timeline })
}
