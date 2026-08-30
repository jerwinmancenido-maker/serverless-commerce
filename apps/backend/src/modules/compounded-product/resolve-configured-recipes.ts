import { MedusaError } from "@medusajs/framework/utils"

import { normalizeInventoryKitComponents } from "../bom/contracts/inventory-kit"
import type { NormalizedCompoundedProductRecipeRule } from "./recipe-rules"
import type { CompoundedProductVariantMatrix } from "./variant-matrix"

export type ResolvedConfiguredVariantRecipe = {
  matrixRowKey: string
  components: Array<{
    inventoryItemId: string
    requiredQuantity: number
  }>
}

type ConfiguredRecipeMatrixRow = {
  key: string
  options: Array<{
    axisKey: string
    valueKey: string
  }>
}

function invalidRecipe(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function ruleMatchesRow(
  rule: Extract<
    NormalizedCompoundedProductRecipeRule,
    { kind: "finished_product" | "variation_value" }
  >,
  row: ConfiguredRecipeMatrixRow,
) {
  return row.options.some(
    (option) =>
      option.axisKey === rule.match.axis_key &&
      option.valueKey === rule.match.value_key,
  )
}

export function resolveConfiguredCompoundedProductRecipeRows(input: {
  rows: ConfiguredRecipeMatrixRow[]
  rules: NormalizedCompoundedProductRecipeRule[]
}): ResolvedConfiguredVariantRecipe[] {
  if (!input.rules.length) {
    return []
  }

  const finishedRules = input.rules.filter(
    (rule) => rule.kind === "finished_product",
  )
  const variationRules = input.rules.filter(
    (rule) => rule.kind === "variation_value",
  )
  const commonPackagingRules = input.rules.filter(
    (rule) => rule.kind === "common_packaging",
  )

  return input.rows.map((row) => {
    const matchedFinishedRules = finishedRules.filter((rule) =>
      ruleMatchesRow(rule, row),
    )

    if (matchedFinishedRules.length !== 1) {
      invalidRecipe(
        `Variant row ${row.key} must resolve exactly one finished product component; resolved ${matchedFinishedRules.length}`,
      )
    }

    const matchedVariationRules = variationRules.filter((rule) =>
      ruleMatchesRow(rule, row),
    )
    const quantitiesByInventoryItemId = new Map<string, number>()

    for (const rule of [
      ...matchedFinishedRules,
      ...matchedVariationRules,
      ...commonPackagingRules,
    ]) {
      for (const component of rule.components) {
        const current =
          quantitiesByInventoryItemId.get(component.inventoryItemId) || 0
        const combined = current + component.requiredQuantity

        if (!Number.isSafeInteger(combined) || combined <= 0) {
          invalidRecipe(
            `Variant row ${row.key} has an unsafe combined quantity for ${component.inventoryItemId}`,
          )
        }

        quantitiesByInventoryItemId.set(component.inventoryItemId, combined)
      }
    }

    const components = normalizeInventoryKitComponents(
      Array.from(quantitiesByInventoryItemId, ([
        inventoryItemId,
        requiredQuantity,
      ]) => ({
        inventoryItemId,
        requiredQuantity,
      })),
    )

    return {
      matrixRowKey: row.key,
      components,
    }
  })
}

export function resolveConfiguredCompoundedProductRecipes(input: {
  matrix: CompoundedProductVariantMatrix
  rules: NormalizedCompoundedProductRecipeRule[]
}): ResolvedConfiguredVariantRecipe[] {
  return resolveConfiguredCompoundedProductRecipeRows({
    rows: input.matrix.rows,
    rules: input.rules,
  })
}
