/**
 * @file    apps/backend/src/api/admin/peptide-comparisons/[id]/route.ts
 * @module  AdminPeptideComparisonItemRoute
 * @purpose Admin endpoint for retrieving, updating, and deleting a head-to-head comparison by ID.
 * @contracts
 *   API:      GET/POST/DELETE /admin/peptide-comparisons/:id
 *   Workflow: updatePeptideComparisonWorkflow · deletePeptideComparisonWorkflow
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../modules/research-content/service"
import {
  deletePeptideComparisonWorkflow,
  updatePeptideComparisonWorkflow,
} from "../../../../workflows/manage-research-library"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  const { id } = req.params
  const comparison = await service.retrievePeptideComparison(id)

  if (!comparison) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Peptide comparison '${id}' not found.`,
    )
  }

  return res.json({ comparison })
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

  const existing = await service.retrievePeptideComparison(id)
  if (!existing) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Peptide comparison '${id}' not found.`,
    )
  }

  const updateData: Record<string, any> = { id }
  const fields = [
    "slug",
    "title",
    "subtitle",
    "category",
    "compound_a",
    "compound_b",
    "summary",
    "synergy_verdict",
    "vectors",
    "citations",
    "status",
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

  const { result: updated } = await updatePeptideComparisonWorkflow(req.scope).run({
    input: updateData as any,
  })

  return res.json({ comparison: updated })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { id } = req.params
  const { result } = await deletePeptideComparisonWorkflow(req.scope).run({
    input: { id },
  })

  return res.json(result)
}
