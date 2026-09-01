import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../modules/research-tracking/service"
import { acceptResearchAgreementWorkflow } from "../../../../../workflows/manage-research-agreement"
import { awardRewardEventSafely } from "../../../../../workflows/award-reward-event"
import type { StoreAcceptResearchAgreement } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const acceptances = await service.listResearchAgreementAcceptances(
    { customer_id: req.auth_context.actor_id },
    { order: { accepted_at: "DESC" } },
  )
  const active = await service.listResearchAgreementBundles(
    { status: "active" },
    { order: { effective_at: "DESC" }, take: 1 },
  )
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    current_acceptance: acceptances[0] || null,
    agreement_history: acceptances,
    active_agreement_bundle: active[0] || null,
    setup_required: Boolean(
      active[0] && acceptances[0]?.agreement_bundle_id !== active[0].id,
    ),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreAcceptResearchAgreement>,
  res: MedusaResponse,
) {
  const { result } = await acceptResearchAgreementWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  await awardRewardEventSafely(req.scope, {
    customer_id: req.auth_context.actor_id,
    event_type: "profile_completed",
    source_type: "profile_completed",
    source_id: result.id,
    idempotency_key: `profile-completed:${result.id}`,
  })
  res.status(201).json({ agreement_acceptance: result })
}
