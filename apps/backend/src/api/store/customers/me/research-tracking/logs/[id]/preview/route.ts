import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { previewResearchRoutineLogMutation } from "../../../../../../../../modules/research-tracking/queries/personal-routines"
import type { StorePreviewResearchRoutineLogMutationType } from "../../../validators"
import { setResearchPrivateNoStore } from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StorePreviewResearchRoutineLogMutationType>,
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

  const preview = await previewResearchRoutineLogMutation({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    activeConsentVersion: configuration.activeConsentVersion,
    logId: req.params.id,
    operation: req.validatedBody.operation,
    supplyId: req.validatedBody.supply_id,
    confirmedQuantityBaseUnits:
      req.validatedBody.confirmed_quantity_base_units,
    baseUnit: req.validatedBody.base_unit,
  })

  res.json({ preview })
}
