import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type { AdminUpdateResearchProtocolVisibility } from "../../../../../modules/research-content/contracts/research-protocol-visibility"
import { normalizeResearchProtocolVisibilityPolicy } from "../../../../../modules/research-content/protocol-access"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import { updateResearchProtocolVisibilityWorkflow } from "../../../../../workflows/manage-research-protocol-visibility"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [storedPolicy] = await service.listResearchProtocolVisibilityPolicies(
    { series_id: req.params.id },
    { take: 1 },
  )
  const events = await service.listResearchProtocolModerationEvents(
    { series_id: req.params.id, action: "visibility_updated" },
    { take: 25, order: { occurred_at: "DESC" } },
  )
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    visibility: normalizeResearchProtocolVisibilityPolicy(storedPolicy),
    audit_events: events,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateResearchProtocolVisibility>,
  res: MedusaResponse,
) {
  const { result } = await updateResearchProtocolVisibilityWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ visibility: result })
}
