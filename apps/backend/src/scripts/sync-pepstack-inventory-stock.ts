/**
 * @file    apps/backend/src/scripts/sync-pepstack-inventory-stock.ts
 * @module  PepStackStockSynchronizer (BOM / Inventory Module)
 * @purpose Synchronizes authentic PepStack Labs component and finished vial stock quantities into Medusa inventory.
 * @contracts
 *   Service: InventoryModuleService · BomModuleService
 */

import type { IInventoryService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

import { PEPSTACK_BOM_MODULE } from "../modules/bom"
import type PepstackBomModuleService from "../modules/bom/service"

const FALLBACK_STOCK_LOCATION_ID = "sloc_01M0VYVW7TH4SDMF8F5YAW82Y6"

function extractStrength(str: string): string {
  const match = str.match(
    /(\d+(?:\.\d+)?\s*(?:MG|IU|ML|MCG|G|SLOT|mg|iu|ml|mcg|g))/i
  )
  return match ? match[1].replace(/\s+/g, "").toUpperCase() : ""
}

function cleanCompoundSlug(title: string): string {
  return title
    .replace(/^medusa\s+/i, "")
    .replace(/\+/g, "PLUS")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
}

export default async function syncPepstackInventoryStock({
  container,
}: {
  container: any
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService = container.resolve(Modules.INVENTORY) as IInventoryService
  const bomService = container.resolve(PEPSTACK_BOM_MODULE) as PepstackBomModuleService

  logger.info("=== Starting PepStack Labs Stock Synchronization ===")

  // 1. Resolve active stock location
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  const targetLocationId =
    stockLocations && stockLocations.length > 0
      ? stockLocations[0].id
      : FALLBACK_STOCK_LOCATION_ID
  const locationName =
    stockLocations && stockLocations.length > 0
      ? stockLocations[0].name
      : "Default Warehouse"

  logger.info(`Target Warehouse: ${targetLocationId} ("${locationName}")`)

  // 2. Load PepStack scraped components
  const dataPath = path.resolve(process.cwd(), "data/scraped/pepstack-components.json")
  if (!fs.existsSync(dataPath)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Component data file not found at ${dataPath}`
    )
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"))
  const components: any[] = rawData.components || []

  // 3. Filter out zero stock and test items strictly per user directive
  const validComponents = components.filter(
    (c) =>
      (c.stock_ph ?? c.stock_quantity) > 0 &&
      !c.name.startsWith("ZZ_") &&
      !c.name.includes("Test Product")
  )

  logger.info(`Loaded ${validComponents.length} valid non-zero components to synchronize`)

  // 4. Ensure additional consumable items exist in Medusa
  const consumableDefinitions: Record<string, { sku: string; title: string; category: string }> = {
    "cartridges (3ml each)": {
      sku: "SUPPLY-CARTRIDGE-3ML",
      title: "Cartridges (3 mL each)",
      category: "Consumable",
    },
    "hypodermic needles": {
      sku: "SUPPLY-HYPODERMIC-NEEDLE",
      title: "Hypodermic Needles",
      category: "Needle",
    },
    "insulin pen needles": {
      sku: "SUPPLY-INSULIN-PEN-NEEDLE",
      title: "Insulin Pen Needles",
      category: "Needle",
    },
    "insulin pen v2 (60 units)": {
      sku: "SUPPLY-INSULIN-PEN-V2",
      title: "Insulin Pen V2 (60 Units)",
      category: "Device",
    },
    "sterile syringe 5cc": {
      sku: "SUPPLY-SYRINGE-5CC",
      title: "Sterile Syringe 5 cc",
      category: "Syringe",
    },
  }

  for (const [key, def] of Object.entries(consumableDefinitions)) {
    const [existing] = await inventoryService.listInventoryItems({ sku: def.sku })
    if (!existing) {
      const [created] = await inventoryService.createInventoryItems([
        { sku: def.sku, title: def.title },
      ])
      await inventoryService.createInventoryLevels({
        inventory_item_id: created.id,
        location_id: targetLocationId,
        stocked_quantity: 0,
      })
      await bomService.createComponentProfiles({
        inventory_item_id: created.id,
        base_unit: "piece",
        display_unit: "piece",
        base_units_per_display_unit: 1,
        display_precision: 0,
        reorder_threshold_base_units: 50,
        classification: "included_supply",
        supplier_unit: "piece",
        inventory_units_per_supplier_unit: 1,
        category: def.category,
        lot_tracking_required: false,
        expiry_tracking_required: false,
      })
      logger.info(`Created missing consumable item: ${def.sku} ("${def.title}")`)
    }
  }

  // 5. Re-fetch all inventory items and levels
  const allMedusaItems = await inventoryService.listInventoryItems({}, { take: 1000 })
  const allLevels = await inventoryService.listInventoryLevels(
    { location_id: targetLocationId },
    { take: 1000 }
  )
  const levelMap = new Map<string, any>()
  for (const lvl of allLevels) {
    levelMap.set(lvl.inventory_item_id, lvl)
  }

  let updatedCount = 0
  let skippedCount = 0
  const syncAuditLog: Array<{
    name: string
    medusaSku: string
    medusaTitle: string
    previousStock: number
    newStock: number
  }> = []

  for (const c of validComponents) {
    const targetStock = c.stock_ph ?? c.stock_quantity
    let match: any = null
    const lowerName = c.name.toLowerCase()

    // Consumables & explicit name overrides
    if (lowerName.includes("cuv100")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-CUV100-50MG")
    } else if (
      lowerName.includes("ghk-cu anti-aging serum") &&
      (lowerName.includes("30g") || lowerName.includes("30ml"))
    ) {
      match = allMedusaItems.find((m) => m.sku === "RAW-GHKCUANTIAGINGSERUM-30ML")
    } else if (
      lowerName.includes("ghk-cu anti-aging serum") &&
      (lowerName.includes("50g") || lowerName.includes("50ml"))
    ) {
      match = allMedusaItems.find((m) => m.sku === "RAW-GHKCUANTIAGINGSERUM-50ML")
    } else if (lowerName.includes("igf-1 lr3")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-IGF1LR3-1MG")
    } else if (lowerName.includes("lemon bottle")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-LEMONBOTTLE-10ML")
    } else if (lowerName.includes("lipo-c")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-LIPOCPLUSB12-10ML")
    } else if (lowerName.includes("semaglutide")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-SEMAGLUTIDE-5MG")
    } else if (lowerName.includes("alcohol prep")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-ALCOHOL-PAD")
    } else if (lowerName.includes("3cc") && lowerName.includes("needle")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-SYRINGE-3CC")
    } else if (lowerName.includes("1cc") && lowerName.includes("syringe")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-SYRINGE-1CC")
    } else if (lowerName.includes("sterile syringe 5cc")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-SYRINGE-5CC")
    } else if (lowerName.includes("cartridges (3ml each)")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-CARTRIDGE-3ML")
    } else if (lowerName.includes("hypodermic needles")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-HYPODERMIC-NEEDLE")
    } else if (lowerName.includes("insulin pen needles")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-INSULIN-PEN-NEEDLE")
    } else if (lowerName.includes("insulin pen v2")) {
      match = allMedusaItems.find((m) => m.sku === "SUPPLY-INSULIN-PEN-V2")
    } else if (lowerName.includes("bacteriostatic water 10ml")) {
      match = allMedusaItems.find(
        (m) =>
          m.sku === "RAW-BACTERIOSTATICWATER-10ML" || m.sku === "SUPPLY-BAC-10ML"
      )
    } else if (lowerName.includes("bacteriostatic water 30ml")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-BACTERIOSTATICWATER-30ML")
    } else if (lowerName.includes("bacteriostatic water 3ml")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-BACTERIOSTATICWATER-3ML")
    } else if (
      lowerName.includes("bacteriostatic water 5mg") ||
      lowerName.includes("bacteriostatic water 5ml")
    ) {
      match = allMedusaItems.find((m) => m.sku === "RAW-BACTERIOSTATICWATER-5ML")
    } else if (lowerName.includes("custom mixed vial organizer")) {
      match = allMedusaItems.find(
        (m) => m.sku === "RAW-CUSTOMMIXEDVIALORGANIZER-STD"
      )
    } else if (lowerName.includes("50-slot vial organizer")) {
      match = allMedusaItems.find((m) => m.sku === "RAW-50SLOTVIALORGANIZERBOX-STD")
    } else if (lowerName.includes("reusable insulin pen")) {
      match = allMedusaItems.find(
        (m) => m.sku === "RAW-REUSABLEMETALINSULINPEN-STD"
      )
    } else if (lowerName.includes("peptide reconstitution set")) {
      match = allMedusaItems.find(
        (m) => m.sku === "RAW-PEPTIDERECONSTITUTIONSET-STD"
      )
    } else if (lowerName.includes("clear nasal spray bottles")) {
      if (lowerName.includes("5g") || lowerName.includes("5ml")) {
        match = allMedusaItems.find(
          (m) => m.sku === "RAW-CLEARNASALSPRAYBOTTLES-5ML"
        )
      } else if (lowerName.includes("8g") || lowerName.includes("8ml")) {
        match = allMedusaItems.find(
          (m) => m.sku === "RAW-CLEARNASALSPRAYBOTTLES-8ML"
        )
      } else if (lowerName.includes("10g") || lowerName.includes("10ml")) {
        match = allMedusaItems.find(
          (m) => m.sku === "RAW-CLEARNASALSPRAYBOTTLES-10ML"
        )
      }
    }

    // Direct SKU match
    if (!match && c.sku) {
      match = allMedusaItems.find(
        (m) =>
          m.sku === c.sku ||
          m.sku === `RAW-${c.sku}` ||
          m.sku?.endsWith(`-${c.sku}`)
      )
    }

    // Compound slug + strength matching
    if (!match) {
      const strength = extractStrength(c.name)
      const rawCompoundName = c.name
        .split("–")[0]
        .split("|")[0]
        .replace(/vial/gi, "")
        .replace(/\d+(?:\.\d+)?\s*(?:MG|IU|ML|MCG|G|SLOT|mg|iu|ml|mcg|g)/gi, "")
        .trim()
      const slug = cleanCompoundSlug(rawCompoundName)

      // 1. Exact RAW-<SLUG>-<STRENGTH>
      match = allMedusaItems.find((m) => m.sku === `RAW-${slug}-${strength}`)

      // 2. Partial slug + strength
      if (!match) {
        match = allMedusaItems.find((m) => {
          const mSku = m.sku || ""
          if (strength && !mSku.includes(strength)) return false
          return (
            mSku.includes(slug) ||
            slug.includes(mSku.replace(/^RAW-/, "").replace(/-\w+$/, ""))
          )
        })
      }
    }

    if (!match) {
      logger.warn(`Could not find Medusa inventory match for: "${c.name}"`)
      skippedCount++
      continue
    }

    const currentLevel = levelMap.get(match.id)
    const previousStock = currentLevel ? Number(currentLevel.stocked_quantity) : 0

    if (currentLevel) {
      await inventoryService.updateInventoryLevels([
        {
          inventory_item_id: match.id,
          location_id: targetLocationId,
          stocked_quantity: targetStock,
        },
      ])
    } else {
      await inventoryService.createInventoryLevels({
        inventory_item_id: match.id,
        location_id: targetLocationId,
        stocked_quantity: targetStock,
      })
    }

    updatedCount++
    syncAuditLog.push({
      name: c.name,
      medusaSku: match.sku,
      medusaTitle: match.title,
      previousStock,
      newStock: targetStock,
    })
  }

  logger.info(`=== Synchronization Complete ===`)
  logger.info(`Updated: ${updatedCount} inventory items`)
  logger.info(`Skipped: ${skippedCount} items`)

  console.log("\n=== COMPLETED STOCK SYNCHRONIZATION AUDIT LOG ===")
  for (const log of syncAuditLog) {
    console.log(
      `[${log.medusaSku}] ${log.medusaTitle}: ${log.previousStock} -> ${log.newStock} units`
    )
  }
}
