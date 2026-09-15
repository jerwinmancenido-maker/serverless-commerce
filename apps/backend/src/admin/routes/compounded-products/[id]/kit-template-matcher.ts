/**
 * @file    apps/backend/src/admin/routes/compounded-products/[id]/kit-template-matcher.ts
 * @module  KitTemplateMatcher (Admin Extension)
 * @purpose Auto-matches component inventory and Bill of Materials recipes, and orders variants by clinical dosage and kit tier.
 * @contracts
 *   Route: /compounded-products/:id
 */

import type { HttpTypes } from "@medusajs/types"
import type { ComponentProfile } from "../types"

export type KitType = "subq" | "bac" | "vial"

export type KitTemplateDefinition = {
  id: KitType
  name: string
  label: string
  description: string
  icon: string
}

export const KIT_TEMPLATES: Record<KitType, KitTemplateDefinition> = {
  subq: {
    id: "subq",
    name: "SubQ Injection Kit",
    label: "SubQ Injection Kit",
    description: "Vial + 10 mL BAC Water + 1 cc Syringes + Alcohol Pads",
    icon: "subq",
  },
  bac: {
    id: "bac",
    name: "BAC Reconstitution Only",
    label: "BAC Water Only",
    description: "Vial + 10 mL BAC Water",
    icon: "bac",
  },
  vial: {
    id: "vial",
    name: "Vial Only",
    label: "Vial Only",
    description: "Single finished vial without additional supplies",
    icon: "vial",
  },
}

/**
 * Standard reference component acquisition costs (in PHP) for unit economics modeling.
 */
export function estimateComponentUnitCost(title: string, classification?: string): number {
  const lower = title.toLowerCase()
  if (classification === "finished_product" || lower.includes("vial") || lower.includes("lyophilized")) {
    return 450
  }
  if (lower.includes("bac") || lower.includes("water") || lower.includes("diluent")) {
    return 120
  }
  if (lower.includes("syringe") || lower.includes("needle") || lower.includes("lds")) {
    return 15
  }
  if (lower.includes("pad") || lower.includes("alcohol") || lower.includes("swab")) {
    return 2.5
  }
  if (classification === "packaging" || lower.includes("box") || lower.includes("mailer")) {
    return 45
  }
  return 50
}

export type ComponentRole =
  | "finished_product"
  | "diluent"
  | "syringe"
  | "sanitization"
  | "packaging"
  | "other"

/**
 * Categorizes a BOM component into its functional clinical kit role.
 */
export function detectComponentRole(
  title: string,
  classification?: string,
): ComponentRole {
  const lower = title.toLowerCase()
  if (
    classification === "finished_product" ||
    lower.includes("vial") ||
    lower.includes("lyophilized") ||
    lower.includes("mg") ||
    lower.includes("mcg")
  ) {
    return "finished_product"
  }
  if (
    lower.includes("bac") ||
    lower.includes("water") ||
    lower.includes("diluent") ||
    lower.includes("saline")
  ) {
    return "diluent"
  }
  if (
    lower.includes("syringe") ||
    lower.includes("needle") ||
    lower.includes("lds") ||
    lower.includes("0.3ml") ||
    lower.includes("0.5ml") ||
    lower.includes("1cc") ||
    lower.includes("3cc")
  ) {
    return "syringe"
  }
  if (
    lower.includes("pad") ||
    lower.includes("alcohol") ||
    lower.includes("swab") ||
    lower.includes("prep")
  ) {
    return "sanitization"
  }
  if (
    classification === "packaging" ||
    lower.includes("box") ||
    lower.includes("mailer") ||
    lower.includes("mailer box") ||
    lower.includes("protective")
  ) {
    return "packaging"
  }
  return "other"
}

/**
 * Detects the recommended kit type from the variant's title.
 */
export function detectKitTypeFromTitle(title: string): KitType {
  const lower = title.toLowerCase()

  if (
    lower.includes("analytical") ||
    lower.includes("lab set") ||
    lower.includes("subq") ||
    lower.includes("complete") ||
    lower.includes("injection kit") ||
    lower.includes("set")
  ) {
    return "subq"
  }

  if (
    lower.includes("bac") ||
    lower.includes("pharma bac") ||
    lower.includes("reconstitution")
  ) {
    return "bac"
  }

  return "vial"
}

export type RecipeRow = {
  inventoryItemId: string
  requiredDisplayAmount: string
}

/**
 * Resolves recipe rows for a given kit type based on available component profiles and inventory items.
 */
export function resolveKitRecipeRows({
  kitType,
  variantTitle,
  profiles,
  inventoryById,
}: {
  kitType: KitType
  variantTitle: string
  profiles: ComponentProfile[]
  inventoryById: Map<string, HttpTypes.AdminInventoryItem>
}): RecipeRow[] {
  const rows: RecipeRow[] = []

  // 1. Resolve the Finished Product component
  const finishedProfiles = profiles.filter(
    (p) => p.classification === "finished_product",
  )

  let matchedFinishedProfile: ComponentProfile | undefined

  if (finishedProfiles.length > 0) {
    // Try to match variant strength in the title (e.g. 10mg, 20mg, 50mg)
    const lowerVariant = variantTitle.toLowerCase()
    const strengthMatch = lowerVariant.match(/\b(\d+)\s*(mg|mcg|g)\b/)

    if (strengthMatch) {
      const strength = strengthMatch[0].replace(/\s+/g, "")
      matchedFinishedProfile = finishedProfiles.find((p) => {
        const itemTitle = (
          inventoryById.get(p.inventory_item_id)?.title || ""
        ).toLowerCase()
        return itemTitle.includes(strength)
      })
    }

    if (!matchedFinishedProfile) {
      matchedFinishedProfile = finishedProfiles[0]
    }
  } else if (profiles.length > 0) {
    // Fallback: search for item with 'vial' in title
    matchedFinishedProfile =
      profiles.find((p) => {
        const title = (
          inventoryById.get(p.inventory_item_id)?.title || ""
        ).toLowerCase()
        return title.includes("vial") || title.includes("finished")
      }) || profiles[0]
  }

  if (matchedFinishedProfile) {
    rows.push({
      inventoryItemId: matchedFinishedProfile.inventory_item_id,
      requiredDisplayAmount: "1",
    })
  }

  // 2. If 'vial' only, return the finished vial
  if (kitType === "vial") {
    return rows
  }

  // Helper to find inventory item by title keywords
  const findItemByKeywords = (keywords: string[]) => {
    return profiles.find((p) => {
      if (p.classification === "finished_product") return false
      const title = (
        inventoryById.get(p.inventory_item_id)?.title || ""
      ).toLowerCase()
      const category = (p.category || "").toLowerCase()
      return keywords.some((kw) => title.includes(kw) || category.includes(kw))
    })
  }

  // 3. Resolve BAC Water (for both 'bac' and 'subq')
  const bacProfile = findItemByKeywords(["bac water", "bac", "bacteriostatic"])
  if (bacProfile) {
    rows.push({
      inventoryItemId: bacProfile.inventory_item_id,
      requiredDisplayAmount: "1",
    })
  }

  // 4. Resolve Syringes & Alcohol Pads (for 'subq')
  if (kitType === "subq") {
    const syringeProfile = findItemByKeywords(["syringe", "1 cc", "1cc", "3 cc"])
    if (syringeProfile) {
      rows.push({
        inventoryItemId: syringeProfile.inventory_item_id,
        requiredDisplayAmount: "1",
      })
    }

    const alcoholProfile = findItemByKeywords(["alcohol", "pad", "swab", "prep"])
    if (alcoholProfile) {
      rows.push({
        inventoryItemId: alcoholProfile.inventory_item_id,
        requiredDisplayAmount: "1",
      })
    }
  }

  return rows
}

/**
 * Extracts numeric dosage weight in milligrams from a title string.
 * Handles formats like: 10MG, 50mg, 500mcg, 2.5mg, 1g.
 */
export function extractDosageMg(title?: string | null): number {
  if (!title) return 0
  const match = title.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|iu|ml)\b/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()

  if (unit === "mcg") return value / 1000
  if (unit === "g") return value * 1000
  return value
}

const KIT_TYPE_ORDER: Record<KitType, number> = {
  vial: 1,
  bac: 2,
  subq: 3,
}

export function getKitTypeTier(title?: string | null): number {
  if (!title) return 99
  const kitType = detectKitTypeFromTitle(title)
  return KIT_TYPE_ORDER[kitType] ?? 99
}

export function extractVariantPriceAmount(variant: {
  prices?: Array<{ amount?: number | string | null }> | null
}): number {
  if (!variant.prices || !variant.prices.length) {
    return Number.MAX_SAFE_INTEGER
  }
  const amounts = variant.prices
    .map((p) =>
      p.amount !== null && p.amount !== undefined ? Number(p.amount) : null,
    )
    .filter((a): a is number => a !== null && !isNaN(a))

  return amounts.length ? Math.min(...amounts) : Number.MAX_SAFE_INTEGER
}

/**
 * Sorts compounded product variants hierarchically:
 * 1. Dosage strength ascending (e.g. 5MG < 10MG < 50MG)
 * 2. Kit Tier progression (Vial -> Vial + BAC -> Complete SubQ Set)
 * 3. Base price ascending
 * 4. Alphabetical title fallback
 */
export function sortCompoundedProductVariants<
  T extends {
    title?: string | null
    prices?: Array<{ amount?: number | string | null }> | null
  },
>(variants: T[]): T[] {
  return [...variants].sort((a, b) => {
    const dosageA = extractDosageMg(a.title)
    const dosageB = extractDosageMg(b.title)

    if (dosageA !== dosageB) {
      if (dosageA > 0 && dosageB > 0) {
        return dosageA - dosageB
      }
      if (dosageA > 0) return -1
      if (dosageB > 0) return 1
    }

    const tierA = getKitTypeTier(a.title)
    const tierB = getKitTypeTier(b.title)

    if (tierA !== tierB) {
      return tierA - tierB
    }

    const priceA = extractVariantPriceAmount(a)
    const priceB = extractVariantPriceAmount(b)

    if (priceA !== priceB) {
      return priceA - priceB
    }

    return (a.title || "").localeCompare(b.title || "")
  })
}

