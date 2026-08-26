import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { mutateResearchRoutineLogWorkflow } from "../../../../../../../../workflows/mutate-research-routine-log"
import type { StoreVoidResearchRoutineLogType } from "../../../validators"
import { createResearchWorkflowContext, getResearchIdempotencyKey, setResearchPrivateNoStore } from "../../../utils"

export async function POST(req: AuthenticatedMedusaRequest<StoreVoidResearchRoutineLogType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  if (!configuration.available) return res.status(503).json({ type: "not_allowed", message: "Research & Tracking customer access is not available" })
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await mutateResearchRoutineLogWorkflow(req.scope).run({
    input: { customerId, activeConsentVersion: configuration.activeConsentVersion, logId: req.params.id, operation: "void", idempotencyKey, previewToken: req.validatedBody.preview_token },
    context: createResearchWorkflowContext(customerId, "routine-log-void", idempotencyKey),
  })
  res.json(result)
}
