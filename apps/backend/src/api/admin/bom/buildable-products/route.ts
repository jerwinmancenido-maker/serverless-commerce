import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type {
  IInventoryService,
  IProductModuleService,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

import { resolveBuildableProductRows } from "../../../../modules/bom/resolve-buildable-products"
import { resolveVariantLocationAvailability } from "../../../../modules/bom/resolve-location-availability"
import type { AdminGetBuildableProductsType } from "../validators"

type NativeVariant = {
  id: string
  title: string
  sku: string | null
  product?: { id: string; title: string } | null
}

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
  stocked_quantity: number
  reserved_quantity: number
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const {
    location_id: locationId,
    q,
    limit,
    offset,
  } = req.validatedQuery as AdminGetBuildableProductsType
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT,
  )
  const [locationResult, variantResult] = await Promise.all([
    query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
      filters: { id: locationId },
      pagination: { take: 1 },
    }),
    productService.listAndCountProductVariants(
      q ? { q } : {},
      {
        relations: ["product"],
        take: limit,
        skip: offset,
        order: { product_id: "ASC", title: "ASC" },
      },
    ),
  ])
  const location = (locationResult.data as Array<{
    id: string
    name: string
  }>)[0]

  if (!location) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location ${locationId} was not found`,
    )
  }

  const [variantRecords, variantCount] = variantResult
  const variants = variantRecords as NativeVariant[]
  const variantIds = variants.map((variant) => variant.id)
  const linkResult = variantIds.length
    ? await query.graph({
        entity: "product_variant_inventory_item",
        fields: ["variant_id", "inventory_item_id", "required_quantity"],
        filters: { variant_id: variantIds },
      })
    : { data: [] }
  const links = linkResult.data as NativeRecipeLink[]
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
  const itemById = new Map(
    (inventoryItems as NativeInventoryItem[]).map((item) => [item.id, item]),
  )
  const levelByItemId = new Map(
    (inventoryLevels as NativeInventoryLevel[]).map((level) => [
      level.inventory_item_id,
      level,
    ]),
  )
  const missingInventoryItemIds = inventoryItemIds.filter(
    (id) => !itemById.has(id),
  )

  if (missingInventoryItemIds.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Recipe inventory items were not found: ${missingInventoryItemIds.join(
        ", ",
      )}`,
    )
  }

  const availability = variantIds.length
    ? resolveVariantLocationAvailability({
        variantIds,
        recipeLinks: links.map((link) => ({
          variantId: link.variant_id,
          inventoryItemId: link.inventory_item_id,
          requiredQuantity: Number(link.required_quantity),
        })),
        locationLevels: inventoryItemIds.map((inventoryItemId) => {
          const item = itemById.get(inventoryItemId)
          const level = levelByItemId.get(inventoryItemId)

          return {
            inventoryItemId,
            inventoryItemTitle:
              item?.title || item?.sku || inventoryItemId,
            stockedQuantity: Number(level?.stocked_quantity || 0),
            reservedQuantity: Number(level?.reserved_quantity || 0),
          }
        }),
      })
    : []

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    location,
    buildable_products: resolveBuildableProductRows({
      variants,
      availability,
    }),
    count: variantCount,
    limit,
    offset,
  })
}
