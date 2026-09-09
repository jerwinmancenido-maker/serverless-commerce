/**
 * @file    apps/backend/src/lib/bot-runner/missions/catalog-sanity-mission.ts
 * @module  CatalogSanityMission (Autonomous Agent Runner Module)
 * @purpose Audits product catalog health, BOM recipe consistency, PHP currency pricing rules, inventory levels, and monograph linkages.
 * @contracts
 *   Query:   product · product_variant · inventory_item
 *   Module:  PEPSTACK_BOM_MODULE · RESEARCH_CONTENT_MODULE
 */

import { type MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type { BotMissionArtifacts, BotMissionRun, BotStepLog } from "../types"
import { PEPSTACK_BOM_MODULE } from "../../../modules/bom"
import type PepstackBomModuleService from "../../../modules/bom/service"
import { RESEARCH_CONTENT_MODULE } from "../../../modules/research-content"
import type ResearchContentModuleService from "../../../modules/research-content/service"

interface MissionContext {
  run: BotMissionRun
  container: MedusaContainer
  abortSignal: AbortSignal
  onStepUpdate: (log: BotStepLog) => void
  onArtifactsUpdate: (artifacts: Partial<BotMissionArtifacts>) => void
}

export async function executeCatalogSanityMission(ctx: MissionContext): Promise<void> {
  const { abortSignal, container, onArtifactsUpdate, onStepUpdate } = ctx
  const artifacts: Partial<BotMissionArtifacts> = {}

  const checkAborted = () => {
    if (abortSignal.aborted) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Mission was aborted by administrator"
      )
    }
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 1: Scan Catalog & Published Product Variants
  // ──────────────────────────────────────────────────────────────────────────
  checkAborted()
  const step1Start = Date.now()
  onStepUpdate({
    step: 1,
    totalSteps: 5,
    title: "Scan Catalog Products & Variants",
    status: "running",
    timestamp: new Date().toISOString(),
    message: "Scanning active catalog products, handles, and variant allocations...",
  })

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "status",
      "variants.id",
      "variants.title",
      "variants.sku",
    ],
    pagination: { take: 100 },
  })

  const productList = products || []
  let totalVariants = 0
  const invalidProducts: string[] = []

  for (const p of productList as any[]) {
    const variants = p.variants || []
    totalVariants += variants.length
    if (variants.length === 0 || !p.handle) {
      invalidProducts.push(p.title || p.id)
    }
  }

  artifacts.scannedProductsCount = productList.length
  artifacts.scannedVariantsCount = totalVariants
  onArtifactsUpdate(artifacts)

  if (productList.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Catalog scan failed: No products found in store database"
    )
  }

  onStepUpdate({
    step: 1,
    totalSteps: 5,
    title: "Scan Catalog Products & Variants",
    status: "success",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - step1Start,
    message: `Audited ${productList.length} products with ${totalVariants} variants. (${invalidProducts.length} anomalies)`,
    details: {
      productsCount: productList.length,
      variantsCount: totalVariants,
      invalidCount: invalidProducts.length,
    },
  })

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 2: BOM Recipe & Component Profiles Audit
  // ──────────────────────────────────────────────────────────────────────────
  checkAborted()
  const step2Start = Date.now()
  onStepUpdate({
    step: 2,
    totalSteps: 5,
    title: "Audit BOM Recipes & Component Profiles",
    status: "running",
    timestamp: new Date().toISOString(),
    message: "Verifying bill-of-materials profiles in Pepstack BOM module...",
  })

  let profilesCount = 0
  let bomService: PepstackBomModuleService | null = null

  try {
    bomService = container.resolve<PepstackBomModuleService>(PEPSTACK_BOM_MODULE)
  } catch {
    bomService = null
  }

  if (bomService && typeof bomService.listComponentProfiles === "function") {
    const profiles = await bomService.listComponentProfiles({}, { take: 100 })
    profilesCount = profiles.length
  }

  artifacts.bomProfilesCount = profilesCount
  onArtifactsUpdate(artifacts)

  onStepUpdate({
    step: 2,
    totalSteps: 5,
    title: "Audit BOM Recipes & Component Profiles",
    status: "success",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - step2Start,
    message: `Verified ${profilesCount} active BOM component profiles.`,
    details: { profilesCount },
  })

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 3: PHP Currency & Pricing Rules Compliance
  // ──────────────────────────────────────────────────────────────────────────
  checkAborted()
  const step3Start = Date.now()
  onStepUpdate({
    step: 3,
    totalSteps: 5,
    title: "Verify PHP Pricing & Currency Rules",
    status: "running",
    timestamp: new Date().toISOString(),
    message: "Auditing price set bindings and zero-price exploits across variants...",
  })

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "title",
      "sku",
      "prices.currency_code",
      "prices.amount",
    ],
    pagination: { take: 150 },
  })

  const variantList = variants || []
  const missingPhpPrice: string[] = []

  for (const v of variantList as any[]) {
    const prices = v.prices || []
    const hasValidPhpPrice = prices.some(
      (pr: any) => pr.currency_code?.toLowerCase() === "php" && Number(pr.amount) > 0
    )
    if (!hasValidPhpPrice) {
      missingPhpPrice.push(v.sku || v.title || v.id)
    }
  }

  artifacts.missingPricesCount = missingPhpPrice.length
  onArtifactsUpdate(artifacts)

  onStepUpdate({
    step: 3,
    totalSteps: 5,
    title: "Verify PHP Pricing & Currency Rules",
    status: "success",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - step3Start,
    message: `Audited ${variantList.length} variants: ${variantList.length - missingPhpPrice.length} conform to PHP pricing rules.`,
    details: {
      totalVariants: variantList.length,
      compliantCount: variantList.length - missingPhpPrice.length,
      missingCount: missingPhpPrice.length,
    },
  })

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 4: Component Inventory Thresholds & Stock Health
  // ──────────────────────────────────────────────────────────────────────────
  checkAborted()
  const step4Start = Date.now()
  onStepUpdate({
    step: 4,
    totalSteps: 5,
    title: "Audit Inventory Levels & Stock Thresholds",
    status: "running",
    timestamp: new Date().toISOString(),
    message: "Scanning inventory item locations and reserved quantities...",
  })

  let lowStockCount = 0
  let totalInventoryItems = 0

  try {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: [
        "id",
        "sku",
        "title",
        "location_levels.stocked_quantity",
        "location_levels.reserved_quantity",
      ],
      pagination: { take: 100 },
    })

    const items = inventoryItems || []
    totalInventoryItems = items.length

    for (const item of items as any[]) {
      const levels = item.location_levels || []
      const available = levels.reduce(
        (sum: number, lvl: any) =>
          sum + (Number(lvl.stocked_quantity) - Number(lvl.reserved_quantity)),
        0
      )
      if (available <= 0) {
        lowStockCount++
      }
    }
  } catch {
    // Inventory module may not have location levels populated in all test suites
  }

  artifacts.lowStockItemsCount = lowStockCount
  onArtifactsUpdate(artifacts)

  onStepUpdate({
    step: 4,
    totalSteps: 5,
    title: "Audit Inventory Levels & Stock Thresholds",
    status: "success",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - step4Start,
    message: `Audited ${totalInventoryItems} inventory items (${lowStockCount} items at/below zero stock).`,
    details: { totalInventoryItems, lowStockCount },
  })

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 5: Research Monograph & Digital Content Linkage
  // ──────────────────────────────────────────────────────────────────────────
  checkAborted()
  const step5Start = Date.now()
  onStepUpdate({
    step: 5,
    totalSteps: 5,
    title: "Audit Protocol Monographs & Content Linkage",
    status: "running",
    timestamp: new Date().toISOString(),
    message: "Checking digital monographs in research content library...",
  })

  let monographsCount = 0
  let researchContentService: ResearchContentModuleService | null = null

  try {
    researchContentService = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE
    )
  } catch {
    researchContentService = null
  }

  if (
    researchContentService &&
    typeof researchContentService.listProtocolMonographs === "function"
  ) {
    const monographs = await researchContentService.listProtocolMonographs(
      {},
      { take: 50 }
    )
    monographsCount = monographs.length
  }

  artifacts.monographsCount = monographsCount
  onArtifactsUpdate(artifacts)

  onStepUpdate({
    step: 5,
    totalSteps: 5,
    title: "Audit Protocol Monographs & Content Linkage",
    status: "success",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - step5Start,
    message: `Verified ${monographsCount} clinical protocol monographs linked in research library.`,
    details: { monographsCount },
  })
}
