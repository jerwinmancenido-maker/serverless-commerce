/**
 * @file    apps/backend/src/api/admin/peptide-stack-interactions/[id]/route.ts
 * @module  AdminPeptideStackInteractionItemRoute
 * @purpose Admin endpoint for updating and deleting individual peptide stack interaction rules.
 * @contracts
 *   API:     GET /admin/peptide-stack-interactions/:id · POST /admin/peptide-stack-interactions/:id · DELETE /admin/peptide-stack-interactions/:id
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

function getStoragePath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "apps/backend/data/peptide-stack-interactions.json"),
    path.resolve(process.cwd(), "data/peptide-stack-interactions.json"),
    path.resolve(__dirname, "../../../../../data/peptide-stack-interactions.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  return possiblePaths[0]
}

function loadData() {
  const filePath = getStoragePath()
  let data: any = {
    version: "2026.09.11",
    compounds: [],
    pairwise_interactions: [],
    presets: [],
  }

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8")
      data = JSON.parse(raw)
    } catch (err) {
      console.error(`[AdminStackInteractions] Failed to parse ${filePath}:`, err)
    }
  }

  return { data, filePath }
}

function saveData(data: any, filePath: string) {
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data } = loadData()
  const id = req.params.id

  const rule = (data.pairwise_interactions || []).find(
    (item: any) => item.id === id || `${item.compound_a}_${item.compound_b}` === id
  )

  if (!rule) {
    return res.status(404).json({ message: "Stack interaction rule not found" })
  }

  return res.json({ interaction: rule })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const id = req.params.id
  const body = req.body as any

  if (!body) {
    return res.status(400).json({ message: "Request body required" })
  }

  let found = false
  data.pairwise_interactions = (data.pairwise_interactions || []).map((item: any) => {
    if (item.id === id || `${item.compound_a}_${item.compound_b}` === id) {
      found = true
      return {
        ...item,
        compound_a: body.compound_a ?? item.compound_a,
        compound_b: body.compound_b ?? item.compound_b,
        status: body.status ?? item.status,
        score: body.score !== undefined ? Number(body.score) : item.score,
        title: body.title ?? item.title,
        mechanismSummary: body.mechanismSummary ?? item.mechanismSummary,
        timingProtocol: body.timingProtocol ?? item.timingProtocol,
        safetyRule: body.safetyRule ?? item.safetyRule,
        citation: body.citation ?? item.citation,
        stackedProtocol: body.stackedProtocol ?? item.stackedProtocol,
      }
    }
    return item
  })

  if (!found) {
    return res.status(404).json({ message: "Stack interaction rule not found to update" })
  }

  saveData(data, filePath)
  return res.json({ message: "Stack interaction rule updated successfully" })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const id = req.params.id

  const initialCount = (data.pairwise_interactions || []).length
  data.pairwise_interactions = (data.pairwise_interactions || []).filter(
    (item: any) => item.id !== id && `${item.compound_a}_${item.compound_b}` !== id
  )

  if (data.pairwise_interactions.length === initialCount) {
    return res.status(404).json({ message: "Stack interaction rule not found to delete" })
  }

  saveData(data, filePath)
  return res.json({ message: "Stack interaction rule deleted successfully", id })
}
