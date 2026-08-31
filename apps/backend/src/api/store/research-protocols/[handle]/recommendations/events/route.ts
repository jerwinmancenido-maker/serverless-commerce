import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../modules/research-content"
import type { StoreRecordResearchProtocolRecommendationEvent } from "../../../../../../modules/research-content/contracts/research-protocol-merchandising"
import type ResearchContentModuleService from "../../../../../../modules/research-content/service"
import { recordResearchProtocolRecommendationEventWorkflow } from "../../../../../../workflows/manage-research-protocol-merchandising"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreRecordResearchProtocolRecommendationEvent>,
  res: MedusaResponse,
) {
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
  const { result } = await recordResearchProtocolRecommendationEventWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      series_id: series.id,
      customer_id: req.auth_context?.actor_id || null,
    },
  })
  res.status(201).json({ event: result })
}
