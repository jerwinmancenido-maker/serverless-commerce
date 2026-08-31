import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import type { AdminUpdateResearchProtocolDraft } from "../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../modules/research-content/service"
import { updateResearchProtocolWorkflow } from "../../../../workflows/manage-research-protocol"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [protocol] = await service.listResearchProtocolSeries(
    { id: req.params.id },
    {
      take: 1,
      relations: [
        "revisions",
        "product_links",
        "product_links.variant_targets",
        "audit_events",
      ],
    },
  )

  if (!protocol) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }

  res.json({
    protocol: {
      ...protocol,
      revisions: [...(protocol.revisions || [])].sort(
        (left, right) => right.revision - left.revision,
      ),
      audit_events: [...(protocol.audit_events || [])].sort(
        (left, right) => right.created_at.getTime() - left.created_at.getTime(),
      ),
    },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateResearchProtocolDraft>,
  res: MedusaResponse,
) {
  const { result } = await updateResearchProtocolWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.json({ revision: result })
}
