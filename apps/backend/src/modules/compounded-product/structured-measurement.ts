import { MedusaError } from "@medusajs/framework/utils"

import {
  convertResearchDisplayAmountToBaseUnits,
  getResearchDisplayUnitDimension,
  normalizeResearchDecimalAmount,
  normalizeResearchUnitProfile,
  RESEARCH_FIXED_UNIT_PROFILES,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
  type ResearchFixedDisplayUnit,
  type ResearchQuantityDimension,
  type ResearchUnitProfile,
} from "../../lib/research-quantity"

export const COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE = [
  "declared",
  "calculated",
  "estimated",
] as const

export type CompoundedProductMeasurementProvenance =
  (typeof COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE)[number]

export type CompoundedProductStructuredMeasurementInput = {
  amount: string
  displayUnit: ResearchDisplayUnit
  dimension: ResearchQuantityDimension
  displayPrecision: number
  provenance: CompoundedProductMeasurementProvenance
  materialProfileId?: string | null
  sourceDocumentId?: string | null
  countBasis?: string | null
  unitProfile?: ResearchUnitProfile
}

export type CompoundedProductStructuredMeasurement = {
  amount: string
  displayUnit: ResearchDisplayUnit
  dimension: ResearchQuantityDimension
  baseUnit: ResearchBaseUnit
  baseUnits: number
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
  provenance: CompoundedProductMeasurementProvenance
  materialProfileId: string | null
  sourceDocumentId: string | null
  countBasis: string | null
}

export type CompoundedProductStructuredRatio = {
  numerator: CompoundedProductStructuredMeasurement
  denominator: CompoundedProductStructuredMeasurement
}

function invalidMeasurement(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function normalizeOptionalReference(
  value: string | null | undefined,
  label: string,
): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = value.trim()

  if (!normalized || normalized.length > 255) {
    invalidMeasurement(`${label} must contain 1 through 255 characters`)
  }

  return normalized
}

function resolveUnitProfile(
  input: CompoundedProductStructuredMeasurementInput,
): ResearchUnitProfile {
  const fixed =
    RESEARCH_FIXED_UNIT_PROFILES[
      input.displayUnit as ResearchFixedDisplayUnit
    ]

  if (fixed) {
    const fixedProfile: ResearchUnitProfile = {
      ...fixed,
      displayUnit: input.displayUnit,
      displayPrecision: input.displayPrecision,
    }

    if (input.unitProfile) {
      const supplied = normalizeResearchUnitProfile(input.unitProfile)

      if (
        supplied.displayUnit !== fixedProfile.displayUnit ||
        supplied.baseUnit !== fixedProfile.baseUnit ||
        supplied.baseUnitsPerDisplayUnit !==
          fixedProfile.baseUnitsPerDisplayUnit ||
        supplied.displayPrecision !== fixedProfile.displayPrecision
      ) {
        invalidMeasurement(
          `${input.displayUnit} must use its fixed research quantity profile`,
        )
      }
    }

    return fixedProfile
  }

  if (input.displayUnit !== "IU" || !input.unitProfile) {
    invalidMeasurement(
      "IU requires an explicit product-specific unit profile",
    )
  }

  const supplied = normalizeResearchUnitProfile(input.unitProfile)

  if (
    supplied.displayUnit !== "IU" ||
    supplied.displayPrecision !== input.displayPrecision
  ) {
    invalidMeasurement(
      "IU unit profile must match the display unit and display precision",
    )
  }

  return supplied
}

export function normalizeCompoundedProductStructuredMeasurement(
  input: CompoundedProductStructuredMeasurementInput,
): CompoundedProductStructuredMeasurement {
  const amount = normalizeResearchDecimalAmount(input.amount)
  const fractionLength = amount.split(".")[1]?.length || 0

  if (
    !Number.isSafeInteger(input.displayPrecision) ||
    input.displayPrecision < 0 ||
    input.displayPrecision > 6
  ) {
    invalidMeasurement("displayPrecision must be an integer from 0 through 6")
  }

  if (fractionLength > input.displayPrecision) {
    invalidMeasurement(
      `amount exceeds the configured display precision of ${input.displayPrecision}`,
    )
  }

  if (!COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE.includes(input.provenance)) {
    invalidMeasurement(
      `provenance must be one of: ${COMPOUNDED_PRODUCT_MEASUREMENT_PROVENANCE.join(", ")}`,
    )
  }

  const resolvedDimension = getResearchDisplayUnitDimension(input.displayUnit)

  if (resolvedDimension !== input.dimension) {
    invalidMeasurement(
      `${input.displayUnit} is not compatible with the ${input.dimension} dimension`,
    )
  }

  const materialProfileId = normalizeOptionalReference(
    input.materialProfileId,
    "materialProfileId",
  )
  const sourceDocumentId = normalizeOptionalReference(
    input.sourceDocumentId,
    "sourceDocumentId",
  )
  const countBasis = normalizeOptionalReference(input.countBasis, "countBasis")

  if (input.displayUnit === "IU" && !materialProfileId) {
    invalidMeasurement("IU requires an explicit material profile reference")
  }

  if (input.dimension !== "count" && countBasis) {
    invalidMeasurement("countBasis is only accepted for count measurements")
  }

  const unitProfile = resolveUnitProfile(input)
  const converted = convertResearchDisplayAmountToBaseUnits({
    amount,
    displayUnit: input.displayUnit,
    unitProfile,
  })

  return {
    amount,
    displayUnit: input.displayUnit,
    dimension: input.dimension,
    baseUnit: converted.baseUnit,
    baseUnits: converted.baseUnits,
    baseUnitsPerDisplayUnit: unitProfile.baseUnitsPerDisplayUnit,
    displayPrecision: input.displayPrecision,
    provenance: input.provenance,
    materialProfileId,
    sourceDocumentId,
    countBasis,
  }
}

export function normalizeCompoundedProductStructuredRatio(input: {
  numerator: CompoundedProductStructuredMeasurementInput
  denominator: CompoundedProductStructuredMeasurementInput
}): CompoundedProductStructuredRatio {
  return {
    numerator: normalizeCompoundedProductStructuredMeasurement(
      input.numerator,
    ),
    denominator: normalizeCompoundedProductStructuredMeasurement(
      input.denominator,
    ),
  }
}
