/**
 * @file    apps/backend/src/api/admin/peptide-stack-interactions/route.ts
 * @module  AdminPeptideStackInteractionsRoute
 * @purpose Admin endpoint for inspecting and creating peptide interaction matrices, pairwise synergy scores, and preset research stacks.
 * @contracts
 *   API:     GET /admin/peptide-stack-interactions · POST /admin/peptide-stack-interactions
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import crypto from "crypto"

function getStoragePath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "apps/backend/data/peptide-stack-interactions.json"),
    path.resolve(process.cwd(), "data/peptide-stack-interactions.json"),
    path.resolve(__dirname, "../../../../data/peptide-stack-interactions.json"),
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

  // Ensure every interaction has an id
  if (Array.isArray(data.pairwise_interactions)) {
    data.pairwise_interactions.forEach((item: any) => {
      if (!item.id) {
        item.id = `${item.compound_a}_${item.compound_b}`
      }
    })
  }

  return { data, filePath }
}

function saveData(data: any, filePath: string) {
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data } = loadData()

  const compoundId = (req.query.compound_id as string | undefined)?.toLowerCase().trim()
  const search = (req.query.search as string | undefined)?.toLowerCase().trim()
  const category = (req.query.category as string | undefined)?.toLowerCase().trim()

  let compounds = data.compounds || []
  let interactions = data.pairwise_interactions || []
  let presets = data.presets || []

  if (compoundId) {
    interactions = interactions.filter(
      (rule: any) =>
        rule.compound_a?.toLowerCase() === compoundId ||
        rule.compound_b?.toLowerCase() === compoundId
    )
    presets = presets.filter((p: any) =>
      p.compound_ids?.some((id: string) => id.toLowerCase() === compoundId)
    )
  }

  if (category && category !== "all") {
    compounds = compounds.filter(
      (c: any) => c.category?.toLowerCase() === category
    )
  }

  if (search) {
    compounds = compounds.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(search) ||
        c.shortName?.toLowerCase().includes(search) ||
        c.targetReceptor?.toLowerCase().includes(search)
    )
    interactions = interactions.filter(
      (rule: any) =>
        rule.title?.toLowerCase().includes(search) ||
        rule.mechanismSummary?.toLowerCase().includes(search) ||
        rule.compound_a?.toLowerCase().includes(search) ||
        rule.compound_b?.toLowerCase().includes(search)
    )
    presets = presets.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(search) ||
        p.summary?.toLowerCase().includes(search)
    )
  }

  return res.json({
    version: data.version,
    compounds,
    pairwise_interactions: interactions,
    presets,
    count: {
      compounds: compounds.length,
      interactions: interactions.length,
      presets: presets.length,
    },
  })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const body = req.body as any

  if (!body) {
    return res.status(400).json({ message: "Request body required" })
  }

  if (!body.compound_a || !body.compound_b || !body.title) {
    return res.status(400).json({ message: "Compound A, Compound B, and Title are required" })
  }

  const id = body.id || `${body.compound_a}_${body.compound_b}`

  const newRule = {
    id,
    compound_a: body.compound_a,
    compound_b: body.compound_b,
    status: body.status || "synergistic",
    score: Number(body.score) || 85,
    title: body.title,
    mechanismSummary: body.mechanismSummary || "",
    timingProtocol: body.timingProtocol || "",
    safetyRule: body.safetyRule || "",
    citation: body.citation || "",
    stackedProtocol: body.stackedProtocol || {
      cycleLength: body.cycleLength || "8 weeks",
      washout: body.washout || "4 weeks",
      morningDose: body.morningDose || "",
      eveningDose: body.eveningDose || "",
      weeklySchedule: body.weeklySchedule || "Daily",
      syringeHandling: body.syringeHandling || "Separate sterile syringes",
    },
  }

  // Check if exists and replace or append
  const index = (data.pairwise_interactions || []).findIndex(
    (item: any) => item.id === id || (item.compound_a === body.compound_a && item.compound_b === body.compound_b)
  )

  if (index >= 0) {
    data.pairwise_interactions[index] = newRule
  } else {
    data.pairwise_interactions = [newRule, ...(data.pairwise_interactions || [])]
  }

  saveData(data, filePath)
  return res.status(201).json({ interaction: newRule, message: "Stack interaction rule saved" })
}
