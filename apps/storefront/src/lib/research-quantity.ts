export type ResearchBaseUnit = "microgram" | "microliter" | "piece"
export type ResearchDisplayUnit =
  | "mcg"
  | "mg"
  | "g"
  | "µL"
  | "mL"
  | "IU"
  | "piece"
  | "unit"

export type ResearchUnitProfile = {
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
}

type CompleteResearchUnitProfile = {
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit
  base_units_per_display_unit: number
  display_precision: number
}

function validProfile(
  profile: ResearchUnitProfile | null | undefined,
): profile is CompleteResearchUnitProfile {
  const displayUnit = profile?.display_unit

  if (
    !profile ||
    !displayUnit ||
    !["microgram", "microliter", "piece"].includes(profile.base_unit) ||
    !["mcg", "mg", "g", "µL", "mL", "IU", "piece", "unit"].includes(
      displayUnit,
    ) ||
    !Number.isSafeInteger(profile.base_units_per_display_unit) ||
    (profile.base_units_per_display_unit ?? 0) <= 0 ||
    !Number.isSafeInteger(profile.display_precision) ||
    (profile.display_precision ?? -1) < 0 ||
    (profile.display_precision ?? 7) > 6
  ) {
    return false
  }

  const fixed = {
    mcg: ["microgram", 1],
    mg: ["microgram", 1_000],
    g: ["microgram", 1_000_000],
    µL: ["microliter", 1],
    mL: ["microliter", 1_000],
    piece: ["piece", 1],
    unit: ["piece", 1],
  } as const
  const expected =
    displayUnit === "IU" ? null : fixed[displayUnit]

  return expected
    ? profile.base_unit === expected[0] &&
        profile.base_units_per_display_unit === expected[1]
    : profile.base_unit !== "piece"
}

export const MCG_PREFERRED_COMPOUND_REGEX =
  /\b(semax|selank|dsip|adamax)\b|(?:\b|\d)mcg\b/i

export function isMcgPreferredCompound(nameOrLabel?: string | null): boolean {
  if (!nameOrLabel) {
    return false
  }

  return MCG_PREFERRED_COMPOUND_REGEX.test(nameOrLabel)
}

export function serializeResearchUnitProfile(
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): string {
  return JSON.stringify(resolveResearchUnitProfile(profile, compoundNameOrLabel))
}

export function parseResearchUnitProfile(
  value: FormDataEntryValue | null,
): CompleteResearchUnitProfile | null {
  if (typeof value !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(value) as ResearchUnitProfile

    return validProfile(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Universal dosage normalizer for research compounds:
 * - If dose >= 1000 mcg -> format in mg (e.g., 1000 mcg -> 1 mg, 2500 mcg -> 2.5 mg, 5000 mcg -> 5 mg)
 * - If dose < 1000 mcg -> format in mcg (e.g., 200 mcg -> 200 mcg, 0.2 mg -> 200 mcg)
 */
export function formatPeptideDosage(
  amount: number | string,
  unit: string = "mcg"
): { amount: string; unit: "mcg" | "mg" | "IU"; formatted: string } {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num) || num <= 0) {
    const fallbackUnit = unit?.toLowerCase() === "iu" ? "IU" : unit === "mg" ? "mg" : "mcg"
    const fallbackAmount = isNaN(num) ? String(amount) : "0"
    return {
      amount: fallbackAmount,
      unit: fallbackUnit,
      formatted: `${fallbackAmount} ${fallbackUnit}`,
    }
  }

  // Handle native International Units (IU)
  if (unit?.toLowerCase() === "iu") {
    const formattedIU = Number(num.toFixed(2)).toString()
    return {
      amount: formattedIU,
      unit: "IU",
      formatted: `${formattedIU} IU`,
    }
  }

  // Convert to microgram baseline
  let mcg = num
  if (unit === "mg") {
    mcg = num * 1000
  }

  // Threshold rule: >= 1000 mcg -> mg; < 1000 mcg -> mcg
  if (mcg >= 1000) {
    const mg = mcg / 1000
    // Format cleanly without trailing zeros (up to 3 decimal places if needed, e.g. 1.25)
    const formattedMg = Number(mg.toFixed(3)).toString()
    return {
      amount: formattedMg,
      unit: "mg",
      formatted: `${formattedMg} mg`,
    }
  }

  const formattedMcg = Number(mcg.toFixed(1)).toString()
  return {
    amount: formattedMcg,
    unit: "mcg",
    formatted: `${formattedMcg} mcg`,
  }
}

export function defaultResearchUnitProfile(
  baseUnit: ResearchBaseUnit,
  compoundNameOrLabel?: string | null,
  amountOrBaseUnits?: number | null,
): CompleteResearchUnitProfile {
  if (baseUnit === "microgram") {
    if (amountOrBaseUnits != null) {
      if (amountOrBaseUnits >= 1000) {
        return {
          base_unit: baseUnit,
          display_unit: "mg",
          base_units_per_display_unit: 1_000,
          display_precision: 2,
        }
      } else {
        return {
          base_unit: baseUnit,
          display_unit: "mcg",
          base_units_per_display_unit: 1,
          display_precision: 0,
        }
      }
    }

    if (isMcgPreferredCompound(compoundNameOrLabel)) {
      return {
        base_unit: baseUnit,
        display_unit: "mcg",
        base_units_per_display_unit: 1,
        display_precision: 0,
      }
    }

    return {
      base_unit: baseUnit,
      display_unit: "mg",
      base_units_per_display_unit: 1_000,
      display_precision: 2,
    }
  }

  if (baseUnit === "microliter") {
    return {
      base_unit: baseUnit,
      display_unit: "mL",
      base_units_per_display_unit: 1_000,
      display_precision: 3,
    }
  }

  return {
    base_unit: baseUnit,
    display_unit: "piece",
    base_units_per_display_unit: 1,
    display_precision: 0,
  }
}

export function resolveResearchUnitProfile(
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): CompleteResearchUnitProfile {
  return validProfile(profile)
    ? profile
    : defaultResearchUnitProfile(profile.base_unit, compoundNameOrLabel)
}

export function formatResearchQuantity(
  baseUnits: number,
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): string {
  const resolved = resolveResearchUnitProfile(profile, compoundNameOrLabel)
  const displayValue = baseUnits / resolved.base_units_per_display_unit

  return `${displayValue.toLocaleString("en-PH", {
    maximumFractionDigits: resolved.display_precision,
    minimumFractionDigits: 0,
  })} ${resolved.display_unit}`
}

export function researchDisplayQuantity(
  baseUnits: number,
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): number {
  const resolved = resolveResearchUnitProfile(profile, compoundNameOrLabel)

  return baseUnits / resolved.base_units_per_display_unit
}

export function researchDisplayStep(
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): number {
  const resolved = resolveResearchUnitProfile(profile, compoundNameOrLabel)

  return 10 ** -resolved.display_precision
}

export function convertResearchDisplayQuantityToBaseUnits(
  displayValue: number,
  profile: ResearchUnitProfile,
  compoundNameOrLabel?: string | null,
): number | null {
  const resolved = resolveResearchUnitProfile(profile, compoundNameOrLabel)
  const baseUnits = displayValue * resolved.base_units_per_display_unit

  return Number.isSafeInteger(baseUnits) && baseUnits > 0 ? baseUnits : null
}
