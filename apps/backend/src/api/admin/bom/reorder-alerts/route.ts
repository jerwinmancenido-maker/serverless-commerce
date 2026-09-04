import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IInventoryService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../../../../modules/bom"
import type PepstackBomModuleService from "../../../../modules/bom/service"
import type { AdminGetReorderAlertsType } from "../validators"

type NativeInventoryItem = {
  id: string
  title: string | null
  sku: string | null
}

type NativeInventoryLevel = {
  inventory_item_id: string
  stocked_quantity: number
  reserved_quantity: number
}

type ReorderAlertItem = {
  inventory_item_id: string
  inventory_item_title: string
  category: string
  base_unit: string
  display_unit: string
  available_base_units: number
  reorder_threshold_base_units: number
  deficit_base_units: number
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { location_id: locationId } =
    req.validatedQuery as AdminGetReorderAlertsType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const inventoryService = req.scope.resolve<IInventoryService>(
    Modules.INVENTORY,
  )

  // 1. Verify the stock location exists
  const locationResult = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { id: locationId },
    pagination: { take: 1 },
  })
  const location = (
    locationResult.data as Array<{ id: string; name: string }>
  )[0]

  if (!location) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location ${locationId} not found`,
    )
  }

  // 2. Load all component profiles and filter in JS to those with a reorder
  //    threshold configured. Profiles with threshold === 0 mean "no threshold
  //    set" and are intentionally excluded from alerts.
  const allProfiles = await bomService.listComponentProfiles(
    {},
    { order: { inventory_item_id: "ASC" } },
  )
  const profiles = allProfiles.filter(
    (p) => p.reorder_threshold_base_units > 0,
  )

  if (!profiles.length) {
    res.setHeader("Cache-Control", "private, no-store")
    res.json({
      location,
      below_threshold: [],
      out_of_stock: [],
      below_threshold_count: 0,
      out_of_stock_count: 0,
    })
    return
  }

  // 3. Fetch live inventory levels from Medusa for those items at this location
  const inventoryItemIds = profiles.map((p) => p.inventory_item_id)

  const [inventoryItems, inventoryLevels] = await Promise.all([
    inventoryService.listInventoryItems({ id: inventoryItemIds }),
    inventoryService.listInventoryLevels({
      inventory_item_id: inventoryItemIds,
      location_id: locationId,
    }),
  ])

  const itemById = new Map(
    (inventoryItems as NativeInventoryItem[]).map((item) => [item.id, item]),
  )
  const levelByItemId = new Map(
    (inventoryLevels as NativeInventoryLevel[]).map((level) => [
      level.inventory_item_id,
      level,
    ]),
  )

  // 4. Classify each profile as below_threshold or out_of_stock
  const below_threshold: ReorderAlertItem[] = []
  const out_of_stock: ReorderAlertItem[] = []

  for (const profile of profiles) {
    const item = itemById.get(profile.inventory_item_id)
    const level = levelByItemId.get(profile.inventory_item_id)
    const stocked = Number(level?.stocked_quantity ?? 0)
    const reserved = Number(level?.reserved_quantity ?? 0)
    const available = Math.max(0, stocked - reserved)

    // Healthy — skip
    if (available > profile.reorder_threshold_base_units) continue

    const alertItem: ReorderAlertItem = {
      inventory_item_id: profile.inventory_item_id,
      inventory_item_title:
        item?.title ?? item?.sku ?? profile.inventory_item_id,
      category: profile.category,
      base_unit: profile.base_unit,
      display_unit: profile.display_unit,
      available_base_units: available,
      reorder_threshold_base_units: profile.reorder_threshold_base_units,
      deficit_base_units: profile.reorder_threshold_base_units - available,
    }

    if (available === 0) {
      out_of_stock.push(alertItem)
    } else {
      below_threshold.push(alertItem)
    }
  }

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    location,
    below_threshold,
    out_of_stock,
    below_threshold_count: below_threshold.length,
    out_of_stock_count: out_of_stock.length,
  })
}
