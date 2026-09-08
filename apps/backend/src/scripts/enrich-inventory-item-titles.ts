import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { IInventoryService } from "@medusajs/framework/types"

function cleanPresentation(title: string): string {
  let cleaned = (title || "").trim()
  if (cleaned.includes("/")) {
    const [opt1, opt2] = cleaned.split("/").map((s) => s.trim())
    if (opt2) {
      return `${opt1} (${opt2.toLowerCase()})`
    }
  }
  return cleaned
}

const KNOWN_PEPTIDES: Record<string, string> = {
  GHK: "GHK-Cu",
  "GHK-CU": "GHK-Cu",
  BPC157: "BPC-157",
  TB500: "TB-500",
  CUV100: "CUV-100",
  HGH: "HGH",
  HMG: "HMG",
  PT141: "PT-141",
  DSIP: "DSIP",
  LL37: "LL-37",
}

function titleCase(str: string): string {
  const upper = str.toUpperCase()
  if (KNOWN_PEPTIDES[upper]) {
    return KNOWN_PEPTIDES[upper]
  }
  return str
    .toLowerCase()
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-")
}

export default async function enrichInventoryItemTitles({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)

  logger.info("[enrich-inventory-titles] Starting comprehensive compound name enrichment...")

  // 1. Fetch all product variants with parent product title
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "product.title"],
  })

  const variantBySku = new Map<string, { title: string; productTitle: string }>()
  for (const v of variants as any[]) {
    if (v.sku && v.product?.title) {
      variantBySku.set(v.sku.toUpperCase(), {
        title: v.title,
        productTitle: v.product.title.trim(),
      })
    }
  }

  logger.info(`[enrich-inventory-titles] Indexed ${variantBySku.size} product variants by SKU.`)

  // 2. Fetch all inventory items
  const items = await inventoryService.listInventoryItems({}, { take: 1000 })
  logger.info(`[enrich-inventory-titles] Found ${items.length} total inventory items in database.`)

  let updatedCount = 0

  for (const item of items) {
    const currentTitle = (item.title || "").trim()
    const sku = (item.sku || "").toUpperCase().trim()

    let compoundName = ""
    let presentation = cleanPresentation(currentTitle)

    // Option A: Direct match from variant SKU
    if (sku && variantBySku.has(sku)) {
      const match = variantBySku.get(sku)!
      compoundName = match.productTitle
      presentation = cleanPresentation(match.title || currentTitle)
    } else if (sku) {
      // Option B: Derive compound from SKU prefix
      if (sku.startsWith("GHK-CU")) {
        compoundName = "GHK-Cu"
        presentation = "Finished Vial (50mg)"
      } else {
        const parts = sku.split("-")
        if (parts.length >= 2) {
          const rawPrefix = parts[0]
          if (rawPrefix.length > 2 && !rawPrefix.startsWith("INV") && !rawPrefix.startsWith("SUP")) {
            compoundName = titleCase(rawPrefix)
          }
        }
      }
    }

    if (compoundName && (currentTitle !== `${compoundName} — ${presentation}`)) {
      const newTitle = `${compoundName} — ${presentation}`
      try {
        await inventoryService.updateInventoryItems({
          id: item.id,
          title: newTitle,
        })
        updatedCount++
        logger.info(`  [updated] "${currentTitle}" -> "${newTitle}" (${item.sku || item.id})`)
      } catch (err: any) {
        logger.warn(`  [error] Failed to update ${item.id}: ${err?.message}`)
      }
    }
  }

  logger.info(`[enrich-inventory-titles] Completed: Enriched ${updatedCount} inventory items with compound names.`)
}
