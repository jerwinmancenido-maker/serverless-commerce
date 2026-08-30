import { MedusaError } from "@medusajs/framework/utils"

import type { BomComponentClassification } from "../bom/contracts/component-profile"
import {
  normalizeCompoundedProductRecipe,
  type CompoundedProductComponentProfile,
  type NormalizedCompoundedProductRecipeComponent,
} from "./bom-recipe"
import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"

type RecipeRule = CompoundedProductPresentationSnapshot["recipe_rules"][number]

export type CompoundedProductRecipeRuleProfile =
  CompoundedProductComponentProfile & {
    classification: BomComponentClassification
  }

type NormalizedRecipeRule<T extends RecipeRule> = T extends RecipeRule
  ? Omit<T, "components"> & {
      components: NormalizedCompoundedProductRecipeComponent[]
    }
  : never

export type NormalizedCompoundedProductRecipeRule =
  NormalizedRecipeRule<RecipeRule>

const expectedClassificationByRuleKind = {
  finished_product: "finished_product",
  variation_value: "included_supply",
  common_packaging: "packaging",
} as const satisfies Record<RecipeRule["kind"], BomComponentClassification>

export function validateAndNormalizeCompoundedProductRecipeRules(input: {
  rules: RecipeRule[]
  profiles: CompoundedProductRecipeRuleProfile[]
}): NormalizedCompoundedProductRecipeRule[] {
  const profileByInventoryItemId = new Map(
    input.profiles.map((profile) => [profile.inventory_item_id, profile]),
  )

  return input.rules.map((rule) => {
    const expectedClassification =
      expectedClassificationByRuleKind[rule.kind]

    rule.components.forEach((component) => {
      const profile = profileByInventoryItemId.get(
        component.inventory_item_id,
      )

      if (!profile) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Component profile was not found for ${component.inventory_item_id}`,
        )
      }

      if (profile.classification !== expectedClassification) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${component.inventory_item_id} must be classified as ${expectedClassification} for ${rule.kind} recipe rules`,
        )
      }
    })

    const components = rule.components.length
      ? normalizeCompoundedProductRecipe({
          request: {
            components: rule.components,
            note: null,
          },
          profiles: input.profiles,
        })
      : []

    return {
      ...rule,
      components,
    } as NormalizedCompoundedProductRecipeRule
  })
}
