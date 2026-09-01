import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../modules/research-tracking/service"
import { manageResearchAgreementWorkflow } from "../../../workflows/manage-research-agreement"
import type { AdminResearchAgreementBundle } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const bundles = await service.listResearchAgreementBundles(
    {},
    { order: { created_at: "DESC" } },
  )
  const acceptances = await service.listResearchAgreementAcceptances({})
  const acceptanceCounts = acceptances.reduce<Record<string, number>>(
    (counts, acceptance) => {
      counts[acceptance.agreement_bundle_id] =
        (counts[acceptance.agreement_bundle_id] || 0) + 1
      return counts
    },
    {},
  )
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ agreement_bundles: bundles, acceptance_counts: acceptanceCounts })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminResearchAgreementBundle>,
  res: MedusaResponse,
) {
  const { result } = await manageResearchAgreementWorkflow(req.scope).run({
    input: {
      operation: "create",
      actor_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.status(201).json({ agreement_bundle: result })
}
