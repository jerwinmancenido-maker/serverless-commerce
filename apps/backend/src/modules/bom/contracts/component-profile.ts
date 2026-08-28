import { MedusaError } from "@medusajs/framework/utils"

import {
  BOM_BASE_UNITS,
  type BomBaseUnit,
  assertNonNegativeSafeInteger,
  assertPositiveSafeInteger,
} from "./inventory-kit"
import {
  normalizeResearchUnitProfile,
  type ResearchDisplayUnit,
} from "../../../lib/research-quantity"

export type SetComponentProfileInput = {
  inventoryItemId: string
  baseUnit: BomBaseUnit
  displayUnit: string
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
  reorderThresholdBaseUnits: number
  category: string
  lotTrackingRequired: boolean
  expiryTrackingRequired: boolean
}

const MAX_POSTGRES_INTEGER = 2_147_483_647

function assertPostgresInteger(value: number, field: string) {
  if (value > MAX_POSTGRES_INTEGER) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must not exceed ${MAX_POSTGRES_INTEGER}`,
    )
  }
}

function normalizeRequiredText(value: string, field: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must not be empty`,
    )
  }

  return normalized
}

export function normalizeComponentProfileInput(
  input: SetComponentProfileInput,
): SetComponentProfileInput {
  if (!BOM_BASE_UNITS.includes(input.baseUnit)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `baseUnit must be one of: ${BOM_BASE_UNITS.join(", ")}`,
    )
  }

  assertPositiveSafeInteger(
    input.baseUnitsPerDisplayUnit,
    "baseUnitsPerDisplayUnit",
  )
  assertNonNegativeSafeInteger(input.displayPrecision, "displayPrecision")
  assertNonNegativeSafeInteger(
    input.reorderThresholdBaseUnits,
    "reorderThresholdBaseUnits",
  )
  assertPostgresInteger(
    input.baseUnitsPerDisplayUnit,
    "baseUnitsPerDisplayUnit",
  )
  const displayUnit = normalizeRequiredText(input.displayUnit, "displayUnit")

  normalizeResearchUnitProfile({
    baseUnit: input.baseUnit,
    displayUnit: displayUnit as ResearchDisplayUnit,
    baseUnitsPerDisplayUnit: input.baseUnitsPerDisplayUnit,
    displayPrecision: input.displayPrecision,
  })
  assertPostgresInteger(input.displayPrecision, "displayPrecision")
  assertPostgresInteger(
    input.reorderThresholdBaseUnits,
    "reorderThresholdBaseUnits",
  )

  return {
    inventoryItemId: normalizeRequiredText(
      input.inventoryItemId,
      "inventoryItemId",
    ),
    baseUnit: input.baseUnit,
    displayUnit,
    baseUnitsPerDisplayUnit: input.baseUnitsPerDisplayUnit,
    displayPrecision: input.displayPrecision,
    reorderThresholdBaseUnits: input.reorderThresholdBaseUnits,
    category: normalizeRequiredText(input.category, "category"),
    lotTrackingRequired: input.lotTrackingRequired,
    expiryTrackingRequired: input.expiryTrackingRequired,
  }
}
