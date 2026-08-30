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
import { resolveInventoryItemBomUsage } from "../../../../../modules/bom/resolve-inventory-item-usage"
import type PepstackBomModuleService from "../../../../../modules/bom/service"

const USAGE_PREVIEW_LIMIT = 6

type NativeRecipeLink = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

type NativeProductVariant = {
  id: string
  title: string
  sku: string | null
  product?: {
    id: string
    title: string
  } | null
}

type RecipeSnapshotVersion = {
  variant_id: string
  version: number
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const inventoryItemId = req.params.inventoryItemId?.trim()

  if (!inventoryItemId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "inventory item ID is required",
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryService = req.scope.resolve<IInventoryService>(
    Modules.INVENTORY,
  )
  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const [inventoryItems, componentProfiles, linkResult] = await Promise.all([
    inventoryService.listInventoryItems({ id: inventoryItemId }),
    bomService.listComponentProfiles(
      { inventory_item_id: inventoryItemId },
      { take: 1 },
    ),
    query.graph({
      entity: "product_variant_inventory_item",
      fields: ["variant_id", "inventory_item_id", "required_quantity"],
      filters: { inventory_item_id: inventoryItemId },
      pagination: {
        take: USAGE_PREVIEW_LIMIT,
        skip: 0,
        order: { variant_id: "ASC" },
      },
    }),
  ])
  const inventoryItem = inventoryItems[0]

  if (!inventoryItem) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `inventory item ${inventoryItemId} was not found`,
    )
  }

  const links = linkResult.data as NativeRecipeLink[]
  const variantIds = links.map((link) => link.variant_id)
  const [variantResult, snapshotResult] = variantIds.length
    ? await Promise.all([
        query.graph({
          entity: "product_variant",
          fields: ["id", "title", "sku", "product.id", "product.title"],
          filters: { id: variantIds },
        }),
        bomService.listRecipeAuditSnapshots({ variant_id: variantIds }),
      ])
    : [{ data: [] }, []]

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    component_profile: componentProfiles[0] || null,
    recipe_usage: resolveInventoryItemBomUsage({
      links,
      variants: variantResult.data as NativeProductVariant[],
      snapshots: snapshotResult as RecipeSnapshotVersion[],
    }),
    recipe_usage_count: linkResult.metadata?.count ?? links.length,
    recipe_usage_limit: USAGE_PREVIEW_LIMIT,
  })
}
