export type ResearchBaseUnit = "microgram" | "microliter" | "piece"
export type ResearchDisplayUnit = "mcg" | "mg" | "mL" | "IU" | "unit"

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
    !["mcg", "mg", "mL", "IU", "unit"].includes(
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
    mL: ["microliter", 1_000],
    unit: ["piece", 1],
  } as const
  const expected =
    displayUnit === "IU" ? null : fixed[displayUnit]

  return expected
    ? profile.base_unit === expected[0] &&
        profile.base_units_per_display_unit === expected[1]
    : profile.base_unit !== "piece"
}

export function serializeResearchUnitProfile(
  profile: ResearchUnitProfile,
): string {
  return JSON.stringify(resolveResearchUnitProfile(profile))
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

export function defaultResearchUnitProfile(
  baseUnit: ResearchBaseUnit,
): CompleteResearchUnitProfile {
  if (baseUnit === "microgram") {
    return {
      base_unit: baseUnit,
      display_unit: "mcg",
      base_units_per_display_unit: 1,
      display_precision: 0,
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
    display_unit: "unit",
    base_units_per_display_unit: 1,
    display_precision: 0,
  }
}

export function resolveResearchUnitProfile(
  profile: ResearchUnitProfile,
): CompleteResearchUnitProfile {
  return validProfile(profile)
    ? profile
    : defaultResearchUnitProfile(profile.base_unit)
}

export function formatResearchQuantity(
  baseUnits: number,
  profile: ResearchUnitProfile,
): string {
  const resolved = resolveResearchUnitProfile(profile)
  const displayValue = baseUnits / resolved.base_units_per_display_unit

  return `${displayValue.toLocaleString("en-PH", {
    maximumFractionDigits: resolved.display_precision,
    minimumFractionDigits: 0,
  })} ${resolved.display_unit}`
}

export function researchDisplayQuantity(
  baseUnits: number,
  profile: ResearchUnitProfile,
): number {
  const resolved = resolveResearchUnitProfile(profile)

  return baseUnits / resolved.base_units_per_display_unit
}

export function researchDisplayStep(profile: ResearchUnitProfile): number {
  const resolved = resolveResearchUnitProfile(profile)

  return 10 ** -resolved.display_precision
}

export function convertResearchDisplayQuantityToBaseUnits(
  displayValue: number,
  profile: ResearchUnitProfile,
): number | null {
  const resolved = resolveResearchUnitProfile(profile)
  const baseUnits = displayValue * resolved.base_units_per_display_unit

  return Number.isSafeInteger(baseUnits) && baseUnits > 0 ? baseUnits : null
}
