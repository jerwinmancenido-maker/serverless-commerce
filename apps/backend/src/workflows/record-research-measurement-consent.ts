import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
} from "../modules/research-tracking/contracts/ownership"
import {
  retrieveActiveResearchProfile,
  retrieveResearchProfileForRead,
} from "../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"

type Input = {
  customerId: string
  activeGeneralConsentVersion: string
  requestedConsentVersion: string
  activeConsentVersion: string
  noticeSha256: string
  accepted: boolean
  idempotencyKey: string
}

type Result = {
  created: boolean
  consent_event: {
    id: string
    event_type: "accepted" | "withdrawn"
    consent_version: string
    occurred_at: Date
  }
}

function project(event: {
  id: string
  event_type: "accepted" | "withdrawn"
  consent_version: string
  occurred_at: Date
}) {
  return {
    id: event.id,
    event_type: event.event_type,
    consent_version: event.consent_version,
    occurred_at: event.occurred_at,
  }
}

const recordResearchMeasurementConsentStep = createStep<Input, Result, string>(
  "record-research-measurement-consent",
  async (input: Input, { container }) => {
    if (input.requestedConsentVersion !== input.activeConsentVersion) {
      throw new MedusaError(MedusaError.Types.CONFLICT, "consent_version_changed")
    }
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const profile = input.accepted
      ? await retrieveActiveResearchProfile(
          container,
          input.customerId,
          input.activeGeneralConsentVersion,
        )
      : await retrieveResearchProfileForRead(container, input.customerId)
    const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)
    const eventType = input.accepted ? "accepted" : "withdrawn"
    const fingerprint = createResearchRequestFingerprint(
      "research-measurement-consent",
      [eventType, input.activeConsentVersion, input.noticeSha256],
    )
    const [existing] = await service.listResearchMeasurementConsentEvents(
      { profile_id: profile.id, idempotency_key: idempotencyKey },
      { take: 1 },
    )
    if (existing) {
      if (existing.request_fingerprint_sha256 !== fingerprint) {
        throw new MedusaError(MedusaError.Types.CONFLICT, "idempotency_key_conflict")
      }
      return new StepResponse<Result, string>(
        { created: false, consent_event: project(existing) },
        undefined,
      )
    }
    const [latest] = await service.listResearchMeasurementConsentEvents(
      { profile_id: profile.id },
      { order: { occurred_at: "DESC", id: "DESC" }, take: 1 },
    )
    const occurredAt = new Date(
      Math.max(Date.now(), (latest?.occurred_at.getTime() ?? 0) + 1),
    )
    const event = await service.createResearchMeasurementConsentEvents({
      profile_id: profile.id,
      event_type: eventType,
      consent_version: input.activeConsentVersion,
      notice_sha256: input.noticeSha256,
      occurred_at: occurredAt,
      idempotency_key: idempotencyKey,
      request_fingerprint_sha256: fingerprint,
    })
    return new StepResponse<Result, string>(
      { created: true, consent_event: project(event) },
      event.id,
    )
  },
  async (eventId: string | undefined, { container }) => {
    if (eventId) {
      await container
        .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
        .deleteResearchMeasurementConsentEvents(eventId)
    }
  },
)

export const recordResearchMeasurementConsentWorkflow = createWorkflow(
  "record-research-measurement-consent",
  (input: Input) => {
    const requestLock = transform({ input }, ({ input }) => ({
      key: `research-measurement-consent:${input.customerId}:${input.idempotencyKey}`,
      timeout: 10,
      ttl: 30,
    }))
    acquireLockStep(requestLock)
    const result = recordResearchMeasurementConsentStep(input)
    releaseLockStep(requestLock)
    return new WorkflowResponse(result)
  },
)
