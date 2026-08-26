import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../modules/research-tracking/config"
import { normalizeResearchRoutineLogInput } from "../../../../../../../modules/research-tracking/contracts/personal-routines"
import { previewResearchRoutineLog } from "../../../../../../../modules/research-tracking/queries/personal-routines"
import type { StorePreviewResearchRoutineLogType } from "../../validators"
import { setResearchPrivateNoStore } from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StorePreviewResearchRoutineLogType>,
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

  const preview = await previewResearchRoutineLog({
    container: req.scope,
    normalized: normalizeResearchRoutineLogInput({
      customerId: req.auth_context.actor_id,
      activeConsentVersion: configuration.activeConsentVersion,
      routineId: req.validatedBody.routine_id,
      routineRevisionId: req.validatedBody.routine_revision_id,
      occurrenceId: req.validatedBody.occurrence_id,
      localDate: req.validatedBody.local_date,
      supplyId: req.validatedBody.supply_id,
      confirmedQuantityBaseUnits:
        req.validatedBody.confirmed_quantity_base_units,
      baseUnit: req.validatedBody.base_unit,
    }),
  })

  res.json({ preview })
}
