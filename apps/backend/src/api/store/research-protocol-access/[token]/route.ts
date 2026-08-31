import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import { ResearchProtocolContent } from "../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [access] = await service.listResearchProtocolOrderAccesses(
    { access_token: req.params.token, revoked_at: null },
    { take: 1, relations: ["revision", "revision.series"] },
  )
  if (!access) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Protocol access was not found")
  const [currentRevision] = await service.listResearchProtocols(
    { series_id: access.revision.series_id, status: "published" },
    { take: 1, order: { revision: "DESC" } },
  )
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    protocol: {
      handle: access.protocol_handle_snapshot,
      title: access.protocol_title_snapshot,
      revision: access.revision_number_snapshot,
      content: ResearchProtocolContent.parse(access.revision.content),
      issued_at: access.issued_at,
      current_revision: currentRevision?.revision || null,
      has_newer_revision: Boolean(
        currentRevision && currentRevision.revision > access.revision_number_snapshot,
      ),
    },
  })
}
