import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
import { manageResearchMeasurementWorkflow } from "../../../../../../../../workflows/manage-research-measurement"
import type { StoreReviseResearchMeasurementType } from "../../../validators"
import { createResearchWorkflowContext, getResearchIdempotencyKey, setResearchPrivateNoStore } from "../../../utils"

export async function POST(req: AuthenticatedMedusaRequest<StoreReviseResearchMeasurementType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  if (!configuration.available) return res.status(503).json({ type: "not_allowed" })
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await manageResearchMeasurementWorkflow(req.scope).run({
    input: {
      operation: "revise",
      customerId,
      activeConsentVersion: configuration.activeConsentVersion,
      idempotencyKey,
      entryId: req.params.id,
      expectedRevisionId: req.validatedBody.expected_revision_id,
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
    context: createResearchWorkflowContext(customerId, "measurement-revise", idempotencyKey),
  })
  res.json(result)
}
