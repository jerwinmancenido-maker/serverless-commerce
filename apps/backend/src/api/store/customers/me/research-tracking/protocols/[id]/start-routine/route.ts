import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { startProtocolDerivedRoutineWorkflow } from "../../../../../../../../workflows/start-protocol-derived-routine"
import { awardRewardEventSafely } from "../../../../../../../../workflows/award-reward-event"
import type { StoreStartProtocolRoutineType } from "../../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreStartProtocolRoutineType>,
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

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await startProtocolDerivedRoutineWorkflow(req.scope).run({
    input: {
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      profileAccessId: req.params.id,
      trackedMaterialId: req.validatedBody.tracked_material_id,
      protocolLevelKey: req.validatedBody.protocol_level_key,
      startDate: req.validatedBody.start_date,
      localTimesByRow: req.validatedBody.local_times_by_row,
      calculatorResultSnapshot: req.validatedBody.calculator_result_snapshot,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "protocol-routine-start",
      idempotencyKey,
    ),
  })
  await awardRewardEventSafely(req.scope, {
    customer_id: customerId,
    event_type: "first_protocol_review",
    source_type: "first_protocol_review",
    source_id: req.params.id,
    idempotency_key: `first-protocol-review:${req.params.id}`,
  })
  if (result.created) {
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "first_routine",
      source_type: "first_routine",
      source_id: idempotencyKey,
      idempotency_key: `first-routine:${idempotencyKey}`,
    })
  }

  res.status(result.created ? 201 : 200).json(result)
}
