import { createHash } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"

import type {
  ResearchPrivacyPriorProfileStatus,
  ResearchPrivacyRequestStatus,
  ResearchProfileStatus,
} from "./tracking"

export const RESEARCH_SUPPORTED_LOCALES = ["en-PH"] as const
export const RESEARCH_DEFAULT_TIMEZONE = "Asia/Manila"
export const RESEARCH_IDEMPOTENCY_KEY_MIN_LENGTH = 8
export const RESEARCH_IDEMPOTENCY_KEY_MAX_LENGTH = 128

const consentVersionPattern = /^\d{4}-\d{2}-\d{2}\.v[1-9]\d*$/
const sha256Pattern = /^[a-f0-9]{64}$/
const idempotencyKeyPattern = /^[A-Za-z0-9._:-]+$/

export type ResearchProfileProjection = {
  timezone: string
  locale: string
  consent_version: string
  consented_at: Date
  status: ResearchProfileStatus
  created_at: Date
  updated_at: Date
}

export type ResearchPrivacyRequestProjection = {
  request_type: "deletion"
  status: ResearchPrivacyRequestStatus
  requested_at: Date
  cancelled_at: Date | null
  started_at: Date | null
  completed_at: Date | null
}

export type ResearchConsentEventProjection = {
  event_type: "accepted" | "withdrawn"
  consent_version: string
  occurred_at: Date
}

export type CreateResearchProfileInput = {
  customerId: string
  timezone: string
  locale: string
  requestedConsentVersion: string
  activeConsentVersion: string
  noticeSha256: string
  accepted: boolean
  idempotencyKey: string
}

export type UpdateResearchProfilePreferencesInput = {
  customerId: string
  timezone?: string
  locale?: string
  idempotencyKey: string
}

export type RecordResearchConsentInput = {
  customerId: string
  requestedConsentVersion: string
  activeConsentVersion: string
  noticeSha256: string
  accepted: boolean
  idempotencyKey: string
}

export type CloseResearchProfileInput = {
  customerId: string
  acknowledgeClosure: boolean
  idempotencyKey: string
}

export type RequestResearchProfileDeletionInput = {
  customerId: string
  acknowledgeDeletionRequest: boolean
  idempotencyKey: string
}

export type CancelResearchProfileDeletionInput = {
  customerId: string
  acknowledgeCancellation: boolean
  idempotencyKey: string
}

export type NormalizedCreateResearchProfileInput = CreateResearchProfileInput & {
  requestFingerprintSha256: string
}

export type NormalizedResearchConsentInput = RecordResearchConsentInput & {
  requestFingerprintSha256: string
}

export type NormalizedResearchAcknowledgement = {
  customerId: string
  idempotencyKey: string
  requestFingerprintSha256: string
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function normalizeRequiredText(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  return normalized
}

export function createResearchRequestFingerprint(
  operation: string,
  values: Array<string | boolean | null>,
): string {
  return createHash("sha256")
    .update(JSON.stringify([operation, ...values]))
    .digest("hex")
}

export function normalizeResearchIdempotencyKey(value: string): string {
  const normalized = value.trim()

  if (
    normalized.length < RESEARCH_IDEMPOTENCY_KEY_MIN_LENGTH ||
    normalized.length > RESEARCH_IDEMPOTENCY_KEY_MAX_LENGTH ||
    !idempotencyKeyPattern.test(normalized)
  ) {
    invalid(
      `idempotencyKey must be ${RESEARCH_IDEMPOTENCY_KEY_MIN_LENGTH}-${RESEARCH_IDEMPOTENCY_KEY_MAX_LENGTH} characters using letters, digits, period, underscore, colon, or hyphen`,
    )
  }

  return normalized
}

export function normalizeResearchConsentVersion(value: string): string {
  const normalized = value.trim()

  if (!consentVersionPattern.test(normalized)) {
    invalid("consent version must use YYYY-MM-DD.vN")
  }

  return normalized
}

export function normalizeResearchNoticeSha256(value: string): string {
  const normalized = value.trim().toLowerCase()

  if (!sha256Pattern.test(normalized)) {
    invalid("noticeSha256 must be a lowercase SHA-256 digest")
  }

  return normalized
}

export function normalizeResearchTimezone(value: string): string {
  const normalized = value.trim()

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: normalized }).format()
  } catch {
    invalid("timezone must be a valid IANA timezone")
  }

  return normalized
}

export function normalizeResearchLocale(value: string): string {
  const normalized = value.trim()

  if (!RESEARCH_SUPPORTED_LOCALES.includes(normalized as "en-PH")) {
    invalid("locale must be en-PH")
  }

  return normalized
}

export function normalizeCreateResearchProfileInput(
  input: CreateResearchProfileInput,
): NormalizedCreateResearchProfileInput {
  const customerId = normalizeRequiredText(input.customerId, "customerId")
  const timezone = normalizeResearchTimezone(input.timezone)
  const locale = normalizeResearchLocale(input.locale)
  const requestedConsentVersion = normalizeResearchConsentVersion(
    input.requestedConsentVersion,
  )
  const activeConsentVersion = normalizeResearchConsentVersion(
    input.activeConsentVersion,
  )
  const noticeSha256 = normalizeResearchNoticeSha256(input.noticeSha256)
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  if (input.accepted !== true) {
    invalid("accepted must be true")
  }

  if (requestedConsentVersion !== activeConsentVersion) {
    conflict("consent version is no longer current")
  }

  return {
    customerId,
    timezone,
    locale,
    requestedConsentVersion,
    activeConsentVersion,
    noticeSha256,
    accepted: true,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "create-research-profile",
      [timezone, locale, requestedConsentVersion, noticeSha256, true],
    ),
  }
}

export function normalizeUpdateResearchProfilePreferencesInput(
  input: UpdateResearchProfilePreferencesInput,
): UpdateResearchProfilePreferencesInput & {
  requestFingerprintSha256: string
} {
  const customerId = normalizeRequiredText(input.customerId, "customerId")
  const timezone = input.timezone
    ? normalizeResearchTimezone(input.timezone)
    : undefined
  const locale = input.locale ? normalizeResearchLocale(input.locale) : undefined
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  if (!timezone && !locale) {
    invalid("timezone or locale is required")
  }

  return {
    customerId,
    timezone,
    locale,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "update-research-profile-preferences",
      [timezone ?? null, locale ?? null],
    ),
  }
}

export function normalizeRecordResearchConsentInput(
  input: RecordResearchConsentInput,
): NormalizedResearchConsentInput {
  const normalized = normalizeCreateResearchProfileInput({
    ...input,
    timezone: RESEARCH_DEFAULT_TIMEZONE,
    locale: "en-PH",
  })

  return {
    customerId: normalized.customerId,
    requestedConsentVersion: normalized.requestedConsentVersion,
    activeConsentVersion: normalized.activeConsentVersion,
    noticeSha256: normalized.noticeSha256,
    accepted: true,
    idempotencyKey: normalized.idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "record-research-consent",
      [
        normalized.requestedConsentVersion,
        normalized.noticeSha256,
        true,
      ],
    ),
  }
}

function normalizeAcknowledgement(
  operation: string,
  customerId: string,
  acknowledged: boolean,
  idempotencyKey: string,
): NormalizedResearchAcknowledgement {
  const normalizedCustomerId = normalizeRequiredText(customerId, "customerId")
  const normalizedIdempotencyKey =
    normalizeResearchIdempotencyKey(idempotencyKey)

  if (acknowledged !== true) {
    invalid("acknowledgement must be true")
  }

  return {
    customerId: normalizedCustomerId,
    idempotencyKey: normalizedIdempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(operation, [
      true,
    ]),
  }
}

export function normalizeCloseResearchProfileInput(
  input: CloseResearchProfileInput,
): NormalizedResearchAcknowledgement {
  return normalizeAcknowledgement(
    "close-research-profile",
    input.customerId,
    input.acknowledgeClosure,
    input.idempotencyKey,
  )
}

export function normalizeRequestResearchProfileDeletionInput(
  input: RequestResearchProfileDeletionInput,
): NormalizedResearchAcknowledgement {
  return normalizeAcknowledgement(
    "request-research-profile-deletion",
    input.customerId,
    input.acknowledgeDeletionRequest,
    input.idempotencyKey,
  )
}

export function normalizeCancelResearchProfileDeletionInput(
  input: CancelResearchProfileDeletionInput,
): NormalizedResearchAcknowledgement {
  return normalizeAcknowledgement(
    "cancel-research-profile-deletion",
    input.customerId,
    input.acknowledgeCancellation,
    input.idempotencyKey,
  )
}

export function assertMatchingResearchFingerprint(
  stored: string,
  requested: string,
): void {
  if (stored !== requested) {
    conflict("idempotency key was already used with different input")
  }
}

export function isResearchPrivacyRequestOpen(
  status: ResearchPrivacyRequestStatus,
): boolean {
  return status === "requested" || status === "processing"
}

export function assertPrivacyPriorProfileStatus(
  status: ResearchProfileStatus,
): ResearchPrivacyPriorProfileStatus {
  if (status !== "active" && status !== "closed") {
    conflict("profile cannot enter deletion_requested from its current state")
  }

  return status
}

export function projectResearchProfile(profile: {
  timezone: string
  locale: string
  consent_version: string
  consented_at: Date
  status: ResearchProfileStatus
  created_at: Date
  updated_at: Date
}): ResearchProfileProjection {
  return {
    timezone: profile.timezone,
    locale: profile.locale,
    consent_version: profile.consent_version,
    consented_at: profile.consented_at,
    status: profile.status,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

export function projectResearchConsentEvent(event: {
  event_type: "accepted" | "withdrawn"
  consent_version: string
  occurred_at: Date
}): ResearchConsentEventProjection {
  return {
    event_type: event.event_type,
    consent_version: event.consent_version,
    occurred_at: event.occurred_at,
  }
}

export function projectResearchPrivacyRequest(request: {
  request_type: "deletion"
  status: ResearchPrivacyRequestStatus
  requested_at: Date
  cancelled_at: Date | null
  started_at: Date | null
  completed_at: Date | null
}): ResearchPrivacyRequestProjection {
  return {
    request_type: request.request_type,
    status: request.status,
    requested_at: request.requested_at,
    cancelled_at: request.cancelled_at,
    started_at: request.started_at,
    completed_at: request.completed_at,
  }
}
