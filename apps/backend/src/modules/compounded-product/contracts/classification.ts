import { z } from "@medusajs/framework/zod"

export const COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES = [
  "active",
  "inactive",
  "archived",
] as const

export const AdminCreateCompoundedProductClassificationMapping = z.strictObject({
  product_type_id: z.string().trim().min(1).max(255),
  presentation_id: z.string().trim().min(1).max(255),
  reason: z.string().trim().min(3).max(1_000),
})

export const AdminTransitionCompoundedProductClassificationMapping =
  z.strictObject({
    expected_status: z.enum(COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES),
    target_status: z.enum(COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES),
    reason: z.string().trim().min(3).max(1_000),
  }).refine((input) => input.expected_status !== input.target_status, {
    message: "Classification mapping status must change",
    path: ["target_status"],
  })

export const AdminListCompoundedProductClassificationMappings = z.strictObject({
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().positive().max(100).default(100),
  ),
  offset: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().nonnegative().default(0),
  ),
})

const CompoundedProductClassificationAction = z.enum([
  "reclassify",
  "remove_governance",
])

export const AdminPreviewCompoundedProductClassificationChange = z.strictObject({
  action: CompoundedProductClassificationAction,
  target_product_type_id: z.string().trim().min(1).max(255),
})

export const AdminChangeCompoundedProductClassification =
  AdminPreviewCompoundedProductClassificationChange.extend({
    impact_fingerprint: z.string().length(64).regex(/^[a-f0-9]{64}$/),
    reason: z.string().trim().min(3).max(1_000),
  })

export type CompoundedProductClassificationMappingStatus =
  (typeof COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES)[number]

export type AdminCreateCompoundedProductClassificationMapping = z.infer<
  typeof AdminCreateCompoundedProductClassificationMapping
>

export type AdminTransitionCompoundedProductClassificationMapping = z.infer<
  typeof AdminTransitionCompoundedProductClassificationMapping
>

export type AdminListCompoundedProductClassificationMappings = z.infer<
  typeof AdminListCompoundedProductClassificationMappings
>

export type AdminPreviewCompoundedProductClassificationChange = z.infer<
  typeof AdminPreviewCompoundedProductClassificationChange
>

export type AdminChangeCompoundedProductClassification = z.infer<
  typeof AdminChangeCompoundedProductClassification
>
