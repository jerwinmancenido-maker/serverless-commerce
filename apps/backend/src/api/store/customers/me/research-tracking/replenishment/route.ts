import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { listOwnedResearchReplenishmentProjections } from "../../../../../../modules/research-tracking/queries/replenishment"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const projections = await listOwnedResearchReplenishmentProjections({
    container: req.scope,
    customerId: req.auth_context.actor_id,
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ projections })
}
