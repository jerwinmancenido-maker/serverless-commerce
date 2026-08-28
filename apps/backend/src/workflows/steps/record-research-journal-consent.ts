import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  normalizeResearchJournalConsentInput,
  projectResearchJournalConsentEvent,
  type RecordResearchJournalConsentInput,
  type ResearchJournalConsentEventType,
} from "../../modules/research-tracking/contracts/journal-consent"
import {
  retrieveActiveResearchProfile,
  retrieveResearchProfileForRead,
} from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type JournalConsentEventRecord = {
  id: string
  profile_id: string
  event_type: ResearchJournalConsentEventType
  consent_version: string
  notice_sha256: string
  occurred_at: Date
  idempotency_key: string
  request_fingerprint_sha256: string
}

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

export const recordResearchJournalConsentStep = createStep(
  "record-research-journal-consent",
  async (input: RecordResearchJournalConsentInput, { container }) => {
    const normalized = normalizeResearchJournalConsentInput(input)
    const trackingService = service(container)
    const profile =
      normalized.eventType === "accepted"
        ? await retrieveActiveResearchProfile(
            container,
            normalized.customerId,
            normalized.activeGeneralConsentVersion,
          )
        : await retrieveResearchProfileForRead(
            container,
            normalized.customerId,
          )
    const [existing] = (await trackingService.listResearchJournalConsentEvents(
      {
        profile_id: profile.id,
        idempotency_key: normalized.idempotencyKey,
      },
      { take: 1 },
    )) as JournalConsentEventRecord[]

    if (existing) {
      if (
        existing.request_fingerprint_sha256 !==
        normalized.requestFingerprintSha256
      ) {
        conflict("idempotency_key_conflict")
      }

      return new StepResponse<
        {
          created: boolean
          consent_event: ReturnType<
            typeof projectResearchJournalConsentEvent
          >
        },
        string
      >(
        {
          created: false,
          consent_event: projectResearchJournalConsentEvent(existing),
        },
        undefined,
      )
    }

    const [latest] = (await trackingService.listResearchJournalConsentEvents(
      { profile_id: profile.id },
      { order: { occurred_at: "DESC", id: "DESC" }, take: 1 },
    )) as JournalConsentEventRecord[]
    const latestOccurredAt = latest?.occurred_at.getTime() ?? 0
    const occurredAt = new Date(Math.max(Date.now(), latestOccurredAt + 1))
    const created = (await trackingService.createResearchJournalConsentEvents({
      profile_id: profile.id,
      event_type: normalized.eventType,
      consent_version: normalized.consentVersion,
      notice_sha256: normalized.noticeSha256,
      occurred_at: occurredAt,
      idempotency_key: normalized.idempotencyKey,
      request_fingerprint_sha256: normalized.requestFingerprintSha256,
    })) as JournalConsentEventRecord

    return new StepResponse<
      {
        created: boolean
        consent_event: ReturnType<typeof projectResearchJournalConsentEvent>
      },
      string
    >(
      {
        created: true,
        consent_event: projectResearchJournalConsentEvent(created),
      },
      created.id,
    )
  },
  async (createdEventId: string | undefined, { container }) => {
    if (createdEventId) {
      await service(container).deleteResearchJournalConsentEvents(
        createdEventId,
      )
    }
  },
)
