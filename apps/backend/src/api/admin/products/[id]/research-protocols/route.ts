import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type {
  AdminCreateResearchProtocolBody,
  AdminListResearchProtocols,
} from "../../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import {
  createResearchProtocolWorkflow,
  linkResearchProtocolProductWorkflow,
} from "../../../../../workflows/manage-research-protocol"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { status, limit, offset } =
    req.validatedQuery as AdminListResearchProtocols
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const links = await service.listResearchProtocolProductLinks(
    { product_id: req.params.id, archived_at: null },
    { relations: ["variant_targets"] },
  )
  const [series, count] = links.length
      ? await service.listAndCountResearchProtocolSeries(
        { id: links.map((link) => link.series_id), archived_at: null },
        { take: limit, skip: offset, order: { created_at: "DESC" }, relations: ["revisions", "product_links", "product_links.variant_targets"] },
      )
    : [[], 0] as const
  const protocols = series
    .map((item) => ({
      ...item,
      product_links: (item.product_links || []).filter((link) => !link.archived_at),
      revisions: [...(item.revisions || [])].sort(
        (left, right) => right.revision - left.revision,
      ),
    }))
    .filter((item) =>
      status
        ? item.revisions.some((revision) => revision.status === status)
        : true,
    )

  res.json({ protocols, count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateResearchProtocolBody>,
  res: MedusaResponse,
) {
  const { result } = await createResearchProtocolWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      actorId: req.auth_context.actor_id,
    },
  })

  const { result: productLink } = await linkResearchProtocolProductWorkflow(
    req.scope,
  ).run({
    input: {
      series_id: result.series.id,
      product_id: req.params.id,
      applicability_scope: "entire_product",
      variant_ids: [],
      is_primary: false,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(201).json({ protocol: result, product_link: productLink })
}
