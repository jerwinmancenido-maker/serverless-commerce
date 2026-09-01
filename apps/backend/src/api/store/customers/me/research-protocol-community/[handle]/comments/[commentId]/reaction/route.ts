import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../../../modules/research-content"
import type { StoreReactResearchProtocolComment } from "../../../../../../../../../modules/research-content/contracts/research-protocol-community"
import type ResearchContentModuleService from "../../../../../../../../../modules/research-content/service"
import { reactProtocolCommentWorkflow, removeProtocolReactionWorkflow } from "../../../../../../../../../workflows/manage-research-protocol-community"

const getSeries = async (service: ResearchContentModuleService, handle: string) => {
  const [series] = await service.listResearchProtocolSeries({ protocol_key: handle, archived_at: null }, { take: 1 })
  if (!series) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol was not found")
  return series
}

export async function POST(req: AuthenticatedMedusaRequest<StoreReactResearchProtocolComment>, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const series = await getSeries(service, req.params.handle)
  const { result } = await reactProtocolCommentWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: series.id, comment_id: req.params.commentId, customer_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ reaction: { comment_id: req.params.commentId, reaction: result.reaction } })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const series = await getSeries(service, req.params.handle)
  await removeProtocolReactionWorkflow(req.scope).run({ input: { series_id: series.id, comment_id: req.params.commentId, customer_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.status(204).send()
}
