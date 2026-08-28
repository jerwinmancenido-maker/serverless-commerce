import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../../modules/research-tracking/config"
import { recordResearchJournalConsentWorkflow } from "../../../../../../../workflows/record-research-journal-consent"
import type { StoreRecordResearchJournalConsentType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreRecordResearchJournalConsentType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const trackingConfiguration = getResearchTrackingCustomerConfiguration()
  const journalConfiguration = getResearchJournalConfiguration()

  if (!trackingConfiguration.available || !journalConfiguration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Journal consent is not available",
    })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await recordResearchJournalConsentWorkflow(req.scope).run({
    input: {
      customerId,
      activeGeneralConsentVersion:
        trackingConfiguration.activeConsentVersion,
      requestedConsentVersion: req.validatedBody.consent_version,
      activeConsentVersion: journalConfiguration.activeConsentVersion,
      noticeSha256: journalConfiguration.noticeSha256,
      accepted: req.validatedBody.accepted,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "journal-consent",
      idempotencyKey,
    ),
  })

  res.status(result.created ? 201 : 200).json(result)
}
