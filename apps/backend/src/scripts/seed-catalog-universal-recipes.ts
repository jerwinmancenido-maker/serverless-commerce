/**
 * @file    apps/backend/src/scripts/seed-catalog-universal-recipes.ts
 * @module  UniversalCatalogRecipeSeeder (BOM / Inventory Module)
 * @purpose Automated catalog-wide inventory and recipe linking engine for all peptide products.
 * @contracts
 *   Service: InventoryModuleService · BomModuleService · RemoteLink
 */

import type { IInventoryService, ILinkModule } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../modules/bom"
import type PepstackBomModuleService from "../modules/bom/service"

const FALLBACK_STOCK_LOCATION_ID = "sloc_01M0VYVW7TH4SDMF8F5YAW82Y6"

const MASTER_SUPPLY_DEFINITIONS = [
  {
    sku: "SUPPLY-BAC-10ML",
    title: "Bacteriostatic Water 10 mL USP",
    initialStock: 500,
    profile: {
      baseUnit: "microliter" as const,
      displayUnit: "mL" as const,
      baseUnitsPerDisplayUnit: 1000,
      displayPrecision: 1,
      reorderThresholdBaseUnits: 100_000,
      classification: "included_supply" as const,
      supplierUnit: "piece" as const,
      inventoryUnitsPerSupplierUnit: 1,
      category: "Solvent",
      lotTrackingRequired: false,
      expiryTrackingRequired: true,
    },
  },
  {
    sku: "SUPPLY-SYRINGE-1CC",
    title: "Sterile Syringe 1 cc / U-100",
    initialStock: 1000,
    profile: {
      baseUnit: "piece" as const,
      displayUnit: "piece" as const,
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
      reorderThresholdBaseUnits: 200,
      classification: "included_supply" as const,
      supplierUnit: "piece" as const,
      inventoryUnitsPerSupplierUnit: 1,
      category: "Syringe",
      lotTrackingRequired: false,
      expiryTrackingRequired: false,
    },
  },
  {
    sku: "SUPPLY-ALCOHOL-PAD",
    title: "Alcohol Prep Pads 70% IPA",
    initialStock: 2500,
    profile: {
      baseUnit: "piece" as const,
      displayUnit: "piece" as const,
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
      reorderThresholdBaseUnits: 500,
      classification: "included_supply" as const,
      supplierUnit: "pack" as const,
      inventoryUnitsPerSupplierUnit: 100,
      category: "Antiseptic",
      lotTrackingRequired: false,
      expiryTrackingRequired: false,
    },
  },
  {
    sku: "SUPPLY-MAILER-BOX",
    title: "Insulated Cold-Chain Mailer Box",
    initialStock: 250,
    profile: {
      baseUnit: "piece" as const,
      displayUnit: "piece" as const,
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
      reorderThresholdBaseUnits: 50,
      classification: "packaging" as const,
      supplierUnit: "piece" as const,
      inventoryUnitsPerSupplierUnit: 1,
      category: "Packaging",
      lotTrackingRequired: false,
      expiryTrackingRequired: false,
    },
  },
]

function extractStrengthToken(text: string): string {
  const match = text.match(/(\d+(?:\.\d+)?\s*(?:MG|IU|ML|MCG|G|SLOT|mg|iu|ml|mcg|g))/i)
  if (match && match[1]) {
    return match[1].replace(/\s+/g, "").toUpperCase()
  }
  return "STD"
}

function cleanCompoundSlug(title: string): string {
  const normalized = title
    .replace(/^medusa\s+/i, "")
    .replace(/\+/g, "PLUS")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
  return normalized.slice(0, 24) || "COMPOUND"
}

type RecipeTier = "subq" | "bac" | "nasal" | "vial"

function determineRecipeTier(variantTitle: string): RecipeTier {
  const lower = variantTitle.toLowerCase()
  if (lower.includes("subq") || lower.includes("complete set") || lower.includes("syringe")) {
    return "subq"
  }
  if (lower.includes("bac") || lower.includes("solvent") || lower.includes("mixing")) {
    return "bac"
  }
  if (lower.includes("nasal")) {
    return "nasal"
  }
  return "vial"
}

export default async function seedCatalogUniversalRecipes({
  container,
}: {
  container: any
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService = container.resolve(Modules.INVENTORY) as IInventoryService
  const bomService = container.resolve(PEPSTACK_BOM_MODULE) as PepstackBomModuleService
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK) as ILinkModule

  logger.info("=== Starting Universal Catalog Recipe & Inventory Seeder ===")

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

  // 2. Ensure Master Supplies Exist and are Stocked
  const existingMasterItems = await inventoryService.listInventoryItems({
    sku: MASTER_SUPPLY_DEFINITIONS.map((s) => s.sku),
  })
  const masterMap: Record<string, string> = {}
  for (const item of existingMasterItems) {
    if (item.sku) masterMap[item.sku] = item.id
  }

  for (const def of MASTER_SUPPLY_DEFINITIONS) {
    let itemId = masterMap[def.sku]
    if (!itemId) {
      const [created] = await inventoryService.createInventoryItems([
        { sku: def.sku, title: def.title },
      ])
      itemId = created.id
      masterMap[def.sku] = itemId
      logger.info(`Created master supply inventory item: ${def.sku} (${itemId})`)
    }

    const [existingLevel] = await inventoryService.listInventoryLevels({
      inventory_item_id: itemId,
      location_id: targetLocationId,
    })
    if (!existingLevel) {
      await inventoryService.createInventoryLevels({
        inventory_item_id: itemId,
        location_id: targetLocationId,
        stocked_quantity: def.initialStock,
      })
      logger.info(`Stocked ${def.initialStock} units for master supply: ${def.sku}`)
    }

    const [existingProfile] = await bomService.listComponentProfiles(
      { inventory_item_id: itemId },
      { take: 1 }
    )
    if (!existingProfile) {
      await bomService.createComponentProfiles({
        inventory_item_id: itemId,
        base_unit: def.profile.baseUnit,
        display_unit: def.profile.displayUnit,
        base_units_per_display_unit: def.profile.baseUnitsPerDisplayUnit,
        display_precision: def.profile.displayPrecision,
        reorder_threshold_base_units: def.profile.reorderThresholdBaseUnits,
        classification: def.profile.classification,
        supplier_unit: def.profile.supplierUnit,
        inventory_units_per_supplier_unit: def.profile.inventoryUnitsPerSupplierUnit,
        category: def.profile.category,
        lot_tracking_required: def.profile.lotTrackingRequired,
        expiry_tracking_required: def.profile.expiryTrackingRequired,
      })
      logger.info(`Created component profile for master supply: ${def.sku}`)
    }
  }

  const bacWaterId = masterMap["SUPPLY-BAC-10ML"]
  const syringe1ccId = masterMap["SUPPLY-SYRINGE-1CC"]
  const alcoholPadId = masterMap["SUPPLY-ALCOHOL-PAD"]
  const mailerBoxId = masterMap["SUPPLY-MAILER-BOX"]

  // 3. Query all products and variants (with high pagination limit)
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "variants.id",
      "variants.title",
      "variants.sku",
    ],
    pagination: {
      take: 500,
    },
  })

  // Filter out merch/apparel products
  const peptideProducts = (allProducts || []).filter((p: any) => {
    const lower = (p.title || "").toLowerCase()
    return (
      !lower.startsWith("medusa t-shirt") &&
      !lower.startsWith("medusa sweat") &&
      !lower.startsWith("medusa shorts")
    )
  })

  logger.info(`Found ${peptideProducts.length} catalog products to process.`)

  // 4. Query all existing recipe links
  const { data: allExistingLinks } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["variant_id", "inventory_item_id", "required_quantity"],
    pagination: {
      take: 5000,
    },
  })
  const existingLinkKeys = new Set(
    (allExistingLinks || []).map(
      (link: any) => `${link.variant_id}:${link.inventory_item_id}`
    )
  )
  const variantsWithLinks = new Set(
    (allExistingLinks || []).map((link: any) => link.variant_id)
  )

  let createdItemsCount = 0
  let createdLinksCount = 0
  let skippedVariantsCount = 0

  // 5. Process each product
  for (const prod of peptideProducts) {
    const variants = prod.variants || []
    if (variants.length === 0) continue

    const compoundSlug = cleanCompoundSlug(prod.title)

    // Map of strength token -> raw vial inventory_item_id
    const rawVialMap: Record<string, string> = {}

    for (const v of variants) {
      const strength = extractStrengthToken(v.title || "")
      const rawSku = `RAW-${compoundSlug}-${strength}`

      if (!rawVialMap[strength]) {
        // Find or create raw vial inventory item
        const [existingItem] = await inventoryService.listInventoryItems({
          sku: rawSku,
        })

        let rawItemId: string
        if (existingItem) {
          rawItemId = existingItem.id
        } else {
          const [newItem] = await inventoryService.createInventoryItems([
            {
              sku: rawSku,
              title: `${prod.title} — Active Finished Vial (${strength})`,
            },
          ])
          rawItemId = newItem.id
          createdItemsCount++
          logger.info(`Created active vial inventory item: ${rawSku} (${rawItemId})`)
        }

        // Ensure inventory level
        const [existingLevel] = await inventoryService.listInventoryLevels({
          inventory_item_id: rawItemId,
          location_id: targetLocationId,
        })
        if (!existingLevel) {
          await inventoryService.createInventoryLevels({
            inventory_item_id: rawItemId,
            location_id: targetLocationId,
            stocked_quantity: 100,
          })
          logger.info(`Stocked 100 units for active vial: ${rawSku}`)
        }

        // Ensure BOM profile
        const [existingProfile] = await bomService.listComponentProfiles(
          { inventory_item_id: rawItemId },
          { take: 1 }
        )
        if (!existingProfile) {
          await bomService.createComponentProfiles({
            inventory_item_id: rawItemId,
            base_unit: "piece",
            display_unit: "vial",
            base_units_per_display_unit: 1,
            display_precision: 0,
            reorder_threshold_base_units: 10,
            classification: "finished_product",
            supplier_unit: "piece",
            inventory_units_per_supplier_unit: 1,
            category: "Active Peptide Vial",
            lot_tracking_required: false,
            expiry_tracking_required: true,
          })
        }

        rawVialMap[strength] = rawItemId
      }

      // Check if variant already has recipes linked
      if (variantsWithLinks.has(v.id)) {
        skippedVariantsCount++
        continue
      }

      const rawVialId = rawVialMap[strength]
      const tier = determineRecipeTier(v.title || "")

      // Determine components for recipe
      const recipeRows: Array<{ inventoryItemId: string; qty: number }> = []

      // 1x Raw Finished Vial is fundamental to all tiers
      recipeRows.push({ inventoryItemId: rawVialId, qty: 1 })

      if (tier === "bac") {
        if (bacWaterId) {
          recipeRows.push({ inventoryItemId: bacWaterId, qty: 1 })
        }
      } else if (tier === "subq") {
        if (bacWaterId) recipeRows.push({ inventoryItemId: bacWaterId, qty: 1 })
        if (syringe1ccId) recipeRows.push({ inventoryItemId: syringe1ccId, qty: 10 })
        if (alcoholPadId) recipeRows.push({ inventoryItemId: alcoholPadId, qty: 10 })
        if (mailerBoxId) recipeRows.push({ inventoryItemId: mailerBoxId, qty: 1 })
      } else if (tier === "nasal") {
        if (bacWaterId) recipeRows.push({ inventoryItemId: bacWaterId, qty: 1 })
      }

      // Create links
      for (const row of recipeRows) {
        const linkKey = `${v.id}:${row.inventoryItemId}`
        if (existingLinkKeys.has(linkKey)) continue

        try {
          await (remoteLink as any).create({
            [Modules.PRODUCT]: { variant_id: v.id },
            [Modules.INVENTORY]: { inventory_item_id: row.inventoryItemId },
            data: { required_quantity: row.qty },
          })
          existingLinkKeys.add(linkKey)
          createdLinksCount++
        } catch (err: any) {
          if (
            err?.message?.includes("duplicate") ||
            err?.message?.includes("unique")
          ) {
            existingLinkKeys.add(linkKey)
          } else {
            logger.warn(`Failed linking variant ${v.id} to item ${row.inventoryItemId}: ${err?.message}`)
          }
        }
      }
      variantsWithLinks.add(v.id)
    }
  }

  logger.info("=== Universal Catalog Recipe Seeding Complete ===")
  logger.info(`  Total Peptide Products: ${peptideProducts.length}`)
  logger.info(`  Active Vial Inventory Items Created: ${createdItemsCount}`)
  logger.info(`  Recipe Component Links Created: ${createdLinksCount}`)
  logger.info(`  Variants Already Configured (Skipped): ${skippedVariantsCount}`)
}
