import type { InferTypeOf } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import {
  createRecipeSnapshotHash,
  normalizeRecipeSnapshotComponents,
  type RecipeSnapshotComponent,
} from "../../modules/bom/contracts/recipe-audit"
import { PEPSTACK_BOM_MODULE } from "../../modules/bom"
import RecipeAuditSnapshot from "../../modules/bom/models/recipe-audit-snapshot"
import type PepstackBomModuleService from "../../modules/bom/service"
import type { VariantInventoryKitChange } from "./validate-variant-inventory-kit-change"

type RecipeAuditSnapshotRecord = InferTypeOf<typeof RecipeAuditSnapshot>

export const createRecipeAuditSnapshotStep = createStep<
  VariantInventoryKitChange,
  RecipeAuditSnapshotRecord | null,
  string | null
>(
  "create-recipe-audit-snapshot",
  async (change: VariantInventoryKitChange, { container }) => {
    if (!change.shouldReplace) {
      return new StepResponse(null, null)
    }

    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )
    const profiles = await bomService.listComponentProfiles({
      inventory_item_id: change.components.map(
        ({ inventoryItemId }) => inventoryItemId,
      ),
    })
    const profileByInventoryItemId = new Map(
      profiles.map((profile) => [profile.inventory_item_id, profile]),
    )
    const missingProfileIds = change.components
      .map(({ inventoryItemId }) => inventoryItemId)
      .filter((inventoryItemId) => !profileByInventoryItemId.has(inventoryItemId))

    if (missingProfileIds.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `component profiles were not found: ${missingProfileIds.join(", ")}`,
      )
    }

    const components = normalizeRecipeSnapshotComponents(
      change.components.map(({ inventoryItemId, requiredQuantity }) => {
        const profile = profileByInventoryItemId.get(inventoryItemId)!

        return {
          inventoryItemId,
          requiredQuantity,
          baseUnit: profile.base_unit,
          displayUnit: profile.display_unit,
          baseUnitsPerDisplayUnit: profile.base_units_per_display_unit,
          displayPrecision: profile.display_precision,
        } satisfies RecipeSnapshotComponent
      }),
    )
    const [latestSnapshot] = await bomService.listRecipeAuditSnapshots(
      { variant_id: change.variantId },
      {
        order: { version: "DESC" },
        take: 1,
      },
    )
    const snapshot = await bomService.createRecipeAuditSnapshots({
      variant_id: change.variantId,
      version: (latestSnapshot?.version ?? 0) + 1,
      recipe_hash: createRecipeSnapshotHash(components),
      components,
      actor_id: change.actorId ?? null,
      note: change.note ?? null,
    })

    return new StepResponse(snapshot, snapshot.id)
  },
  async (snapshotId: string | null, { container }) => {
    if (!snapshotId) {
      return
    }

    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )

    await bomService.deleteRecipeAuditSnapshots(snapshotId)
  },
)
