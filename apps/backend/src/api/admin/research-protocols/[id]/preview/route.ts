import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import { ResearchProtocolContent, type AdminPreviewResearchProtocol } from "../../../../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { revision_id: revisionId } = req.validatedQuery as AdminPreviewResearchProtocol
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [series] = await service.listResearchProtocolSeries(
    { id: req.params.id },
    { take: 1, relations: ["revisions", "product_links"] },
  )
  if (!series) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol was not found")
  const revisions = [...(series.revisions || [])].sort((left, right) => right.revision - left.revision)
  const revision = revisionId
    ? revisions.find((item) => item.id === revisionId)
    : revisions.find((item) => item.status === "draft") || revisions.find((item) => item.status === "published") || revisions[0]
  if (!revision) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol revision was not found")
  const content = ResearchProtocolContent.parse(revision.content)
  const productLinks = (series.product_links || []).filter((link) => !link.archived_at)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productLinks.length
    ? await query.graph({ entity: "product", fields: ["id", "title"], filters: { id: productLinks.map((link) => link.product_id) } })
    : { data: [] }
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    preview: {
      title: revision.title,
      summary: revision.summary,
      revision: revision.revision,
      preview_status: revision.status === "published" ? "Published guide" : "Draft preview",
      updated_at: revision.updated_at,
      quick_overview: content.intended_application,
      research_scope: content.research_purpose,
      important_limitations: content.explicit_exclusions,
      reference_quantities: content.reference_quantities,
      materials_and_equipment: content.materials_and_equipment,
      preparation_and_handling: content.preparation_and_handling,
      research_steps: content.research_procedure,
      storage_and_disposal: content.storage_and_disposal,
      references: content.references,
      safety_information: content.disclaimer,
      compatible_products: products.map((product: any) => ({ id: product.id, title: product.title })),
      content,
    },
  })
}
