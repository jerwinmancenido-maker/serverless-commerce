import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../../../modules/research-content"
import type { StoreEditResearchProtocolComment } from "../../../../../../../../../modules/research-content/contracts/research-protocol-community"
import type ResearchContentModuleService from "../../../../../../../../../modules/research-content/service"
import { editProtocolCommentWorkflow } from "../../../../../../../../../workflows/manage-research-protocol-community"

export async function POST(req: AuthenticatedMedusaRequest<StoreEditResearchProtocolComment>, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [series] = await service.listResearchProtocolSeries({ protocol_key: req.params.handle, archived_at: null }, { take: 1 })
  if (!series) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol was not found")
  const { result } = await editProtocolCommentWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: series.id, comment_id: req.params.commentId, customer_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ comment: { id: result.id, status: result.status, edited_at: result.edited_at } })
}
