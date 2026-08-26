import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchTrackingCustomerConfiguration,
  getResearchTrackingPurchasedActivationConfiguration,
} from "../../../../../../modules/research-tracking/config"
import { listPurchasedSupplyCandidates } from "../../../../../../modules/research-tracking/queries/purchased-supplies"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerConfiguration = getResearchTrackingCustomerConfiguration()
  const activationConfiguration =
    getResearchTrackingPurchasedActivationConfiguration()

  if (!customerConfiguration.available || !activationConfiguration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Purchased-item tracking is not available",
    })
  }

  const limit = req.validatedQuery.limit ?? 20
  const offset = req.validatedQuery.offset ?? 0
  const result = await listPurchasedSupplyCandidates({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    activeConsentVersion: customerConfiguration.activeConsentVersion,
    eligibleSalesChannelIds: activationConfiguration.eligibleSalesChannelIds,
    limit,
    offset,
  })

  res.json({
    purchased_items: result.items,
    count: result.count,
    limit,
    offset,
  })
}
