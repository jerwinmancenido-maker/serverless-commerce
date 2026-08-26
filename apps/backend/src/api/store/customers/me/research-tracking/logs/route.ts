import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import { listOwnedResearchRoutineLogs } from "../../../../../../modules/research-tracking/queries/personal-routines"
import { confirmResearchRoutineLogWorkflow } from "../../../../../../workflows/confirm-research-routine-log"
import type { StoreConfirmResearchRoutineLogType } from "../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const logs = await listOwnedResearchRoutineLogs({
    container: req.scope,
    customerId: req.auth_context.actor_id,
  })

  res.json({ logs })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreConfirmResearchRoutineLogType>,
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
  const { result } = await confirmResearchRoutineLogWorkflow(req.scope).run({
    input: {
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      routineId: req.validatedBody.routine_id,
      routineRevisionId: req.validatedBody.routine_revision_id,
      occurrenceId: req.validatedBody.occurrence_id,
      localDate: req.validatedBody.local_date,
      supplyId: req.validatedBody.supply_id,
      confirmedQuantityBaseUnits:
        req.validatedBody.confirmed_quantity_base_units,
      baseUnit: req.validatedBody.base_unit,
      previewToken: req.validatedBody.preview_token,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "routine-log-confirm",
      idempotencyKey,
    ),
  })

  res.status(201).json(result)
}
