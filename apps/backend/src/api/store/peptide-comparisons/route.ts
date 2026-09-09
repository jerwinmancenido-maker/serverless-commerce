/**
 * @file apps/backend/src/api/store/peptide-comparisons/route.ts
 * @module StorefrontAPI · PeptideComparisons
 * @purpose Public storefront endpoint listing published head-to-head peptide comparisons with category filtering.
 * @contracts GET /store/peptide-comparisons?category=&limit=&offset= -> { comparisons: PeptideComparison[], count: number }
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

  const filters: Record<string, any> = {
    status: "published",
  }

  if (category) {
    filters.category = category
  }

  const [comparisons, count] = await service.listAndCountPeptideComparisons(
    filters,
    {
      take: limit,
      skip: offset,
      order: { published_at: "DESC" },
    },
  )

  return res.json({
    comparisons,
    count,
    limit,
    offset,
  })
}
