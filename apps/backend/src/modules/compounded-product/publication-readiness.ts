import {
  CompoundedProductPublicationReadinessInput,
  type CompoundedProductReadinessBlocker,
} from "./contracts/governance"

export type CompoundedProductPublicationReadinessResult = {
  ready: boolean
  blockers: CompoundedProductReadinessBlocker[]
}

export function evaluateCompoundedProductPublicationReadiness(
  rawInput: CompoundedProductPublicationReadinessInput,
): CompoundedProductPublicationReadinessResult {
  const input = CompoundedProductPublicationReadinessInput.parse(rawInput)
  const blockers: CompoundedProductReadinessBlocker[] = []

  if (!input.registration_exists) {
    blockers.push("registration_missing")
  }

  if (!input.compound_format_assigned) {
    blockers.push("compound_format_missing")
  } else if (!input.compound_format_active) {
    blockers.push("compound_format_inactive")
  }

  if (!input.configuration_revision_active) {
    blockers.push("configuration_revision_inactive")
  }

  if (input.variant_count === 0) {
    blockers.push("variant_matrix_empty")
  }

  if (input.policy.require_price && !input.prices_ready) {
    blockers.push("price_missing")
  }

  if (input.policy.require_sales_channel && !input.sales_channels_ready) {
    blockers.push("sales_channel_missing")
  }

  if (
    input.policy.require_bom_for_managed_inventory &&
    input.managed_inventory_requires_bom &&
    !input.bom_recipes_ready
  ) {
    blockers.push("bom_recipe_missing")
  }

  if (
    input.policy.require_valid_structured_measurements &&
    !input.structured_measurements_valid
  ) {
    blockers.push("structured_measurement_invalid")
  }

  if (input.policy.require_governance_audit && !input.audit_available) {
    blockers.push("audit_unavailable")
  }

  return { ready: blockers.length === 0, blockers }
}
