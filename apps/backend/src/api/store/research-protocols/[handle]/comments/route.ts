import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [series] = await service.listResearchProtocolSeries(
    { protocol_key: req.params.handle, archived_at: null },
    { take: 1 },
  )
  if (!series) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const [comments, count] =
    await service.listAndCountResearchProtocolComments(
      { series_id: series.id, status: "approved" },
      {
        take: limit,
        skip: offset,
        order: { submitted_at: "DESC" },
      },
    )

  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120")
  res.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      author_name: comment.author_name_snapshot,
      kind: comment.kind,
      body: comment.body,
      submitted_at: comment.submitted_at,
    })),
    count,
    limit,
    offset,
  })
}
