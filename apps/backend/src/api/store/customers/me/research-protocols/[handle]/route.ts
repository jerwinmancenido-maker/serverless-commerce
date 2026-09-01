import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../modules/research-content"
import { getCustomerProtocolEligibility } from "../../../../../../modules/research-content/community-access"
import { ResearchProtocolContent } from "../../../../../../modules/research-content/contracts/research-protocol"
import { buildResearchProtocolContentForAccess } from "../../../../../../modules/research-content/protocol-access"
import type ResearchContentModuleService from "../../../../../../modules/research-content/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const eligibility = await getCustomerProtocolEligibility({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    protocolHandle: req.params.handle,
  })
  const accessLevel = eligibility.purchaser ? "purchaser" : "member"
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [revision] = await service.listResearchProtocols(
    { series_id: eligibility.series.id, status: "published" },
    { take: 1, order: { revision: "DESC" } },
  )
  if (!revision) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Published research protocol was not found",
    )
  }
  const content = ResearchProtocolContent.parse(revision.content)
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    protocol: {
      handle: eligibility.series.protocol_key,
      title: revision.title,
      summary: revision.summary,
      revision: revision.revision,
      updated_at: revision.updated_at,
      access_level: accessLevel,
      purchaser: eligibility.purchaser,
      content: buildResearchProtocolContentForAccess(
        content,
        eligibility.policy,
        accessLevel,
      ),
      community: {
        read_scope: eligibility.policy.community_read_scope,
        post_scope: eligibility.policy.community_post_scope,
      },
    },
  })
}
