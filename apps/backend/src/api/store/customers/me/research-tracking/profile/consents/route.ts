import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../../modules/research-tracking/config"
import { recordResearchConsentWorkflow } from "../../../../../../../workflows/research-tracking-ownership"
import type { StoreRecordResearchConsentType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreRecordResearchConsentType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const configuration = getResearchTrackingCustomerConfiguration()

  if (!configuration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Research & Tracking customer access is not available",
    })
  }

  const { result } = await recordResearchConsentWorkflow(req.scope).run({
    input: {
      customerId,
      requestedConsentVersion: req.validatedBody.consent_version,
      activeConsentVersion: configuration.activeConsentVersion,
      noticeSha256: configuration.noticeSha256,
      accepted: req.validatedBody.accepted,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "consent-record",
      idempotencyKey,
    ),
  })

  res.json({ research_profile: result.research_profile })
}
