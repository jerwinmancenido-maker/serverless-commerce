import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { manageResearchRoutineWorkflow } from "../../../../../../../../workflows/manage-research-routine"
import type { StoreTransitionResearchRoutineType } from "../../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreTransitionResearchRoutineType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()

  if (!configuration.available || !configuration.activeConsentVersion) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Research & Tracking customer access is not available",
    })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await manageResearchRoutineWorkflow(req.scope).run({
    input: {
      operation: "resume",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        routineId: req.params.id,
        effectiveFromDate: req.validatedBody.effective_from_date,
        idempotencyKey,
      },
    },
    context: createResearchWorkflowContext(
      customerId,
      "routine-resume",
      idempotencyKey,
    ),
  })

  res.json(result)
}
