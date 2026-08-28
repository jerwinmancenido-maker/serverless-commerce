import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../../../modules/research-tracking/config"
import { manageResearchJournalEntryWorkflow } from "../../../../../../../../workflows/manage-research-journal-entry"
import type { StoreTransitionResearchJournalEntryType } from "../../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreTransitionResearchJournalEntryType>,
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
  const { result } = await manageResearchJournalEntryWorkflow(req.scope).run({
    input: {
      operation: "void",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        activeJournalConsentVersion:
          journalConfiguration.activeConsentVersion,
        activeJournalNoticeSha256: journalConfiguration.noticeSha256,
        journalEntryId: req.params.id,
        expectedRevisionId: req.validatedBody.expected_revision_id,
        confirmed: req.validatedBody.confirmed,
        idempotencyKey,
      },
    },
    context: createResearchWorkflowContext(
      customerId,
      "journal-void",
      idempotencyKey,
    ),
  })

  res.json(result)
}
