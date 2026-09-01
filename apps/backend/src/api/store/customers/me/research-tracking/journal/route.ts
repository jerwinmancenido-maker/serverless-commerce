import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../modules/research-tracking/config"
import { listOwnedResearchJournalEntries } from "../../../../../../modules/research-tracking/queries/journal"
import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import { manageResearchJournalEntryWorkflow } from "../../../../../../workflows/manage-research-journal-entry"
import { awardRewardEventSafely } from "../../../../../../workflows/award-reward-event"
import { evaluateAndAwardResearchGoals } from "../../../../../../workflows/evaluate-and-award-research-goals"
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

  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  const attachments = profile
    ? await service.listResearchJournalAttachments(
        { profile_id: profile.id, status: "active" },
        { order: { uploaded_at: "DESC" } },
      )
    : []
  const attachmentsByEntry = new Map<string, typeof attachments>()
  for (const attachment of attachments) {
    const current = attachmentsByEntry.get(attachment.journal_entry_id) ?? []
    current.push(attachment)
    attachmentsByEntry.set(attachment.journal_entry_id, current)
  }
  const serializedEntries = entries.map((entry) => ({
    ...entry,
    attachments: (attachmentsByEntry.get(entry.journal_entry_id) ?? []).map(
      (attachment) => ({
        id: attachment.id,
        journal_entry_id: attachment.journal_entry_id,
        journal_revision_id: attachment.journal_revision_id,
        file_name: attachment.file_name,
        mime_type: attachment.mime_type,
        size_bytes: attachment.size_bytes,
        scan_status: attachment.scan_status,
        uploaded_at: attachment.uploaded_at,
      }),
    ),
  }))

  res.json({ journal_entries: serializedEntries, count })
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
        routineRevisionId: body.routine_revision_id,
        protocolRevisionId: body.protocol_revision_id,
        profileProtocolAccessId: body.profile_protocol_access_id,
        measurementEntryId: body.measurement_entry_id,
        orderId: body.order_id,
        productId: body.product_id,
        productVariantId: body.product_variant_id,
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
  if (result.created) {
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "first_journal",
      source_type: "first_journal",
      source_id: idempotencyKey,
      idempotency_key: `first-journal:${idempotencyKey}`,
    })
    await awardRewardEventSafely(req.scope, {
      customer_id: customerId,
      event_type: "journal_daily",
      source_type: "journal_daily",
      source_id: body.local_date,
      idempotency_key: `journal-daily:${customerId}:${body.local_date}`,
    })
    await evaluateAndAwardResearchGoals(req.scope, {
      customerId,
      today: body.local_date,
    })
  }

  res.status(result.created ? 201 : 200).json(result)
}
