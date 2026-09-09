/**
 * @file apps/backend/src/api/store/research-articles/[slug]/route.ts
 * @module StorefrontAPI · ResearchArticleDetail
 * @purpose Public storefront endpoint retrieving a published scientific article by unique slug.
 * @contracts GET /store/research-articles/:slug -> { article: ResearchArticle } | 404
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const { slug } = req.params

  const [article] = await service.listResearchArticles(
    { slug, status: "published" },
    { take: 1 },
  )

  if (!article) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Scientific article '${slug}' not found or is unpublished.`,
    )
  }

  return res.json({ article })
}
