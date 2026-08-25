import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import { projectResearchProfile } from "../../../../../../modules/research-tracking/contracts/ownership"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import { createResearchProfileWorkflow } from "../../../../../../workflows/research-tracking-ownership"
import type { StoreCreateResearchProfileType } from "../validators"
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
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )

  res.json({
    research_profile: profile ? projectResearchProfile(profile) : null,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateResearchProfileType>,
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

  const { result } = await createResearchProfileWorkflow(req.scope).run({
    input: {
      customerId,
      timezone: req.validatedBody.timezone,
      locale: req.validatedBody.locale,
      requestedConsentVersion: req.validatedBody.consent_version,
      activeConsentVersion: configuration.activeConsentVersion,
      noticeSha256: configuration.noticeSha256,
      accepted: req.validatedBody.accepted,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "profile-create",
      idempotencyKey,
    ),
  })

  res.status(result.created ? 201 : 200).json({
    research_profile: result.research_profile,
  })
}
