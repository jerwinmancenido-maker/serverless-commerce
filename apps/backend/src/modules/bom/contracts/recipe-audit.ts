import { createHash } from "node:crypto"

import { type BomBaseUnit } from "./inventory-kit"

export type RecipeSnapshotComponent = {
  inventoryItemId: string
  requiredQuantity: number
  baseUnit: BomBaseUnit
  displayUnit: string
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
}

export function normalizeRecipeSnapshotComponents(
  components: RecipeSnapshotComponent[],
) {
  return components
    .map((component) => ({ ...component }))
    .sort((left, right) =>
      left.inventoryItemId.localeCompare(right.inventoryItemId),
    )
}

export function createRecipeSnapshotHash(
  components: RecipeSnapshotComponent[],
) {
  return createHash("sha256")
    .update(JSON.stringify(normalizeRecipeSnapshotComponents(components)))
    .digest("hex")
}
