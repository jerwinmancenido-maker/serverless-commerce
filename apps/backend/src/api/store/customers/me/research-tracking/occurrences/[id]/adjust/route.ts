import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { manageResearchOccurrenceAdjustmentWorkflow } from "../../../../../../../../workflows/manage-research-occurrence-adjustment"
import type { StoreAdjustResearchOccurrenceType } from "../../../validators"
import { createResearchWorkflowContext, getResearchIdempotencyKey, setResearchPrivateNoStore } from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreAdjustResearchOccurrenceType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  if (!configuration.available) return res.status(503).json({ type: "not_allowed" })
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const body = req.validatedBody
  const { result } = await manageResearchOccurrenceAdjustmentWorkflow(req.scope).run({
    input: {
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      occurrenceId: req.params.id,
      routineId: body.routine_id,
      routineRevisionId: body.routine_revision_id,
      routineScheduleSegmentId: body.routine_schedule_segment_id,
      operation: body.operation,
      plannedLocalDate: body.planned_local_date,
      plannedLocalTime: body.planned_local_time,
      rescheduledLocalDate: body.rescheduled_local_date,
      rescheduledLocalTime: body.rescheduled_local_time,
      timezone: body.timezone,
      note: body.note,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(customerId, `occurrence-${body.operation}`, idempotencyKey),
  })
  res.json({ adjustment: result })
}
