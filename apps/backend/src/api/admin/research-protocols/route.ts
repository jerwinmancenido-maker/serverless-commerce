import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import type { AdminListResearchProtocols } from "../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../modules/research-content/service"
import { createResearchProtocolWorkflow } from "../../../workflows/manage-research-protocol"

type ProtocolProduct = {
  id: string
  title: string
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { status, product_id: productId, link_status: linkStatus, limit, offset } =
    req.validatedQuery as AdminListResearchProtocols
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  let seriesIds: string[] | undefined

  if (status) {
    const matchingRevisions = await service.listResearchProtocols(
      { status },
      { relations: ["series"] },
    )
    seriesIds = Array.from(
      new Set(
        matchingRevisions
          .map((revision) => revision.series?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    )
  }

  if (seriesIds && !seriesIds.length) {
    res.json({ protocols: [], count: 0, limit, offset })
    return
  }

  const links = await service.listResearchProtocolProductLinks(
    productId ? { product_id: productId, archived_at: null } : { archived_at: null },
    { relations: ["variant_targets"] },
  )
  const linkedSeriesIds = new Set(links.map((link) => link.series_id))
  if (productId) {
    const productSeriesIds = Array.from(linkedSeriesIds)
    seriesIds = seriesIds
      ? seriesIds.filter((id) => linkedSeriesIds.has(id))
      : productSeriesIds
  } else if (linkStatus) {
    const allSeries = await service.listResearchProtocolSeries({}, { select: ["id"] })
    const filtered = allSeries
      .map((item) => item.id)
      .filter((id) => linkStatus === "linked" ? linkedSeriesIds.has(id) : !linkedSeriesIds.has(id))
    seriesIds = seriesIds ? seriesIds.filter((id) => filtered.includes(id)) : filtered
  }
  if (seriesIds && !seriesIds.length) {
    res.json({ protocols: [], count: 0, limit, offset })
    return
  }
  const [series, count] = await service.listAndCountResearchProtocolSeries(
    seriesIds ? { id: seriesIds, archived_at: null } : { archived_at: null },
    {
      take: limit,
      skip: offset,
      order: { updated_at: "DESC" },
      relations: ["revisions", "product_links", "product_links.variant_targets"],
    },
  )
  const activeLinks = series.flatMap((protocol) =>
    (protocol.product_links || []).filter((link) => !link.archived_at),
  )
  const productIds = Array.from(new Set(activeLinks.map((link) => link.product_id)))
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productResult = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title"],
        filters: { id: productIds },
      })
    : { data: [] }
  const productById = new Map(
    (productResult.data as ProtocolProduct[]).map((product) => [
      product.id,
      product,
    ]),
  )
  const protocols = series.map((protocol) => ({
    ...protocol,
    product_links: (protocol.product_links || [])
      .filter((link) => !link.archived_at)
      .map((link) => ({ ...link, product: productById.get(link.product_id) || null })),
    revisions: [...(protocol.revisions || [])].sort(
      (left, right) => right.revision - left.revision,
    ),
  }))

  res.setHeader("Cache-Control", "private, no-store")
  res.json({ protocols, count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<import("../../../modules/research-content/contracts/research-protocol").AdminCreateResearchProtocol>,
  res: MedusaResponse,
) {
  const { result } = await createResearchProtocolWorkflow(req.scope).run({
    input: { ...req.validatedBody, actorId: req.auth_context.actor_id },
  })
  res.status(201).json({ protocol: result })
}
