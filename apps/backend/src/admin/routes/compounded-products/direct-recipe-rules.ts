import type { DirectVariationAxis } from "./direct-variation-snapshot"
import type {
  PresentationSnapshot,
  RecipeRule,
  RecipeRuleComponent,
} from "./types"

export type DirectRecipeConfiguration = {
  finishedProductAxisId: string
  includedSupplyAxisId: string
  finishedProductByValueId: Record<string, RecipeRuleComponent[]>
  includedSupplyByValueId: Record<string, RecipeRuleComponent[]>
  commonPackaging: RecipeRuleComponent[]
}

export const emptyDirectRecipeConfiguration =
  (): DirectRecipeConfiguration => ({
    finishedProductAxisId: "",
    includedSupplyAxisId: "",
    finishedProductByValueId: {},
    includedSupplyByValueId: {},
    commonPackaging: [],
  })

const compactLabel = (value: string) => value.trim().slice(0, 160)

const stableKeyHash = (value: string) => {
  let hash = 2_166_136_261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }

  return (hash >>> 0).toString(36)
}

const recipeRuleKey = (prefix: string, identity: string) => {
  const fullKey = `${prefix}_${identity}`

  if (fullKey.length <= 64) {
    return fullKey
  }

  const suffix = `_${stableKeyHash(fullKey)}`
  return `${fullKey.slice(0, 64 - suffix.length)}${suffix}`
}

const axisSnapshotPair = (input: {
  axisId: string
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
}) => {
  const axisIndex = input.axes.findIndex((axis) => axis.id === input.axisId)

  if (axisIndex < 0) {
    return null
  }

  const populatedAxes = input.axes.filter(
    (axis) => axis.name.trim() || axis.values.some((value) => value.label.trim()),
  )
  const directAxis = input.axes[axisIndex]
  const populatedIndex = populatedAxes.findIndex(
    (axis) => axis.id === directAxis.id,
  )
  const snapshotAxis = input.snapshot.variation_axes[populatedIndex]

  return snapshotAxis ? { directAxis, snapshotAxis } : null
}

const matchedRules = (input: {
  kind: "finished_product" | "variation_value"
  axisId: string
  componentsByValueId: Record<string, RecipeRuleComponent[]>
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  startPosition: number
  includeEmpty: boolean
}): RecipeRule[] => {
  const pair = axisSnapshotPair(input)

  if (!pair) {
    return []
  }

  const populatedValues = pair.directAxis.values.filter((value) =>
    value.label.trim(),
  )

  const rules: RecipeRule[] = []

  populatedValues.forEach((directValue, valueIndex) => {
    const snapshotValue = pair.snapshotAxis.values[valueIndex]
    const components = input.componentsByValueId[directValue.id] || []

    if (!snapshotValue || (!components.length && !input.includeEmpty)) {
      return
    }

    rules.push({
      key: recipeRuleKey(
        input.kind === "finished_product" ? "finished" : "included",
        `${pair.snapshotAxis.key}_${snapshotValue.key}`,
      ),
      label: compactLabel(
        `${pair.snapshotAxis.semantic_name}: ${snapshotValue.label}`,
      ),
      kind: input.kind,
      position: input.startPosition + rules.length,
      match: {
        axis_key: pair.snapshotAxis.key,
        value_key: snapshotValue.key,
      },
      components,
    })
  })

  return rules
}

export const buildDirectRecipeRules = (input: {
  configuration: DirectRecipeConfiguration
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
}): RecipeRule[] => {
  const finishedRules = matchedRules({
    kind: "finished_product",
    axisId: input.configuration.finishedProductAxisId,
    componentsByValueId: input.configuration.finishedProductByValueId,
    axes: input.axes,
    snapshot: input.snapshot,
    startPosition: 0,
    includeEmpty: false,
  })
  const includedSupplyRules = matchedRules({
    kind: "variation_value",
    axisId: input.configuration.includedSupplyAxisId,
    componentsByValueId: input.configuration.includedSupplyByValueId,
    axes: input.axes,
    snapshot: input.snapshot,
    startPosition: finishedRules.length,
    includeEmpty: Boolean(input.configuration.includedSupplyAxisId),
  })
  const packagingRules: RecipeRule[] = input.configuration.commonPackaging.length
    ? [
        {
          key: "common_packaging",
          label: "Common packaging",
          kind: "common_packaging",
          position: finishedRules.length + includedSupplyRules.length,
          components: input.configuration.commonPackaging,
        },
      ]
    : []

  return [...finishedRules, ...includedSupplyRules, ...packagingRules]
}

export const configuredRecipeCoverageIsComplete = (input: {
  rules: RecipeRule[]
  rows: Array<{
    options: Array<{ axisKey: string; valueKey: string }>
  }>
}) => {
  if (!input.rules.length || !input.rows.length) {
    return false
  }

  const finishedRules = input.rules.filter(
    (
      rule,
    ): rule is Exclude<RecipeRule, { kind: "common_packaging" }> =>
      rule.kind === "finished_product",
  )

  return input.rows.every(
    (row) =>
      finishedRules.filter((rule) =>
        row.options.some(
          (option) =>
            option.axisKey === rule.match.axis_key &&
            option.valueKey === rule.match.value_key,
        ),
      ).length === 1,
  )
}
