import type { IInventoryService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import {
  normalizeComponentProfileInput,
  type SetComponentProfileInput,
} from "../../modules/bom/contracts/component-profile"
import { PEPSTACK_BOM_MODULE } from "../../modules/bom"
import type PepstackBomModuleService from "../../modules/bom/service"

type ComponentProfileValues = {
  inventory_item_id: string
  base_unit: SetComponentProfileInput["baseUnit"]
  display_unit: string
  base_units_per_display_unit: number
  display_precision: number
  reorder_threshold_base_units: number
  category: string
  lot_tracking_required: boolean
  expiry_tracking_required: boolean
}

type SetComponentProfileCompensation = {
  createdId?: string
  previous?: ComponentProfileValues & { id: string }
}

function toProfileValues(
  input: SetComponentProfileInput,
): ComponentProfileValues {
  return {
    inventory_item_id: input.inventoryItemId,
    base_unit: input.baseUnit,
    display_unit: input.displayUnit,
    base_units_per_display_unit: input.baseUnitsPerDisplayUnit,
    display_precision: input.displayPrecision,
    reorder_threshold_base_units: input.reorderThresholdBaseUnits,
    category: input.category,
    lot_tracking_required: input.lotTrackingRequired,
    expiry_tracking_required: input.expiryTrackingRequired,
  }
}

export const validateComponentProfileInputStep = createStep(
  "validate-component-profile-input",
  async (input: SetComponentProfileInput) =>
    new StepResponse(normalizeComponentProfileInput(input)),
)

export const setComponentProfileStep = createStep(
  "set-component-profile",
  async (input: SetComponentProfileInput, { container }) => {
    const inventoryService = container.resolve<IInventoryService>(
      Modules.INVENTORY,
    )
    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )
    const inventoryItems = await inventoryService.listInventoryItems({
      id: input.inventoryItemId,
    })

    if (!inventoryItems[0]) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `inventory item ${input.inventoryItemId} was not found`,
      )
    }

    const [previous] = await bomService.listComponentProfiles(
      { inventory_item_id: input.inventoryItemId },
      { take: 1 },
    )
    const values = toProfileValues(input)

    if (previous) {
      const updated = await bomService.updateComponentProfiles({
        id: previous.id,
        ...values,
      })

      return new StepResponse(updated, {
        previous: {
          id: previous.id,
          inventory_item_id: previous.inventory_item_id,
          base_unit: previous.base_unit,
          display_unit: previous.display_unit,
          base_units_per_display_unit: previous.base_units_per_display_unit,
          display_precision: previous.display_precision,
          reorder_threshold_base_units:
            previous.reorder_threshold_base_units,
          category: previous.category,
          lot_tracking_required: previous.lot_tracking_required,
          expiry_tracking_required: previous.expiry_tracking_required,
        },
      } satisfies SetComponentProfileCompensation)
    }

    const created = await bomService.createComponentProfiles(values)

    return new StepResponse(created, {
      createdId: created.id,
    } satisfies SetComponentProfileCompensation)
  },
  async (compensation: SetComponentProfileCompensation | undefined, context) => {
    if (!compensation) {
      return
    }

    const bomService = context.container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )

    if (compensation.createdId) {
      await bomService.deleteComponentProfiles(compensation.createdId)
      return
    }

    if (compensation.previous) {
      await bomService.updateComponentProfiles(compensation.previous)
    }
  },
)
