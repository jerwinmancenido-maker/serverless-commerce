import { MedusaError } from "@medusajs/framework/utils"

import {
  convertResearchDisplayAmountToBaseUnits,
  isResearchDisplayUnit,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
} from "../../lib/research-quantity"
import { normalizeInventoryKitComponents } from "../bom/contracts/inventory-kit"
import type { AdminSetCompoundedProductVariantRecipe } from "./contracts/bom-readiness"

export type CompoundedProductComponentProfile = {
  inventory_item_id: string
  base_unit: ResearchBaseUnit
  display_unit: string
  base_units_per_display_unit: number
  display_precision: number
}

export type NormalizedCompoundedProductRecipeComponent = {
  inventoryItemId: string
  requiredQuantity: number
  requiredDisplayAmount: string
  displayUnit: ResearchDisplayUnit
  baseUnit: ResearchBaseUnit
}

export function normalizeCompoundedProductRecipe(input: {
  request: AdminSetCompoundedProductVariantRecipe
  profiles: CompoundedProductComponentProfile[]
}): NormalizedCompoundedProductRecipeComponent[] {
  const profileByInventoryItemId = new Map(
    input.profiles.map((profile) => [profile.inventory_item_id, profile]),
  )

  const normalized = input.request.components.map((component) => {
    const profile = profileByInventoryItemId.get(component.inventory_item_id)

    if (!profile) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Component profile was not found for ${component.inventory_item_id}`,
      )
    }

    if (!isResearchDisplayUnit(profile.display_unit)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Component profile ${component.inventory_item_id} has an unsupported display unit`,
      )
    }

    const converted = convertResearchDisplayAmountToBaseUnits({
      amount: component.required_display_amount,
      displayUnit: profile.display_unit,
      unitProfile: {
        displayUnit: profile.display_unit,
        baseUnit: profile.base_unit,
        baseUnitsPerDisplayUnit: profile.base_units_per_display_unit,
        displayPrecision: profile.display_precision,
      },
    })

    return {
      inventoryItemId: component.inventory_item_id,
      requiredQuantity: converted.baseUnits,
      requiredDisplayAmount: component.required_display_amount,
      displayUnit: profile.display_unit,
      baseUnit: converted.baseUnit,
    }
  })

  normalizeInventoryKitComponents(
    normalized.map(({ inventoryItemId, requiredQuantity }) => ({
      inventoryItemId,
      requiredQuantity,
    })),
  )

  return normalized.sort((left, right) =>
    left.inventoryItemId.localeCompare(right.inventoryItemId),
  )
}
