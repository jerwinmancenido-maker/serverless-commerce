/**
 * @file apps/backend/src/api/store/peptide-stack-interactions/route.ts
 * @module StorefrontAPI · PeptideStackInteractions
 * @purpose Public storefront endpoint providing dynamic peptide stacking compatibility rules,
 *          pharmacological interaction matrices, and compatible partner discovery.
 * @contracts GET /store/peptide-stack-interactions?compound_id=&search=&category=
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export interface CompoundProfile {
  id: string
  name: string
  shortName: string
  category: string
  targetReceptor: string
  primaryPathway: string
  adminRoute: string
  optimalTiming: string
  halfLife: string
  protocolHandle?: string
}

export interface PairwiseInteraction {
  compound_a: string
  compound_b: string
  status: "synergistic" | "compatible" | "contraindicated"
  score: number
  title: string
  mechanismSummary: string
  timingProtocol: string
  safetyRule: string
  citation?: string
  stackedProtocol?: {
    cycleLength?: string
    washout?: string
    morningDose?: string
    eveningDose?: string
    weeklySchedule?: string
    syringeHandling?: string
  }
}

export interface PresetStack {
  id: string
  name: string
  tag: string
  compound_ids: string[]
  summary: string
  idealCycleWeeks: number
  bundleDiscountPercent: number
}

interface StackingData {
  version: string
  compounds: CompoundProfile[]
  pairwise_interactions: PairwiseInteraction[]
  presets: PresetStack[]
}

let cachedData: StackingData | null = null

function loadStackingData(): StackingData {
  if (cachedData) {
    return cachedData
  }

  const filePath = path.resolve(
    process.cwd(),
    "data/peptide-stack-interactions.json",
  )

  if (!fs.existsSync(filePath)) {
    // Fallback path resolution
    const altPath = path.resolve(
      __dirname,
      "../../../../data/peptide-stack-interactions.json",
    )
    if (fs.existsSync(altPath)) {
      const raw = fs.readFileSync(altPath, "utf-8")
      cachedData = JSON.parse(raw)
      return cachedData!
    }
    return {
      version: "1.0",
      compounds: [],
      pairwise_interactions: [],
      presets: [],
    }
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  cachedData = JSON.parse(raw)
  return cachedData!
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const data = loadStackingData()

  const compoundId = (req.query.compound_id as string | undefined)?.toLowerCase().trim()
  const searchQuery = (req.query.search as string | undefined)?.toLowerCase().trim()
  const category = (req.query.category as string | undefined)?.toLowerCase().trim()

  let filteredCompounds = [...data.compounds]

  // Filter by category if requested
  if (category) {
    filteredCompounds = filteredCompounds.filter((c) =>
      c.category.toLowerCase().includes(category),
    )
  }

  // Filter by search query if requested
  if (searchQuery) {
    filteredCompounds = filteredCompounds.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery) ||
        c.shortName.toLowerCase().includes(searchQuery) ||
        c.targetReceptor.toLowerCase().includes(searchQuery) ||
        c.primaryPathway.toLowerCase().includes(searchQuery) ||
        c.category.toLowerCase().includes(searchQuery),
    )
  }

  // Compute compatible partners if compound_id is provided
  let compatiblePartners: Array<{
    compound: CompoundProfile
    status: "synergistic" | "compatible" | "contraindicated"
    score: number
    title: string
    mechanismSummary: string
    timingProtocol: string
    safetyRule: string
    citation?: string
    stackedProtocol?: PairwiseInteraction["stackedProtocol"]
  }> = []

  if (compoundId) {
    const baseCompound = data.compounds.find((c) => c.id === compoundId)
    if (baseCompound) {
      for (const other of data.compounds) {
        if (other.id === compoundId) continue

        // Check if there is an explicit interaction rule
        const rule = data.pairwise_interactions.find(
          (r) =>
            (r.compound_a === compoundId && r.compound_b === other.id) ||
            (r.compound_a === other.id && r.compound_b === compoundId),
        )

        if (rule) {
          compatiblePartners.push({
            compound: other,
            status: rule.status,
            score: rule.score,
            title: rule.title,
            mechanismSummary: rule.mechanismSummary,
            timingProtocol: rule.timingProtocol,
            safetyRule: rule.safetyRule,
            citation: rule.citation,
            stackedProtocol: rule.stackedProtocol,
          })
        } else {
          // Default compatible if no negative contraindication is noted
          compatiblePartners.push({
            compound: other,
            status: "compatible",
            score: 82,
            title: "Compatible Multi-Peptide Co-Administration",
            mechanismSummary: `These two compounds (${baseCompound.shortName} and ${other.shortName}) operate through distinct receptor pathways without direct competitive antagonism. They may be co-administered in a coordinated research cycle with proper timing.`,
            timingProtocol: `Administer each according to its optimal timing schedule (${baseCompound.optimalTiming} vs ${other.optimalTiming}).`,
            safetyRule: "Prepare in separate sterile vials. Never combine two different reconstituted solutions in the same syringe.",
          })
        }
      }

      // Sort partners: Synergistic first (by score DESC), then Compatible (by score DESC), then Contraindicated last
      compatiblePartners.sort((a, b) => {
        const order = { synergistic: 1, compatible: 2, contraindicated: 3 }
        if (order[a.status] !== order[b.status]) {
          return order[a.status] - order[b.status]
        }
        return b.score - a.score
      })
    }
  }

  res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600")

  return res.json({
    version: data.version,
    compounds: filteredCompounds,
    pairwise_interactions: data.pairwise_interactions,
    presets: data.presets,
    compatible_partners: compoundId ? compatiblePartners : undefined,
    count: filteredCompounds.length,
  })
}
