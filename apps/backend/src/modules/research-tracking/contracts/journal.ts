import { MedusaError } from "@medusajs/framework/utils"

import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
  normalizeResearchTimezone,
} from "./ownership"

export const RESEARCH_JOURNAL_STATUSES = ["active", "voided"] as const
export const RESEARCH_JOURNAL_OPERATIONS = [
  "create",
  "revise",
  "void",
  "restore",
] as const
export const RESEARCH_JOURNAL_MUTATION_STATUSES = [
  "processing",
  "completed",
  "failed",
] as const
export const RESEARCH_JOURNAL_TITLE_MAX_LENGTH = 120
export const RESEARCH_JOURNAL_NOTE_MAX_LENGTH = 4000
export const RESEARCH_JOURNAL_DEFAULT_LIMIT = 20
export const RESEARCH_JOURNAL_MAX_LIMIT = 50

export type ResearchJournalStatus =
  (typeof RESEARCH_JOURNAL_STATUSES)[number]
export type ResearchJournalOperation =
  (typeof RESEARCH_JOURNAL_OPERATIONS)[number]

export type ResearchJournalRelations = {
  trackedMaterialId: string | null
  supplyId: string | null
  routineId: string | null
  confirmedLogId: string | null
}

export type ResearchJournalContentInput = {
  title?: string | null
  note: string
  localDate: string
  localTime: string
  timezone: string
  trackedMaterialId?: string | null
  supplyId?: string | null
  routineId?: string | null
  confirmedLogId?: string | null
}

export type CreateResearchJournalInput = ResearchJournalContentInput & {
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
  confirmed: boolean
  idempotencyKey: string
}

export type ReviseResearchJournalInput = ResearchJournalContentInput & {
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
  journalEntryId: string
  expectedRevisionId: string
  confirmed: boolean
  idempotencyKey: string
}

export type TransitionResearchJournalInput = {
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
  journalEntryId: string
  expectedRevisionId: string
  operation: "void" | "restore"
  confirmed: boolean
  idempotencyKey: string
}

export type NormalizedResearchJournalContent = {
  title: string | null
  note: string
  localDate: string
  localTime: string
  timezone: string
  relations: ResearchJournalRelations
}

export type NormalizedCreateResearchJournalInput = {
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
  content: NormalizedResearchJournalContent
  idempotencyKey: string
  requestFingerprintSha256: string
}

export type NormalizedReviseResearchJournalInput =
  NormalizedCreateResearchJournalInput & {
    journalEntryId: string
    expectedRevisionId: string
  }

export type NormalizedTransitionResearchJournalInput = {
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
  journalEntryId: string
  expectedRevisionId: string
  operation: "void" | "restore"
  idempotencyKey: string
  requestFingerprintSha256: string
}

export type ResearchJournalProjection = {
  journal_entry_id: string
  status: ResearchJournalStatus
  current_revision: {
    revision_id: string
    revision_number: number
    local_date: string
    local_time: string
    timezone: string
    title: string | null
    note: string
    tracked_material_id: string | null
    supply_id: string | null
    routine_id: string | null
    confirmed_log_id: string | null
    created_at: Date
  }
  created_at: Date
  updated_at: Date
  voided_at: Date | null
  restored_at: Date | null
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function requiredId(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  return normalized
}

function optionalId(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? ""

  return normalized || null
}

function unicodeLength(value: string): number {
  return Array.from(value).length
}

function normalizeLocalDate(value: string): string {
  const normalized = value.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    invalid("localDate must use YYYY-MM-DD")
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`)

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== normalized
  ) {
    invalid("localDate must be a valid calendar date")
  }

  return normalized
}

function normalizeLocalTime(value: string): string {
  const normalized = value.trim()

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    invalid("localTime must use HH:mm")
  }

  return normalized
}

export function normalizeResearchJournalContent(
  input: ResearchJournalContentInput,
): NormalizedResearchJournalContent {
  const title = input.title?.trim() || null
  const note = input.note.trim()

  if (title && unicodeLength(title) > RESEARCH_JOURNAL_TITLE_MAX_LENGTH) {
    invalid(
      `title must contain at most ${RESEARCH_JOURNAL_TITLE_MAX_LENGTH} characters`,
    )
  }

  if (!note || unicodeLength(note) > RESEARCH_JOURNAL_NOTE_MAX_LENGTH) {
    invalid(
      `note must contain 1-${RESEARCH_JOURNAL_NOTE_MAX_LENGTH} characters`,
    )
  }

  return {
    title,
    note,
    localDate: normalizeLocalDate(input.localDate),
    localTime: normalizeLocalTime(input.localTime),
    timezone: normalizeResearchTimezone(input.timezone),
    relations: {
      trackedMaterialId: optionalId(input.trackedMaterialId),
      supplyId: optionalId(input.supplyId),
      routineId: optionalId(input.routineId),
      confirmedLogId: optionalId(input.confirmedLogId),
    },
  }
}

function assertConfirmed(confirmed: boolean): void {
  if (confirmed !== true) {
    invalid("confirmed must be true")
  }
}

function fingerprintContent(
  operation: string,
  content: NormalizedResearchJournalContent,
  additional: Array<string | boolean | null> = [],
): string {
  return createResearchRequestFingerprint(operation, [
    ...additional,
    content.title,
    content.note,
    content.localDate,
    content.localTime,
    content.timezone,
    content.relations.trackedMaterialId,
    content.relations.supplyId,
    content.relations.routineId,
    content.relations.confirmedLogId,
  ])
}

export function normalizeCreateResearchJournalInput(
  input: CreateResearchJournalInput,
): NormalizedCreateResearchJournalInput {
  assertConfirmed(input.confirmed)
  const customerId = requiredId(input.customerId, "customerId")
  const activeConsentVersion = requiredId(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const activeJournalConsentVersion = requiredId(
    input.activeJournalConsentVersion,
    "activeJournalConsentVersion",
  )
  const activeJournalNoticeSha256 = requiredId(
    input.activeJournalNoticeSha256,
    "activeJournalNoticeSha256",
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)
  const content = normalizeResearchJournalContent(input)

  return {
    customerId,
    activeConsentVersion,
    activeJournalConsentVersion,
    activeJournalNoticeSha256,
    content,
    idempotencyKey,
    requestFingerprintSha256: fingerprintContent("create-journal", content),
  }
}

export function normalizeReviseResearchJournalInput(
  input: ReviseResearchJournalInput,
): NormalizedReviseResearchJournalInput {
  assertConfirmed(input.confirmed)
  const customerId = requiredId(input.customerId, "customerId")
  const activeConsentVersion = requiredId(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const activeJournalConsentVersion = requiredId(
    input.activeJournalConsentVersion,
    "activeJournalConsentVersion",
  )
  const activeJournalNoticeSha256 = requiredId(
    input.activeJournalNoticeSha256,
    "activeJournalNoticeSha256",
  )
  const journalEntryId = requiredId(input.journalEntryId, "journalEntryId")
  const expectedRevisionId = requiredId(
    input.expectedRevisionId,
    "expectedRevisionId",
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)
  const content = normalizeResearchJournalContent(input)

  return {
    customerId,
    activeConsentVersion,
    activeJournalConsentVersion,
    activeJournalNoticeSha256,
    journalEntryId,
    expectedRevisionId,
    content,
    idempotencyKey,
    requestFingerprintSha256: fingerprintContent("revise-journal", content, [
      journalEntryId,
      expectedRevisionId,
    ]),
  }
}

export function normalizeTransitionResearchJournalInput(
  input: TransitionResearchJournalInput,
): NormalizedTransitionResearchJournalInput {
  assertConfirmed(input.confirmed)
  const customerId = requiredId(input.customerId, "customerId")
  const activeConsentVersion = requiredId(
    input.activeConsentVersion,
    "activeConsentVersion",
  )
  const activeJournalConsentVersion = requiredId(
    input.activeJournalConsentVersion,
    "activeJournalConsentVersion",
  )
  const activeJournalNoticeSha256 = requiredId(
    input.activeJournalNoticeSha256,
    "activeJournalNoticeSha256",
  )
  const journalEntryId = requiredId(input.journalEntryId, "journalEntryId")
  const expectedRevisionId = requiredId(
    input.expectedRevisionId,
    "expectedRevisionId",
  )
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  return {
    customerId,
    activeConsentVersion,
    activeJournalConsentVersion,
    activeJournalNoticeSha256,
    journalEntryId,
    expectedRevisionId,
    operation: input.operation,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      `${input.operation}-journal`,
      [journalEntryId, expectedRevisionId],
    ),
  }
}
