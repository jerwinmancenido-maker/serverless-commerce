import type { IInventoryService } from "@medusajs/framework/types"
import type { ILinkModule } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, promiseAll } from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../modules/bom"
import type PepstackBomModuleService from "../modules/bom/service"

const STOCK_LOCATION_ID = "sloc_01M0VYVW7TH4SDMF8F5YAW82Y6"

const MASTER_SUPPLIES = [
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
    sku: "SUPPLY-SYRINGE-3CC",
    title: "Sterile Syringe 3 cc",
    initialStock: 500,
    profile: {
      baseUnit: "piece" as const,
      displayUnit: "piece" as const,
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
      reorderThresholdBaseUnits: 100,
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

// GHK-Cu variant IDs from the DB (verified 2026-09-06)
// 50MG variants
const GHK_50MG_VIAL_ONLY_IDS = [
  "variant_01M1RR3WM732DQQHMY5NA2FSC1",
  "variant_01M1RR3WM7945R84FBZ22PQY6Q",
]
const GHK_50MG_VIAL_BAC_ID = "variant_01M1RWYB14EEVFT9SNEVDB8PTE"
const GHK_50MG_SUBQ_ID = "variant_01M1RWYB1424NE5Z4WKHP92G9V"

// 100MG variants
const GHK_100MG_VIAL_ONLY_IDS = [
  "variant_01M1RR3WM77V96V7KA25A7N813",
  "variant_01M1RR3WM7351XBKANTK9D5Z59",
]
const GHK_100MG_VIAL_BAC_ID = "variant_01M1RWYB1588PTSNP4R8AHN5RN"
const GHK_100MG_SUBQ_ID = "variant_01M1RWYB16KWD5YQJM1HE1XDSP"

export default async function seedProductionMasterSupplies({
  container,
}: {
  container: any
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const inventoryService = container.resolve<IInventoryService>(Modules.INVENTORY)
  const bomService = container.resolve<PepstackBomModuleService>(PEPSTACK_BOM_MODULE)
  const remoteLink = container.resolve<ILinkModule>(ContainerRegistrationKeys.LINK)

  logger.info("=== Phase 2: Seeding production master supplies ===")

  // --- Step 1: Create inventory items (idempotent by SKU) ---
  const existingItems = await inventoryService.listInventoryItems({
    sku: MASTER_SUPPLIES.map((s) => s.sku),
  })
  const existingSkus = new Set(existingItems.map((i) => i.sku))

  const supplyMap: Record<string, string> = {}
  for (const existing of existingItems) {
    supplyMap[existing.sku!] = existing.id
    logger.info(`  [skip] inventory_item already exists: ${existing.sku}`)
  }

  const toCreate = MASTER_SUPPLIES.filter((s) => !existingSkus.has(s.sku))

  if (toCreate.length > 0) {
    const created = await inventoryService.createInventoryItems(
      toCreate.map((s) => ({ sku: s.sku, title: s.title }))
    )

    for (const item of created) {
      supplyMap[item.sku!] = item.id
      logger.info(`  [created] inventory_item: ${item.sku} → ${item.id}`)
    }
  }

  // --- Step 2: Create inventory levels (stock) ---
  for (const supply of MASTER_SUPPLIES) {
    const itemId = supplyMap[supply.sku]
    if (!itemId) continue

    const [existingLevel] = await inventoryService.listInventoryLevels({
      inventory_item_id: itemId,
      location_id: STOCK_LOCATION_ID,
    })

    if (existingLevel) {
      logger.info(`  [skip] inventory_level already exists for: ${supply.sku}`)
      continue
    }

    await inventoryService.createInventoryLevels({
      inventory_item_id: itemId,
      location_id: STOCK_LOCATION_ID,
      stocked_quantity: supply.initialStock,
    })
    logger.info(`  [created] inventory_level: ${supply.sku} stock=${supply.initialStock}`)
  }

  // --- Step 3: Create component profiles ---
  for (const supply of MASTER_SUPPLIES) {
    const itemId = supplyMap[supply.sku]
    if (!itemId) continue

    const [existing] = await bomService.listComponentProfiles(
      { inventory_item_id: itemId },
      { take: 1 }
    )

    if (existing) {
      logger.info(`  [skip] component_profile already exists for: ${supply.sku}`)
      continue
    }

    await bomService.createComponentProfiles({
      inventory_item_id: itemId,
      base_unit: supply.profile.baseUnit,
      display_unit: supply.profile.displayUnit,
      base_units_per_display_unit: supply.profile.baseUnitsPerDisplayUnit,
      display_precision: supply.profile.displayPrecision,
      reorder_threshold_base_units: supply.profile.reorderThresholdBaseUnits,
      classification: supply.profile.classification,
      supplier_unit: supply.profile.supplierUnit,
      inventory_units_per_supplier_unit: supply.profile.inventoryUnitsPerSupplierUnit,
      category: supply.profile.category,
      lot_tracking_required: supply.profile.lotTrackingRequired,
      expiry_tracking_required: supply.profile.expiryTrackingRequired,
    })
    logger.info(`  [created] component_profile: ${supply.sku}`)
  }

  // --- Step 4: Link GHK-Cu variants to inventory items ---
  const bacItemId = supplyMap["SUPPLY-BAC-10ML"]
  const syringe1ccId = supplyMap["SUPPLY-SYRINGE-1CC"]
  const alcoholPadId = supplyMap["SUPPLY-ALCOHOL-PAD"]
  const mailerBoxId = supplyMap["SUPPLY-MAILER-BOX"]

  // We need the GHK-Cu finished vial inventory item
  // GHK-Cu variants currently have no inventory links — we will create
  // the finished product inventory item first
  const [existingGhkItem] = await inventoryService.listInventoryItems({
    sku: "GHK-CU-FINISHED-VIAL",
  })

  let ghkVialItemId: string
  if (existingGhkItem) {
    ghkVialItemId = existingGhkItem.id
    logger.info(`  [skip] GHK-Cu finished vial item already exists: ${ghkVialItemId}`)
  } else {
    const [created] = await inventoryService.createInventoryItems([{
      sku: "GHK-CU-FINISHED-VIAL",
      title: "GHK-Cu Finished Vial",
    }])
    ghkVialItemId = created.id

    await inventoryService.createInventoryLevels({
      inventory_item_id: ghkVialItemId,
      location_id: STOCK_LOCATION_ID,
      stocked_quantity: 100,
    })
    logger.info(`  [created] GHK-Cu finished vial item: ${ghkVialItemId} stock=100`)
  }

  // Ensure GHK-Cu finished vial has a component profile
  const [existingGhkProfile] = await bomService.listComponentProfiles(
    { inventory_item_id: ghkVialItemId },
    { take: 1 }
  )
  if (!existingGhkProfile) {
    await bomService.createComponentProfiles({
      inventory_item_id: ghkVialItemId,
      base_unit: "microgram",
      display_unit: "mg",
      base_units_per_display_unit: 1000,
      display_precision: 0,
      reorder_threshold_base_units: 10,
      classification: "finished_product",
      supplier_unit: "piece",
      inventory_units_per_supplier_unit: 1,
      category: "Peptide Vial",
      lot_tracking_required: false,
      expiry_tracking_required: true,
    })
    logger.info(`  [created] component_profile for GHK-Cu finished vial`)
  }

  logger.info("  Linking GHK-Cu variants to inventory items...")

  // Helper to create a variant → inventory_item link if not already present
  async function linkVariantToItem(
    variantId: string,
    inventoryItemId: string,
    qty: number = 1
  ) {
    const [existing] = await inventoryService.listInventoryLevels({
      inventory_item_id: inventoryItemId,
    })

    // Check if the variant link exists via remote link
    try {
      await remoteLink.create({
        [Modules.PRODUCT]: { variant_id: variantId },
        [Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
      })
      logger.info(`    [linked] variant ${variantId} → item ${inventoryItemId} (qty=${qty})`)
    } catch (err: any) {
      if (err?.message?.includes("duplicate") || err?.message?.includes("unique")) {
        logger.info(`    [skip] link already exists: variant ${variantId} → ${inventoryItemId}`)
      } else {
        throw err
      }
    }
  }

  // 50MG Vial Only variants → GHK-Cu vial only
  for (const variantId of GHK_50MG_VIAL_ONLY_IDS) {
    await linkVariantToItem(variantId, ghkVialItemId)
  }

  // 100MG Vial Only variants → GHK-Cu vial only
  for (const variantId of GHK_100MG_VIAL_ONLY_IDS) {
    await linkVariantToItem(variantId, ghkVialItemId)
  }

  // 50MG Vial + BAC → vial + BAC water
  await linkVariantToItem(GHK_50MG_VIAL_BAC_ID, ghkVialItemId)
  await linkVariantToItem(GHK_50MG_VIAL_BAC_ID, bacItemId)

  // 100MG Vial + BAC → vial + BAC water
  await linkVariantToItem(GHK_100MG_VIAL_BAC_ID, ghkVialItemId)
  await linkVariantToItem(GHK_100MG_VIAL_BAC_ID, bacItemId)

  // 50MG Complete SubQ Set → vial + BAC + 10x syringe + 10x pad + 1x box
  await linkVariantToItem(GHK_50MG_SUBQ_ID, ghkVialItemId)
  await linkVariantToItem(GHK_50MG_SUBQ_ID, bacItemId)
  await linkVariantToItem(GHK_50MG_SUBQ_ID, syringe1ccId, 10)
  await linkVariantToItem(GHK_50MG_SUBQ_ID, alcoholPadId, 10)
  await linkVariantToItem(GHK_50MG_SUBQ_ID, mailerBoxId)

  // 100MG Complete SubQ Set → vial + BAC + 10x syringe + 10x pad + 1x box
  await linkVariantToItem(GHK_100MG_SUBQ_ID, ghkVialItemId)
  await linkVariantToItem(GHK_100MG_SUBQ_ID, bacItemId)
  await linkVariantToItem(GHK_100MG_SUBQ_ID, syringe1ccId, 10)
  await linkVariantToItem(GHK_100MG_SUBQ_ID, alcoholPadId, 10)
  await linkVariantToItem(GHK_100MG_SUBQ_ID, mailerBoxId)

  logger.info("=== Phase 2: Master supply seeding complete ===")
}
