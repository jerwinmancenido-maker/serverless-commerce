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
    label: "⚡ SubQ Injection Kit",
    description: "Vial + 10 mL BAC Water + 1 cc Syringes + Alcohol Pads",
    icon: "💉",
  },
  bac: {
    id: "bac",
    name: "BAC Reconstitution Only",
    label: "⚡ BAC Water Only",
    description: "Vial + 10 mL BAC Water",
    icon: "💧",
  },
  vial: {
    id: "vial",
    name: "Vial Only",
    label: "⚡ Vial Only",
    description: "Single finished vial without additional supplies",
    icon: "🧪",
  },
}

/**
 * Detects the recommended kit type from the variant's title.
 */
export function detectKitTypeFromTitle(title: string): KitType {
  const lower = title.toLowerCase()

  if (
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
