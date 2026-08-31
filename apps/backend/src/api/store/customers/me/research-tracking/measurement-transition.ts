import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../modules/research-tracking/config"
import { manageResearchMeasurementWorkflow } from "../../../../../workflows/manage-research-measurement"
import type { StoreTransitionResearchMeasurementType } from "./validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "./utils"

export async function transitionResearchMeasurement(
  operation: "void" | "restore",
  req: AuthenticatedMedusaRequest<StoreTransitionResearchMeasurementType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()

  if (!configuration.available) {
    return res.status(503).json({ type: "not_allowed" })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await manageResearchMeasurementWorkflow(req.scope).run({
    input: {
      operation,
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      idempotencyKey,
      entryId: req.params.id,
      expectedRevisionId: req.validatedBody.expected_revision_id,
    },
    context: createResearchWorkflowContext(
      customerId,
      `measurement-${operation}`,
      idempotencyKey,
    ),
  })

  return res.json(result)
}
