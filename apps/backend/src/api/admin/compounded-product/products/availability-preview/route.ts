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

import { PEPSTACK_BOM_MODULE } from "../../../../../modules/bom"
import type PepstackBomModuleService from "../../../../../modules/bom/service"
import type { AdminPreviewConfiguredRecipeAvailability } from "../../../../../modules/compounded-product/contracts/product-creation"
import { validateAndNormalizeCompoundedProductRecipeRules } from "../../../../../modules/compounded-product/recipe-rules"
import { resolveConfiguredRecipeLocationAvailability } from "../../../../../modules/compounded-product/resolve-configured-availability"

type NativeInventoryItem = {
  id: string
  title: string | null
  sku: string | null
}

type NativeInventoryLevel = {
  inventory_item_id: string
  location_id: string
  stocked_quantity: number
  reserved_quantity: number
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminPreviewConfiguredRecipeAvailability>,
  res: MedusaResponse,
) {
  const input = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService = req.scope.resolve<IInventoryService>(
    Modules.INVENTORY,
  )
  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const inventoryItemIds = Array.from(
    new Set(
      input.recipe_rules.flatMap((rule) =>
        rule.components.map((component) => component.inventory_item_id),
      ),
    ),
  )
  const [{ data: locations }, rawInventoryItems, inventoryLevels, rawProfiles] =
    await Promise.all([
      query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
        filters: { id: input.location_id },
      }),
      inventoryService.listInventoryItems({ id: inventoryItemIds }),
      inventoryService.listInventoryLevels({
        inventory_item_id: inventoryItemIds,
        location_id: input.location_id,
      }),
      bomService.listComponentProfiles(
        { inventory_item_id: inventoryItemIds },
        { take: inventoryItemIds.length },
      ),
    ])
  const location = (locations as Array<{ id: string; name: string }>)[0]

  if (!location) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location ${input.location_id} was not found`,
    )
  }

  const inventoryItems = rawInventoryItems as NativeInventoryItem[]
  const inventoryItemById = new Map(
    inventoryItems.map((item) => [item.id, item]),
  )
  const levelByInventoryItemId = new Map(
    (inventoryLevels as NativeInventoryLevel[]).map((level) => [
      level.inventory_item_id,
      level,
    ]),
  )
  const missingInventoryItemIds = inventoryItemIds.filter(
    (id) => !inventoryItemById.has(id),
  )

  if (missingInventoryItemIds.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Recipe inventory items were not found: ${missingInventoryItemIds.join(", ")}`,
    )
  }

  const rules = validateAndNormalizeCompoundedProductRecipeRules({
    rules: input.recipe_rules,
    profiles: rawProfiles.map((profile) => ({
      inventory_item_id: profile.inventory_item_id,
      base_unit: profile.base_unit,
      display_unit: profile.display_unit,
      base_units_per_display_unit: Number(
        profile.base_units_per_display_unit,
      ),
      display_precision: Number(profile.display_precision),
      classification: profile.classification,
    })),
  })
  const locationLevels = inventoryItems.map((item) => {
    const level = levelByInventoryItemId.get(item.id)

    return {
      inventoryItemId: item.id,
      inventoryItemTitle: item.title || item.sku || item.id,
      stockedQuantity: Number(level?.stocked_quantity || 0),
      reservedQuantity: Number(level?.reserved_quantity || 0),
    }
  })
  const variants = resolveConfiguredRecipeLocationAvailability({
    rows: input.matrix_rows.map((row) => ({
      key: row.key,
      options: row.options.map((option) => ({
        axisKey: option.axis_key,
        valueKey: option.value_key,
      })),
    })),
    rules,
    locationLevels,
  })

  res.setHeader("Cache-Control", "private, no-store")
  res.json({ location, variants })
}
