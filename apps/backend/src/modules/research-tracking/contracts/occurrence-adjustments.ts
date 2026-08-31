import { MedusaError } from "@medusajs/framework/utils"

import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
  normalizeResearchTimezone,
} from "./ownership"

export type ResearchOccurrenceAdjustmentOperation =
  | "skip"
  | "reschedule"
  | "restore"

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function date(value: string, field: string): string {
  const normalized = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) invalid(`${field} must use YYYY-MM-DD`)
  const parsed = new Date(`${normalized}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    invalid(`${field} must be a valid calendar date`)
  }
  return normalized
}

function time(value: string, field: string): string {
  const normalized = value.trim()
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) invalid(`${field} must use HH:mm`)
  return normalized
}

export function normalizeResearchOccurrenceAdjustment(input: {
  customerId: string
  activeConsentVersion: string
  occurrenceId: string
  routineId: string
  routineRevisionId: string
  routineScheduleSegmentId?: string | null
  operation: ResearchOccurrenceAdjustmentOperation
  plannedLocalDate: string
  plannedLocalTime: string
  rescheduledLocalDate?: string | null
  rescheduledLocalTime?: string | null
  timezone: string
  note?: string | null
  idempotencyKey: string
}) {
  const occurrenceId = input.occurrenceId.trim()
  const routineId = input.routineId.trim()
  const routineRevisionId = input.routineRevisionId.trim()
  if (!occurrenceId || !routineId || !routineRevisionId) invalid("occurrence and routine identity are required")
  const plannedLocalDate = date(input.plannedLocalDate, "planned_local_date")
  const plannedLocalTime = time(input.plannedLocalTime, "planned_local_time")
  const timezone = normalizeResearchTimezone(input.timezone)
  const rescheduledLocalDate = input.operation === "reschedule"
    ? date(input.rescheduledLocalDate ?? "", "rescheduled_local_date")
    : null
  const rescheduledLocalTime = input.operation === "reschedule"
    ? time(input.rescheduledLocalTime ?? "", "rescheduled_local_time")
    : null
  const note = input.note?.trim() || null
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  return {
    customerId: input.customerId.trim(),
    activeConsentVersion: input.activeConsentVersion.trim(),
    occurrenceId,
    routineId,
    routineRevisionId,
    routineScheduleSegmentId: input.routineScheduleSegmentId?.trim() || null,
    operation: input.operation,
    plannedLocalDate,
    plannedLocalTime,
    rescheduledLocalDate,
    rescheduledLocalTime,
    timezone,
    note,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "research-occurrence-adjustment",
      [occurrenceId, routineId, routineRevisionId, input.operation, plannedLocalDate,
        plannedLocalTime, rescheduledLocalDate, rescheduledLocalTime, timezone, note],
    ),
  }
}
