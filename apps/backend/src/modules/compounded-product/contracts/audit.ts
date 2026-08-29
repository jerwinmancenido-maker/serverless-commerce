import { z } from "@medusajs/framework/zod"

export const COMPOUNDED_PRODUCT_AUDIT_EVENT_TYPES = [
  "configuration_created",
  "configuration_revised",
  "configuration_status_transitioned",
  "governed_registration_created",
  "governed_registration_reclassified",
  "governed_registration_removed",
  "classification_mapping_created",
  "classification_mapping_status_transitioned",
  "configuration_revision_retained",
  "configuration_revision_migrated",
  "large_matrix_confirmed",
  "product_draft_created",
  "readiness_evaluated",
  "recipe_changed",
  "publication_succeeded",
  "publication_rejected",
  "publication_withdrawn",
] as const

export const COMPOUNDED_PRODUCT_AUDIT_OUTCOMES = [
  "succeeded",
  "rejected",
] as const

export const CompoundedProductGovernanceAuditEventInput = z.object({
  event_type: z.enum(COMPOUNDED_PRODUCT_AUDIT_EVENT_TYPES),
  outcome: z.enum(COMPOUNDED_PRODUCT_AUDIT_OUTCOMES),
  actor_id: z.string().trim().min(1),
  product_id: z.string().trim().min(1).nullable().default(null),
  variant_id: z.string().trim().min(1).nullable().default(null),
  presentation_id: z.string().trim().min(1).nullable().default(null),
  presentation_revision_id: z.string().trim().min(1).nullable().default(null),
  registration_id: z.string().trim().min(1).nullable().default(null),
  correlation_id: z.string().trim().min(1).nullable().default(null),
  decision: z.record(z.string(), z.unknown()),
})

export type CompoundedProductGovernanceAuditEventInput = z.infer<
  typeof CompoundedProductGovernanceAuditEventInput
>

export const AdminChangeCompoundedProductPublication = z.object({
  action: z.enum(["publish", "withdraw"]),
  reason: z.string().trim().min(3).max(500),
})

export type AdminChangeCompoundedProductPublication = z.infer<
  typeof AdminChangeCompoundedProductPublication
>
