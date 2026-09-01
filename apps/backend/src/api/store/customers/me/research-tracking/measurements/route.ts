import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import { listOwnedResearchMeasurements } from "../../../../../../modules/research-tracking/queries/measurements"
import { manageResearchMeasurementWorkflow } from "../../../../../../workflows/manage-research-measurement"
import { awardRewardEventSafely } from "../../../../../../workflows/award-reward-event"
import { evaluateAndAwardResearchGoals } from "../../../../../../workflows/evaluate-and-award-research-goals"
import type {
  StoreCreateResearchMeasurementType,
  StoreListResearchMeasurementsType,
} from "../validators"
import { createResearchWorkflowContext, getResearchIdempotencyKey, setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest<StoreListResearchMeasurementsType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const query = req.validatedQuery as StoreListResearchMeasurementsType
  const measurements = await listOwnedResearchMeasurements({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    metricType: query.metric_type,
    includeVoided: query.include_voided,
  })
  res.json({ measurements })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchMeasurementType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  if (!configuration.available) {
    return res.status(503).json({ type: "not_allowed", message: "Research & Tracking is unavailable" })
  }
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await manageResearchMeasurementWorkflow(req.scope).run({
    input: {
      operation: "create",
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      idempotencyKey,
      data: {
        metricType: req.validatedBody.metric_type,
        value: req.validatedBody.value,
        unit: req.validatedBody.unit,
        localDate: req.validatedBody.local_date,
        localTime: req.validatedBody.local_time,
        timezone: "Asia/Manila",
        note: req.validatedBody.note,
        routineId: req.validatedBody.routine_id,
        protocolRevisionId: req.validatedBody.protocol_revision_id,
        profileProtocolAccessId: req.validatedBody.profile_protocol_access_id,
        trackedMaterialId: req.validatedBody.tracked_material_id,
        routineLogId: req.validatedBody.routine_log_id,
        source: req.validatedBody.source,
      },
    },
    context: createResearchWorkflowContext(customerId, "measurement-create", idempotencyKey),
  })
  if (result.created) {
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "first_measurement",
      source_type: "first_measurement",
      source_id: idempotencyKey,
      idempotency_key: `first-measurement:${idempotencyKey}`,
    })
    const measurementDate = new Date(
      `${req.validatedBody.local_date}T00:00:00.000Z`,
    )
    const monday = new Date(measurementDate)
    monday.setUTCDate(
      measurementDate.getUTCDate() - ((measurementDate.getUTCDay() + 6) % 7),
    )
    const weekFrom = monday.toISOString().slice(0, 10)
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "measurement_weekly",
      source_type: "measurement_weekly",
      source_id: `${req.validatedBody.metric_type}:${weekFrom}`,
      idempotency_key: `measurement-weekly:${customerId}:${req.validatedBody.metric_type}:${weekFrom}`,
    })
    await evaluateAndAwardResearchGoals(req.scope, {
      customerId,
      today: req.validatedBody.local_date,
    })
  }
  res.status(result.created ? 201 : 200).json(result)
}
