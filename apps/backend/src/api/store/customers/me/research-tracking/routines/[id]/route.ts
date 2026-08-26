import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../modules/research-tracking/config"
import { manageResearchRoutineWorkflow } from "../../../../../../../workflows/manage-research-routine"
import type { StoreUpdateResearchRoutineType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateResearchRoutineType>,
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
  const { result } = await manageResearchRoutineWorkflow(req.scope).run({
    input: {
      operation: "update",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        routineId: req.params.id,
        label: req.validatedBody.label,
        plannedQuantityBaseUnits:
          req.validatedBody.planned_quantity_base_units,
        baseUnit: req.validatedBody.base_unit,
        recurrenceType: req.validatedBody.recurrence_type,
        dailyInterval: req.validatedBody.daily_interval,
        weeklyInterval: req.validatedBody.weekly_interval,
        weekdays: req.validatedBody.weekdays,
        localTime: req.validatedBody.local_time,
        startDate: req.validatedBody.start_date,
        endDate: req.validatedBody.end_date,
        effectiveFromDate: req.validatedBody.effective_from_date,
        idempotencyKey,
      },
    },
    context: createResearchWorkflowContext(
      customerId,
      "routine-update",
      idempotencyKey,
    ),
  })

  res.json(result)
}
