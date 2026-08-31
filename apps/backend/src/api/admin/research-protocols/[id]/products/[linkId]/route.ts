import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type {
  AdminUnlinkResearchProtocolProduct,
  AdminUpdateResearchProtocolProductLink,
} from "../../../../../../modules/research-content/contracts/research-protocol"
import {
  unlinkResearchProtocolProductWorkflow,
  updateResearchProtocolProductLinkWorkflow,
} from "../../../../../../workflows/manage-research-protocol"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateResearchProtocolProductLink>,
  res: MedusaResponse,
) {
  const { result } = await updateResearchProtocolProductLinkWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      product_link_id: req.params.linkId,
      actorId: req.auth_context.actor_id,
    },
  })
  res.json({ product_link: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest<AdminUnlinkResearchProtocolProduct>,
  res: MedusaResponse,
) {
  const { result } = await unlinkResearchProtocolProductWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      product_link_id: req.params.linkId,
      actorId: req.auth_context.actor_id,
    },
  })
  res.json({ product_link: result })
}
