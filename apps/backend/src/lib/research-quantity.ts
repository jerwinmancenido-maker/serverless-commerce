import { MedusaError } from "@medusajs/framework/utils"
import {
  RESEARCH_BASE_UNITS,
  RESEARCH_DISPLAY_UNIT_DIMENSIONS,
  RESEARCH_DISPLAY_UNITS,
  RESEARCH_QUANTITY_DIMENSIONS,
  isResearchBaseUnit,
  isResearchDisplayUnit,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
  type ResearchQuantityDimension,
} from "./research-unit-definitions"

export {
  RESEARCH_BASE_UNITS,
  RESEARCH_DISPLAY_UNIT_DIMENSIONS,
  RESEARCH_DISPLAY_UNITS,
  RESEARCH_QUANTITY_DIMENSIONS,
  isResearchBaseUnit,
  isResearchDisplayUnit,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
  type ResearchQuantityDimension,
} from "./research-unit-definitions"

// Medusa's model.number() maps these fields to a PostgreSQL integer column.
export const RESEARCH_MAX_BASE_UNITS = 2_147_483_647

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

export function getResearchDisplayUnitDimension(
  displayUnit: ResearchDisplayUnit,
): ResearchQuantityDimension {
  if (!isResearchDisplayUnit(displayUnit)) {
    invalidResearchQuantityData(
      `displayUnit must be one of: ${RESEARCH_DISPLAY_UNITS.join(", ")}`,
    )
  }

  return RESEARCH_DISPLAY_UNIT_DIMENSIONS[displayUnit]
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

export function normalizeResearchDecimalAmount(amount: string): string {
  if (
    amount.length > 80 ||
    !RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN.test(amount) ||
    !/[1-9]/.test(amount)
  ) {
    invalidResearchQuantityData(
      "amount must be a normalized positive decimal no longer than 80 characters",
    )
  }

  const [integer, fraction = ""] = amount.split(".")
  const normalizedFraction = fraction.replace(/0+$/, "")

  return normalizedFraction ? `${integer}.${normalizedFraction}` : integer
}

function convertResearchAmountWithProfileToBaseUnits(
  amount: string,
  profile: Pick<ResearchUnitProfile, "baseUnit" | "baseUnitsPerDisplayUnit">,
): ResearchQuantityInput {
  const normalizedAmount = normalizeResearchDecimalAmount(amount)
  const [integer, fraction = ""] = normalizedAmount.split(".")
  const scale = 10n ** BigInt(fraction.length)
  const decimalInteger = BigInt(`${integer}${fraction}`)
  const baseUnitsNumerator =
    decimalInteger * BigInt(profile.baseUnitsPerDisplayUnit)

  if (baseUnitsNumerator % scale !== 0n) {
    invalidResearchQuantityData(
      `${amount} does not resolve to a whole number of ${profile.baseUnit} base units`,
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

export function convertResearchDisplayAmountToBaseUnits(input: {
  amount: string
  displayUnit: ResearchDisplayUnit
  unitProfile?: ResearchUnitProfile
}): ResearchQuantityInput {
  if (!isResearchDisplayUnit(input.displayUnit)) {
    invalidResearchQuantityData(
      `displayUnit must be one of: ${RESEARCH_DISPLAY_UNITS.join(", ")}`,
    )
  }

  const fixed =
    RESEARCH_FIXED_UNIT_PROFILES[input.displayUnit as ResearchFixedDisplayUnit]

  if (fixed) {
    if (input.unitProfile) {
      const profile = normalizeResearchUnitProfile(input.unitProfile)

      if (
        profile.displayUnit !== input.displayUnit ||
        profile.baseUnit !== fixed.baseUnit ||
        profile.baseUnitsPerDisplayUnit !== fixed.baseUnitsPerDisplayUnit
      ) {
        invalidResearchQuantityData(
          `${input.displayUnit} must use its fixed research quantity profile`,
        )
      }
    }

    return convertResearchAmountWithProfileToBaseUnits(input.amount, fixed)
  }

  if (!input.unitProfile) {
    invalidResearchQuantityData(
      "IU conversion requires an explicit product-specific unit profile",
    )
  }

  const profile = normalizeResearchUnitProfile(input.unitProfile)

  if (profile.displayUnit !== input.displayUnit) {
    invalidResearchQuantityData(
      `unit profile displayUnit must be ${input.displayUnit}`,
    )
  }

  return convertResearchAmountWithProfileToBaseUnits(input.amount, profile)
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

  try {
    return convertResearchAmountWithProfileToBaseUnits(input.amount, profile)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("does not resolve to a whole number")
    ) {
      invalidResearchQuantityData(
        `${input.amount} ${input.displayUnit} does not resolve to a whole number of ${profile.baseUnit} base units`,
      )
    }

    throw error
  }
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
