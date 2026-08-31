import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../../../../modules/research-content/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "order", fields: ["id"], filters: { id: req.params.id, customer_id: req.auth_context.actor_id }, pagination: { take: 1 } })
  if (!data[0]) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order was not found")
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const accesses = await service.listResearchProtocolOrderAccesses({ order_id: req.params.id, revoked_at: null }, { order: { issued_at: "ASC" } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ research_protocols: accesses.map((access) => ({ line_item_id: access.line_item_id, title: access.protocol_title_snapshot, handle: access.protocol_handle_snapshot, revision: access.revision_number_snapshot, access_token: access.access_token })) })
}
