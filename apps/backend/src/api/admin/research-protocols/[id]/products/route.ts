import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import { COMPOUNDED_PRODUCT_MODULE } from "../../../../../modules/compounded-product"
import type { AdminLinkResearchProtocolProduct } from "../../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import type CompoundedProductModuleService from "../../../../../modules/compounded-product/service"
import { linkResearchProtocolProductWorkflow } from "../../../../../workflows/manage-research-protocol"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const links = await service.listResearchProtocolProductLinks(
    { series_id: req.params.id, archived_at: null },
    { relations: ["variant_targets"], order: { created_at: "ASC" } },
  )
  const productIds = links.map((link) => link.product_id)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title", "status", "metadata", "variants.id", "variants.title"],
        filters: { id: productIds },
      })
    : { data: [] }
  const productById = new Map(products.map((product: any) => [product.id, product]))
  const compoundedService = req.scope.resolve<CompoundedProductModuleService>(COMPOUNDED_PRODUCT_MODULE)
  const registrations = productIds.length
    ? await compoundedService.listGovernedProductRegistrations(
        { product_id: productIds },
        { relations: ["compound_format"] },
      )
    : []
  const formatByProductId = new Map(
    registrations.map((registration) => [registration.product_id, registration.compound_format?.name || null]),
  )
  res.json({
    product_links: links.map((link) => ({
      ...link,
      product: productById.has(link.product_id)
        ? { ...productById.get(link.product_id), product_format: formatByProductId.get(link.product_id) || null }
        : null,
    })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminLinkResearchProtocolProduct>,
  res: MedusaResponse,
) {
  const { result } = await linkResearchProtocolProductWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      series_id: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })
  res.status(201).json({ product_link: result })
}
