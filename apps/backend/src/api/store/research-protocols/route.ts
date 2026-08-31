import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import { ResearchProtocolContent } from "../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const series = await service.listResearchProtocolSeries({ archived_at: null }, { select: ["id", "protocol_key"] })
  const seriesIds = series.map((item) => item.id)
  if (!seriesIds.length) return res.json({ protocols: [], count: 0, limit, offset })
  const [revisions, count] = await service.listAndCountResearchProtocols(
    { series_id: seriesIds, status: "published" },
    { take: limit, skip: offset, order: { published_at: "DESC" }, relations: ["series"] },
  )
  const links = await service.listResearchProtocolProductLinks({ series_id: revisions.map((revision) => revision.series_id), archived_at: null })
  const productIds = Array.from(new Set(links.map((link) => link.product_id)))
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productResult = productIds.length ? await query.graph({ entity: "product", fields: ["id", "title", "handle", "thumbnail"], filters: { id: productIds } }) : { data: [] }
  const productById = new Map((productResult.data as Array<{ id: string; title: string; handle: string; thumbnail: string | null }>).map((product) => [product.id, product]))
  const linksBySeries = new Map<string, typeof links>()
  for (const link of links) linksBySeries.set(link.series_id, [...(linksBySeries.get(link.series_id) || []), link])
  const protocols = revisions.map((revision) => ({
    handle: revision.series.protocol_key,
    revision: revision.revision,
    title: revision.title,
    summary: revision.summary,
    published_at: revision.published_at,
    updated_at: revision.updated_at,
    content: ResearchProtocolContent.parse(revision.content),
    products: (linksBySeries.get(revision.series_id) || []).map((link) => productById.get(link.product_id)).filter(Boolean),
  }))
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  res.json({ protocols, count, limit, offset })
}
