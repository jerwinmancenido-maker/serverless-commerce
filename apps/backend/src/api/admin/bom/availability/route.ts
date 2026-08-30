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

import { resolveVariantLocationAvailability } from "../../../../modules/bom/resolve-location-availability"
import type { AdminGetBomAvailabilityType } from "../validators"

const MAX_VARIANTS = 100

type NativeRecipeLink = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

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

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { variant_ids: variantIdInput, location_id: locationId } =
    req.validatedQuery as AdminGetBomAvailabilityType
  const variantIds = Array.from(
    new Set(
      variantIdInput
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  )

  if (!variantIds.length || variantIds.length > MAX_VARIANTS) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `variant_ids must contain between 1 and ${MAX_VARIANTS} IDs`,
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: variants }, { data: locations }, { data: rawLinks }] =
    await Promise.all([
      query.graph({
        entity: "product_variant",
        fields: ["id"],
        filters: { id: variantIds },
      }),
      query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
        filters: { id: locationId },
      }),
      query.graph({
        entity: "product_variant_inventory_item",
        fields: ["variant_id", "inventory_item_id", "required_quantity"],
        filters: { variant_id: variantIds },
      }),
    ])
  const foundVariantIds = new Set(
    (variants as Array<{ id: string }>).map((variant) => variant.id),
  )
  const missingVariantIds = variantIds.filter((id) => !foundVariantIds.has(id))

  if (missingVariantIds.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product variants were not found: ${missingVariantIds.join(", ")}`,
    )
  }

  const location = (locations as Array<{ id: string; name: string }>)[0]

  if (!location) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location ${locationId} was not found`,
    )
  }

  const links = rawLinks as NativeRecipeLink[]
  const inventoryItemIds = Array.from(
    new Set(links.map((link) => link.inventory_item_id)),
  )
  const inventoryService = req.scope.resolve<IInventoryService>(
    Modules.INVENTORY,
  )
  const [inventoryItems, inventoryLevels] = inventoryItemIds.length
    ? await Promise.all([
        inventoryService.listInventoryItems({ id: inventoryItemIds }),
        inventoryService.listInventoryLevels({
          inventory_item_id: inventoryItemIds,
          location_id: locationId,
        }),
      ])
    : [[], []]
  const inventoryItemById = new Map(
    (inventoryItems as NativeInventoryItem[]).map((item) => [item.id, item]),
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

  const availability = resolveVariantLocationAvailability({
    variantIds,
    recipeLinks: links.map((link) => ({
      variantId: link.variant_id,
      inventoryItemId: link.inventory_item_id,
      requiredQuantity: Number(link.required_quantity),
    })),
    locationLevels: (inventoryItems as NativeInventoryItem[]).map((item) => {
      const level = levelByInventoryItemId.get(item.id)

      return {
        inventoryItemId: item.id,
        inventoryItemTitle: item.title || item.sku || item.id,
        stockedQuantity: Number(level?.stocked_quantity || 0),
        reservedQuantity: Number(level?.reserved_quantity || 0),
      }
    }),
  })

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    location,
    variants: availability,
  })
}
