import {
  resolveVariantLocationAvailability,
  type NativeInventoryLocationLevel,
  type VariantLocationAvailability,
} from "../bom/resolve-location-availability"
import type { NormalizedCompoundedProductRecipeRule } from "./recipe-rules"
import { resolveConfiguredCompoundedProductRecipeRows } from "./resolve-configured-recipes"

type AvailabilityMatrixRow = {
  key: string
  options: Array<{
    axisKey: string
    valueKey: string
  }>
}

export function resolveConfiguredRecipeLocationAvailability(input: {
  rows: AvailabilityMatrixRow[]
  rules: NormalizedCompoundedProductRecipeRule[]
  locationLevels: NativeInventoryLocationLevel[]
}): VariantLocationAvailability[] {
  const recipes = resolveConfiguredCompoundedProductRecipeRows({
    rows: input.rows,
    rules: input.rules,
  })

  return resolveVariantLocationAvailability({
    variantIds: input.rows.map((row) => row.key),
    recipeLinks: recipes.flatMap((recipe) =>
      recipe.components.map((component) => ({
        variantId: recipe.matrixRowKey,
        inventoryItemId: component.inventoryItemId,
        requiredQuantity: component.requiredQuantity,
      })),
    ),
    locationLevels: input.locationLevels,
  })
}
