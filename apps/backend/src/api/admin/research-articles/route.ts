/**
 * @file    apps/backend/src/api/admin/research-articles/route.ts
 * @module  AdminResearchArticlesRoute
 * @purpose Admin endpoint for listing and creating scientific articles in the research library.
 * @contracts
 *   API:      GET /admin/research-articles, POST /admin/research-articles
 *   Workflow: createResearchArticleWorkflow
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import type ResearchContentModuleService from "../../../modules/research-content/service"
import { createResearchArticleWorkflow } from "../../../workflows/manage-research-library"

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

  const [articles, count] = await service.listAndCountResearchArticles(
    filters,
    {
      take: limit,
      skip: offset,
      order: { updated_at: "DESC" },
    },
  )

  return res.json({
    articles,
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
  if (!body.title || !body.slug) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Article 'title' and 'slug' are required fields.",
    )
  }

  const payload = {
    slug: body.slug,
    title: body.title,
    subtitle: body.subtitle || "",
    abstract: body.abstract || "",
    category: body.category || "Laboratory Methodology",
    compound_tag: body.compound_tag || "Peptide",
    reading_time: body.reading_time || "5 min read",
    reviewed_by: body.reviewed_by || "Scientific Review Board",
    status: body.status || "draft",
    published_at: body.status === "published" ? (body.published_at || new Date().toISOString()) : null,
    sections: body.sections || [],
    citations: body.citations || [],
    referenced_compound: body.referenced_compound || null,
    metadata: body.metadata || null,
  }

  const { result: article } = await createResearchArticleWorkflow(req.scope).run({
    input: payload,
  })

  return res.status(201).json({ article })
}
