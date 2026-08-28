import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../../../modules/research-tracking/config"
import { manageResearchJournalEntryWorkflow } from "../../../../../../../../workflows/manage-research-journal-entry"
import type { StoreReviseResearchJournalEntryType } from "../../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreReviseResearchJournalEntryType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  const journalConfiguration = getResearchJournalConfiguration()

  if (!configuration.available || !journalConfiguration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Research & Tracking customer access is not available",
    })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const body = req.validatedBody
  const { result } = await manageResearchJournalEntryWorkflow(req.scope).run({
    input: {
      operation: "revise",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        activeJournalConsentVersion:
          journalConfiguration.activeConsentVersion,
        activeJournalNoticeSha256: journalConfiguration.noticeSha256,
        journalEntryId: req.params.id,
        expectedRevisionId: body.expected_revision_id,
        title: body.title,
        note: body.note,
        localDate: body.local_date,
        localTime: body.local_time,
        timezone: body.timezone,
        trackedMaterialId: body.tracked_material_id,
        supplyId: body.supply_id,
        routineId: body.routine_id,
        confirmedLogId: body.confirmed_log_id,
        confirmed: body.confirmed,
        idempotencyKey,
      },
    },
    context: createResearchWorkflowContext(
      customerId,
      "journal-revise",
      idempotencyKey,
    ),
  })

  res.json(result)
}
