import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import { ResearchProtocolContent } from "../../../modules/research-content/contracts/research-protocol"
import {
  buildPublicResearchProtocolContent,
  normalizeResearchProtocolVisibilityPolicy,
} from "../../../modules/research-content/protocol-access"
import type ResearchContentModuleService from "../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const series = await service.listResearchProtocolSeries(
    { archived_at: null },
    { select: ["id", "protocol_key"] },
  )
  const seriesIds = series.map((item) => item.id)
  if (!seriesIds.length) {
    return res.json({ protocols: [], count: 0, limit, offset })
  }

  const [revisions, policies] = await Promise.all([
    service.listResearchProtocols(
      { series_id: seriesIds, status: "published" },
      { order: { published_at: "DESC" }, relations: ["series"] },
    ),
    service.listResearchProtocolVisibilityPolicies({ series_id: seriesIds }),
  ])
  const policyBySeries = new Map(
    policies.map((policy) => [policy.series_id, policy]),
  )
  const visibleRevisions = revisions.filter((revision) =>
    normalizeResearchProtocolVisibilityPolicy(
      policyBySeries.get(revision.series_id),
    ).public_page_enabled,
  )
  const pagedRevisions = visibleRevisions.slice(offset, offset + limit)

  const links = await service.listResearchProtocolProductLinks({
    series_id: pagedRevisions.map((revision) => revision.series_id),
    archived_at: null,
  })
  const publicLinks = links.filter((link) =>
    normalizeResearchProtocolVisibilityPolicy(
      policyBySeries.get(link.series_id),
    ).public_products,
  )
  const productIds = Array.from(
    new Set(publicLinks.map((link) => link.product_id)),
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productResult = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "thumbnail"],
        filters: { id: productIds },
      })
    : { data: [] }
  const productById = new Map(
    (
      productResult.data as Array<{
        id: string
        title: string
        handle: string
        thumbnail: string | null
      }>
    ).map((product) => [product.id, product]),
  )
  const linksBySeries = new Map<string, typeof publicLinks>()
  for (const link of publicLinks) {
    linksBySeries.set(link.series_id, [
      ...(linksBySeries.get(link.series_id) || []),
      link,
    ])
  }

  const protocols = pagedRevisions.map((revision) => {
    const policy = normalizeResearchProtocolVisibilityPolicy(
      policyBySeries.get(revision.series_id),
    )
    const content = ResearchProtocolContent.parse(revision.content)
    return {
      handle: revision.series.protocol_key,
      revision: revision.revision,
      title: revision.title,
      summary: policy.public_summary ?? revision.summary,
      published_at: revision.published_at,
      updated_at: revision.updated_at,
      content: buildPublicResearchProtocolContent(content, policy),
      products: (linksBySeries.get(revision.series_id) || [])
        .map((link) => productById.get(link.product_id))
        .filter(Boolean),
      access: {
        full_protocol: "purchaser",
        community: policy.community_read_scope,
      },
    }
  })

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  res.json({
    protocols,
    count: visibleRevisions.length,
    limit,
    offset,
  })
}
