import { MedusaError } from "@medusajs/framework/utils"

import {
  createResearchRequestFingerprint,
  normalizeResearchConsentVersion,
  normalizeResearchIdempotencyKey,
  normalizeResearchNoticeSha256,
} from "./ownership"

export const RESEARCH_JOURNAL_CONSENT_EVENT_TYPES = [
  "accepted",
  "withdrawn",
] as const

export type ResearchJournalConsentEventType =
  (typeof RESEARCH_JOURNAL_CONSENT_EVENT_TYPES)[number]

export type RecordResearchJournalConsentInput = {
  customerId: string
  activeGeneralConsentVersion: string
  requestedConsentVersion: string
  activeConsentVersion: string
  noticeSha256: string
  accepted: boolean
  idempotencyKey: string
}

export type NormalizedResearchJournalConsentInput = {
  customerId: string
  activeGeneralConsentVersion: string
  consentVersion: string
  noticeSha256: string
  eventType: ResearchJournalConsentEventType
  idempotencyKey: string
  requestFingerprintSha256: string
}

export type ResearchJournalConsentProjection = {
  event_type: ResearchJournalConsentEventType
  consent_version: string
  occurred_at: Date
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

export function normalizeResearchJournalConsentInput(
  input: RecordResearchJournalConsentInput,
): NormalizedResearchJournalConsentInput {
  const customerId = input.customerId.trim()

  if (!customerId) {
    invalid("customerId is required")
  }

  const requestedConsentVersion = normalizeResearchConsentVersion(
    input.requestedConsentVersion,
  )
  const activeConsentVersion = normalizeResearchConsentVersion(
    input.activeConsentVersion,
  )
  const activeGeneralConsentVersion = normalizeResearchConsentVersion(
    input.activeGeneralConsentVersion,
  )
  const noticeSha256 = normalizeResearchNoticeSha256(input.noticeSha256)
  const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)

  if (requestedConsentVersion !== activeConsentVersion) {
    conflict("Journal consent version is no longer current")
  }

  const eventType = input.accepted ? "accepted" : "withdrawn"

  return {
    customerId,
    activeGeneralConsentVersion,
    consentVersion: activeConsentVersion,
    noticeSha256,
    eventType,
    idempotencyKey,
    requestFingerprintSha256: createResearchRequestFingerprint(
      "record-research-journal-consent",
      [activeConsentVersion, noticeSha256, eventType],
    ),
  }
}

export function projectResearchJournalConsentEvent(input: {
  event_type: ResearchJournalConsentEventType
  consent_version: string
  occurred_at: Date
}): ResearchJournalConsentProjection {
  return {
    event_type: input.event_type,
    consent_version: input.consent_version,
    occurred_at: input.occurred_at,
  }
}
