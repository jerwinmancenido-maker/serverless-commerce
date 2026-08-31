import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type { AdminCreateResearchProtocolMerchandisingLink } from "../../../../../modules/research-content/contracts/research-protocol-merchandising"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import { createResearchProtocolMerchandisingLinkWorkflow } from "../../../../../workflows/manage-research-protocol-merchandising"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const links = await service.listResearchProtocolMerchandisingLinks(
    { series_id: req.params.id, archived_at: null },
    { order: { priority: "ASC", created_at: "ASC" } },
  )
  const productIds = links.map((link) => link.product_id)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productIds.length
    ? await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "status",
          "thumbnail",
          "variants.id",
          "variants.title",
        ],
        filters: { id: productIds },
      })
    : { data: [] }
  const productById = new Map(
    products.map((product: any) => [product.id, product]),
  )
  res.json({
    merchandising_links: links.map((link) => ({
      ...link,
      product: productById.get(link.product_id) || null,
    })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateResearchProtocolMerchandisingLink>,
  res: MedusaResponse,
) {
  const { result } = await createResearchProtocolMerchandisingLinkWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })
  res.status(201).json({ merchandising_link: result })
}
