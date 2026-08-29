import { MedusaError } from "@medusajs/framework/utils"

import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"
import { fingerprintCompoundedProductValue } from "./configuration-fingerprint"

export const COMPOUNDED_PRODUCT_VARIANT_SAFETY_CEILING = 1_000

type VariationAxis = CompoundedProductPresentationSnapshot["variation_axes"][number]
type VariationValue = VariationAxis["values"][number]

export type CompoundedProductVariantOption = {
  axisKey: string
  semanticName: string
  axisPosition: number
  valueKey: string
  valueLabel: string
  valuePosition: number
  measurement: VariationValue["measurement"]
}

export type CompoundedProductVariantMatrixRow = {
  key: string
  title: string
  options: CompoundedProductVariantOption[]
}

export type CompoundedProductVariantMatrix = {
  fingerprint: string
  totalCombinationCount: number
  excludedCombinationCount: number
  resultingVariantCount: number
  warningThreshold: number
  requiresConfirmation: boolean
  confirmationSatisfied: boolean
  rows: CompoundedProductVariantMatrixRow[]
}

export type GenerateCompoundedProductVariantMatrixInput = {
  axes: VariationAxis[]
  selectedValueKeysByAxis?: Record<string, string[]>
  excludedCombinationKeys?: string[]
  warningThreshold: number
  serverMaximum: number
  confirmation?: {
    fingerprint: string
    resultingVariantCount: number
  } | null
}

function invalidVariantMatrix(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function assertLimit(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    invalidVariantMatrix(`${name} must be a positive safe integer`)
  }
}

function compareStableText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function stableRowKey(options: CompoundedProductVariantOption[]): string {
  return fingerprintCompoundedProductValue(
    options.map((option) => [option.axisKey, option.valueKey]),
  )
}

function resolveOrderedAxes(
  axes: VariationAxis[],
  selectedValueKeysByAxis: Record<string, string[]> | undefined,
): Array<{ axis: VariationAxis; values: VariationValue[] }> {
  const axisKeys = new Set<string>()
  const axisPositions = new Set<number>()
  const semanticNames = new Set<string>()
  const orderedAxes = [...axes].sort(
    (left, right) =>
      left.position - right.position || compareStableText(left.key, right.key),
  )

  for (const axis of orderedAxes) {
    if (axisKeys.has(axis.key)) {
      invalidVariantMatrix(`Duplicate variation axis key: ${axis.key}`)
    }

    if (axisPositions.has(axis.position)) {
      invalidVariantMatrix(
        `Duplicate variation axis position: ${axis.position}`,
      )
    }

    const semanticName = axis.semantic_name.trim().toLocaleLowerCase("en-US")

    if (semanticNames.has(semanticName)) {
      invalidVariantMatrix(
        `Duplicate variation axis semantic name: ${axis.semantic_name}`,
      )
    }

    axisKeys.add(axis.key)
    axisPositions.add(axis.position)
    semanticNames.add(semanticName)
  }

  for (const selectedAxisKey of Object.keys(selectedValueKeysByAxis || {})) {
    if (!axisKeys.has(selectedAxisKey)) {
      invalidVariantMatrix(
        `Selected values reference unknown variation axis: ${selectedAxisKey}`,
      )
    }
  }

  return orderedAxes.map((axis) => {
    const valueKeys = new Set<string>()
    const valuePositions = new Set<number>()
    const valueLabels = new Set<string>()

    for (const value of axis.values) {
      const valueLabel = value.label.trim().toLocaleLowerCase("en-US")

      if (valueKeys.has(value.key)) {
        invalidVariantMatrix(
          `Duplicate variation value key: ${axis.key}.${value.key}`,
        )
      }

      if (valuePositions.has(value.position)) {
        invalidVariantMatrix(
          `Duplicate variation value position on ${axis.key}: ${value.position}`,
        )
      }

      if (valueLabels.has(valueLabel)) {
        invalidVariantMatrix(
          `Duplicate variation value label on ${axis.key}: ${value.label}`,
        )
      }

      valueKeys.add(value.key)
      valuePositions.add(value.position)
      valueLabels.add(valueLabel)
    }

    const activeValues = [...axis.values]
      .filter((value) => value.active)
      .sort(
        (left, right) =>
          left.position - right.position ||
          compareStableText(left.key, right.key),
      )
    const selectedKeys = selectedValueKeysByAxis?.[axis.key]

    if (!selectedKeys) {
      if (!activeValues.length) {
        invalidVariantMatrix(
          `Variation axis ${axis.key} has no active values`,
        )
      }

      return { axis, values: activeValues }
    }

    if (!selectedKeys.length) {
      invalidVariantMatrix(
        `Variation axis ${axis.key} requires at least one selected value`,
      )
    }

    if (new Set(selectedKeys).size !== selectedKeys.length) {
      invalidVariantMatrix(
        `Variation axis ${axis.key} contains duplicate selected values`,
      )
    }

    const valuesByKey = new Map(activeValues.map((value) => [value.key, value]))
    const selectedValues = selectedKeys.map((key) => {
      const value = valuesByKey.get(key)

      if (!value) {
        invalidVariantMatrix(
          `Variation value ${axis.key}.${key} is unknown or inactive`,
        )
      }

      return value
    })

    return {
      axis,
      values: selectedValues.sort(
        (left, right) =>
          left.position - right.position ||
          compareStableText(left.key, right.key),
      ),
    }
  })
}

function calculateCombinationCount(
  axes: Array<{ axis: VariationAxis; values: VariationValue[] }>,
  serverMaximum: number,
): number {
  let count = 1

  for (const { values } of axes) {
    if (count > Math.floor(serverMaximum / values.length)) {
      invalidVariantMatrix(
        `Variant matrix exceeds the server maximum of ${serverMaximum}`,
      )
    }

    count *= values.length
  }

  return count
}

function materializeRows(
  axes: Array<{ axis: VariationAxis; values: VariationValue[] }>,
): CompoundedProductVariantMatrixRow[] {
  let optionSets: CompoundedProductVariantOption[][] = [[]]

  for (const { axis, values } of axes) {
    optionSets = optionSets.flatMap((existing) =>
      values.map((value) => [
        ...existing,
        {
          axisKey: axis.key,
          semanticName: axis.semantic_name,
          axisPosition: axis.position,
          valueKey: value.key,
          valueLabel: value.label,
          valuePosition: value.position,
          measurement: value.measurement,
        },
      ]),
    )
  }

  return optionSets.map((options) => ({
    key: stableRowKey(options),
    title: options.map((option) => option.valueLabel).join(" / "),
    options,
  }))
}

export function generateCompoundedProductVariantMatrix(
  input: GenerateCompoundedProductVariantMatrixInput,
): CompoundedProductVariantMatrix {
  assertLimit("warningThreshold", input.warningThreshold)
  assertLimit("serverMaximum", input.serverMaximum)

  if (input.serverMaximum > COMPOUNDED_PRODUCT_VARIANT_SAFETY_CEILING) {
    invalidVariantMatrix(
      `serverMaximum cannot exceed the implementation safety ceiling of ${COMPOUNDED_PRODUCT_VARIANT_SAFETY_CEILING}`,
    )
  }

  if (input.warningThreshold > input.serverMaximum) {
    invalidVariantMatrix(
      "warningThreshold cannot exceed the server maximum",
    )
  }

  const orderedAxes = resolveOrderedAxes(
    input.axes,
    input.selectedValueKeysByAxis,
  )
  const totalCombinationCount = calculateCombinationCount(
    orderedAxes,
    input.serverMaximum,
  )
  const allRows = materializeRows(orderedAxes)
  const excludedKeys = input.excludedCombinationKeys || []
  const excludedSet = new Set(excludedKeys)

  if (excludedSet.size !== excludedKeys.length) {
    invalidVariantMatrix("Excluded combination keys must be unique")
  }

  const rowKeys = new Set(allRows.map((row) => row.key))

  if (rowKeys.size !== allRows.length) {
    invalidVariantMatrix("Variant matrix contains duplicate combinations")
  }

  for (const excludedKey of excludedSet) {
    if (!rowKeys.has(excludedKey)) {
      invalidVariantMatrix(
        `Excluded combination key does not exist: ${excludedKey}`,
      )
    }
  }

  const rows = allRows.filter((row) => !excludedSet.has(row.key))

  if (!rows.length) {
    invalidVariantMatrix("At least one resulting variant is required")
  }

  const fingerprint = fingerprintCompoundedProductValue({
    axes: orderedAxes.map(({ axis, values }) => ({
      key: axis.key,
      semantic_name: axis.semantic_name,
      position: axis.position,
      values: values.map((value) => ({
        key: value.key,
        label: value.label,
        position: value.position,
        measurement: value.measurement,
      })),
    })),
    excludedCombinationKeys: [...excludedSet].sort(),
  })
  const requiresConfirmation = rows.length > input.warningThreshold
  const confirmationSatisfied =
    !requiresConfirmation ||
    (input.confirmation?.fingerprint === fingerprint &&
      input.confirmation.resultingVariantCount === rows.length)

  return {
    fingerprint,
    totalCombinationCount,
    excludedCombinationCount: excludedSet.size,
    resultingVariantCount: rows.length,
    warningThreshold: input.warningThreshold,
    requiresConfirmation,
    confirmationSatisfied,
    rows,
  }
}

export function assertCompoundedProductVariantMatrixConfirmed(
  matrix: CompoundedProductVariantMatrix,
): CompoundedProductVariantMatrix {
  if (!matrix.confirmationSatisfied) {
    invalidVariantMatrix(
      "Large variant matrix requires confirmation for the current fingerprint and count",
    )
  }

  return matrix
}
