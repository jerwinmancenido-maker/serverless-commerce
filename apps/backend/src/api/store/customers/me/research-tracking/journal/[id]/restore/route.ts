import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../../modules/research-tracking/config"
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

  if (!configuration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Research & Tracking customer access is not available",
    })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await manageResearchJournalEntryWorkflow(req.scope).run({
    input: {
      operation: "restore",
      data: {
        customerId,
        activeConsentVersion: configuration.activeConsentVersion,
        journalEntryId: req.params.id,
        expectedRevisionId: req.validatedBody.expected_revision_id,
        confirmed: req.validatedBody.confirmed,
        idempotencyKey,
      },
    },
    context: createResearchWorkflowContext(
      customerId,
      "journal-restore",
      idempotencyKey,
    ),
  })

  res.json(result)
}
