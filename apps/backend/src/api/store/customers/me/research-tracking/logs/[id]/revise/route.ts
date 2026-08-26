import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { mutateResearchRoutineLogWorkflow } from "../../../../../../../../workflows/mutate-research-routine-log"
import type { StoreReviseResearchRoutineLogType } from "../../../validators"
import { createResearchWorkflowContext, getResearchIdempotencyKey, setResearchPrivateNoStore } from "../../../utils"

export async function POST(req: AuthenticatedMedusaRequest<StoreReviseResearchRoutineLogType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  if (!configuration.available) return res.status(503).json({ type: "not_allowed", message: "Research & Tracking customer access is not available" })
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await mutateResearchRoutineLogWorkflow(req.scope).run({
    input: { customerId, activeConsentVersion: configuration.activeConsentVersion, logId: req.params.id, operation: "revise", supplyId: req.validatedBody.supply_id, confirmedQuantityBaseUnits: req.validatedBody.confirmed_quantity_base_units, baseUnit: req.validatedBody.base_unit, idempotencyKey, previewToken: req.validatedBody.preview_token },
    context: createResearchWorkflowContext(customerId, "routine-log-revise", idempotencyKey),
  })
  res.json(result)
}
