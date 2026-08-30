import type { CompoundedProductReadinessPolicySnapshot } from "./contracts/governance"
import {
  evaluateCompoundedProductPublicationReadiness,
  type CompoundedProductPublicationReadinessResult,
} from "./publication-readiness"

export type CompoundedProductReadinessVariant = {
  id: string
  sku: string | null
  title: string
  manage_inventory: boolean
  has_price: boolean
  recipe_components: Array<{
    inventory_item_id: string
    required_quantity: number
  }>
  recipe_ready: boolean
}

export type CompoundedProductReadinessFacts = {
  registration_exists: boolean
  compound_family_assigned: boolean
  compound_family_active: boolean
  compound_format_assigned: boolean
  compound_format_active: boolean
  configuration_revision_active: boolean
  sales_channels_ready: boolean
  structured_measurements_valid: boolean
  audit_available: boolean
  policy: CompoundedProductReadinessPolicySnapshot
  variants: CompoundedProductReadinessVariant[]
}

export type CompoundedProductReadinessReport =
  CompoundedProductPublicationReadinessResult & {
    variants: CompoundedProductReadinessVariant[]
  }

export function compoundedProductRecipeIsReady(input: {
  manageInventory: boolean
  recipeComponents: Array<{ inventory_item_id: string }>
  profiledInventoryItemIds: Set<string>
}) {
  return (
    !input.manageInventory ||
    (input.recipeComponents.length > 0 &&
      input.recipeComponents.every((component) =>
        input.profiledInventoryItemIds.has(component.inventory_item_id),
      ))
  )
}

export function buildCompoundedProductReadinessReport(
  facts: CompoundedProductReadinessFacts,
): CompoundedProductReadinessReport {
  const managedVariants = facts.variants.filter(
    (variant) => variant.manage_inventory,
  )
  const result = evaluateCompoundedProductPublicationReadiness({
    registration_exists: facts.registration_exists,
    compound_family_assigned: facts.compound_family_assigned,
    compound_family_active: facts.compound_family_active,
    compound_format_assigned: facts.compound_format_assigned,
    compound_format_active: facts.compound_format_active,
    configuration_revision_active: facts.configuration_revision_active,
    variant_count: facts.variants.length,
    prices_ready:
      facts.variants.length > 0 &&
      facts.variants.every((variant) => variant.has_price),
    sales_channels_ready: facts.sales_channels_ready,
    managed_inventory_requires_bom: managedVariants.length > 0,
    bom_recipes_ready:
      managedVariants.length === 0 ||
      managedVariants.every((variant) => variant.recipe_ready),
    structured_measurements_valid: facts.structured_measurements_valid,
    audit_available: facts.audit_available,
    policy: facts.policy,
  })

  return { ...result, variants: facts.variants }
}
