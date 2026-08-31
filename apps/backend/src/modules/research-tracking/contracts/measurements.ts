import { MedusaError } from "@medusajs/framework/utils"

import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
  normalizeResearchTimezone,
} from "./ownership"

export const RESEARCH_MEASUREMENT_ALLOWLIST_VERSION = "progress-metrics-v1"
export const RESEARCH_MEASUREMENT_METRICS = [
  "weight",
  "waist",
  "body_fat",
] as const
export type ResearchMeasurementMetric =
  (typeof RESEARCH_MEASUREMENT_METRICS)[number]
export type ResearchMeasurementUnit = "kg" | "lb" | "cm" | "in" | "percent"

const unitsByMetric: Record<ResearchMeasurementMetric, ResearchMeasurementUnit[]> = {
  weight: ["kg", "lb"],
  waist: ["cm", "in"],
  body_fat: ["percent"],
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function normalizeDecimal(value: string): string {
  const normalized = value.trim()

  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(normalized)) {
    invalid("measurement value must be a positive decimal with up to 6 places")
  }

  const numeric = Number(normalized)
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > 100_000) {
    invalid("measurement value is outside the supported range")
  }

  return normalized
}

function normalizedValue(metric: ResearchMeasurementMetric, value: string, unit: ResearchMeasurementUnit) {
  const numeric = Number(value)
  const conversion =
    metric === "weight"
      ? unit === "lb"
        ? numeric * 0.45359237
        : numeric
      : metric === "waist"
        ? unit === "in"
          ? numeric * 2.54
          : numeric
        : numeric

  return conversion.toFixed(6).replace(/\.?0+$/, "")
}

export type ResearchMeasurementContentInput = {
  metricType: ResearchMeasurementMetric
  value: string
  unit: ResearchMeasurementUnit
  localDate: string
  localTime: string
  timezone: string
  note?: string | null
  routineId?: string | null
  protocolRevisionId?: string | null
  profileProtocolAccessId?: string | null
  trackedMaterialId?: string | null
  routineLogId?: string | null
  source?: "customer" | "activity" | "journal"
}

export function normalizeResearchMeasurementContent(
  input: ResearchMeasurementContentInput,
) {
  if (!RESEARCH_MEASUREMENT_METRICS.includes(input.metricType)) {
    invalid("measurement metric is not allowlisted")
  }
  if (!unitsByMetric[input.metricType].includes(input.unit)) {
    invalid(`measurement unit is not valid for ${input.metricType}`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.localDate)) {
    invalid("local_date must be YYYY-MM-DD")
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.localTime)) {
    invalid("local_time must be HH:mm")
  }

  const value = normalizeDecimal(input.value)
  const timezone = normalizeResearchTimezone(input.timezone)
  const normalizedUnit =
    input.metricType === "weight"
      ? "kg"
      : input.metricType === "waist"
        ? "cm"
        : "percent"

  return {
    metricType: input.metricType,
    originalValue: value,
    originalUnit: input.unit,
    normalizedValue: normalizedValue(input.metricType, value, input.unit),
    normalizedUnit,
    localDate: input.localDate,
    localTime: input.localTime,
    timezone,
    note: input.note?.trim() || null,
    routineId: input.routineId?.trim() || null,
    protocolRevisionId: input.protocolRevisionId?.trim() || null,
    profileProtocolAccessId: input.profileProtocolAccessId?.trim() || null,
    trackedMaterialId: input.trackedMaterialId?.trim() || null,
    routineLogId: input.routineLogId?.trim() || null,
    source: input.source ?? "customer",
  } as const
}

export function measurementMutationIdentity(input: {
  operation: "create" | "revise" | "void" | "restore"
  idempotencyKey: string
  values: Array<string | null>
}) {
  return {
    idempotencyKey: normalizeResearchIdempotencyKey(input.idempotencyKey),
    fingerprint: createResearchRequestFingerprint(
      `research-measurement-${input.operation}`,
      input.values,
    ),
  }
}
