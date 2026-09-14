import type { IInventoryService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function dumpInventoryItems({ container }: { container: any }) {
  const inventoryService = container.resolve(Modules.INVENTORY) as IInventoryService
  const items = await inventoryService.listInventoryItems({}, { take: 100 })
  console.log("=== EXACT INVENTORY ITEMS DUMP ===")
  for (const item of items) {
    console.log(`ITEM -> SKU: "${item.sku}" | Title: "${item.title}" | ID: ${item.id}`)
  }
  console.log(`Total count: ${items.length}`)
}
