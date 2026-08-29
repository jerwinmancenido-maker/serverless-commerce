import { MedusaError } from "@medusajs/framework/utils"

export const RESEARCH_BASE_UNITS = ["microgram", "microliter", "piece"] as const

export const RESEARCH_DISPLAY_UNITS = [
  "mcg",
  "mg",
  "g",
  "µL",
  "mL",
  "IU",
  "piece",
  "unit",
] as const

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

export const RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN =
  /^(?:0|[1-9]\d*)(?:\.\d+)?$/

export const RESEARCH_FIXED_UNIT_PROFILES = {
  mcg: { baseUnit: "microgram", baseUnitsPerDisplayUnit: 1 },
  mg: { baseUnit: "microgram", baseUnitsPerDisplayUnit: 1_000 },
  g: { baseUnit: "microgram", baseUnitsPerDisplayUnit: 1_000_000 },
  µL: { baseUnit: "microliter", baseUnitsPerDisplayUnit: 1 },
  mL: { baseUnit: "microliter", baseUnitsPerDisplayUnit: 1_000 },
  piece: { baseUnit: "piece", baseUnitsPerDisplayUnit: 1 },
  unit: { baseUnit: "piece", baseUnitsPerDisplayUnit: 1 },
} as const satisfies Partial<
  Record<
    ResearchDisplayUnit,
    Pick<ResearchUnitProfile, "baseUnit" | "baseUnitsPerDisplayUnit">
  >
>

export type ResearchFixedDisplayUnit = keyof typeof RESEARCH_FIXED_UNIT_PROFILES

export function isResearchBaseUnit(value: string): value is ResearchBaseUnit {
  return RESEARCH_BASE_UNITS.includes(value as ResearchBaseUnit)
}

export function isResearchDisplayUnit(
  value: string,
): value is ResearchDisplayUnit {
  return RESEARCH_DISPLAY_UNITS.includes(value as ResearchDisplayUnit)
}

function invalidResearchQuantityData(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

export function normalizeResearchUnitProfile(
  input: ResearchUnitProfile,
): ResearchUnitProfile {
  if (!isResearchBaseUnit(input.baseUnit)) {
    invalidResearchQuantityData(
      `baseUnit must be one of: ${RESEARCH_BASE_UNITS.join(", ")}`,
    )
  }

  if (!isResearchDisplayUnit(input.displayUnit)) {
    invalidResearchQuantityData(
      `displayUnit must be one of: ${RESEARCH_DISPLAY_UNITS.join(", ")}`,
    )
  }

  if (
    !Number.isSafeInteger(input.baseUnitsPerDisplayUnit) ||
    input.baseUnitsPerDisplayUnit <= 0 ||
    input.baseUnitsPerDisplayUnit > RESEARCH_MAX_BASE_UNITS
  ) {
    invalidResearchQuantityData(
      `baseUnitsPerDisplayUnit must be a positive integer no greater than ${RESEARCH_MAX_BASE_UNITS}`,
    )
  }

  if (
    !Number.isSafeInteger(input.displayPrecision) ||
    input.displayPrecision < 0 ||
    input.displayPrecision > 6
  ) {
    invalidResearchQuantityData(
      "displayPrecision must be an integer from 0 through 6",
    )
  }

  const fixed =
    RESEARCH_FIXED_UNIT_PROFILES[input.displayUnit as ResearchFixedDisplayUnit]

  if (
    fixed &&
    (input.baseUnit !== fixed.baseUnit ||
      input.baseUnitsPerDisplayUnit !== fixed.baseUnitsPerDisplayUnit)
  ) {
    invalidResearchQuantityData(
      `${input.displayUnit} requires ${fixed.baseUnitsPerDisplayUnit} ${fixed.baseUnit} base unit${fixed.baseUnitsPerDisplayUnit === 1 ? "" : "s"} per display unit`,
    )
  }

  if (input.displayUnit === "IU" && input.baseUnit === "piece") {
    invalidResearchQuantityData(
      "IU requires a product-specific microgram or microliter conversion",
    )
  }

  return input
}

export type ResearchQuantityInput = {
  baseUnits: number
  baseUnit: ResearchBaseUnit
}

export type ResearchFixedDisplayQuantityInput = {
  amount: string
  displayUnit: ResearchDisplayUnit
}

export function convertResearchFixedDisplayAmountToBaseUnits(
  input: ResearchFixedDisplayQuantityInput,
): ResearchQuantityInput | null {
  if (!isResearchDisplayUnit(input.displayUnit)) {
    invalidResearchQuantityData(
      `displayUnit must be one of: ${RESEARCH_DISPLAY_UNITS.join(", ")}`,
    )
  }

  const profile =
    RESEARCH_FIXED_UNIT_PROFILES[input.displayUnit as ResearchFixedDisplayUnit]

  if (!profile) {
    return null
  }

  if (
    input.amount.length > 80 ||
    !RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN.test(input.amount) ||
    !/[1-9]/.test(input.amount)
  ) {
    invalidResearchQuantityData(
      "amount must be a normalized positive decimal no longer than 80 characters",
    )
  }

  const [integer, fraction = ""] = input.amount.split(".")
  const scale = 10n ** BigInt(fraction.length)
  const decimalInteger = BigInt(`${integer}${fraction}`)
  const baseUnitsNumerator =
    decimalInteger * BigInt(profile.baseUnitsPerDisplayUnit)

  if (baseUnitsNumerator % scale !== 0n) {
    invalidResearchQuantityData(
      `${input.amount} ${input.displayUnit} does not resolve to a whole number of ${profile.baseUnit} base units`,
    )
  }

  const baseUnits = baseUnitsNumerator / scale

  if (baseUnits > BigInt(RESEARCH_MAX_BASE_UNITS)) {
    invalidResearchQuantityData(
      `converted base units must be no greater than ${RESEARCH_MAX_BASE_UNITS}`,
    )
  }

  return normalizeResearchQuantity({
    baseUnit: profile.baseUnit,
    baseUnits: Number(baseUnits),
  })
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
