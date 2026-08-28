import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../modules/research-tracking/config"
import { listOwnedResearchJournalEntries } from "../../../../../../modules/research-tracking/queries/journal"
import { manageResearchJournalEntryWorkflow } from "../../../../../../workflows/manage-research-journal-entry"
import type {
  StoreCreateResearchJournalEntryType,
  StoreListResearchJournalEntriesType,
} from "../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest<
    unknown,
    StoreListResearchJournalEntriesType
  >,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { entries, count } = await listOwnedResearchJournalEntries({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    limit: req.validatedQuery.limit,
    offset: req.validatedQuery.offset,
    includeVoided: req.validatedQuery.include_voided,
  })

  res.json({ journal_entries: entries, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchJournalEntryType>,
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
      operation: "create",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        activeJournalConsentVersion:
          journalConfiguration.activeConsentVersion,
        activeJournalNoticeSha256: journalConfiguration.noticeSha256,
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
      "journal-create",
      idempotencyKey,
    ),
  })

  res.status(result.created ? 201 : 200).json(result)
}
