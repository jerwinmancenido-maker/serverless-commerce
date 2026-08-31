import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type { AdminListResearchProtocolComments } from "../../../../../modules/research-content/contracts/research-protocol-comment"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"

export async function GET(
  req: MedusaRequest<never, AdminListResearchProtocolComments>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [series] = await service.listResearchProtocolSeries(
    { id: req.params.id },
    { take: 1 },
  )
  if (!series) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }
  const query = req.validatedQuery
  const [comments, count] =
    await service.listAndCountResearchProtocolComments(
      {
        series_id: series.id,
        status: query.status,
      },
      {
        take: query.limit,
        skip: query.offset,
        order: { submitted_at: "DESC" },
      },
    )

  res.json({ comments, count, limit: query.limit, offset: query.offset })
}
