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

export const RESEARCH_QUANTITY_DIMENSIONS = [
  "mass",
  "volume",
  "potency",
  "count",
] as const

export type ResearchBaseUnit = (typeof RESEARCH_BASE_UNITS)[number]
export type ResearchDisplayUnit = (typeof RESEARCH_DISPLAY_UNITS)[number]
export type ResearchQuantityDimension =
  (typeof RESEARCH_QUANTITY_DIMENSIONS)[number]

export const RESEARCH_DISPLAY_UNIT_DIMENSIONS = {
  mcg: "mass",
  mg: "mass",
  g: "mass",
  µL: "volume",
  mL: "volume",
  IU: "potency",
  piece: "count",
  unit: "count",
} as const satisfies Record<ResearchDisplayUnit, ResearchQuantityDimension>

export function isResearchBaseUnit(value: string): value is ResearchBaseUnit {
  return RESEARCH_BASE_UNITS.includes(value as ResearchBaseUnit)
}

export function isResearchDisplayUnit(
  value: string,
): value is ResearchDisplayUnit {
  return RESEARCH_DISPLAY_UNITS.includes(value as ResearchDisplayUnit)
}

export function getResearchDisplayUnitDimension(
  displayUnit: ResearchDisplayUnit,
): ResearchQuantityDimension {
  return RESEARCH_DISPLAY_UNIT_DIMENSIONS[displayUnit]
}
