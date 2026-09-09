/**
 * @file apps/backend/src/api/store/peptide-comparisons/[slug]/route.ts
 * @module StorefrontAPI · PeptideComparisonDetail
 * @purpose Public storefront endpoint retrieving a published head-to-head peptide comparison matrix by unique slug.
 * @contracts GET /store/peptide-comparisons/:slug -> { comparison: PeptideComparison } | 404
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

  const [comparison] = await service.listPeptideComparisons(
    { slug, status: "published" },
    { take: 1 },
  )

  if (!comparison) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Peptide comparison '${slug}' not found or is unpublished.`,
    )
  }

  return res.json({ comparison })
}
