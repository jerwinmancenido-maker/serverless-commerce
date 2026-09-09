/**
 * @file    apps/backend/src/api/store/research-protocol-access/[token]/route.ts
 * @module  StoreResearchProtocolAccessRoute (Research Content Module)
 * @purpose Serves immutable, order-preserved research protocol snapshots for verified access tokens with revocation detection.
 * @contracts
 *   API: GET /store/research-protocol-access/:token
 *   Service: ResearchContentModuleService
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import { ResearchProtocolContent } from "../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [access] = await service.listResearchProtocolOrderAccesses(
    { access_token: req.params.token },
    { take: 1, relations: ["revision", "revision.series"] },
  )

  if (!access) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Protocol access token was not found",
    )
  }

  if (access.revoked_at) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Protocol access has been revoked due to order cancellation, refund, or administrator action",
    )
  }

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
        currentRevision &&
          currentRevision.revision > access.revision_number_snapshot,
      ),
    },
  })
}
