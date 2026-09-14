/**
 * @file apps/storefront/src/lib/data/stack-interactions.ts
 * @module StackInteractionsData
 * @purpose Storefront data access layer for dynamic peptide stacking compatibility,
 *          pharmacological interaction matrices, and co-administration protocols.
 * @contracts API: GET /store/peptide-stack-interactions
 */

import { sdk } from "@lib/config"
import staticStackingData from "./peptide-stack-interactions.json"

export type CompatibilityStatus = "synergistic" | "compatible" | "contraindicated"

export interface StackCompoundProfile {
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

export interface StackedProtocolDetails {
  cycleLength?: string
  washout?: string
  morningDose?: string
  eveningDose?: string
  weeklySchedule?: string
  syringeHandling?: string
}

export interface StackPairwiseRule {
  compound_a: string
  compound_b: string
  status: CompatibilityStatus
  score: number
  title: string
  mechanismSummary: string
  timingProtocol: string
  safetyRule: string
  citation?: string
  stackedProtocol?: StackedProtocolDetails
}

export interface StackPreset {
  id: string
  name: string
  tag: string
  compound_ids: string[]
  summary: string
  idealCycleWeeks: number
  bundleDiscountPercent: number
}

export interface CompatiblePartnerRecommendation {
  compound: StackCompoundProfile
  status: CompatibilityStatus
  score: number
  title: string
  mechanismSummary: string
  timingProtocol: string
  safetyRule: string
  citation?: string
  stackedProtocol?: StackedProtocolDetails
}

export interface StackCompatibilityEvaluation {
  status: CompatibilityStatus
  overallScore: number
  summary: string
  title: string
  pairwiseDetails: Array<{
    pair: [StackCompoundProfile, StackCompoundProfile]
    rule: StackPairwiseRule
  }>
  contraindications: string[]
  combinedProtocol?: StackedProtocolDetails
}

interface StackingDataResponse {
  version: string
  compounds: StackCompoundProfile[]
  pairwise_interactions: StackPairwiseRule[]
  presets: StackPreset[]
  compatible_partners?: CompatiblePartnerRecommendation[]
  count: number
}

/**
 * Fetch the complete dynamic stacking catalog from Medusa Backend API
 * with fallback to local static data cache.
 */
export async function getPeptideStackCatalog(params?: {
  compound_id?: string
  search?: string
  category?: string
}): Promise<StackingDataResponse> {
  const queryParams = new URLSearchParams()
  if (params?.compound_id) queryParams.set("compound_id", params.compound_id)
  if (params?.search) queryParams.set("search", params.search)
  if (params?.category) queryParams.set("category", params.category)

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  try {
    const response = await sdk.client.fetch<StackingDataResponse>(
      `/store/peptide-stack-interactions${queryString}`,
      {
        method: "GET",
        next: { revalidate: 120 },
      }
    )

    if (response && response.compounds && response.compounds.length > 0) {
      return response
    }
  } catch (err) {
    console.warn(
      "[getPeptideStackCatalog] Medusa API call failed or warming up, falling back to static cache:",
      err
    )
  }

  // Fallback to static seed data
  const data = staticStackingData as unknown as StackingDataResponse
  let compounds = [...data.compounds]

  if (params?.category) {
    const cat = params.category.toLowerCase()
    compounds = compounds.filter((c) => c.category.toLowerCase().includes(cat))
  }

  if (params?.search) {
    const q = params.search.toLowerCase()
    compounds = compounds.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.targetReceptor.toLowerCase().includes(q) ||
        c.primaryPathway.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }

  return {
    version: data.version,
    compounds,
    pairwise_interactions: data.pairwise_interactions,
    presets: data.presets,
    count: compounds.length,
  }
}

/**
 * Evaluate pairwise interaction between any two compound IDs dynamically.
 */
export function evaluatePairwiseInteraction(
  compAId: string,
  compBId: string,
  pairwiseRules: StackPairwiseRule[],
  compounds: StackCompoundProfile[]
): StackPairwiseRule {
  const compA = compounds.find((c) => c.id === compAId)
  const compB = compounds.find((c) => c.id === compBId)
  const nameA = compA?.shortName || compAId
  const nameB = compB?.shortName || compBId

  // Check matching rule (either order)
  const rule = pairwiseRules.find(
    (r) =>
      (r.compound_a === compAId && r.compound_b === compBId) ||
      (r.compound_a === compBId && r.compound_b === compAId)
  )

  if (rule) {
    return rule
  }

  // Default Compatible if not explicitly contraindicated
  return {
    compound_a: compAId,
    compound_b: compBId,
    status: "compatible",
    score: 82,
    title: "Compatible Multi-Peptide Co-Administration",
    mechanismSummary: `These two compounds (${nameA} and ${nameB}) operate through distinct receptor pathways without direct competitive antagonism. They may be co-administered in a coordinated research cycle with proper timing separation.`,
    timingProtocol: `Administer each according to its optimal timing schedule (${compA?.optimalTiming || "Morning"} vs ${compB?.optimalTiming || "Evening"}). Avoid mixing in the same syringe; rotate anatomical injection sites.`,
    safetyRule:
      "Maintain separate reconstituted vials and verify individual tolerance before initiating co-administration.",
  }
}

/**
 * Find all compatible and synergistic stacking partners for an active compound
 */
export function getCompatiblePartnersForCompound(
  compoundId: string,
  compounds: StackCompoundProfile[],
  pairwiseRules: StackPairwiseRule[]
): CompatiblePartnerRecommendation[] {
  const base = compounds.find((c) => c.id === compoundId)
  if (!base) return []

  const partners: CompatiblePartnerRecommendation[] = []

  for (const other of compounds) {
    if (other.id === compoundId) continue

    const rule = evaluatePairwiseInteraction(
      compoundId,
      other.id,
      pairwiseRules,
      compounds
    )

    partners.push({
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
  }

  // Sort: Synergistic first (score DESC), then Compatible (score DESC), Contraindicated last
  partners.sort((a, b) => {
    const order: Record<CompatibilityStatus, number> = {
      synergistic: 1,
      compatible: 2,
      contraindicated: 3,
    }
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status]
    }
    return b.score - a.score
  })

  return partners
}

/**
 * Evaluates an entire multi-compound stack (2 to 4 compounds)
 */
export function evaluateMultiCompoundStack(
  compoundIds: string[],
  compounds: StackCompoundProfile[],
  pairwiseRules: StackPairwiseRule[]
): StackCompatibilityEvaluation {
  if (compoundIds.length <= 1) {
    const single = compounds.find((c) => c.id === compoundIds[0])
    return {
      status: "compatible",
      overallScore: 100,
      title: single ? `${single.name} Solo Protocol` : "Select Compounds",
      summary: "Add at least two separate products to evaluate stack compatibility, receptor synergy, and combined administration protocols.",
      pairwiseDetails: [],
      contraindications: [],
    }
  }

  const pairwiseDetails: Array<{
    pair: [StackCompoundProfile, StackCompoundProfile]
    rule: StackPairwiseRule
  }> = []

  const contraindications: string[] = []
  let totalScore = 0
  let pairCount = 0
  let hasContraindicated = false
  let hasSynergistic = false
  let combinedProtocol: StackedProtocolDetails | undefined

  for (let i = 0; i < compoundIds.length; i++) {
    for (let j = i + 1; j < compoundIds.length; j++) {
      const idA = compoundIds[i]
      const idB = compoundIds[j]
      const compA = compounds.find((c) => c.id === idA)
      const compB = compounds.find((c) => c.id === idB)

      if (compA && compB) {
        const rule = evaluatePairwiseInteraction(idA, idB, pairwiseRules, compounds)
        pairwiseDetails.push({ pair: [compA, compB], rule })
        totalScore += rule.score
        pairCount++

        if (rule.status === "contraindicated") {
          hasContraindicated = true
          contraindications.push(`${compA.shortName} + ${compB.shortName}: ${rule.mechanismSummary}`)
        } else if (rule.status === "synergistic") {
          hasSynergistic = true
          if (rule.stackedProtocol && !combinedProtocol) {
            combinedProtocol = rule.stackedProtocol
          }
        }
      }
    }
  }

  const overallScore = pairCount > 0 ? Math.round(totalScore / pairCount) : 80

  let status: CompatibilityStatus = "compatible"
  let title = "Compatible Multi-Peptide Stack"
  let summary = "The selected products operate along non-interfering physiological pathways and can be safely co-administered with separate sterile syringes and staggered timing."

  if (hasContraindicated) {
    status = "contraindicated"
    title = "Contraindicated or Redundant Combination Detected"
    summary = "One or more compound pairs compete for identical receptors or risk amplified adverse reactions. Co-administration is strongly discouraged."
  } else if (hasSynergistic) {
    status = "synergistic"
    title = "Synergistic Multi-Pathway Amplification"
    summary = "The selected products exert complementary pharmacological actions across distinct receptor targets, producing therapeutic effects superior to either agent alone."
  }

  return {
    status,
    overallScore,
    title,
    summary,
    pairwiseDetails,
    contraindications,
    combinedProtocol,
  }
}

export interface AdministrationSopRule {
  step: number
  title: string
  rule: string
  colorTheme: "rose" | "emerald" | "sky" | "amber"
}

export const FOUR_GOLDEN_RULES_SOP: AdministrationSopRule[] = [
  {
    step: 1,
    title: "Strict Vial Segregation",
    rule: "Never mix dry powders or combine reconstituted solutions into one vial. Peptides carry distinct isoelectric points (pI). Combining solutions alters pH, precipitating peptide aggregation and enzymatic cleavage.",
    colorTheme: "rose",
  },
  {
    step: 2,
    title: "Separate Sterile Syringes",
    rule: "Always draw each compound with a fresh sterile 31G U-100 syringe. Never double-dip a needle between two separate peptide vials to prevent needle coring and cross-vial contamination.",
    colorTheme: "emerald",
  },
  {
    step: 3,
    title: "Anatomical Site Spacing",
    rule: "When administering multiple subcutaneous compounds in the same time window, space injection sites at least 2 inches (5 cm) apart (e.g. left vs right abdomen) to optimize localized microvascular uptake.",
    colorTheme: "sky",
  },
  {
    step: 4,
    title: "Diurnal Chronopharmacology",
    rule: "Align each compound with circadian endocrine rhythms: Fasted morning for lipolytics (AOD-9604, Retatrutide), and pre-bed (strictly ≥2h fasted) for GH secretagogues (CJC-1295, Ipamorelin) to sync with nocturnal slow-wave sleep.",
    colorTheme: "amber",
  },
]

