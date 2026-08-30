import type { ResearchDisplayUnit } from "../../../lib/research-unit-definitions"
import type { PresentationSnapshot, VariationAxis } from "./types"

export type DirectVariationValue = {
  id: string
  label: string
  amount: string
  displayUnit: ResearchDisplayUnit | ""
  materialProfileId: string
}

export type DirectVariationAxis = {
  id: string
  name: string
  values: DirectVariationValue[]
}

export const newDirectVariationValue = (): DirectVariationValue => ({
  id: crypto.randomUUID(),
  label: "",
  amount: "",
  displayUnit: "",
  materialProfileId: "",
})

export const newDirectVariationAxis = (): DirectVariationAxis => ({
  id: crypto.randomUUID(),
  name: "",
  values: [newDirectVariationValue()],
})

const MAX_CONFIGURATION_KEY_LENGTH = 64

const configurationKey = (
  value: string,
  fallback: string,
  prefix: "variation" | "option",
) => {
  const normalized = value
    .trim()
    .toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  const populated = normalized || fallback
  const prefixed = /^[a-z]/.test(populated)
    ? populated
    : `${prefix}_${populated}`

  return prefixed.slice(0, MAX_CONFIGURATION_KEY_LENGTH).replace(/_+$/g, "")
}

const uniqueConfigurationKey = (base: string, keys: Set<string>) => {
  let key = base
  let suffix = 2

  while (keys.has(key)) {
    const ending = `_${suffix++}`
    key = `${base.slice(0, MAX_CONFIGURATION_KEY_LENGTH - ending.length)}${ending}`
  }

  keys.add(key)
  return key
}

export const buildDirectProductSnapshot = (input: {
  productTitle: string
  axes: DirectVariationAxis[]
}): PresentationSnapshot => {
  const populatedAxes = input.axes.filter(
    (axis) => axis.name.trim() || axis.values.some((value) => value.label.trim()),
  )
  const keys = new Set<string>()
  const semanticNames = new Set<string>()

  const variationAxes: VariationAxis[] = populatedAxes.map((axis, axisIndex) => {
    const name = axis.name.trim()

    if (!name) {
      throw new Error(`Variation ${axisIndex + 1} needs a name`)
    }

    const semanticIdentity = name.toLocaleLowerCase("en-US")

    if (semanticNames.has(semanticIdentity)) {
      throw new Error(`Variation name ${name} is duplicated`)
    }

    semanticNames.add(semanticIdentity)
    const axisKey = uniqueConfigurationKey(
      configurationKey(name, `variation_${axisIndex + 1}`, "variation"),
      keys,
    )
    const populatedValues = axis.values.filter((value) => value.label.trim())

    if (!populatedValues.length) {
      throw new Error(`Variation ${axisIndex + 1} needs at least one option`)
    }

    const valueKeys = new Set<string>()
    const valueLabels = new Set<string>()

    return {
      key: axisKey,
      semantic_name: name,
      help_text: null,
      position: axisIndex,
      values: populatedValues.map((value, valueIndex) => {
        const label = value.label.trim()
        const labelIdentity = label.toLocaleLowerCase("en-US")

        if (valueLabels.has(labelIdentity)) {
          throw new Error(`${name} contains duplicate option ${label}`)
        }

        valueLabels.add(labelIdentity)
        const valueKey = uniqueConfigurationKey(
          configurationKey(label, `option_${valueIndex + 1}`, "option"),
          valueKeys,
        )
        const hasMeasurement = Boolean(value.amount.trim() || value.displayUnit)

        if (hasMeasurement && (!value.amount.trim() || !value.displayUnit)) {
          throw new Error(`${name} option ${label} needs both amount and unit`)
        }

        if (value.displayUnit === "IU" && !value.materialProfileId.trim()) {
          throw new Error(
            `${name} option ${label} needs a material profile for IU`,
          )
        }

        return {
          key: valueKey,
          label,
          position: valueIndex,
          active: true,
          measurement: hasMeasurement
            ? {
                amount: value.amount.trim(),
                display_unit: value.displayUnit as ResearchDisplayUnit,
                material_profile_id:
                  value.displayUnit === "IU"
                    ? value.materialProfileId.trim()
                    : null,
              }
            : null,
        }
      }),
    }
  })

  return {
    schema_version: "1",
    label: input.productTitle.trim() || "Product configuration",
    description: null,
    fields: [],
    variation_axes: variationAxes,
    recipe_rules: [],
    sku_suggestion_policy: {
      template: "{product}{separator}{options}",
      separator: "-",
      normalization: "uppercase",
    },
    readiness_policy: {
      schema_version: "1",
      require_price: true,
      require_sales_channel: true,
      require_bom_for_managed_inventory: true,
      require_valid_structured_measurements: true,
      require_governance_audit: true,
    },
    variant_warning_threshold: 100,
  }
}

export const prepareAutomaticDirectProductSnapshot = (input: {
  productTitle: string
  axes: DirectVariationAxis[]
}): {
  snapshot: PresentationSnapshot | null
  validationMessage: string | null
} => {
  const incompleteAxisIndex = input.axes.findIndex(
    (axis) =>
      !axis.name.trim() ||
      !axis.values.some((value) => value.label.trim()),
  )

  if (incompleteAxisIndex !== -1) {
    return {
      snapshot: null,
      validationMessage: `Variation ${incompleteAxisIndex + 1} needs a name and at least one option.`,
    }
  }

  try {
    return {
      snapshot: buildDirectProductSnapshot(input),
      validationMessage: null,
    }
  } catch (error) {
    return {
      snapshot: null,
      validationMessage:
        error instanceof Error
          ? error.message
          : "Product variations are invalid.",
    }
  }
}

export const selectedValuesForSnapshot = (snapshot: PresentationSnapshot) =>
  Object.fromEntries(
    snapshot.variation_axes.map((axis) => [
      axis.key,
      axis.values.filter((value) => value.active).map((value) => value.key),
    ]),
  )
