import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PEPSTACK_BOM_MODULE } from "../../modules/bom"
import {
  createRecipeSnapshotHash,
  normalizeRecipeSnapshotComponents,
  type RecipeSnapshotComponent,
} from "../../modules/bom/contracts/recipe-audit"
import type PepstackBomModuleService from "../../modules/bom/service"
import type { CompoundedProductPresentationSnapshot } from "../../modules/compounded-product/contracts/configuration"
import { validateAndNormalizeCompoundedProductRecipeRules } from "../../modules/compounded-product/recipe-rules"
import { resolveConfiguredCompoundedProductRecipes } from "../../modules/compounded-product/resolve-configured-recipes"
import type { CompoundedProductVariantMatrix } from "../../modules/compounded-product/variant-matrix"

const COMPOUNDED_PRODUCT_METADATA_NAMESPACE = "compounded_product"

export type ApplyConfiguredCompoundedProductRecipesInput = {
  productId: string
  registrationId: string
  presentationRevisionId: string
  actorId: string
  snapshot: CompoundedProductPresentationSnapshot
  matrix: CompoundedProductVariantMatrix
}

export type PreparedConfiguredCompoundedProductRecipe = {
  productId: string
  registrationId: string
  presentationRevisionId: string
  variantId: string
  matrixRowKey: string
  components: Array<{
    inventoryItemId: string
    requiredQuantity: number
  }>
  auditComponents: RecipeSnapshotComponent[]
  actorId: string
}

export type PreparedConfiguredCompoundedProductRecipes = {
  recipes: PreparedConfiguredCompoundedProductRecipe[]
  variantUpdates: {
    product_variants: Array<{
      id: string
      manage_inventory: true
      allow_backorder: false
    }>
  }
}

type NativeVariant = {
  id: string
  product_id: string
  metadata: Record<string, unknown> | null
}

function unexpected(message: string): never {
  throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
}

function matrixRowKeyFromVariant(variant: NativeVariant) {
  const metadata = variant.metadata?.[COMPOUNDED_PRODUCT_METADATA_NAMESPACE]

  if (!metadata || typeof metadata !== "object") {
    unexpected(`Variant ${variant.id} is missing compounded-product metadata`)
  }

  const matrixRowKey = (metadata as Record<string, unknown>).matrix_row_key

  if (typeof matrixRowKey !== "string" || !matrixRowKey) {
    unexpected(`Variant ${variant.id} is missing its matrix row key`)
  }

  return matrixRowKey
}

export const prepareConfiguredCompoundedProductRecipesStep = createStep(
  "prepare-configured-compounded-product-recipes",
  async (
    input: ApplyConfiguredCompoundedProductRecipesInput,
    { container },
  ) => {
    if (!input.snapshot.recipe_rules.length) {
      return new StepResponse<PreparedConfiguredCompoundedProductRecipes>({
        recipes: [],
        variantUpdates: { product_variants: [] },
      })
    }

    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const inventoryItemIds = Array.from(
      new Set(
        input.snapshot.recipe_rules.flatMap((rule) =>
          rule.components.map((component) => component.inventory_item_id),
        ),
      ),
    )
    const [profiles, { data: inventoryItems }, { data: rawVariants }] =
      await Promise.all([
        bomService.listComponentProfiles({
          inventory_item_id: inventoryItemIds,
        }),
        query.graph({
          entity: "inventory_item",
          fields: ["id"],
          filters: { id: inventoryItemIds },
        }),
        query.graph({
          entity: "variant",
          fields: ["id", "product_id", "metadata"],
          filters: { product_id: input.productId },
        }),
      ])
    const foundInventoryItemIds = new Set(
      (inventoryItems as Array<{ id: string }>).map((item) => item.id),
    )
    const missingInventoryItemIds = inventoryItemIds.filter(
      (id) => !foundInventoryItemIds.has(id),
    )

    if (missingInventoryItemIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Recipe inventory items were not found: ${missingInventoryItemIds.join(", ")}`,
      )
    }

    const normalizedRules =
      validateAndNormalizeCompoundedProductRecipeRules({
        rules: input.snapshot.recipe_rules,
        profiles,
      })
    const resolved = resolveConfiguredCompoundedProductRecipes({
      matrix: input.matrix,
      rules: normalizedRules,
    })
    const variants = rawVariants as NativeVariant[]
    const variantByMatrixRowKey = new Map<string, NativeVariant>()

    for (const variant of variants) {
      if (variant.product_id !== input.productId) {
        unexpected(`Variant ${variant.id} does not belong to ${input.productId}`)
      }

      const matrixRowKey = matrixRowKeyFromVariant(variant)

      if (variantByMatrixRowKey.has(matrixRowKey)) {
        unexpected(`Multiple variants resolve to matrix row ${matrixRowKey}`)
      }

      variantByMatrixRowKey.set(matrixRowKey, variant)
    }

    if (
      variantByMatrixRowKey.size !== input.matrix.rows.length ||
      resolved.length !== input.matrix.rows.length
    ) {
      unexpected("Created variants do not match the configured variant matrix")
    }

    const profileByInventoryItemId = new Map(
      profiles.map((profile) => [profile.inventory_item_id, profile]),
    )
    const recipes = resolved.map((recipe) => {
      const variant = variantByMatrixRowKey.get(recipe.matrixRowKey)

      if (!variant) {
        unexpected(`No created variant matches matrix row ${recipe.matrixRowKey}`)
      }

      const auditComponents = normalizeRecipeSnapshotComponents(
        recipe.components.map(({ inventoryItemId, requiredQuantity }) => {
          const profile = profileByInventoryItemId.get(inventoryItemId)

          if (!profile) {
            unexpected(`Component profile disappeared for ${inventoryItemId}`)
          }

          return {
            inventoryItemId,
            requiredQuantity,
            baseUnit: profile.base_unit,
            displayUnit: profile.display_unit,
            baseUnitsPerDisplayUnit: profile.base_units_per_display_unit,
            displayPrecision: profile.display_precision,
          }
        }),
      )

      return {
        productId: input.productId,
        registrationId: input.registrationId,
        presentationRevisionId: input.presentationRevisionId,
        variantId: variant.id,
        matrixRowKey: recipe.matrixRowKey,
        components: recipe.components,
        auditComponents,
        actorId: input.actorId,
      }
    })

    return new StepResponse<PreparedConfiguredCompoundedProductRecipes>({
      recipes,
      variantUpdates: {
        product_variants: recipes.map((recipe) => ({
          id: recipe.variantId,
          manage_inventory: true as const,
          allow_backorder: false as const,
        })),
      },
    })
  },
)

export const createConfiguredRecipeAuditSnapshotsStep = createStep(
  "create-configured-recipe-audit-snapshots",
  async (recipes: PreparedConfiguredCompoundedProductRecipe[], { container }) => {
    if (!recipes.length) {
      return new StepResponse([], [])
    }

    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )
    const snapshots = await bomService.createRecipeAuditSnapshots(
      recipes.map((recipe) => ({
        variant_id: recipe.variantId,
        version: 1,
        recipe_hash: createRecipeSnapshotHash(recipe.auditComponents),
        components: recipe.auditComponents,
        actor_id: recipe.actorId,
        note: `Generated from compounded-product configuration revision ${recipe.presentationRevisionId}`,
      })),
    )
    const created = Array.isArray(snapshots) ? snapshots : [snapshots]

    return new StepResponse(
      created,
      created.map((snapshot) => snapshot.id),
    )
  },
  async (snapshotIds: string[] | undefined, { container }) => {
    if (!snapshotIds?.length) {
      return
    }

    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )

    await bomService.deleteRecipeAuditSnapshots(snapshotIds)
  },
)
