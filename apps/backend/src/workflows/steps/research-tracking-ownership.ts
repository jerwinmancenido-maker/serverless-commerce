import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  assertMatchingResearchFingerprint,
  assertPrivacyPriorProfileStatus,
  normalizeCancelResearchProfileDeletionInput,
  normalizeCloseResearchProfileInput,
  normalizeCreateResearchProfileInput,
  normalizeRecordResearchConsentInput,
  normalizeRequestResearchProfileDeletionInput,
  normalizeUpdateResearchProfilePreferencesInput,
  projectResearchConsentEvent,
  projectResearchPrivacyRequest,
  projectResearchProfile,
  type CancelResearchProfileDeletionInput,
  type CloseResearchProfileInput,
  type CreateResearchProfileInput,
  type RecordResearchConsentInput,
  type ResearchConsentEventProjection,
  type ResearchPrivacyRequestProjection,
  type ResearchProfileProjection,
  type RequestResearchProfileDeletionInput,
  type UpdateResearchProfilePreferencesInput,
} from "../../modules/research-tracking/contracts/ownership"
import type {
  ResearchConsentEventType,
  ResearchPrivacyPriorProfileStatus,
  ResearchPrivacyRequestStatus,
  ResearchProfileStatus,
} from "../../modules/research-tracking/contracts/tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type ResearchProfileRecord = {
  id: string
  customer_id: string
  timezone: string
  locale: string
  consent_version: string
  consented_at: Date
  status: ResearchProfileStatus
  created_at: Date
  updated_at: Date
}

type ResearchConsentEventRecord = {
  id: string
  profile_id: string
  event_type: ResearchConsentEventType
  consent_version: string
  notice_sha256: string
  occurred_at: Date
  idempotency_key: string
  request_fingerprint_sha256: string
}

type ResearchPrivacyRequestRecord = {
  id: string
  profile_id: string
  request_type: "deletion"
  status: ResearchPrivacyRequestStatus
  prior_profile_status: ResearchPrivacyPriorProfileStatus
  open_request_key: string | null
  requested_at: Date
  cancelled_at: Date | null
  started_at: Date | null
  completed_at: Date | null
  idempotency_key: string
  request_fingerprint_sha256: string
  cancellation_idempotency_key: string | null
  cancellation_fingerprint_sha256: string | null
}

type ProfileSnapshot = Pick<
  ResearchProfileRecord,
  "id" | "timezone" | "locale" | "consent_version" | "consented_at" | "status"
>

type PrivacyRequestSnapshot = Omit<
  ResearchPrivacyRequestRecord,
  "profile_id"
>

type CreateConsentEventStepInput = {
  profileId: string
  eventType: ResearchConsentEventType
  consentVersion: string
  noticeSha256: string
  occurredAt: Date
  idempotencyKey: string
  requestFingerprintSha256: string
}

type CreatePrivacyRequestStepInput = {
  profileId: string
  priorProfileStatus: ResearchPrivacyPriorProfileStatus
  requestedAt: Date
  idempotencyKey: string
  requestFingerprintSha256: string
}

type RestoreProfileAfterCancellationInput = {
  customerId: string
  profileId: string
  status: ResearchPrivacyPriorProfileStatus
}

function notFound(message: string): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, message)
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function getResearchTrackingService(
  container: MedusaContainer,
): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

async function retrieveOwnedProfile(
  service: ResearchTrackingModuleService,
  customerId: string,
): Promise<ResearchProfileRecord> {
  const [profile] = await service.listResearchProfiles(
    { customer_id: customerId },
    { take: 1 },
  )

  if (!profile) {
    notFound("research profile was not found")
  }

  return profile
}

async function findConsentEventByIdempotencyKey(
  service: ResearchTrackingModuleService,
  profileId: string,
  idempotencyKey: string,
): Promise<ResearchConsentEventRecord | undefined> {
  const [event] = await service.listResearchConsentEvents(
    { profile_id: profileId, idempotency_key: idempotencyKey },
    { take: 1 },
  )

  return event
}

async function retrieveLatestAcceptedConsentEvent(
  service: ResearchTrackingModuleService,
  profileId: string,
): Promise<ResearchConsentEventRecord> {
  const [event] = await service.listResearchConsentEvents(
    { profile_id: profileId, event_type: "accepted" },
    { order: { occurred_at: "DESC" }, take: 1 },
  )

  if (!event) {
    conflict("profile has no accepted consent event to withdraw")
  }

  return event
}

async function findPrivacyRequestByIdempotencyKey(
  service: ResearchTrackingModuleService,
  profileId: string,
  idempotencyKey: string,
): Promise<ResearchPrivacyRequestRecord | undefined> {
  const [request] = await service.listResearchPrivacyRequests(
    { profile_id: profileId, idempotency_key: idempotencyKey },
    { take: 1 },
  )

  return request
}

async function findPrivacyRequestByCancellationKey(
  service: ResearchTrackingModuleService,
  profileId: string,
  idempotencyKey: string,
): Promise<ResearchPrivacyRequestRecord | undefined> {
  const [request] = await service.listResearchPrivacyRequests(
    {
      profile_id: profileId,
      cancellation_idempotency_key: idempotencyKey,
    },
    { take: 1 },
  )

  return request
}

async function findOpenPrivacyRequest(
  service: ResearchTrackingModuleService,
  profileId: string,
): Promise<ResearchPrivacyRequestRecord | undefined> {
  const [request] = await service.listResearchPrivacyRequests(
    {
      profile_id: profileId,
      status: ["requested", "processing"],
    },
    { order: { requested_at: "DESC" }, take: 1 },
  )

  return request
}

function snapshotProfile(profile: ResearchProfileRecord): ProfileSnapshot {
  return {
    id: profile.id,
    timezone: profile.timezone,
    locale: profile.locale,
    consent_version: profile.consent_version,
    consented_at: profile.consented_at,
    status: profile.status,
  }
}

function snapshotPrivacyRequest(
  request: ResearchPrivacyRequestRecord,
): PrivacyRequestSnapshot {
  return {
    id: request.id,
    request_type: request.request_type,
    status: request.status,
    prior_profile_status: request.prior_profile_status,
    open_request_key: request.open_request_key,
    requested_at: request.requested_at,
    cancelled_at: request.cancelled_at,
    started_at: request.started_at,
    completed_at: request.completed_at,
    idempotency_key: request.idempotency_key,
    request_fingerprint_sha256: request.request_fingerprint_sha256,
    cancellation_idempotency_key: request.cancellation_idempotency_key,
    cancellation_fingerprint_sha256:
      request.cancellation_fingerprint_sha256,
  }
}

export type PrepareCreateResearchProfileResult = {
  profileId: string
  profile: ResearchProfileProjection
  consentEvent: ResearchConsentEventProjection | null
  shouldCreateConsentEvent: boolean
  consentEventInput: CreateConsentEventStepInput
}

export const createResearchProfileStep = createStep(
  "create-research-profile",
  async (input: CreateResearchProfileInput, { container }) => {
    const normalized = normalizeCreateResearchProfileInput(input)
    const service = getResearchTrackingService(container)
    const [existingProfile] = await service.listResearchProfiles(
      { customer_id: normalized.customerId },
      { take: 1 },
    )

    if (existingProfile) {
      const existingEvent = await findConsentEventByIdempotencyKey(
        service,
        existingProfile.id,
        normalized.idempotencyKey,
      )

      if (!existingEvent) {
        conflict("research profile already exists")
      }

      assertMatchingResearchFingerprint(
        existingEvent.request_fingerprint_sha256,
        normalized.requestFingerprintSha256,
      )

      return new StepResponse<PrepareCreateResearchProfileResult, string>(
        {
          profileId: existingProfile.id,
          profile: projectResearchProfile(existingProfile),
          consentEvent: projectResearchConsentEvent(existingEvent),
          shouldCreateConsentEvent: false,
          consentEventInput: {
            profileId: existingProfile.id,
            eventType: "accepted",
            consentVersion: normalized.requestedConsentVersion,
            noticeSha256: normalized.noticeSha256,
            occurredAt: existingEvent.occurred_at,
            idempotencyKey: normalized.idempotencyKey,
            requestFingerprintSha256: normalized.requestFingerprintSha256,
          },
        },
        undefined,
      )
    }

    const occurredAt = new Date()
    const created = await service.createResearchProfiles({
      customer_id: normalized.customerId,
      timezone: normalized.timezone,
      locale: normalized.locale,
      consent_version: normalized.requestedConsentVersion,
      consented_at: occurredAt,
      status: "active",
    })

    return new StepResponse<PrepareCreateResearchProfileResult, string>(
      {
        profileId: created.id,
        profile: projectResearchProfile(created),
        consentEvent: null,
        shouldCreateConsentEvent: true,
        consentEventInput: {
          profileId: created.id,
          eventType: "accepted",
          consentVersion: normalized.requestedConsentVersion,
          noticeSha256: normalized.noticeSha256,
          occurredAt,
          idempotencyKey: normalized.idempotencyKey,
          requestFingerprintSha256: normalized.requestFingerprintSha256,
        },
      },
      created.id,
    )
  },
  async (createdId: string | undefined, { container }) => {
    if (!createdId) {
      return
    }

    await getResearchTrackingService(container).deleteResearchProfiles(
      createdId,
    )
  },
)

export const createResearchConsentEventStep = createStep(
  "create-research-consent-event",
  async (input: CreateConsentEventStepInput, { container }) => {
    const service = getResearchTrackingService(container)
    const created = await service.createResearchConsentEvents({
      profile_id: input.profileId,
      event_type: input.eventType,
      consent_version: input.consentVersion,
      notice_sha256: input.noticeSha256,
      occurred_at: input.occurredAt,
      idempotency_key: input.idempotencyKey,
      request_fingerprint_sha256: input.requestFingerprintSha256,
    })

    return new StepResponse(projectResearchConsentEvent(created), created.id)
  },
  async (createdId: string | undefined, { container }) => {
    if (!createdId) {
      return
    }

    await getResearchTrackingService(container).deleteResearchConsentEvents(
      createdId,
    )
  },
)

export const updateResearchProfilePreferencesStep = createStep(
  "update-research-profile-preferences",
  async (input: UpdateResearchProfilePreferencesInput, { container }) => {
    const normalized = normalizeUpdateResearchProfilePreferencesInput(input)
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, normalized.customerId)

    if (profile.status !== "active") {
      conflict("only an active research profile can update preferences")
    }

    if (
      (normalized.timezone === undefined ||
        normalized.timezone === profile.timezone) &&
      (normalized.locale === undefined || normalized.locale === profile.locale)
    ) {
      return new StepResponse<ResearchProfileProjection, ProfileSnapshot>(
        projectResearchProfile(profile),
        undefined,
      )
    }

    const previous = snapshotProfile(profile)
    const updated = await service.updateResearchProfiles({
      id: profile.id,
      timezone: normalized.timezone ?? profile.timezone,
      locale: normalized.locale ?? profile.locale,
    })

    return new StepResponse(projectResearchProfile(updated), previous)
  },
  async (previous: ProfileSnapshot | undefined, { container }) => {
    if (!previous) {
      return
    }

    await getResearchTrackingService(container).updateResearchProfiles(previous)
  },
)

export type PrepareRecordResearchConsentResult = {
  profile: ResearchProfileProjection
  consentEvent: ResearchConsentEventProjection | null
  shouldCreateConsentEvent: boolean
  consentEventInput: CreateConsentEventStepInput
}

export const updateResearchProfileConsentStep = createStep(
  "update-research-profile-consent",
  async (input: RecordResearchConsentInput, { container }) => {
    const normalized = normalizeRecordResearchConsentInput(input)
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, normalized.customerId)
    const existingEvent = await findConsentEventByIdempotencyKey(
      service,
      profile.id,
      normalized.idempotencyKey,
    )

    if (existingEvent) {
      assertMatchingResearchFingerprint(
        existingEvent.request_fingerprint_sha256,
        normalized.requestFingerprintSha256,
      )

      return new StepResponse<
        PrepareRecordResearchConsentResult,
        ProfileSnapshot
      >(
        {
          profile: projectResearchProfile(profile),
          consentEvent: projectResearchConsentEvent(existingEvent),
          shouldCreateConsentEvent: false,
          consentEventInput: {
            profileId: profile.id,
            eventType: "accepted",
            consentVersion: existingEvent.consent_version,
            noticeSha256: existingEvent.notice_sha256,
            occurredAt: existingEvent.occurred_at,
            idempotencyKey: existingEvent.idempotency_key,
            requestFingerprintSha256:
              existingEvent.request_fingerprint_sha256,
          },
        },
        undefined,
      )
    }

    if (profile.status !== "active") {
      conflict("only an active research profile can renew consent")
    }

    const occurredAt = new Date()
    const previous = snapshotProfile(profile)
    const updated = await service.updateResearchProfiles({
      id: profile.id,
      consent_version: normalized.requestedConsentVersion,
      consented_at: occurredAt,
    })

    return new StepResponse<PrepareRecordResearchConsentResult, ProfileSnapshot>(
      {
        profile: projectResearchProfile(updated),
        consentEvent: null,
        shouldCreateConsentEvent: true,
        consentEventInput: {
          profileId: profile.id,
          eventType: "accepted",
          consentVersion: normalized.requestedConsentVersion,
          noticeSha256: normalized.noticeSha256,
          occurredAt,
          idempotencyKey: normalized.idempotencyKey,
          requestFingerprintSha256: normalized.requestFingerprintSha256,
        },
      },
      previous,
    )
  },
  async (previous: ProfileSnapshot | undefined, { container }) => {
    if (!previous) {
      return
    }

    await getResearchTrackingService(container).updateResearchProfiles(previous)
  },
)

export type PrepareCloseResearchProfileResult = {
  profile: ResearchProfileProjection
  consentEvent: ResearchConsentEventProjection | null
  shouldCreateConsentEvent: boolean
  consentEventInput: CreateConsentEventStepInput
}

export const closeResearchProfileStep = createStep(
  "close-research-profile",
  async (input: CloseResearchProfileInput, { container }) => {
    const normalized = normalizeCloseResearchProfileInput(input)
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, normalized.customerId)
    const existingEvent = await findConsentEventByIdempotencyKey(
      service,
      profile.id,
      normalized.idempotencyKey,
    )

    if (existingEvent) {
      assertMatchingResearchFingerprint(
        existingEvent.request_fingerprint_sha256,
        normalized.requestFingerprintSha256,
      )

      return new StepResponse<
        PrepareCloseResearchProfileResult,
        ProfileSnapshot
      >(
        {
          profile: projectResearchProfile(profile),
          consentEvent: projectResearchConsentEvent(existingEvent),
          shouldCreateConsentEvent: false,
          consentEventInput: {
            profileId: profile.id,
            eventType: "withdrawn",
            consentVersion: existingEvent.consent_version,
            noticeSha256: existingEvent.notice_sha256,
            occurredAt: existingEvent.occurred_at,
            idempotencyKey: existingEvent.idempotency_key,
            requestFingerprintSha256:
              existingEvent.request_fingerprint_sha256,
          },
        },
        undefined,
      )
    }

    if (profile.status !== "active") {
      conflict("only an active research profile can be closed")
    }

    const acceptedEvent = await retrieveLatestAcceptedConsentEvent(
      service,
      profile.id,
    )
    const occurredAt = new Date()
    const previous = snapshotProfile(profile)
    const updated = await service.updateResearchProfiles({
      id: profile.id,
      status: "closed",
    })

    return new StepResponse<PrepareCloseResearchProfileResult, ProfileSnapshot>(
      {
        profile: projectResearchProfile(updated),
        consentEvent: null,
        shouldCreateConsentEvent: true,
        consentEventInput: {
          profileId: profile.id,
          eventType: "withdrawn",
          consentVersion: acceptedEvent.consent_version,
          noticeSha256: acceptedEvent.notice_sha256,
          occurredAt,
          idempotencyKey: normalized.idempotencyKey,
          requestFingerprintSha256: normalized.requestFingerprintSha256,
        },
      },
      previous,
    )
  },
  async (previous: ProfileSnapshot | undefined, { container }) => {
    if (!previous) {
      return
    }

    await getResearchTrackingService(container).updateResearchProfiles(previous)
  },
)

export type PrepareDeletionRequestResult = {
  profile: ResearchProfileProjection
  privacyRequest: ResearchPrivacyRequestProjection | null
  shouldCreatePrivacyRequest: boolean
  privacyRequestInput: CreatePrivacyRequestStepInput
}

export const requestResearchProfileDeletionStep = createStep(
  "request-research-profile-deletion",
  async (input: RequestResearchProfileDeletionInput, { container }) => {
    const normalized = normalizeRequestResearchProfileDeletionInput(input)
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, normalized.customerId)
    const replay = await findPrivacyRequestByIdempotencyKey(
      service,
      profile.id,
      normalized.idempotencyKey,
    )

    if (replay) {
      assertMatchingResearchFingerprint(
        replay.request_fingerprint_sha256,
        normalized.requestFingerprintSha256,
      )

      return new StepResponse<PrepareDeletionRequestResult, ProfileSnapshot>(
        {
          profile: projectResearchProfile(profile),
          privacyRequest: projectResearchPrivacyRequest(replay),
          shouldCreatePrivacyRequest: false,
          privacyRequestInput: {
            profileId: profile.id,
            priorProfileStatus: replay.prior_profile_status,
            requestedAt: replay.requested_at,
            idempotencyKey: replay.idempotency_key,
            requestFingerprintSha256: replay.request_fingerprint_sha256,
          },
        },
        undefined,
      )
    }

    const openRequest = await findOpenPrivacyRequest(service, profile.id)

    if (openRequest) {
      return new StepResponse<PrepareDeletionRequestResult, ProfileSnapshot>(
        {
          profile: projectResearchProfile(profile),
          privacyRequest: projectResearchPrivacyRequest(openRequest),
          shouldCreatePrivacyRequest: false,
          privacyRequestInput: {
            profileId: profile.id,
            priorProfileStatus: openRequest.prior_profile_status,
            requestedAt: openRequest.requested_at,
            idempotencyKey: openRequest.idempotency_key,
            requestFingerprintSha256: openRequest.request_fingerprint_sha256,
          },
        },
        undefined,
      )
    }

    const priorProfileStatus = assertPrivacyPriorProfileStatus(profile.status)
    const requestedAt = new Date()
    const previous = snapshotProfile(profile)
    const updated = await service.updateResearchProfiles({
      id: profile.id,
      status: "deletion_requested",
    })

    return new StepResponse<PrepareDeletionRequestResult, ProfileSnapshot>(
      {
        profile: projectResearchProfile(updated),
        privacyRequest: null,
        shouldCreatePrivacyRequest: true,
        privacyRequestInput: {
          profileId: profile.id,
          priorProfileStatus,
          requestedAt,
          idempotencyKey: normalized.idempotencyKey,
          requestFingerprintSha256: normalized.requestFingerprintSha256,
        },
      },
      previous,
    )
  },
  async (previous: ProfileSnapshot | undefined, { container }) => {
    if (!previous) {
      return
    }

    await getResearchTrackingService(container).updateResearchProfiles(previous)
  },
)

export const createResearchPrivacyRequestStep = createStep(
  "create-research-privacy-request",
  async (input: CreatePrivacyRequestStepInput, { container }) => {
    const service = getResearchTrackingService(container)
    const created = await service.createResearchPrivacyRequests({
      profile_id: input.profileId,
      request_type: "deletion",
      status: "requested",
      prior_profile_status: input.priorProfileStatus,
      open_request_key: input.profileId,
      requested_at: input.requestedAt,
      cancelled_at: null,
      started_at: null,
      completed_at: null,
      idempotency_key: input.idempotencyKey,
      request_fingerprint_sha256: input.requestFingerprintSha256,
      cancellation_idempotency_key: null,
      cancellation_fingerprint_sha256: null,
    })

    return new StepResponse(projectResearchPrivacyRequest(created), created.id)
  },
  async (createdId: string | undefined, { container }) => {
    if (!createdId) {
      return
    }

    await getResearchTrackingService(container).deleteResearchPrivacyRequests(
      createdId,
    )
  },
)

export type PrepareCancellationResult = {
  profileId: string
  profile: ResearchProfileProjection
  privacyRequest: ResearchPrivacyRequestProjection
  shouldRestoreProfile: boolean
  restoreProfileInput: RestoreProfileAfterCancellationInput
}

export const cancelResearchPrivacyRequestStep = createStep(
  "cancel-research-privacy-request",
  async (input: CancelResearchProfileDeletionInput, { container }) => {
    const normalized = normalizeCancelResearchProfileDeletionInput(input)
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, normalized.customerId)
    const replay = await findPrivacyRequestByCancellationKey(
      service,
      profile.id,
      normalized.idempotencyKey,
    )

    if (replay) {
      if (!replay.cancellation_fingerprint_sha256) {
        conflict("privacy request cancellation fingerprint is missing")
      }

      assertMatchingResearchFingerprint(
        replay.cancellation_fingerprint_sha256,
        normalized.requestFingerprintSha256,
      )

      return new StepResponse<
        PrepareCancellationResult,
        PrivacyRequestSnapshot
      >(
        {
          profileId: profile.id,
          profile: projectResearchProfile(profile),
          privacyRequest: projectResearchPrivacyRequest(replay),
          shouldRestoreProfile: false,
          restoreProfileInput: {
            customerId: normalized.customerId,
            profileId: profile.id,
            status: replay.prior_profile_status,
          },
        },
        undefined,
      )
    }

    const openRequest = await findOpenPrivacyRequest(service, profile.id)

    if (!openRequest) {
      notFound("open research profile deletion request was not found")
    }

    if (openRequest.status !== "requested") {
      conflict("deletion request can no longer be cancelled")
    }

    if (profile.status !== "deletion_requested") {
      conflict("profile is not awaiting deletion")
    }

    const previous = snapshotPrivacyRequest(openRequest)
    const updated = await service.updateResearchPrivacyRequests({
      id: openRequest.id,
      status: "cancelled",
      open_request_key: null,
      cancelled_at: new Date(),
      cancellation_idempotency_key: normalized.idempotencyKey,
      cancellation_fingerprint_sha256: normalized.requestFingerprintSha256,
    })

    return new StepResponse<PrepareCancellationResult, PrivacyRequestSnapshot>(
      {
        profileId: profile.id,
        profile: projectResearchProfile(profile),
        privacyRequest: projectResearchPrivacyRequest(updated),
        shouldRestoreProfile: true,
        restoreProfileInput: {
          customerId: normalized.customerId,
          profileId: profile.id,
          status: openRequest.prior_profile_status,
        },
      },
      previous,
    )
  },
  async (previous: PrivacyRequestSnapshot | undefined, { container }) => {
    if (!previous) {
      return
    }

    await getResearchTrackingService(container).updateResearchPrivacyRequests(
      previous,
    )
  },
)

export const restoreResearchProfileAfterCancellationStep = createStep(
  "restore-research-profile-after-cancellation",
  async (input: RestoreProfileAfterCancellationInput, { container }) => {
    const service = getResearchTrackingService(container)
    const profile = await retrieveOwnedProfile(service, input.customerId)

    if (profile.id !== input.profileId) {
      notFound("research profile was not found")
    }

    if (profile.status !== "deletion_requested") {
      conflict("profile is not awaiting deletion")
    }

    const updated = await service.updateResearchProfiles({
      id: profile.id,
      status: input.status,
    })

    return new StepResponse(projectResearchProfile(updated), profile.id)
  },
  async (profileId: string | undefined, { container }) => {
    if (!profileId) {
      return
    }

    await getResearchTrackingService(container).updateResearchProfiles({
      id: profileId,
      status: "deletion_requested",
    })
  },
)
