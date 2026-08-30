import type { DirectVariationAxis } from "./direct-variation-snapshot"
import type { DirectRecipeConfiguration } from "./direct-recipe-rules"
import type {
  MatrixRow,
  PresentationSnapshot,
  RecipeRuleComponent,
} from "./types"

type RecipeScope = {
  axisId: string
  valueId: string
  axisLabel: string
  valueLabel: string
  sharedCombinationCount: number
}

export type RecipeAxisRoles = {
  finishedProductAxisId: string
  includedSupplyAxisId: string
  needsManualReview: boolean
}

const populatedAxes = (axes: DirectVariationAxis[]) =>
  axes.filter(
    (axis) =>
      axis.name.trim() || axis.values.some((value) => value.label.trim()),
  )

const normalizedName = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const contentAxisNames = new Set([
  "net content",
  "content",
  "strength",
  "concentration",
  "amount",
])

const inclusionAxisNames = new Set([
  "inclusion",
  "included item",
  "included items",
  "included supply",
  "included supplies",
  "bundle",
  "kit",
  "set",
])

const measurementValueCount = (axis: DirectVariationAxis) =>
  axis.values.filter(
    (value) => Boolean(value.amount.trim()) && Boolean(value.displayUnit),
  ).length

export const inferRecipeAxisRoles = (
  axes: DirectVariationAxis[],
): RecipeAxisRoles => {
  const axesWithValues = populatedAxes(axes).filter((axis) =>
    axis.values.some((value) => value.label.trim()),
  )
  const contentCandidates = axesWithValues.filter(
    (axis) =>
      contentAxisNames.has(normalizedName(axis.name)) ||
      measurementValueCount(axis) ===
        axis.values.filter((value) => value.label.trim()).length,
  )
  const inclusionCandidates = axesWithValues.filter((axis) =>
    inclusionAxisNames.has(normalizedName(axis.name)),
  )
  const finishedProductAxis =
    contentCandidates.length === 1 ? contentCandidates[0] : null
  const includedSupplyAxis =
    inclusionCandidates.length === 1
      ? inclusionCandidates[0]
      : axesWithValues.length === 2 && finishedProductAxis
        ? axesWithValues.find((axis) => axis.id !== finishedProductAxis.id) ||
          null
        : null

  return {
    finishedProductAxisId: finishedProductAxis?.id || "",
    includedSupplyAxisId: includedSupplyAxis?.id || "",
    needsManualReview: !finishedProductAxis || !includedSupplyAxis,
  }
}

export const withInferredRecipeAxisRoles = (
  configuration: DirectRecipeConfiguration,
  axes: DirectVariationAxis[],
): DirectRecipeConfiguration => {
  const activeAxisIds = new Set(populatedAxes(axes).map((axis) => axis.id))
  const inferred = inferRecipeAxisRoles(axes)
  const finishedProductAxisId = inferred.needsManualReview
    ? activeAxisIds.has(configuration.finishedProductAxisId)
      ? configuration.finishedProductAxisId
      : inferred.finishedProductAxisId
    : inferred.finishedProductAxisId
  const includedSupplyAxisId = inferred.needsManualReview
    ? activeAxisIds.has(configuration.includedSupplyAxisId)
      ? configuration.includedSupplyAxisId
      : inferred.includedSupplyAxisId
    : inferred.includedSupplyAxisId

  if (
    finishedProductAxisId === configuration.finishedProductAxisId &&
    includedSupplyAxisId === configuration.includedSupplyAxisId
  ) {
    return configuration
  }

  return {
    ...configuration,
    finishedProductAxisId,
    includedSupplyAxisId,
  }
}

const resolveScope = (input: {
  axisId: string
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  row: MatrixRow
  rows: MatrixRow[]
}): RecipeScope | null => {
  if (!input.axisId) return null

  const axes = populatedAxes(input.axes)
  const directAxisIndex = axes.findIndex((axis) => axis.id === input.axisId)

  if (directAxisIndex < 0) return null

  const directAxis = axes[directAxisIndex]
  const snapshotAxis = input.snapshot.variation_axes[directAxisIndex]
  const rowOption = input.row.options.find(
    (option) => option.axisKey === snapshotAxis?.key,
  )

  if (!snapshotAxis || !rowOption) return null

  const snapshotValueIndex = snapshotAxis.values.findIndex(
    (value) => value.key === rowOption.valueKey,
  )
  const directValues = directAxis.values.filter((value) => value.label.trim())
  const directValue = directValues[snapshotValueIndex]

  if (!directValue) return null

  return {
    axisId: directAxis.id,
    valueId: directValue.id,
    axisLabel: directAxis.name.trim() || "Unnamed variation",
    valueLabel: directValue.label.trim(),
    sharedCombinationCount: input.rows.filter((row) =>
      row.options.some(
        (option) =>
          option.axisKey === snapshotAxis.key &&
          option.valueKey === rowOption.valueKey,
      ),
    ).length,
  }
}

export const resolveCombinationRecipeScopes = (input: {
  configuration: DirectRecipeConfiguration
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  row: MatrixRow
  rows: MatrixRow[]
}) => ({
  finishedProduct: resolveScope({
    axisId: input.configuration.finishedProductAxisId,
    axes: input.axes,
    snapshot: input.snapshot,
    row: input.row,
    rows: input.rows,
  }),
  includedSupply: resolveScope({
    axisId: input.configuration.includedSupplyAxisId,
    axes: input.axes,
    snapshot: input.snapshot,
    row: input.row,
    rows: input.rows,
  }),
})

export const componentsForCombination = (input: {
  configuration: DirectRecipeConfiguration
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  row: MatrixRow
  rows: MatrixRow[]
}) => {
  const scopes = resolveCombinationRecipeScopes(input)
  const finishedProduct = scopes.finishedProduct
    ? input.configuration.finishedProductByValueId[
        scopes.finishedProduct.valueId
      ] || []
    : []
  const includedSupplies = scopes.includedSupply
    ? input.configuration.includedSupplyByValueId[
        scopes.includedSupply.valueId
      ] || []
    : []

  return {
    scopes,
    finishedProduct,
    includedSupplies,
    packaging: input.configuration.commonPackaging,
    all: [
      ...finishedProduct,
      ...includedSupplies,
      ...input.configuration.commonPackaging,
    ],
  }
}

export const combinationComponentsAreComplete = (
  components: ReturnType<typeof componentsForCombination>,
) =>
  components.finishedProduct.length === 1 &&
  components.all.every((component) => {
    const amount = Number(component.required_display_amount)

    return Number.isFinite(amount) && amount > 0
  })

export const completeRowsForAvailability = (input: {
  configuration: DirectRecipeConfiguration
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  rows: MatrixRow[]
}) =>
  input.rows.filter((row) =>
    combinationComponentsAreComplete(
      componentsForCombination({
        ...input,
        row,
      }),
    ),
  )

export const updateCombinationComponents = (input: {
  configuration: DirectRecipeConfiguration
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot
  row: MatrixRow
  rows: MatrixRow[]
  finishedProduct: RecipeRuleComponent[]
  includedSupplies: RecipeRuleComponent[]
  packaging: RecipeRuleComponent[]
}) => {
  const scopes = resolveCombinationRecipeScopes(input)
  let next: DirectRecipeConfiguration = {
    ...input.configuration,
    commonPackaging: input.packaging,
  }

  if (scopes.finishedProduct) {
    next = {
      ...next,
      finishedProductByValueId: {
        ...next.finishedProductByValueId,
        [scopes.finishedProduct.valueId]: input.finishedProduct.slice(0, 1),
      },
    }
  }

  if (scopes.includedSupply) {
    next = {
      ...next,
      includedSupplyByValueId: {
        ...next.includedSupplyByValueId,
        [scopes.includedSupply.valueId]: input.includedSupplies,
      },
    }
  }

  return next
}
