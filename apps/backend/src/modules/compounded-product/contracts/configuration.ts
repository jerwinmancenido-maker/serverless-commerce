import { z } from "@medusajs/framework/zod"

import {
  convertResearchFixedDisplayAmountToBaseUnits,
  RESEARCH_DISPLAY_UNITS,
  RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN,
  type ResearchDisplayUnit,
} from "../../../lib/research-quantity"

export const COMPOUNDED_PRODUCT_CONFIGURATION_SCHEMA_VERSION = "1"

export const COMPOUNDED_PRODUCT_CONFIGURATION_STATUSES = [
  "draft",
  "active",
  "inactive",
  "blocked",
  "archived",
] as const

export const COMPOUNDED_PRODUCT_REVISION_STATUSES = [
  "draft",
  "active",
  "superseded",
  "blocked",
  "archived",
] as const

export const COMPOUNDED_PRODUCT_FIELD_KINDS = [
  "text",
  "boolean",
  "single_select",
  "measurement",
  "ratio",
  "document_reference",
] as const

export const COMPOUNDED_PRODUCT_FIELD_REQUIREMENTS = [
  "optional",
  "draft",
  "publication",
] as const

export const COMPOUNDED_PRODUCT_MEASUREMENT_DIMENSIONS = [
  "mass",
  "volume",
  "potency",
  "count",
] as const

const CONFIGURATION_KEY_PATTERN = /^[a-z][a-z0-9_]*$/

const DISPLAY_UNITS_BY_DIMENSION = {
  mass: ["mcg", "mg", "g"],
  volume: ["µL", "mL"],
  potency: ["IU"],
  count: ["piece", "unit"],
} as const

const ConfigurationKey = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(CONFIGURATION_KEY_PATTERN)

const DisplayLabel = z.string().trim().min(1).max(160)

const PositiveDecimalAmount = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN,
    "Amount must be a normalized positive decimal",
  )
  .refine((value) => /[1-9]/.test(value), {
    message: "Amount must be greater than zero",
  })

const Position = z.number().int().nonnegative().max(10_000)

const MetadataTarget = z.strictObject({
  scope: z.enum(["product", "variant"]),
  key: ConfigurationKey,
})

const FieldBase = {
  key: ConfigurationKey,
  label: DisplayLabel,
  help_text: z.string().trim().max(1_000).nullable().default(null),
  position: Position,
  requirement: z.enum(COMPOUNDED_PRODUCT_FIELD_REQUIREMENTS),
  metadata_target: MetadataTarget.nullable().default(null),
}

const SelectValue = z.strictObject({
  key: ConfigurationKey,
  label: DisplayLabel,
  position: Position,
  active: z.boolean().default(true),
})

const TextField = z.strictObject({
  ...FieldBase,
  kind: z.literal("text"),
  multiline: z.boolean().default(false),
  max_length: z.number().int().positive().max(10_000),
})

const BooleanField = z.strictObject({
  ...FieldBase,
  kind: z.literal("boolean"),
})

const SingleSelectField = z.strictObject({
  ...FieldBase,
  kind: z.literal("single_select"),
  values: z.array(SelectValue).min(1).max(500),
})

const MeasurementField = z.strictObject({
  ...FieldBase,
  kind: z.literal("measurement"),
  dimension: z.enum(COMPOUNDED_PRODUCT_MEASUREMENT_DIMENSIONS),
  allowed_display_units: z
    .array(z.enum(RESEARCH_DISPLAY_UNITS))
    .min(1)
    .max(RESEARCH_DISPLAY_UNITS.length),
  allow_product_specific_iu: z.boolean().default(false),
})

const RatioField = z.strictObject({
  ...FieldBase,
  kind: z.literal("ratio"),
  numerator_dimension: z.enum(COMPOUNDED_PRODUCT_MEASUREMENT_DIMENSIONS),
  numerator_allowed_display_units: z
    .array(z.enum(RESEARCH_DISPLAY_UNITS))
    .min(1)
    .max(RESEARCH_DISPLAY_UNITS.length),
  denominator_dimension: z.enum(COMPOUNDED_PRODUCT_MEASUREMENT_DIMENSIONS),
  denominator_allowed_display_units: z
    .array(z.enum(RESEARCH_DISPLAY_UNITS))
    .min(1)
    .max(RESEARCH_DISPLAY_UNITS.length),
  denominator_count_bases: z.array(SelectValue).max(100).default([]),
  allow_product_specific_iu: z.boolean().default(false),
})

const DocumentReferenceField = z.strictObject({
  ...FieldBase,
  kind: z.literal("document_reference"),
  allowed_document_types: z.array(ConfigurationKey).min(1).max(100),
})

export const CompoundedProductConfiguredField = z.discriminatedUnion("kind", [
  TextField,
  BooleanField,
  SingleSelectField,
  MeasurementField,
  RatioField,
  DocumentReferenceField,
])

export const CompoundedProductVariationValue = z
  .strictObject({
    key: ConfigurationKey,
    label: DisplayLabel,
    position: Position,
    active: z.boolean().default(true),
    measurement: z
      .strictObject({
        amount: PositiveDecimalAmount,
        display_unit: z.enum(RESEARCH_DISPLAY_UNITS),
        material_profile_id: z
          .string()
          .trim()
          .min(1)
          .max(255)
          .nullable()
          .default(null),
      })
      .nullable()
      .default(null),
  })
  .superRefine((value, context) => {
    const measurement = value.measurement

    if (!measurement) {
      return
    }

    if (measurement.display_unit === "IU" && !measurement.material_profile_id) {
      context.addIssue({
        code: "custom",
        message: "IU requires an explicit product-specific material profile",
        path: ["measurement", "material_profile_id"],
      })

      return
    }

    if (measurement.display_unit !== "IU") {
      try {
        convertResearchFixedDisplayAmountToBaseUnits({
          amount: measurement.amount,
          displayUnit: measurement.display_unit,
        })
      } catch (error) {
        context.addIssue({
          code: "custom",
          message:
            error instanceof Error
              ? error.message
              : "Measurement does not resolve to safe integer base units",
          path: ["measurement", "amount"],
        })
      }
    }
  })

export const CompoundedProductVariationAxis = z.strictObject({
  key: ConfigurationKey,
  semantic_name: DisplayLabel,
  help_text: z.string().trim().max(1_000).nullable().default(null),
  position: Position,
  values: z.array(CompoundedProductVariationValue).min(1).max(500),
})

const SkuSuggestionPolicy = z.strictObject({
  template: z.string().trim().min(1).max(500),
  separator: z.string().max(8),
  normalization: z.enum(["uppercase", "lowercase", "preserve"]),
})

function addDuplicateIssues(
  values: Array<{ key: string; position: number }>,
  context: z.core.$RefinementCtx,
  path: Array<string | number>,
) {
  const keys = new Set<string>()
  const positions = new Set<number>()

  values.forEach((value, index) => {
    if (keys.has(value.key)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate key: ${value.key}`,
        path: [...path, index, "key"],
      })
    }

    if (positions.has(value.position)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate position: ${value.position}`,
        path: [...path, index, "position"],
      })
    }

    keys.add(value.key)
    positions.add(value.position)
  })
}

function normalizeDisplayIdentity(value: string) {
  return value.trim().toLocaleLowerCase("en-US")
}

function addDuplicateDisplayIssues(
  values: Array<{ label: string }>,
  context: z.core.$RefinementCtx,
  path: Array<string | number>,
) {
  const labels = new Set<string>()

  values.forEach((value, index) => {
    const normalizedLabel = normalizeDisplayIdentity(value.label)

    if (labels.has(normalizedLabel)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate display value: ${value.label}`,
        path: [...path, index, "label"],
      })
    }

    labels.add(normalizedLabel)
  })
}

function normalizeDecimal(value: string) {
  const [integer, fraction = ""] = value.split(".")
  const normalizedFraction = fraction.replace(/0+$/, "")

  return normalizedFraction ? `${integer}.${normalizedFraction}` : integer
}

function measurementIdentity(
  measurement: {
    amount: string
    display_unit: ResearchDisplayUnit
    material_profile_id: string | null
  } | null,
) {
  if (!measurement) {
    return null
  }

  if (measurement.display_unit !== "IU") {
    try {
      const fixedQuantity = convertResearchFixedDisplayAmountToBaseUnits({
        amount: measurement.amount,
        displayUnit: measurement.display_unit,
      })

      return fixedQuantity
        ? `${fixedQuantity.baseUnit}:${fixedQuantity.baseUnits}`
        : null
    } catch {
      return null
    }
  }

  return `IU:${measurement.material_profile_id}:${normalizeDecimal(measurement.amount)}`
}

function addDuplicateMeasurementIssues(
  values: Array<{
    measurement: {
      amount: string
      display_unit: ResearchDisplayUnit
      material_profile_id: string | null
    } | null
  }>,
  context: z.core.$RefinementCtx,
  path: Array<string | number>,
) {
  const measurements = new Set<string>()

  values.forEach((value, index) => {
    const identity = measurementIdentity(value.measurement)

    if (!identity) {
      return
    }

    if (measurements.has(identity)) {
      context.addIssue({
        code: "custom",
        message: "Duplicate normalized measurement value",
        path: [...path, index, "measurement"],
      })
    }

    measurements.add(identity)
  })
}

function addDuplicateSemanticNameIssues(
  axes: Array<{ semantic_name: string }>,
  context: z.core.$RefinementCtx,
) {
  const semanticNames = new Set<string>()

  axes.forEach((axis, index) => {
    const semanticName = normalizeDisplayIdentity(axis.semantic_name)

    if (semanticNames.has(semanticName)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate semantic name: ${axis.semantic_name}`,
        path: ["variation_axes", index, "semantic_name"],
      })
    }

    semanticNames.add(semanticName)
  })
}

function addUnitCompatibilityIssues(
  units: readonly string[],
  dimension: keyof typeof DISPLAY_UNITS_BY_DIMENSION,
  allowProductSpecificIu: boolean,
  context: z.core.$RefinementCtx,
  path: Array<string | number>,
) {
  const compatibleUnits = DISPLAY_UNITS_BY_DIMENSION[
    dimension
  ] as readonly string[]

  units.forEach((unit, index) => {
    if (!compatibleUnits.includes(unit)) {
      context.addIssue({
        code: "custom",
        message: `${unit} is not compatible with the ${dimension} dimension`,
        path: [...path, index],
      })
    }
  })

  if (units.includes("IU") && !allowProductSpecificIu) {
    context.addIssue({
      code: "custom",
      message: "IU requires an explicit product-specific material profile",
      path,
    })
  }
}

export const CompoundedProductPresentationSnapshot = z
  .strictObject({
    schema_version: z.literal(COMPOUNDED_PRODUCT_CONFIGURATION_SCHEMA_VERSION),
    label: DisplayLabel,
    description: z.string().trim().max(2_000).nullable().default(null),
    fields: z.array(CompoundedProductConfiguredField).max(500),
    variation_axes: z.array(CompoundedProductVariationAxis).max(50),
    sku_suggestion_policy: SkuSuggestionPolicy.nullable().default(null),
    variant_warning_threshold: z.number().int().positive().max(100_000),
  })
  .superRefine((snapshot, context) => {
    addDuplicateIssues(snapshot.fields, context, ["fields"])
    addDuplicateIssues(snapshot.variation_axes, context, ["variation_axes"])
    addDuplicateSemanticNameIssues(snapshot.variation_axes, context)

    snapshot.variation_axes.forEach((axis, axisIndex) => {
      const path = ["variation_axes", axisIndex, "values"]

      addDuplicateIssues(axis.values, context, path)
      addDuplicateDisplayIssues(axis.values, context, path)
      addDuplicateMeasurementIssues(axis.values, context, path)
    })

    snapshot.fields.forEach((field, fieldIndex) => {
      if (field.kind === "single_select") {
        const path = ["fields", fieldIndex, "values"]
        addDuplicateIssues(field.values, context, path)
        addDuplicateDisplayIssues(field.values, context, path)
      }

      if (field.kind === "measurement") {
        addUnitCompatibilityIssues(
          field.allowed_display_units,
          field.dimension,
          field.allow_product_specific_iu,
          context,
          ["fields", fieldIndex, "allowed_display_units"],
        )
      }

      if (field.kind === "ratio") {
        addDuplicateIssues(field.denominator_count_bases, context, [
          "fields",
          fieldIndex,
          "denominator_count_bases",
        ])
        addDuplicateDisplayIssues(field.denominator_count_bases, context, [
          "fields",
          fieldIndex,
          "denominator_count_bases",
        ])

        if (
          field.denominator_dimension !== "count" &&
          field.denominator_count_bases.length
        ) {
          context.addIssue({
            code: "custom",
            message:
              "Denominator count bases require the count measurement dimension",
            path: ["fields", fieldIndex, "denominator_count_bases"],
          })
        }

        addUnitCompatibilityIssues(
          field.numerator_allowed_display_units,
          field.numerator_dimension,
          field.allow_product_specific_iu,
          context,
          ["fields", fieldIndex, "numerator_allowed_display_units"],
        )
        addUnitCompatibilityIssues(
          field.denominator_allowed_display_units,
          field.denominator_dimension,
          field.allow_product_specific_iu,
          context,
          ["fields", fieldIndex, "denominator_allowed_display_units"],
        )
      }
    })
  })

export const AdminCreateCompoundedProductPresentation = z.strictObject({
  key: ConfigurationKey,
  snapshot: CompoundedProductPresentationSnapshot,
})

export const AdminCreateCompoundedProductPresentationRevision = z.strictObject({
  expected_current_revision_id: z.string().trim().min(1),
  snapshot: CompoundedProductPresentationSnapshot,
  reason: z.string().trim().min(1).max(1_000),
})

export const AdminTransitionCompoundedProductPresentation = z.strictObject({
  expected_current_revision_id: z.string().trim().min(1),
  target_status: z.enum(["active", "inactive", "blocked", "archived"]),
  reason: z.string().trim().min(1).max(1_000),
})

export type CompoundedProductConfigurationStatus =
  (typeof COMPOUNDED_PRODUCT_CONFIGURATION_STATUSES)[number]

export type CompoundedProductRevisionStatus =
  (typeof COMPOUNDED_PRODUCT_REVISION_STATUSES)[number]

export type CompoundedProductPresentationSnapshot = z.infer<
  typeof CompoundedProductPresentationSnapshot
>

export type AdminCreateCompoundedProductPresentation = z.infer<
  typeof AdminCreateCompoundedProductPresentation
>

export type AdminCreateCompoundedProductPresentationRevision = z.infer<
  typeof AdminCreateCompoundedProductPresentationRevision
>

export type AdminTransitionCompoundedProductPresentation = z.infer<
  typeof AdminTransitionCompoundedProductPresentation
>
