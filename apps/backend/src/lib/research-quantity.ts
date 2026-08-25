import { MedusaError } from "@medusajs/framework/utils"

export const RESEARCH_BASE_UNITS = ["microgram", "microliter", "piece"] as const

// Medusa's model.number() maps these fields to a PostgreSQL integer column.
export const RESEARCH_MAX_BASE_UNITS = 2_147_483_647

export type ResearchBaseUnit = (typeof RESEARCH_BASE_UNITS)[number]

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
