import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"

type RecommendationQuery = {
  placement: string
  limit: number
  exclude_product_ids: string[]
}

export async function GET(
  req: MedusaRequest,
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
  const now = new Date()
  const validatedQuery = req.validatedQuery as RecommendationQuery
  const excluded = new Set(validatedQuery.exclude_product_ids || [])
  const links = await service.listResearchProtocolMerchandisingLinks(
    { series_id: series.id, status: "active", archived_at: null },
    { order: { priority: "ASC", created_at: "ASC" }, take: 100 },
  )
  const eligible = links.filter((link) => {
    const placements = Array.isArray(link.placements)
      ? (link.placements as string[])
      : []
    return (
      placements.includes(validatedQuery.placement) &&
      !excluded.has(link.product_id) &&
      (!link.starts_at || link.starts_at <= now) &&
      (!link.ends_at || link.ends_at > now)
    )
  })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productIds = eligible.map((link) => link.product_id)
  const { data: products } = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "status"],
        filters: { id: productIds },
      })
    : { data: [] }
  const publishedIds = new Set(
    products
      .filter((product: any) => product.status === "published")
      .map((product: any) => product.id),
  )
  const recommendations = eligible
    .filter((link) => publishedIds.has(link.product_id))
    .slice(0, validatedQuery.limit)
    .map((link) => ({
      id: link.id,
      protocol_revision_id: revision.id,
      product_id: link.product_id,
      product_variant_ids: link.product_variant_ids,
      relationship_type: link.relationship_type,
      placement: validatedQuery.placement,
      heading: link.heading,
      reason: link.reason,
      quick_add_enabled: link.quick_add_enabled,
      hide_after_purchase: link.hide_after_purchase,
      priority: link.priority,
    }))
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ recommendations })
}
