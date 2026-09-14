import type { IInventoryService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const CANONICAL_MASTER_SUPPLIES = [
  { sku: "SUPPLY-BAC-10ML", title: "Bacteriostatic Water 10 mL USP" },
  { sku: "SUPPLY-SYRINGE-1CC", title: "Sterile Syringe 1 cc / U-100" },
  { sku: "SUPPLY-SYRINGE-3CC", title: "Sterile Syringe 3 cc" },
  { sku: "SUPPLY-ALCOHOL-PAD", title: "Alcohol Prep Pads 70% IPA" },
  { sku: "SUPPLY-MAILER-BOX", title: "Insulated Cold-Chain Mailer Box" },
]

export default async function restoreMasterSupplyTitles({
  container,
}: {
  container: any
}) {
  const inventoryService = container.resolve(Modules.INVENTORY) as IInventoryService
  console.log("=== Restoring Canonical Master Supply Titles ===")

  for (const supply of CANONICAL_MASTER_SUPPLIES) {
    const [item] = await inventoryService.listInventoryItems({ sku: supply.sku })
    if (item) {
      await inventoryService.updateInventoryItems({
        id: item.id,
        title: supply.title,
      })
      console.log(`[restored] ${supply.sku} -> "${supply.title}" (ID: ${item.id})`)
    }
  }

  console.log("=== Master supply titles restoration complete ===")
}
