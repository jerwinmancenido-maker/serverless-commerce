/**
 * @file    apps/storefront/src/modules/custom-kit-builder/utils/stoichiometry.ts
 * @module  CustomKitStoichiometry
 * @purpose Stoichiometric calibration, cycle supply sizing, and commercial bundle pricing for custom kits.
 * @contracts
 *   Functions: calculateStoichiometry · calculateCycleSupplies · calculateBundlePricing · parseNetMassMg
 */

import type {
  BundlePricingSummary,
  CycleSupplySummary,
  KitCompoundConfig,
  KitPackagingTier,
  SlotCostBreakdown,
  StoichiometryMetrics,
} from "../types"

/**
 * Extracts net compound mass in milligrams from title or variant string.
 * e.g. "Tirzepatide 10MG" -> 10, "BPC-157 5mg" -> 5, "Glutathione 1500mg" -> 1500.
 */
export function parseNetMassMg(productTitle: string, variantTitle?: string): number {
  const combined = `${productTitle} ${variantTitle || ""}`.toLowerCase()
  const match = combined.match(/(\d+(?:\.\d+)?)\s*(?:mg|milligram)/i)
  if (match && match[1]) {
    const parsed = parseFloat(match[1])
    if (parsed > 0) return parsed
  }
  return 10 // Fallback sensible default for peptide vials
}

/**
 * Calculates in-vitro concentration and U-100 syringe volumetric draw.
 */
export function calculateStoichiometry({
  netMassMg,
  diluentVolumeMl,
  targetDoseMcg,
}: {
  netMassMg: number
  diluentVolumeMl: number
  targetDoseMcg: number
}): StoichiometryMetrics {
  const safeMass = Math.max(0.1, netMassMg)
  const safeDiluent = Math.max(0.1, diluentVolumeMl)
  const safeDose = Math.max(1, targetDoseMcg)

  // C = Mass (mg) / Volume (mL)
  const concentrationMgMl = safeMass / safeDiluent
  const concentrationMcgMl = concentrationMgMl * 1000

  // Dose Volume = Dose (mcg) / Concentration (mcg/mL)
  const doseVolumeMl = safeDose / concentrationMcgMl

  // U-100 syringe: 1 mL = 100 units
  const syringeUnits = Number((doseVolumeMl * 100).toFixed(1))

  // 1 tick = 1 unit on U-100 = 0.01 mL
  const concentrationMcgPerTick = Number((concentrationMcgMl * 0.01).toFixed(1))

  const isOverCapacity = syringeUnits > 100

  return {
    concentrationMgMl: Number(concentrationMgMl.toFixed(2)),
    concentrationMcgPerTick,
    doseVolumeMl: Number(doseVolumeMl.toFixed(4)),
    syringeUnits,
    isOverCapacity,
  }
}

/**
 * Calculates physical inventory supplies required for a complete research cycle.
 * Incorporates a 10% safety buffer for needle dead-space and vial meniscus residue.
 */
export function calculateCycleSupplies({
  netMassMg,
  targetDoseMcg,
  frequencyPerWeek,
  cycleWeeks,
  packagingTier,
}: {
  netMassMg: number
  targetDoseMcg: number
  frequencyPerWeek: number
  cycleWeeks: number
  packagingTier: KitPackagingTier
}): CycleSupplySummary {
  const safeWeeks = Math.max(1, cycleWeeks)
  const safeFrequency = Math.max(1, frequencyPerWeek)
  const totalDoses = safeFrequency * safeWeeks

  const totalMgNeeded = Number(((totalDoses * targetDoseMcg) / 1000).toFixed(2))

  // 10% research buffer for dead space / residual reconstitution volume
  const bufferedMg = totalMgNeeded * 1.1
  const vialsRequired = Math.max(1, Math.ceil(bufferedMg / Math.max(1, netMassMg)))

  const diluentVialsRequired = packagingTier !== "vial_only" ? vialsRequired : 0

  // 1 syringe and alcohol pad per scheduled dose + 10% buffer
  const syringesRequired =
    packagingTier === "complete_subq"
      ? totalDoses + Math.ceil(totalDoses * 0.1)
      : 0

  const alcoholPadsRequired =
    packagingTier === "complete_subq"
      ? totalDoses + Math.ceil(totalDoses * 0.1)
      : 0

  return {
    cycleWeeks: safeWeeks,
    totalDoses,
    totalMgNeeded,
    vialsRequired,
    diluentVialsRequired,
    syringesRequired,
    alcoholPadsRequired,
  }
}

/**
 * Resolves packaging tier incremental cost per vial in PHP.
 */
export function getPackagingAddonPrice(tier: KitPackagingTier): number {
  switch (tier) {
    case "vial_bac":
      return 350 // 10mL Bacteriostatic Water USP
    case "complete_subq":
      return 750 // 10mL BAC Water + 10x U-100 Syringes + 10x IPA Swabs + Thermal Mailer
    case "vial_only":
    default:
      return 0
  }
}

/**
 * Computes multi-vial commercial bundle pricing with tiered savings.
 * 2 Vials = 10% Multi-Vial Savings
 * 3+ Vials = 15% Sovereign Stack Savings
 */
export function calculateBundlePricing({
  configs,
  cycleWeeks,
}: {
  configs: KitCompoundConfig[]
  cycleWeeks: number
}): BundlePricingSummary {
  const items: SlotCostBreakdown[] = []
  let grossTotal = 0

  for (const config of configs) {
    const supplies = calculateCycleSupplies({
      netMassMg: config.netMassMg,
      targetDoseMcg: config.targetDoseMcg,
      frequencyPerWeek: config.frequencyPerWeek,
      cycleWeeks,
      packagingTier: config.packagingTier,
    })

    // Extract unit price in PHP from variant if available, otherwise fallback
    const calculatedPrice = config.variant?.calculated_price?.calculated_amount
    const rawPrice = typeof calculatedPrice === "number" ? calculatedPrice : 3250

    const packagingAddon = getPackagingAddonPrice(config.packagingTier)
    const unitTotal = rawPrice + packagingAddon
    const slotGross = unitTotal * supplies.vialsRequired

    grossTotal += slotGross

    items.push({
      slotId: config.slotId,
      title: config.product.title,
      variantTitle: config.variant.title || `${config.netMassMg}MG`,
      baseUnitVialPrice: rawPrice,
      packagingAddonPerVial: packagingAddon,
      vialsRequired: supplies.vialsRequired,
      slotGrossTotal: slotGross,
    })
  }

  // Tier Discount: 2 compounds = 10%, 3+ compounds = 15%
  const compoundCount = configs.length
  let discountPercent = 0
  let savingsLabel = "Standard Catalog Price"

  if (compoundCount === 2) {
    discountPercent = 10
    savingsLabel = "10% Multi-Compound Bundle Savings"
  } else if (compoundCount >= 3) {
    discountPercent = 15
    savingsLabel = "15% Sovereign Multi-Vial Stack Savings"
  }

  const discountAmount = Math.round((grossTotal * discountPercent) / 100)
  const bundleNetTotal = grossTotal - discountAmount

  return {
    items,
    grossTotal,
    discountPercent,
    discountAmount,
    bundleNetTotal,
    savingsLabel,
  }
}
