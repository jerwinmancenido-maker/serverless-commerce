import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import { listTrackedMaterialsAndSupplies } from "../../../../../../modules/research-tracking/queries/purchased-supplies"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()

  if (!configuration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Research & Tracking customer access is not available",
    })
  }

  const limit = req.validatedQuery.limit ?? 20
  const offset = req.validatedQuery.offset ?? 0
  const result = await listTrackedMaterialsAndSupplies({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    activeConsentVersion: configuration.activeConsentVersion,
    limit,
    offset,
  })

  res.json({
    materials: result.materials,
    count: result.count,
    limit,
    offset,
  })
}
