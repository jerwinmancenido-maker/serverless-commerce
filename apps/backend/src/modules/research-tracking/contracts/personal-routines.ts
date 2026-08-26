import { createHash, createHmac, timingSafeEqual } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"

import type { ResearchBaseUnit } from "../../../lib/research-quantity"
import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
  normalizeResearchTimezone,
} from "./ownership"

export const RESEARCH_ROUTINE_STATUSES = ["active", "archived"] as const
export const RESEARCH_RECURRENCE_TYPES = ["once", "daily", "weekly"] as const
export const RESEARCH_LOG_STATUSES = ["confirmed", "voided"] as const
export const RESEARCH_LOG_OPERATIONS = [
  "confirm",
  "revise",
  "void",
  "restore",
] as const
export const RESEARCH_MUTATION_STATUSES = [
  "processing",
  "completed",
  "failed",
] as const
export const RESEARCH_ROUTINE_LABEL_MAX_LENGTH = 120
export const RESEARCH_OCCURRENCE_MAX_DAYS = 31

export type ResearchRoutineStatus = (typeof RESEARCH_ROUTINE_STATUSES)[number]
export type ResearchRecurrenceType = (typeof RESEARCH_RECURRENCE_TYPES)[number]
export type ResearchLogStatus = (typeof RESEARCH_LOG_STATUSES)[number]
export type ResearchLogOperation = (typeof RESEARCH_LOG_OPERATIONS)[number]
export type ResearchMutationStatus = (typeof RESEARCH_MUTATION_STATUSES)[number]

export type ResearchRoutineSchedule = {
  recurrence_type: ResearchRecurrenceType
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: number[]
  local_time: string
  start_date: string
  end_date: string | null
  effective_from_date: string
  timezone: string
}

export type CreateResearchRoutineInput = {
  customerId: string
  activeConsentVersion: string
  trackedMaterialId: string
  label: string
  plannedQuantityBaseUnits: number
  baseUnit: ResearchBaseUnit
  recurrenceType: ResearchRecurrenceType
  dailyInterval?: number | null
  weeklyInterval?: number | null
  weekdays?: number[]
  localTime: string
  timezone: string
  startDate: string
  endDate?: string | null
  effectiveFromDate: string
  idempotencyKey: string
}

export type UpdateResearchRoutineInput = Omit<
  CreateResearchRoutineInput,
  "trackedMaterialId"
> & {
  routineId: string
}

export type TransitionResearchRoutineInput = {
  customerId: string
  activeConsentVersion: string
  routineId: string
  effectiveFromDate: string
  idempotencyKey: string
}

export type NormalizedResearchRoutineInput = {
  customerId: string
  activeConsentVersion: string
  routineId: string | null
  trackedMaterialId: string | null
  label: string
  plannedQuantityBaseUnits: number
  baseUnit: ResearchBaseUnit
  schedule: ResearchRoutineSchedule
  idempotencyKey: string
  requestFingerprintSha256: string
}

export type ResearchOccurrence = {
  occurrence_id: string
  routine_id: string
  routine_revision_id: string
  label: string
  planned_quantity_base_units: number
  base_unit: ResearchBaseUnit
  local_date: string
  local_time: string
  timezone: string
  status: "scheduled" | "confirmed" | "voided"
  log_id: string | null
}

export type ResearchRoutineProjection = {
  routine_id: string
  tracked_material_id: string
  tracked_material_label: string
  status: ResearchRoutineStatus
  archived_at: Date | null
  current_revision: {
    revision_id: string
    label: string
    planned_quantity_base_units: number
    base_unit: ResearchBaseUnit
    schedule: ResearchRoutineSchedule
    created_at: Date
  }
}

export type PreviewResearchRoutineLogInput = {
  customerId: string
  activeConsentVersion: string
  routineId: string
  routineRevisionId: string
  occurrenceId: string
  localDate: string
  supplyId: string
  confirmedQuantityBaseUnits: number
  baseUnit: ResearchBaseUnit
}

export type ConfirmResearchRoutineLogInput = PreviewResearchRoutineLogInput & {
  idempotencyKey: string
  previewToken: string
}

export type NormalizedResearchRoutineLogInput =
  PreviewResearchRoutineLogInput & {
    idempotencyKey: string | null
    requestFingerprintSha256: string
  }

export type ResearchRoutineLogPreview = {
  routine_id: string
  routine_revision_id: string
  occurrence_id: string
  local_date: string
  local_time: string
  timezone: string
  supply_id: string
  base_unit: ResearchBaseUnit
  confirmed_quantity_base_units: number
  current_remaining_quantity_base_units: number
  projected_remaining_quantity_base_units: number
  notice: string
  preview_token: string
}

export type ResearchRoutineLogConfirmationPreviewClaims = {
  customerId: string
  routineId: string
  routineRevisionId: string
  occurrenceId: string
  localDate: string
  supplyId: string
  confirmedQuantityBaseUnits: number
  baseUnit: ResearchBaseUnit
}

export type ResearchRoutineLogMutationPreview = {
  log_id: string
  operation: "revise" | "void" | "restore"
  current_status: ResearchLogStatus
  projected_status: ResearchLogStatus
  supply_changes: Array<{
    supply_id: string
    base_unit: ResearchBaseUnit
    current_remaining_quantity_base_units: number
    projected_remaining_quantity_base_units: number
  }>
  confirmed_quantity_base_units: number
  base_unit: ResearchBaseUnit
  notice: string
  preview_token: string
}

export type ResearchRoutineLogMutationPreviewClaims = {
  customerId: string
  logId: string
  operation: "revise" | "void" | "restore"
  currentRevisionId: string
  currentStatus: ResearchLogStatus
  supplyId: string | null
  confirmedQuantityBaseUnits: number | null
  baseUnit: ResearchBaseUnit | null
  supplyBalances: Array<{
    supplyId: string
    remainingQuantityBaseUnits: number
  }>
}

const RESEARCH_LOG_PREVIEW_TTL_SECONDS = 5 * 60

function canonicalSupplyBalances(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null
  }

  const balances: ResearchRoutineLogMutationPreviewClaims["supplyBalances"] = []

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { supplyId?: unknown }).supplyId !== "string" ||
      !Number.isSafeInteger(
        (item as { remainingQuantityBaseUnits?: unknown })
          .remainingQuantityBaseUnits,
      )
    ) {
      return null
    }

    balances.push({
      supplyId: (item as { supplyId: string }).supplyId,
      remainingQuantityBaseUnits: (
        item as { remainingQuantityBaseUnits: number }
      ).remainingQuantityBaseUnits,
    })
  }

  return JSON.stringify(
    balances.sort((left, right) => left.supplyId.localeCompare(right.supplyId)),
  )
}

function researchLogPreviewSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "JWT_SECRET is required for private record previews",
    )
  }

  return secret
}

export function createResearchRoutineLogMutationPreviewToken(
  claims: ResearchRoutineLogMutationPreviewClaims,
  now = new Date(),
): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...claims,
      expiresAt:
        Math.floor(now.getTime() / 1000) + RESEARCH_LOG_PREVIEW_TTL_SECONDS,
    }),
  ).toString("base64url")
  const signature = createHmac("sha256", researchLogPreviewSecret())
    .update(payload)
    .digest("base64url")

  return `${payload}.${signature}`
}

export function createResearchRoutineLogConfirmationPreviewToken(
  claims: ResearchRoutineLogConfirmationPreviewClaims,
  now = new Date(),
): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...claims,
      expiresAt:
        Math.floor(now.getTime() / 1000) + RESEARCH_LOG_PREVIEW_TTL_SECONDS,
    }),
  ).toString("base64url")
  const signature = createHmac("sha256", researchLogPreviewSecret())
    .update(payload)
    .digest("base64url")

  return `${payload}.${signature}`
}

export function assertResearchRoutineLogConfirmationPreviewToken(
  token: string,
  expected: ResearchRoutineLogConfirmationPreviewClaims,
  now = new Date(),
): void {
  const [payload, providedSignature, extra] = token.split(".")

  if (!payload || !providedSignature || extra) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  const expectedSignature = createHmac("sha256", researchLogPreviewSecret())
    .update(payload)
    .digest("base64url")
  const provided = Buffer.from(providedSignature)
  const signed = Buffer.from(expectedSignature)

  if (provided.length !== signed.length || !timingSafeEqual(provided, signed)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  let claims: ResearchRoutineLogConfirmationPreviewClaims & {
    expiresAt: number
  }

  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  if (
    claims.expiresAt < Math.floor(now.getTime() / 1000) ||
    claims.customerId !== expected.customerId ||
    claims.routineId !== expected.routineId ||
    claims.routineRevisionId !== expected.routineRevisionId ||
    claims.occurrenceId !== expected.occurrenceId ||
    claims.localDate !== expected.localDate ||
    claims.supplyId !== expected.supplyId ||
    claims.confirmedQuantityBaseUnits !== expected.confirmedQuantityBaseUnits ||
    claims.baseUnit !== expected.baseUnit
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "preview_expired_or_changed",
    )
  }
}

export function assertResearchRoutineLogMutationPreviewToken(
  token: string,
  expected: ResearchRoutineLogMutationPreviewClaims,
  now = new Date(),
): void {
  const [payload, providedSignature, extra] = token.split(".")

  if (!payload || !providedSignature || extra) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  const expectedSignature = createHmac("sha256", researchLogPreviewSecret())
    .update(payload)
    .digest("base64url")
  const provided = Buffer.from(providedSignature)
  const signed = Buffer.from(expectedSignature)

  if (provided.length !== signed.length || !timingSafeEqual(provided, signed)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  let claims: ResearchRoutineLogMutationPreviewClaims & { expiresAt: number }

  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "preview_required")
  }

  if (
    claims.expiresAt < Math.floor(now.getTime() / 1000) ||
    claims.customerId !== expected.customerId ||
    claims.logId !== expected.logId ||
    claims.operation !== expected.operation ||
    claims.currentRevisionId !== expected.currentRevisionId ||
    claims.currentStatus !== expected.currentStatus ||
    claims.supplyId !== expected.supplyId ||
    claims.confirmedQuantityBaseUnits !== expected.confirmedQuantityBaseUnits ||
    claims.baseUnit !== expected.baseUnit ||
    canonicalSupplyBalances(claims.supplyBalances) !==
      canonicalSupplyBalances(expected.supplyBalances)
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "preview_expired_or_changed",
    )
  }
}

export type ResearchRoutineLogProjection = {
  log_id: string
  routine_id: string
  routine_revision_id: string
  occurrence_id: string
  status: ResearchLogStatus
  operation: ResearchLogOperation
  local_date: string
  local_time: string
  timezone: string
  supply_id: string
  confirmed_quantity_base_units: number
  base_unit: ResearchBaseUnit
  created_at: Date
}

type RoutineRevisionForProjection = {
  id: string
  routine_id: string
  label: string
  planned_quantity_base_units: number
  base_unit: ResearchBaseUnit
  recurrence_type: ResearchRecurrenceType
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: number[] | null
  local_time: string
  start_date: Date | string
  end_date: Date | string | null
  effective_from_date: Date | string
  timezone: string
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  return normalized
}

function normalizeDate(value: string, field: string): string {
  const normalized = value.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    invalid(`${field} must use YYYY-MM-DD`)
  }

  const date = new Date(`${normalized}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== normalized
  ) {
    invalid(`${field} must be a valid calendar date`)
  }

  return normalized
}

function normalizeTime(value: string): string {
  const normalized = value.trim()

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    invalid("localTime must use HH:mm")
  }

  return normalized
}

function normalizePositiveInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    invalid(`${field} must be a positive safe integer`)
  }

  return value
}

function normalizeWeekdays(values: number[] | undefined): number[] {
  const weekdays = Array.from(new Set(values ?? [])).sort(
    (left, right) => left - right,
  )

  if (
    weekdays.some(
      (weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6,
    )
  ) {
    invalid("weekdays must contain unique values from 0 through 6")
  }

  return weekdays
}

export function normalizeResearchRoutineLabel(value: string): string {
  const normalized = requiredText(value, "label").replace(/\s+/g, " ")

  if (Array.from(normalized).length > RESEARCH_ROUTINE_LABEL_MAX_LENGTH) {
    invalid(
      `label must not exceed ${RESEARCH_ROUTINE_LABEL_MAX_LENGTH} characters`,
    )
  }

  return normalized
}

export function normalizeResearchRoutineInput(
  input: CreateResearchRoutineInput | UpdateResearchRoutineInput,
): NormalizedResearchRoutineInput {
  const customerId = requiredText(input.customerId, "customerId")
  const activeConsentVersion = requiredText(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const routineId =
    "routineId" in input ? requiredText(input.routineId, "routineId") : null
  const trackedMaterialId =
    "trackedMaterialId" in input
      ? requiredText(input.trackedMaterialId, "trackedMaterialId")
      : null
  const label = normalizeResearchRoutineLabel(input.label)
  const plannedQuantityBaseUnits = normalizePositiveInteger(
    input.plannedQuantityBaseUnits,
    "plannedQuantityBaseUnits",
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)
  const timezone = normalizeResearchTimezone(input.timezone)
  const localTime = normalizeTime(input.localTime)
  const startDate = normalizeDate(input.startDate, "startDate")
  const effectiveFromDate = normalizeDate(
    input.effectiveFromDate,
    "effectiveFromDate",
  )
  const endDate = input.endDate ? normalizeDate(input.endDate, "endDate") : null
  const weekdays = normalizeWeekdays(input.weekdays)

  if (endDate && endDate < startDate) {
    invalid("endDate cannot precede startDate")
  }

  let dailyInterval: number | null = null
  let weeklyInterval: number | null = null

  if (input.recurrenceType === "once") {
    if (weekdays.length || input.dailyInterval || input.weeklyInterval) {
      invalid("once recurrence cannot include interval or weekday fields")
    }
  } else if (input.recurrenceType === "daily") {
    dailyInterval = normalizePositiveInteger(
      input.dailyInterval ?? 1,
      "dailyInterval",
    )

    if (dailyInterval > 30 || weekdays.length || input.weeklyInterval) {
      invalid("daily recurrence interval must be 1-30 without weekly fields")
    }
  } else if (input.recurrenceType === "weekly") {
    weeklyInterval = normalizePositiveInteger(
      input.weeklyInterval ?? 1,
      "weeklyInterval",
    )

    if (weeklyInterval > 12 || !weekdays.length || input.dailyInterval) {
      invalid("weekly recurrence requires weekdays and an interval from 1-12")
    }
  } else {
    invalid("recurrenceType is unsupported")
  }

  const schedule: ResearchRoutineSchedule = {
    recurrence_type: input.recurrenceType,
    daily_interval: dailyInterval,
    weekly_interval: weeklyInterval,
    weekdays,
    local_time: localTime,
    start_date: startDate,
    end_date: endDate,
    effective_from_date: effectiveFromDate,
    timezone,
  }
  const fingerprintValues = [
    routineId,
    trackedMaterialId,
    label,
    String(plannedQuantityBaseUnits),
    input.baseUnit,
    schedule.recurrence_type,
    schedule.daily_interval === null ? null : String(schedule.daily_interval),
    schedule.weekly_interval === null ? null : String(schedule.weekly_interval),
    schedule.weekdays.join(","),
    schedule.local_time,
    schedule.start_date,
    schedule.end_date,
    schedule.effective_from_date,
    schedule.timezone,
  ]

  return {
    customerId,
    activeConsentVersion,
    routineId,
    trackedMaterialId,
    label,
    plannedQuantityBaseUnits,
    baseUnit: input.baseUnit,
    schedule,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      routineId ? "update-research-routine" : "create-research-routine",
      fingerprintValues,
    ),
  }
}

export function normalizeRoutineTransitionInput(
  input: TransitionResearchRoutineInput,
  operation: "archive" | "resume",
) {
  const customerId = requiredText(input.customerId, "customerId")
  const activeConsentVersion = requiredText(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const routineId = requiredText(input.routineId, "routineId")
  const effectiveFromDate = normalizeDate(
    input.effectiveFromDate,
    "effectiveFromDate",
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  return {
    customerId,
    activeConsentVersion,
    routineId,
    effectiveFromDate,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      `${operation}-research-routine`,
      [routineId, effectiveFromDate],
    ),
  }
}

export function normalizeResearchRoutineLogInput(
  input: PreviewResearchRoutineLogInput | ConfirmResearchRoutineLogInput,
): NormalizedResearchRoutineLogInput {
  const customerId = requiredText(input.customerId, "customerId")
  const activeConsentVersion = requiredText(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const routineId = requiredText(input.routineId, "routineId")
  const routineRevisionId = requiredText(
    input.routineRevisionId,
    "routineRevisionId",
  )
  const occurrenceId = requiredText(input.occurrenceId, "occurrenceId")
  const localDate = normalizeDate(input.localDate, "localDate")
  const supplyId = requiredText(input.supplyId, "supplyId")
  const confirmedQuantityBaseUnits = normalizePositiveInteger(
    input.confirmedQuantityBaseUnits,
    "confirmedQuantityBaseUnits",
  )
  const idempotencyKey =
    "idempotencyKey" in input
      ? normalizeResearchIdempotencyKey(input.idempotencyKey)
      : null

  return {
    customerId,
    activeConsentVersion,
    routineId,
    routineRevisionId,
    occurrenceId,
    localDate,
    supplyId,
    confirmedQuantityBaseUnits,
    baseUnit: input.baseUnit,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "confirm-research-routine-log",
      [
        routineId,
        routineRevisionId,
        occurrenceId,
        localDate,
        supplyId,
        String(confirmedQuantityBaseUnits),
        input.baseUnit,
      ],
    ),
  }
}

function dateString(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  return Math.floor(
    (Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) /
      86_400_000,
  )
}

export function validateOccurrenceRange(from: string, to: string) {
  const normalizedFrom = normalizeDate(from, "from")
  const normalizedTo = normalizeDate(to, "to")
  const span = daysBetween(normalizedFrom, normalizedTo)

  if (span < 0 || span >= RESEARCH_OCCURRENCE_MAX_DAYS) {
    invalid(
      `occurrence range must not exceed ${RESEARCH_OCCURRENCE_MAX_DAYS} days`,
    )
  }

  return { from: normalizedFrom, to: normalizedTo }
}

function occursOnDate(
  revision: RoutineRevisionForProjection,
  date: string,
): boolean {
  const startDate = dateString(revision.start_date)
  const endDate = revision.end_date ? dateString(revision.end_date) : null
  const effectiveFromDate = dateString(revision.effective_from_date)

  if (
    date < startDate ||
    date < effectiveFromDate ||
    (endDate && date > endDate)
  ) {
    return false
  }

  const elapsedDays = daysBetween(startDate, date)

  if (revision.recurrence_type === "once") {
    return elapsedDays === 0
  }

  if (revision.recurrence_type === "daily") {
    return elapsedDays % (revision.daily_interval ?? 1) === 0
  }

  const weekIndex = Math.floor(elapsedDays / 7)
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay()

  return (
    weekIndex % (revision.weekly_interval ?? 1) === 0 &&
    (revision.weekdays ?? []).includes(weekday)
  )
}

export function createOccurrenceId(
  routineRevisionId: string,
  localDate: string,
  localTime: string,
): string {
  const digest = createHash("sha256")
    .update([routineRevisionId, localDate, localTime].join("\u0000"))
    .digest("hex")

  return `occ_${digest}`
}

export function projectResearchOccurrences(input: {
  revision: RoutineRevisionForProjection
  from: string
  to: string
  loggedOccurrences?: Map<
    string,
    { logId: string; status: "confirmed" | "voided" }
  >
  archivedAtDate?: string | null
  inactiveDateRanges?: Array<{ from: string; to: string | null }>
}): ResearchOccurrence[] {
  const range = validateOccurrenceRange(input.from, input.to)
  const occurrences: ResearchOccurrence[] = []
  const cursor = new Date(`${range.from}T00:00:00.000Z`)
  const end = new Date(`${range.to}T00:00:00.000Z`)

  while (cursor <= end) {
    const localDate = cursor.toISOString().slice(0, 10)

    if (
      (!input.archivedAtDate || localDate < input.archivedAtDate) &&
      !input.inactiveDateRanges?.some(
        (range) =>
          localDate >= range.from && (!range.to || localDate < range.to),
      ) &&
      occursOnDate(input.revision, localDate)
    ) {
      const occurrenceId = createOccurrenceId(
        input.revision.id,
        localDate,
        input.revision.local_time,
      )
      const logged = input.loggedOccurrences?.get(occurrenceId) ?? null

      occurrences.push({
        occurrence_id: occurrenceId,
        routine_id: input.revision.routine_id,
        routine_revision_id: input.revision.id,
        label: input.revision.label,
        planned_quantity_base_units: input.revision.planned_quantity_base_units,
        base_unit: input.revision.base_unit,
        local_date: localDate,
        local_time: input.revision.local_time,
        timezone: input.revision.timezone,
        status: logged?.status ?? "scheduled",
        log_id: logged?.logId ?? null,
      })
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return occurrences
}
