/**
 * @file    apps/backend/src/api/admin/peptide-comparisons/route.ts
 * @module  AdminPeptideComparisonsRoute
 * @purpose Admin endpoint for listing and creating head-to-head peptide comparison matrices.
 * @contracts
 *   API:      GET /admin/peptide-comparisons, POST /admin/peptide-comparisons
 *   Workflow: createPeptideComparisonWorkflow
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import type ResearchContentModuleService from "../../../modules/research-content/service"
import { createPeptideComparisonWorkflow } from "../../../workflows/manage-research-library"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const status = req.query.status as string | undefined
  const category = req.query.category as string | undefined

  const filters: Record<string, any> = {}
  if (status) {
    filters.status = status
  }
  if (category) {
    filters.category = category
  }

  const [comparisons, count] = await service.listAndCountPeptideComparisons(
    filters,
    {
      take: limit,
      skip: offset,
      order: { updated_at: "DESC" },
    },
  )

  return res.json({
    comparisons,
    count,
    limit,
    offset,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const body = req.body as Record<string, any>
  if (!body.title || !body.slug || !body.compound_a || !body.compound_b) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Comparison 'title', 'slug', 'compound_a', and 'compound_b' are required fields.",
    )
  }

  const payload = {
    slug: body.slug,
    title: body.title,
    subtitle: body.subtitle || "",
    category: body.category || "General Pharmacology",
    compound_a: body.compound_a,
    compound_b: body.compound_b,
    summary: body.summary || "",
    synergy_verdict: body.synergy_verdict || "",
    vectors: body.vectors || [],
    citations: body.citations || [],
    status: body.status || "draft",
    published_at: body.status === "published" ? (body.published_at || new Date().toISOString()) : null,
    metadata: body.metadata || null,
  }

  const { result: comparison } = await createPeptideComparisonWorkflow(req.scope).run({
    input: payload,
  })

  return res.status(201).json({ comparison })
}
