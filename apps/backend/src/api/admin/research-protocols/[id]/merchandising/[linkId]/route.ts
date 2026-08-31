import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type {
  AdminArchiveResearchProtocolMerchandisingLink,
  AdminUpdateResearchProtocolMerchandisingLink,
} from "../../../../../../modules/research-content/contracts/research-protocol-merchandising"
import {
  archiveResearchProtocolMerchandisingLinkWorkflow,
  updateResearchProtocolMerchandisingLinkWorkflow,
} from "../../../../../../workflows/manage-research-protocol-merchandising"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateResearchProtocolMerchandisingLink>,
  res: MedusaResponse,
) {
  const { result } = await updateResearchProtocolMerchandisingLinkWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      merchandising_link_id: req.params.linkId,
      actorId: req.auth_context.actor_id,
    },
  })
  res.json({ merchandising_link: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest<AdminArchiveResearchProtocolMerchandisingLink>,
  res: MedusaResponse,
) {
  const { result } = await archiveResearchProtocolMerchandisingLinkWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      merchandising_link_id: req.params.linkId,
      actorId: req.auth_context.actor_id,
    },
  })
  res.json({ merchandising_link: result })
}
