import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import {
  listOwnedResearchOccurrences,
  listOwnedResearchRoutineLogs,
} from "../../../../../../modules/research-tracking/queries/personal-routines"
import { confirmResearchRoutineLogWorkflow } from "../../../../../../workflows/confirm-research-routine-log"
import { awardRewardEventSafely } from "../../../../../../workflows/award-reward-event"
import { evaluateAndAwardResearchGoals } from "../../../../../../workflows/evaluate-and-award-research-goals"
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
  await awardRewardEventSafely(req.scope, {
    customer_id: customerId,
    event_type: "first_routine_activity",
    source_type: "first_routine_activity",
    source_id: idempotencyKey,
    idempotency_key: `first-routine-activity:${idempotencyKey}`,
  })
  await awardRewardEventSafely(req.scope, {
    customer_id: customerId,
    event_type: "routine_activity_daily",
    source_type: "routine_activity_daily",
    source_id: req.validatedBody.local_date,
    idempotency_key: `routine-activity-daily:${customerId}:${req.validatedBody.local_date}`,
  })
  const activityDate = new Date(`${req.validatedBody.local_date}T00:00:00.000Z`)
  const day = activityDate.getUTCDay()
  const monday = new Date(activityDate)
  monday.setUTCDate(activityDate.getUTCDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const weekFrom = monday.toISOString().slice(0, 10)
  const weekTo = sunday.toISOString().slice(0, 10)
  const weeklyOccurrences = await listOwnedResearchOccurrences({
    container: req.scope,
    customerId,
    from: weekFrom,
    to: weekTo,
  })
  if (
    weeklyOccurrences.length > 0 &&
    weeklyOccurrences.every((occurrence) => occurrence.status === "confirmed")
  ) {
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "first_weekly_goal",
      source_type: "first_weekly_goal",
      source_id: weekFrom,
      idempotency_key: `first-weekly-goal:${customerId}:${weekFrom}`,
    })
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "weekly_routine_goal",
      source_type: "weekly_routine_goal",
      source_id: weekFrom,
      idempotency_key: `weekly-routine-goal:${customerId}:${weekFrom}`,
    })
  }
  await evaluateAndAwardResearchGoals(req.scope, {
    customerId,
    today: req.validatedBody.local_date,
  })

  res.status(201).json(result)
}
