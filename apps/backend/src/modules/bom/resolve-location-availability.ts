import { MedusaError } from "@medusajs/framework/utils"

import {
  calculateBuildableQuantity,
  calculateComponentCapacities,
  type ComponentAvailability,
} from "./contracts/inventory-kit"

export type NativeInventoryRecipeLink = {
  variantId: string
  inventoryItemId: string
  requiredQuantity: number
}

export type NativeInventoryLocationLevel = {
  inventoryItemId: string
  inventoryItemTitle: string
  stockedQuantity: number
  reservedQuantity: number
}

export type VariantComponentAvailability = {
  inventory_item_id: string
  inventory_item_title: string
  stocked_quantity: number
  reserved_quantity: number
  available_quantity: number
  required_quantity: number
  capacity: number
  limiting: boolean
}

export type VariantLocationAvailability = {
  variant_id: string
  status: "calculated" | "missing_recipe"
  calculated_stock: number | null
  limiting_components: Array<{
    inventory_item_id: string
    inventory_item_title: string
  }>
  components: VariantComponentAvailability[]
}

function assertIdentifier(value: string, field: string) {
  if (!value.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must not be empty`,
    )
  }
}

function assertNonNegativeSafeInteger(value: number, field: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must be a non-negative safe integer`,
    )
  }
}

export function resolveVariantLocationAvailability(input: {
  variantIds: string[]
  recipeLinks: NativeInventoryRecipeLink[]
  locationLevels: NativeInventoryLocationLevel[]
}): VariantLocationAvailability[] {
  const variantIds = Array.from(new Set(input.variantIds.map((id) => id.trim())))

  if (!variantIds.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "at least one variant ID is required",
    )
  }

  variantIds.forEach((id) => assertIdentifier(id, "variantId"))

  const levelByInventoryItemId = new Map(
    input.locationLevels.map((level) => {
      assertIdentifier(level.inventoryItemId, "inventoryItemId")
      assertNonNegativeSafeInteger(level.stockedQuantity, "stockedQuantity")
      assertNonNegativeSafeInteger(level.reservedQuantity, "reservedQuantity")

      return [level.inventoryItemId, level] as const
    }),
  )

  return variantIds.map((variantId) => {
    const links = input.recipeLinks.filter((link) => link.variantId === variantId)

    if (!links.length) {
      return {
        variant_id: variantId,
        status: "missing_recipe" as const,
        calculated_stock: null,
        limiting_components: [],
        components: [],
      }
    }

    const componentInput: ComponentAvailability[] = links.map((link) => {
      const level = levelByInventoryItemId.get(link.inventoryItemId)
      const stockedQuantity = level?.stockedQuantity || 0
      const reservedQuantity = level?.reservedQuantity || 0

      return {
        inventoryItemId: link.inventoryItemId,
        availableQuantity: Math.max(0, stockedQuantity - reservedQuantity),
        requiredQuantity: link.requiredQuantity,
      }
    })
    const buildable = calculateBuildableQuantity(componentInput)
    const capacityByInventoryItemId = new Map(
      calculateComponentCapacities(componentInput).map((component) => [
        component.inventoryItemId,
        component,
      ]),
    )
    const limitingIds = new Set(buildable.limitingInventoryItemIds)
    const components = links.map((link) => {
      const level = levelByInventoryItemId.get(link.inventoryItemId)
      const capacity = capacityByInventoryItemId.get(link.inventoryItemId)

      if (!capacity) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `capacity was not calculated for ${link.inventoryItemId}`,
        )
      }

      return {
        inventory_item_id: link.inventoryItemId,
        inventory_item_title:
          level?.inventoryItemTitle || link.inventoryItemId,
        stocked_quantity: level?.stockedQuantity || 0,
        reserved_quantity: level?.reservedQuantity || 0,
        available_quantity: capacity.availableQuantity,
        required_quantity: capacity.requiredQuantity,
        capacity: capacity.capacity,
        limiting: limitingIds.has(link.inventoryItemId),
      }
    })

    return {
      variant_id: variantId,
      status: "calculated" as const,
      calculated_stock: buildable.quantity,
      limiting_components: components
        .filter((component) => component.limiting)
        .map((component) => ({
          inventory_item_id: component.inventory_item_id,
          inventory_item_title: component.inventory_item_title,
        })),
      components,
    }
  })
}
