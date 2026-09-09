/**
 * @file apps/backend/src/api/store/research-articles/route.ts
 * @module StorefrontAPI · ResearchArticles
 * @purpose Public storefront endpoint listing published peer-reviewed scientific articles with category/tag filtering.
 * @contracts GET /store/research-articles?category=&tag=&limit=&offset= -> { articles: ResearchArticle[], count: number }
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import type ResearchContentModuleService from "../../../modules/research-content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const category = req.query.category as string | undefined
  const tag = req.query.tag as string | undefined

  const filters: Record<string, any> = {
    status: "published",
  }

  if (category) {
    filters.category = category
  }
  if (tag) {
    filters.compound_tag = tag
  }

  const [articles, count] = await service.listAndCountResearchArticles(
    filters,
    {
      take: limit,
      skip: offset,
      order: { published_at: "DESC" },
    },
  )

  return res.json({
    articles,
    count,
    limit,
    offset,
  })
}
