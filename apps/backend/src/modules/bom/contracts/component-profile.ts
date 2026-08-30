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

export const BOM_COMPONENT_CLASSIFICATIONS = [
  "finished_product",
  "included_supply",
  "packaging",
] as const

export const BOM_SUPPLIER_UNITS = ["box", "pack", "roll", "piece"] as const

export type BomComponentClassification =
  (typeof BOM_COMPONENT_CLASSIFICATIONS)[number]
export type BomSupplierUnit = (typeof BOM_SUPPLIER_UNITS)[number]

export type SetComponentProfileInput = {
  inventoryItemId: string
  baseUnit: BomBaseUnit
  displayUnit: string
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
  reorderThresholdBaseUnits: number
  classification?: BomComponentClassification
  supplierUnit?: BomSupplierUnit
  inventoryUnitsPerSupplierUnit?: number
  category: string
  lotTrackingRequired: boolean
  expiryTrackingRequired: boolean
}

export type NormalizedComponentProfileInput = Omit<
  SetComponentProfileInput,
  "classification" | "supplierUnit" | "inventoryUnitsPerSupplierUnit"
> & {
  classification: BomComponentClassification
  supplierUnit: BomSupplierUnit
  inventoryUnitsPerSupplierUnit: number
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
): NormalizedComponentProfileInput {
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
  const classification = input.classification ?? "included_supply"
  const supplierUnit = input.supplierUnit ?? "piece"
  const inventoryUnitsPerSupplierUnit =
    input.inventoryUnitsPerSupplierUnit ?? 1

  if (!BOM_COMPONENT_CLASSIFICATIONS.includes(classification)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `classification must be one of: ${BOM_COMPONENT_CLASSIFICATIONS.join(", ")}`,
    )
  }
  if (!BOM_SUPPLIER_UNITS.includes(supplierUnit)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `supplierUnit must be one of: ${BOM_SUPPLIER_UNITS.join(", ")}`,
    )
  }
  assertPositiveSafeInteger(
    inventoryUnitsPerSupplierUnit,
    "inventoryUnitsPerSupplierUnit",
  )
  if (supplierUnit === "piece" && inventoryUnitsPerSupplierUnit !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "inventoryUnitsPerSupplierUnit must be 1 when supplierUnit is piece",
    )
  }
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
  assertPostgresInteger(
    inventoryUnitsPerSupplierUnit,
    "inventoryUnitsPerSupplierUnit",
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
    classification,
    supplierUnit,
    inventoryUnitsPerSupplierUnit,
    category: normalizeRequiredText(input.category, "category"),
    lotTrackingRequired: input.lotTrackingRequired,
    expiryTrackingRequired: input.expiryTrackingRequired,
  }
}

export function convertSupplierUnitsToInventoryUnits(input: {
  supplierUnits: number
  inventoryUnitsPerSupplierUnit: number
}): number {
  assertNonNegativeSafeInteger(input.supplierUnits, "supplierUnits")
  assertPositiveSafeInteger(
    input.inventoryUnitsPerSupplierUnit,
    "inventoryUnitsPerSupplierUnit",
  )

  const inventoryUnits =
    input.supplierUnits * input.inventoryUnitsPerSupplierUnit

  if (!Number.isSafeInteger(inventoryUnits)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "received inventory units must be a safe integer",
    )
  }

  return inventoryUnits
}
