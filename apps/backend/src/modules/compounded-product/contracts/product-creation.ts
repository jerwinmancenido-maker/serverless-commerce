import { z } from "@medusajs/framework/zod"

import {
  RESEARCH_BASE_UNITS,
  RESEARCH_DISPLAY_UNITS,
  RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN,
  RESEARCH_QUANTITY_DIMENSIONS,
} from "../../../lib/research-quantity"
import { COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE } from "../structured-measurement"
import { CompoundedProductIdempotencyKey } from "./idempotency"

const OptionalId = z.string().trim().min(1).max(255).nullable().default(null)
const OptionalText = (maximum: number) =>
  z.string().trim().max(maximum).nullable().default(null)
const UniqueIdArray = z
  .array(z.string().trim().min(1).max(255))
  .max(100)
  .refine((values) => new Set(values).size === values.length, {
    message: "IDs must be unique",
  })
  .default([])

const UnitProfile = z.strictObject({
  displayUnit: z.enum(RESEARCH_DISPLAY_UNITS),
  baseUnit: z.enum(RESEARCH_BASE_UNITS),
  baseUnitsPerDisplayUnit: z.number().int().positive(),
  displayPrecision: z.number().int().min(0).max(6),
})

export const CompoundedProductStructuredMeasurementInputSchema =
  z.strictObject({
    amount: z.string().trim().min(1).max(80),
    displayUnit: z.enum(RESEARCH_DISPLAY_UNITS),
    dimension: z.enum(RESEARCH_QUANTITY_DIMENSIONS),
    displayPrecision: z.number().int().min(0).max(6),
    provenance: z.enum(COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE),
    materialProfileId: OptionalId,
    sourceDocumentId: OptionalId,
    countBasis: OptionalId,
    unitProfile: UnitProfile.optional(),
  })

export const CompoundedProductStructuredRatioInputSchema = z.strictObject({
  numerator: CompoundedProductStructuredMeasurementInputSchema,
  denominator: CompoundedProductStructuredMeasurementInputSchema,
})

export const CompoundedProductDocumentReferenceInputSchema = z.strictObject({
  documentId: z.string().trim().min(1).max(255),
  documentType: z.string().trim().min(1).max(64),
})

const CompoundedProductConfiguredValue = z.union([
  z.string().max(10_000),
  z.boolean(),
  CompoundedProductStructuredMeasurementInputSchema,
  CompoundedProductStructuredRatioInputSchema,
  CompoundedProductDocumentReferenceInputSchema,
])

const VariantPrice = z.strictObject({
  amount: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN),
  currency_code: z.string().trim().toLowerCase().length(3),
})

const VariantSubmission = z
  .strictObject({
    matrix_row_key: z.string().length(64).regex(/^[a-f0-9]{64}$/),
    sku: z.string().trim().max(255).default(""),
    prices: z.array(VariantPrice).max(50).default([]),
    image_urls: z.array(z.string().url().max(2_000)).max(50).default([]),
    manage_inventory: z.boolean().default(true),
    allow_backorder: z.boolean().default(false),
    configured_values: z
      .record(z.string(), CompoundedProductConfiguredValue)
      .default({}),
  })
  .superRefine((variant, context) => {
    const currencies = new Set<string>()

    variant.prices.forEach((price, index) => {
      if (currencies.has(price.currency_code)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate price currency: ${price.currency_code}`,
          path: ["prices", index, "currency_code"],
        })
      }

      currencies.add(price.currency_code)
    })
  })

const ProductSubmission = z.strictObject({
  title: z.string().trim().min(1).max(255),
  subtitle: OptionalText(255),
  description: OptionalText(20_000),
  handle: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .nullable()
    .default(null),
  type_id: OptionalId,
  collection_id: OptionalId,
  category_ids: UniqueIdArray,
  tag_ids: UniqueIdArray,
  sales_channel_ids: UniqueIdArray,
  shipping_profile_id: z.string().trim().min(1).max(255),
  image_urls: z.array(z.string().url().max(2_000)).max(50).default([]),
  configured_values: z
    .record(z.string(), CompoundedProductConfiguredValue)
    .default({}),
})

export const AdminCreateCompoundedProductDraft = z.strictObject({
  idempotency_key: CompoundedProductIdempotencyKey,
  presentation_revision_id: z.string().trim().min(1).max(255),
  expected_configuration_fingerprint: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]{64}$/),
  configuration_revision_resolution: z
    .discriminatedUnion("action", [
      z.strictObject({
        action: z.literal("retain"),
        from_revision_id: z.string().trim().min(1).max(255),
        to_revision_id: z.string().trim().min(1).max(255),
        impact_fingerprint: z.string().length(64).regex(/^[a-f0-9]{64}$/),
        reason: z.string().trim().min(3).max(500),
      }),
      z.strictObject({
        action: z.literal("migrate"),
        from_revision_id: z.string().trim().min(1).max(255),
        to_revision_id: z.string().trim().min(1).max(255),
        impact_fingerprint: z.string().length(64).regex(/^[a-f0-9]{64}$/),
        reason: z.string().trim().min(3).max(500),
      }),
    ])
    .nullable()
    .default(null),
  selected_value_keys_by_axis: z
    .record(z.string(), z.array(z.string().trim().min(1).max(64)).min(1))
    .default({}),
  excluded_combination_keys: z
    .array(z.string().length(64).regex(/^[a-f0-9]{64}$/))
    .default([]),
  matrix_confirmation: z
    .strictObject({
      fingerprint: z.string().length(64).regex(/^[a-f0-9]{64}$/),
      resulting_variant_count: z.number().int().positive(),
    })
    .nullable()
    .default(null),
  product: ProductSubmission,
  variants: z.array(VariantSubmission).min(1).max(1_000),
})

export const AdminCompareCompoundedProductConfigurationRevisions =
  z.strictObject({
    from_revision_id: z.string().trim().min(1).max(255),
    to_revision_id: z.string().trim().min(1).max(255),
  })

export const AdminPreviewCompoundedProductVariantMatrix = z.strictObject({
  presentation_revision_id: z.string().trim().min(1).max(255),
  expected_configuration_fingerprint: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]{64}$/),
  selected_value_keys_by_axis: z
    .record(z.string(), z.array(z.string().trim().min(1).max(64)).min(1))
    .default({}),
  excluded_combination_keys: z
    .array(z.string().length(64).regex(/^[a-f0-9]{64}$/))
    .default([]),
})

export type AdminCreateCompoundedProductDraft = z.infer<
  typeof AdminCreateCompoundedProductDraft
>

export type AdminPreviewCompoundedProductVariantMatrix = z.infer<
  typeof AdminPreviewCompoundedProductVariantMatrix
>

export type AdminCompareCompoundedProductConfigurationRevisions = z.infer<
  typeof AdminCompareCompoundedProductConfigurationRevisions
>

export type CompoundedProductConfiguredValue = z.infer<
  typeof CompoundedProductConfiguredValue
>
