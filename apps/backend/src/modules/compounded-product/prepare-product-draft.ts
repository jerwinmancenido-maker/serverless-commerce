import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

import type { AdminCreateCompoundedProductDraft } from "./contracts/product-creation"
import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"
import {
  normalizeCompoundedProductStructuredMeasurement,
  normalizeCompoundedProductStructuredRatio,
} from "./structured-measurement"
import {
  assertCompoundedProductVariantMatrixConfirmed,
  generateCompoundedProductVariantMatrix,
  type CompoundedProductVariantMatrix,
} from "./variant-matrix"

const COMPOUNDED_PRODUCT_METADATA_NAMESPACE = "compounded_product"

type ConfiguredField = CompoundedProductPresentationSnapshot["fields"][number]
type ConfiguredValue = AdminCreateCompoundedProductDraft["product"]["configured_values"][string]

export type PreparedCompoundedProductDraft = {
  nativeProduct: CreateProductWorkflowInputDTO
  matrix: CompoundedProductVariantMatrix
}

function invalidDraft(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function normalizeConfiguredValue(
  field: ConfiguredField,
  value: ConfiguredValue,
): unknown {
  if (field.kind === "text") {
    if (typeof value !== "string") {
      invalidDraft(`${field.key} must be text`)
    }

    const normalized = value.trim()

    if (!normalized || normalized.length > field.max_length) {
      invalidDraft(
        `${field.key} must contain 1 through ${field.max_length} characters`,
      )
    }

    return normalized
  }

  if (field.kind === "boolean") {
    if (typeof value !== "boolean") {
      invalidDraft(`${field.key} must be a boolean`)
    }

    return value
  }

  if (field.kind === "single_select") {
    if (typeof value !== "string") {
      invalidDraft(`${field.key} must select one configured value`)
    }

    const selected = field.values.find(
      (candidate) => candidate.key === value && candidate.active,
    )

    if (!selected) {
      invalidDraft(`${field.key} references an unknown or inactive value`)
    }

    return { key: selected.key, label: selected.label }
  }

  if (field.kind === "measurement") {
    if (typeof value !== "object" || value === null || !("amount" in value)) {
      invalidDraft(`${field.key} must be a structured measurement`)
    }

    const normalized = normalizeCompoundedProductStructuredMeasurement(value)

    if (
      normalized.dimension !== field.dimension ||
      !field.allowed_display_units.includes(normalized.displayUnit)
    ) {
      invalidDraft(`${field.key} uses a measurement outside its configuration`)
    }

    return normalized
  }

  if (field.kind === "ratio") {
    if (
      typeof value !== "object" ||
      value === null ||
      !("numerator" in value) ||
      !("denominator" in value)
    ) {
      invalidDraft(`${field.key} must be a structured ratio`)
    }

    const normalized = normalizeCompoundedProductStructuredRatio(value)

    if (
      normalized.numerator.dimension !== field.numerator_dimension ||
      normalized.denominator.dimension !== field.denominator_dimension ||
      !field.numerator_allowed_display_units.includes(
        normalized.numerator.displayUnit,
      ) ||
      !field.denominator_allowed_display_units.includes(
        normalized.denominator.displayUnit,
      )
    ) {
      invalidDraft(`${field.key} uses a ratio outside its configuration`)
    }

    if (
      field.denominator_dimension === "count" &&
      field.denominator_count_bases.length &&
      !field.denominator_count_bases.some(
        (basis) => basis.key === normalized.denominator.countBasis && basis.active,
      )
    ) {
      invalidDraft(`${field.key} uses an unknown or inactive count basis`)
    }

    return normalized
  }

  if (typeof value !== "string") {
    invalidDraft(`${field.key} must be a document reference`)
  }

  const normalized = value.trim()

  if (!normalized || normalized.length > 255) {
    invalidDraft(`${field.key} must contain a valid document reference`)
  }

  return normalized
}

function resolveConfiguredMetadata(input: {
  fields: CompoundedProductPresentationSnapshot["fields"]
  values: Record<string, ConfiguredValue>
  scope: "product" | "variant"
  context: string
}): Record<string, unknown> {
  const fieldsByKey = new Map(input.fields.map((field) => [field.key, field]))
  const metadata: Record<string, unknown> = {}

  for (const suppliedKey of Object.keys(input.values)) {
    const field = fieldsByKey.get(suppliedKey)

    if (!field) {
      invalidDraft(`${input.context} contains unknown field ${suppliedKey}`)
    }

    if (!field.metadata_target) {
      invalidDraft(`${suppliedKey} has no configured persistence target`)
    }

    if (field.metadata_target.scope !== input.scope) {
      invalidDraft(
        `${suppliedKey} belongs to ${field.metadata_target.scope} metadata`,
      )
    }

    if (field.metadata_target.key === COMPOUNDED_PRODUCT_METADATA_NAMESPACE) {
      invalidDraft(
        `${COMPOUNDED_PRODUCT_METADATA_NAMESPACE} is a reserved metadata key`,
      )
    }

    metadata[field.metadata_target.key] = normalizeConfiguredValue(
      field,
      input.values[suppliedKey],
    )
  }

  for (const field of input.fields) {
    if (
      field.requirement === "draft" &&
      field.metadata_target?.scope === input.scope &&
      !(field.key in input.values)
    ) {
      invalidDraft(`${input.context} is missing required field ${field.key}`)
    }

    if (field.requirement === "draft" && !field.metadata_target) {
      invalidDraft(
        `Required field ${field.key} has no configured persistence target`,
      )
    }
  }

  return metadata
}

function assertConfiguredPersistenceTargets(
  fields: CompoundedProductPresentationSnapshot["fields"],
) {
  const targets = new Set<string>()

  for (const field of fields) {
    if (!field.metadata_target) {
      continue
    }

    if (field.metadata_target.key === COMPOUNDED_PRODUCT_METADATA_NAMESPACE) {
      invalidDraft(
        `${COMPOUNDED_PRODUCT_METADATA_NAMESPACE} is a reserved metadata key`,
      )
    }

    const identity = `${field.metadata_target.scope}:${field.metadata_target.key}`

    if (targets.has(identity)) {
      invalidDraft(`Duplicate configured persistence target: ${identity}`)
    }

    targets.add(identity)
  }
}

export function prepareCompoundedProductDraft(input: {
  request: AdminCreateCompoundedProductDraft
  snapshot: CompoundedProductPresentationSnapshot
  configurationFingerprint: string
  serverMaximum: number
}): PreparedCompoundedProductDraft {
  assertConfiguredPersistenceTargets(input.snapshot.fields)

  const matrix = assertCompoundedProductVariantMatrixConfirmed(
    generateCompoundedProductVariantMatrix({
      axes: input.snapshot.variation_axes,
      selectedValueKeysByAxis: input.request.selected_value_keys_by_axis,
      excludedCombinationKeys: input.request.excluded_combination_keys,
      warningThreshold: input.snapshot.variant_warning_threshold,
      serverMaximum: input.serverMaximum,
      confirmation: input.request.matrix_confirmation
        ? {
            fingerprint: input.request.matrix_confirmation.fingerprint,
            resultingVariantCount:
              input.request.matrix_confirmation.resulting_variant_count,
          }
        : null,
    }),
  )
  const submissionsByRow = new Map(
    input.request.variants.map((variant) => [variant.matrix_row_key, variant]),
  )

  if (submissionsByRow.size !== input.request.variants.length) {
    invalidDraft("Variant submissions must contain unique matrix row keys")
  }

  if (submissionsByRow.size !== matrix.rows.length) {
    invalidDraft("Variant submissions must match every resulting matrix row")
  }

  for (const submittedKey of submissionsByRow.keys()) {
    if (!matrix.rows.some((row) => row.key === submittedKey)) {
      invalidDraft(`Variant submission references unknown row ${submittedKey}`)
    }
  }

  const skuSet = new Set<string>()
  const variants = matrix.rows.map((row) => {
    const submission = submissionsByRow.get(row.key)

    if (!submission) {
      invalidDraft(`Variant submission is missing row ${row.key}`)
    }

    const skuIdentity = submission.sku.toLocaleUpperCase("en-US")

    if (skuSet.has(skuIdentity)) {
      invalidDraft(`Duplicate SKU in request: ${submission.sku}`)
    }

    skuSet.add(skuIdentity)

    const configuredMetadata = resolveConfiguredMetadata({
      fields: input.snapshot.fields,
      values: submission.configured_values,
      scope: "variant",
      context: `Variant ${submission.sku}`,
    })

    return {
      title: row.title,
      sku: submission.sku,
      options: Object.fromEntries(
        row.options.map((option) => [option.semanticName, option.valueLabel]),
      ),
      prices: submission.prices,
      manage_inventory: submission.manage_inventory,
      allow_backorder: submission.allow_backorder,
      metadata: {
        ...configuredMetadata,
        [COMPOUNDED_PRODUCT_METADATA_NAMESPACE]: {
          schema_version: "1",
          matrix_row_key: row.key,
          image_urls: submission.image_urls,
          variation_measurements: row.options
            .filter((option) => option.measurement)
            .map((option) => ({
              axis_key: option.axisKey,
              value_key: option.valueKey,
              measurement: option.measurement,
            })),
        },
      },
    }
  })
  const productMetadata = resolveConfiguredMetadata({
    fields: input.snapshot.fields,
    values: input.request.product.configured_values,
    scope: "product",
    context: "Product",
  })
  const options = input.snapshot.variation_axes
    .slice()
    .sort((left, right) => left.position - right.position)
    .map((axis) => ({
      title: axis.semantic_name,
      values: Array.from(
        new Set(
          matrix.rows.flatMap((row) =>
            row.options
              .filter((option) => option.axisKey === axis.key)
              .map((option) => option.valueLabel),
          ),
        ),
      ),
    }))

  return {
    matrix,
    nativeProduct: {
      title: input.request.product.title,
      subtitle: input.request.product.subtitle,
      description: input.request.product.description,
      handle: input.request.product.handle,
      status: "draft",
      is_giftcard: false,
      discountable: true,
      type_id: input.request.product.type_id,
      collection_id: input.request.product.collection_id,
      category_ids: input.request.product.category_ids,
      tag_ids: input.request.product.tag_ids,
      sales_channels: input.request.product.sales_channel_ids.map((id) => ({
        id,
      })),
      shipping_profile_id: input.request.product.shipping_profile_id,
      images: input.request.product.image_urls.map((url) => ({ url })),
      options,
      variants,
      metadata: {
        ...productMetadata,
        [COMPOUNDED_PRODUCT_METADATA_NAMESPACE]: {
          schema_version: "1",
          presentation_revision_id: input.request.presentation_revision_id,
          configuration_fingerprint: input.configurationFingerprint,
          matrix_fingerprint: matrix.fingerprint,
        },
      },
    },
  }
}
