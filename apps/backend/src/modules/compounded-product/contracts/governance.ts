import { z } from "@medusajs/framework/zod"

export const COMPOUNDED_PRODUCT_REGISTRATION_STATES = [
  "draft",
  "ready",
  "blocked",
  "published",
  "withdrawn",
] as const

export const COMPOUNDED_PRODUCT_READINESS_BLOCKERS = [
  "registration_missing",
  "compound_format_missing",
  "compound_format_inactive",
  "configuration_revision_inactive",
  "variant_matrix_empty",
  "price_missing",
  "sales_channel_missing",
  "bom_recipe_missing",
  "structured_measurement_invalid",
  "audit_unavailable",
] as const

export const CompoundedProductReadinessPolicySnapshot = z.strictObject({
  schema_version: z.literal("1"),
  require_price: z.boolean(),
  require_sales_channel: z.boolean(),
  require_bom_for_managed_inventory: z.boolean(),
  require_valid_structured_measurements: z.boolean(),
  require_governance_audit: z.boolean(),
})

export const CompoundedProductPublicationReadinessInput = z.strictObject({
  registration_exists: z.boolean(),
  compound_format_assigned: z.boolean(),
  compound_format_active: z.boolean(),
  configuration_revision_active: z.boolean(),
  variant_count: z.number().int().nonnegative(),
  prices_ready: z.boolean(),
  sales_channels_ready: z.boolean(),
  managed_inventory_requires_bom: z.boolean(),
  bom_recipes_ready: z.boolean(),
  structured_measurements_valid: z.boolean(),
  audit_available: z.boolean(),
  policy: CompoundedProductReadinessPolicySnapshot,
})

export type CompoundedProductRegistrationState =
  (typeof COMPOUNDED_PRODUCT_REGISTRATION_STATES)[number]

export type CompoundedProductReadinessBlocker =
  (typeof COMPOUNDED_PRODUCT_READINESS_BLOCKERS)[number]

export type CompoundedProductReadinessPolicySnapshot = z.infer<
  typeof CompoundedProductReadinessPolicySnapshot
>

export const DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY = {
  schema_version: "1",
  require_price: true,
  require_sales_channel: true,
  require_bom_for_managed_inventory: true,
  require_valid_structured_measurements: true,
  require_governance_audit: true,
} as const satisfies CompoundedProductReadinessPolicySnapshot

export type CompoundedProductPublicationReadinessInput = z.infer<
  typeof CompoundedProductPublicationReadinessInput
>
