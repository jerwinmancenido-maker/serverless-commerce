import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import { ResearchProtocolContent } from "../../../../modules/research-content/contracts/research-protocol"
import {
  buildPublicResearchProtocolContent,
  normalizeResearchProtocolVisibilityPolicy,
} from "../../../../modules/research-content/protocol-access"
import type ResearchContentModuleService from "../../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  let [series] = await service.listResearchProtocolSeries(
    { protocol_key: req.params.handle, archived_at: null },
    { take: 1 },
  )

  if (!series) {
    const candidates = [
      `${req.params.handle}-laboratory-handling`,
      req.params.handle.replace(/-laboratory-handling$/, ""),
      req.params.handle.replace(/-protocol$/, ""),
      req.params.handle.replace(/-vial$/, ""),
      req.params.handle.replace(/-500mg$/, ""),
      req.params.handle.replace(/-1500mg$/, ""),
    ].filter((k) => k !== req.params.handle)

    for (const altKey of candidates) {
      const [candidate] = await service.listResearchProtocolSeries(
        { protocol_key: altKey, archived_at: null },
        { take: 1 },
      )
      if (candidate) {
        series = candidate
        break
      }
    }
  }

  if (!series) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }
  const [revision] = await service.listResearchProtocols(
    { series_id: series.id, status: "published" },
    { take: 1, order: { revision: "DESC" } },
  )
  if (!revision) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Published research protocol was not found",
    )
  }
  const [storedPolicy] = await service.listResearchProtocolVisibilityPolicies(
    { series_id: series.id },
    { take: 1 },
  )
  const policy = normalizeResearchProtocolVisibilityPolicy(storedPolicy)
  if (!policy.public_page_enabled) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }

  const links = policy.public_products
    ? await service.listResearchProtocolProductLinks(
        { series_id: series.id, archived_at: null },
        { relations: ["variant_targets"] },
      )
    : []
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productResult = links.length
    ? await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "handle",
          "thumbnail",
          "variants.id",
          "variants.title",
        ],
        filters: { id: links.map((link) => link.product_id) },
      })
    : { data: [] }
  const content = ResearchProtocolContent.parse(revision.content)

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  res.json({
    protocol: {
      handle: series.protocol_key,
      revision: revision.revision,
      title: revision.title,
      summary: policy.public_summary ?? revision.summary,
      published_at: revision.published_at,
      updated_at: revision.updated_at,
      content: buildPublicResearchProtocolContent(content, policy),
      products: productResult.data,
      access: {
        full_protocol: "purchaser",
        community: policy.community_read_scope,
        community_count_visible: false,
      },
      search_indexable: policy.search_indexable,
      recommendations_enabled: policy.public_recommendations,
    },
  })
}
