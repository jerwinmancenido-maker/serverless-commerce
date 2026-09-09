/**
 * @file    apps/backend/src/api/admin/research-articles/[id]/route.ts
 * @module  AdminResearchArticleItemRoute
 * @purpose Admin endpoint for retrieving, updating, and deleting a scientific article by ID.
 * @contracts
 *   API:      GET/POST/DELETE /admin/research-articles/:id
 *   Workflow: updateResearchArticleWorkflow · deleteResearchArticleWorkflow
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../modules/research-content/service"
import {
  deleteResearchArticleWorkflow,
  updateResearchArticleWorkflow,
} from "../../../../workflows/manage-research-library"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const { id } = req.params
  const article = await service.retrieveResearchArticle(id)

  if (!article) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Research article '${id}' not found.`,
    )
  }

  return res.json({ article })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const { id } = req.params
  const body = req.body as Record<string, any>

  const existing = await service.retrieveResearchArticle(id)
  if (!existing) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Research article '${id}' not found.`,
    )
  }

  const updateData: Record<string, any> = { id }
  const fields = [
    "slug",
    "title",
    "subtitle",
    "abstract",
    "category",
    "compound_tag",
    "reading_time",
    "reviewed_by",
    "status",
    "sections",
    "citations",
    "referenced_compound",
    "metadata",
  ]

  for (const f of fields) {
    if (body[f] !== undefined) {
      updateData[f] = body[f]
    }
  }

  if (body.status === "published" && !existing.published_at) {
    updateData.published_at = new Date().toISOString()
  } else if (body.status === "draft") {
    updateData.published_at = null
  }

  const { result: updated } = await updateResearchArticleWorkflow(req.scope).run({
    input: updateData as any,
  })

  return res.json({ article: updated })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { id } = req.params
  const { result } = await deleteResearchArticleWorkflow(req.scope).run({
    input: { id },
  })

  return res.json(result)
}
