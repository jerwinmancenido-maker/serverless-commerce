import { MedusaError } from "@medusajs/framework/utils"

export const RESEARCH_BASE_UNITS = ["microgram", "microliter", "piece"] as const

export const RESEARCH_DISPLAY_UNITS = ["mcg", "mg", "mL", "IU", "unit"] as const

// Medusa's model.number() maps these fields to a PostgreSQL integer column.
export const RESEARCH_MAX_BASE_UNITS = 2_147_483_647

export type ResearchBaseUnit = (typeof RESEARCH_BASE_UNITS)[number]
export type ResearchDisplayUnit = (typeof RESEARCH_DISPLAY_UNITS)[number]

export type ResearchUnitProfile = {
  baseUnit: ResearchBaseUnit
  displayUnit: ResearchDisplayUnit
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
}

export function isResearchBaseUnit(value: string): value is ResearchBaseUnit {
  return RESEARCH_BASE_UNITS.includes(value as ResearchBaseUnit)
}

export function isResearchDisplayUnit(
  value: string,
): value is ResearchDisplayUnit {
  return RESEARCH_DISPLAY_UNITS.includes(value as ResearchDisplayUnit)
}

function invalidUnitProfile(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

export function normalizeResearchUnitProfile(
  input: ResearchUnitProfile,
): ResearchUnitProfile {
  if (!isResearchBaseUnit(input.baseUnit)) {
    invalidUnitProfile(
      `baseUnit must be one of: ${RESEARCH_BASE_UNITS.join(", ")}`,
    )
  }

  if (!isResearchDisplayUnit(input.displayUnit)) {
    invalidUnitProfile(
      `displayUnit must be one of: ${RESEARCH_DISPLAY_UNITS.join(", ")}`,
    )
  }

  if (
    !Number.isSafeInteger(input.baseUnitsPerDisplayUnit) ||
    input.baseUnitsPerDisplayUnit <= 0 ||
    input.baseUnitsPerDisplayUnit > RESEARCH_MAX_BASE_UNITS
  ) {
    invalidUnitProfile(
      `baseUnitsPerDisplayUnit must be a positive integer no greater than ${RESEARCH_MAX_BASE_UNITS}`,
    )
  }

  if (
    !Number.isSafeInteger(input.displayPrecision) ||
    input.displayPrecision < 0 ||
    input.displayPrecision > 6
  ) {
    invalidUnitProfile("displayPrecision must be an integer from 0 through 6")
  }

  const fixedConversions: Partial<
    Record<ResearchDisplayUnit, Pick<ResearchUnitProfile, "baseUnit" | "baseUnitsPerDisplayUnit">>
  > = {
    mcg: { baseUnit: "microgram", baseUnitsPerDisplayUnit: 1 },
    mg: { baseUnit: "microgram", baseUnitsPerDisplayUnit: 1_000 },
    mL: { baseUnit: "microliter", baseUnitsPerDisplayUnit: 1_000 },
    unit: { baseUnit: "piece", baseUnitsPerDisplayUnit: 1 },
  }
  const fixed = fixedConversions[input.displayUnit]

  if (
    fixed &&
    (input.baseUnit !== fixed.baseUnit ||
      input.baseUnitsPerDisplayUnit !== fixed.baseUnitsPerDisplayUnit)
  ) {
    invalidUnitProfile(
      `${input.displayUnit} requires ${fixed.baseUnitsPerDisplayUnit} ${fixed.baseUnit} base unit${fixed.baseUnitsPerDisplayUnit === 1 ? "" : "s"} per display unit`,
    )
  }

  if (input.displayUnit === "IU" && input.baseUnit === "piece") {
    invalidUnitProfile(
      "IU requires a product-specific microgram or microliter conversion",
    )
  }

  return input
}

export type ResearchQuantityInput = {
  baseUnits: number
  baseUnit: ResearchBaseUnit
}

export function normalizeResearchQuantity(
  input: ResearchQuantityInput,
): ResearchQuantityInput {
  if (!RESEARCH_BASE_UNITS.includes(input.baseUnit)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "baseUnit must be microgram, microliter, or piece",
    )
  }

  if (
    !Number.isSafeInteger(input.baseUnits) ||
    input.baseUnits <= 0 ||
    input.baseUnits > RESEARCH_MAX_BASE_UNITS
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `baseUnits must be a positive integer no greater than ${RESEARCH_MAX_BASE_UNITS}`,
    )
  }

  return input
}
