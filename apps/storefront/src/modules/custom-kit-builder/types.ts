/**
 * @file    apps/storefront/src/modules/custom-kit-builder/types.ts
 * @module  CustomKitBuilderTypes
 * @purpose Type contracts for custom multi-vial peptide kit studio, stoichiometry calculations, and cart bridge.
 * @contracts
 *   Types:   KitCompoundConfig · StoichiometryMetrics · CycleSupplySummary · BundlePricingSummary
 */

import type { HttpTypes } from "@medusajs/types"

export type KitPackagingTier = "vial_only" | "vial_bac" | "complete_subq"

export interface KitCompoundConfig {
  slotId: string
  product: HttpTypes.StoreProduct
  variant: HttpTypes.StoreProductVariant
  netMassMg: number
  diluentVolumeMl: number
  targetDoseMcg: number
  packagingTier: KitPackagingTier
  frequencyPerWeek: number
}

export interface StoichiometryMetrics {
  concentrationMgMl: number
  concentrationMcgPerTick: number
  doseVolumeMl: number
  syringeUnits: number
  isOverCapacity: boolean
}

export interface CycleSupplySummary {
  cycleWeeks: number
  totalDoses: number
  totalMgNeeded: number
  vialsRequired: number
  diluentVialsRequired: number
  syringesRequired: number
  alcoholPadsRequired: number
}

export interface SlotCostBreakdown {
  slotId: string
  title: string
  variantTitle: string
  baseUnitVialPrice: number
  packagingAddonPerVial: number
  vialsRequired: number
  slotGrossTotal: number
}

export interface BundlePricingSummary {
  items: SlotCostBreakdown[]
  grossTotal: number
  discountPercent: number
  discountAmount: number
  bundleNetTotal: number
  savingsLabel: string
}
