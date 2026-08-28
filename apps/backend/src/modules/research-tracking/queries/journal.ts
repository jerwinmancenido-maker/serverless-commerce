import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from ".."
import type {
  ResearchJournalProjection,
  ResearchJournalRelations,
  ResearchJournalStatus,
} from "../contracts/journal"
import type ResearchTrackingModuleService from "../service"
import type {
  ResearchJournalConsentEventType,
  ResearchJournalConsentProjection,
} from "../contracts/journal-consent"
import {
  retrieveActiveResearchProfile,
  retrieveResearchProfileForRead,
} from "./personal-routines"

type JournalEntryRecord = {
  id: string
  profile_id: string
  status: ResearchJournalStatus
  current_revision_id: string | null
  voided_at: Date | null
  restored_at: Date | null
  created_at: Date
  updated_at: Date
}

type JournalRevisionRecord = {
  id: string
  journal_entry_id: string
  revision_number: number
  local_date: Date
  local_time: string
  timezone: string
  title: string | null
  note: string
  tracked_material_id: string | null
  supply_id: string | null
  routine_id: string | null
  confirmed_log_id: string | null
  prior_revision_id: string | null
  created_at: Date
}

type JournalConsentEventRecord = {
  id: string
  event_type: ResearchJournalConsentEventType
  consent_version: string
  notice_sha256: string
  occurred_at: Date
}

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function notFound(): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "resource was not found")
}

export async function retrieveOwnedJournalEntry(input: {
  container: MedusaContainer
  profileId: string
  journalEntryId: string
}): Promise<JournalEntryRecord> {
  const [entry] = (await service(input.container).listResearchJournalEntries(
    { id: input.journalEntryId, profile_id: input.profileId },
    { take: 1 },
  )) as JournalEntryRecord[]

  if (!entry) {
    notFound()
  }

  return entry
}

export async function retrieveJournalRevision(
  container: MedusaContainer,
  revisionId: string,
): Promise<JournalRevisionRecord> {
  return (await service(container).retrieveResearchJournalEntryRevision(
    revisionId,
  )) as JournalRevisionRecord
}

async function projectJournalEntry(input: {
  container: MedusaContainer
  entry: JournalEntryRecord
}): Promise<ResearchJournalProjection> {
  if (!input.entry.current_revision_id) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "journal entry has no current revision",
    )
  }

  const revision = await retrieveJournalRevision(
    input.container,
    input.entry.current_revision_id,
  )

  return {
    journal_entry_id: input.entry.id,
    status: input.entry.status,
    current_revision: {
      revision_id: revision.id,
      revision_number: revision.revision_number,
      local_date: revision.local_date.toISOString().slice(0, 10),
      local_time: revision.local_time,
      timezone: revision.timezone,
      title: revision.title,
      note: revision.note,
      tracked_material_id: revision.tracked_material_id,
      supply_id: revision.supply_id,
      routine_id: revision.routine_id,
      confirmed_log_id: revision.confirmed_log_id,
      created_at: revision.created_at,
    },
    created_at: input.entry.created_at,
    updated_at: input.entry.updated_at,
    voided_at: input.entry.voided_at,
    restored_at: input.entry.restored_at,
  }
}

export async function listOwnedResearchJournalEntries(input: {
  container: MedusaContainer
  customerId: string
  limit: number
  offset: number
  includeVoided: boolean
}): Promise<{ entries: ResearchJournalProjection[]; count: number }> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const filters = {
    profile_id: profile.id,
    ...(input.includeVoided ? {} : { status: "active" as const }),
  }
  const [entries, count] = (await service(
    input.container,
  ).listAndCountResearchJournalEntries(filters, {
    take: input.limit,
    skip: input.offset,
    order: { created_at: "DESC" },
  })) as [JournalEntryRecord[], number]

  return {
    entries: await Promise.all(
      entries.map((entry) =>
        projectJournalEntry({ container: input.container, entry }),
      ),
    ),
    count,
  }
}

export async function retrieveOwnedResearchJournalProjection(input: {
  container: MedusaContainer
  customerId: string
  journalEntryId: string
}): Promise<ResearchJournalProjection> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const entry = await retrieveOwnedJournalEntry({
    container: input.container,
    profileId: profile.id,
    journalEntryId: input.journalEntryId,
  })

  return await projectJournalEntry({ container: input.container, entry })
}

export async function retrieveJournalMutationProfile(input: {
  container: MedusaContainer
  customerId: string
  activeConsentVersion: string
  activeJournalConsentVersion: string
  activeJournalNoticeSha256: string
}) {
  const profile = await retrieveActiveResearchProfile(
    input.container,
    input.customerId,
    input.activeConsentVersion,
  )
  const consent = await retrieveCurrentResearchJournalConsentRecord({
    container: input.container,
    profileId: profile.id,
  })

  if (
    consent?.event_type !== "accepted" ||
    consent.consent_version !== input.activeJournalConsentVersion ||
    consent.notice_sha256 !== input.activeJournalNoticeSha256
  ) {
    throw new MedusaError(
      MedusaError.Types.FORBIDDEN,
      "research_journal_consent_required",
    )
  }

  return profile
}

export async function retrieveCurrentResearchJournalConsent(input: {
  container: MedusaContainer
  profileId: string
}): Promise<ResearchJournalConsentProjection | null> {
  const event = await retrieveCurrentResearchJournalConsentRecord(input)

  return event
    ? {
        event_type: event.event_type,
        consent_version: event.consent_version,
        occurred_at: event.occurred_at,
      }
    : null
}

async function retrieveCurrentResearchJournalConsentRecord(input: {
  container: MedusaContainer
  profileId: string
}): Promise<JournalConsentEventRecord | null> {
  const [event] = (await service(
    input.container,
  ).listResearchJournalConsentEvents(
    { profile_id: input.profileId },
    { order: { occurred_at: "DESC", id: "DESC" }, take: 1 },
  )) as JournalConsentEventRecord[]

  return event ?? null
}

export async function retrieveOwnedResearchJournalConsentStatus(input: {
  container: MedusaContainer
  customerId: string
  activeConsentVersion: string
  activeNoticeSha256: string
}): Promise<(ResearchJournalConsentProjection & { is_current: boolean }) | null> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const event = await retrieveCurrentResearchJournalConsentRecord({
    container: input.container,
    profileId: profile.id,
  })

  return event
    ? {
        event_type: event.event_type,
        consent_version: event.consent_version,
        occurred_at: event.occurred_at,
        is_current:
          event.event_type === "accepted" &&
          event.consent_version === input.activeConsentVersion &&
          event.notice_sha256 === input.activeNoticeSha256,
      }
    : null
}

export async function validateOwnedJournalRelations(input: {
  container: MedusaContainer
  profileId: string
  relations: ResearchJournalRelations
}): Promise<void> {
  const trackingService = service(input.container)

  if (input.relations.trackedMaterialId) {
    const [material] = await trackingService.listTrackedMaterials(
      {
        id: input.relations.trackedMaterialId,
        profile_id: input.profileId,
      },
      { take: 1 },
    )

    if (!material) {
      notFound()
    }
  }

  if (input.relations.supplyId) {
    const [supply] = await trackingService.listResearchSupplies(
      { id: input.relations.supplyId },
      { take: 1 },
    )

    if (!supply) {
      notFound()
    }

    const [material] = await trackingService.listTrackedMaterials(
      {
        id: supply.tracked_material_id,
        profile_id: input.profileId,
      },
      { take: 1 },
    )

    if (!material) {
      notFound()
    }
  }

  if (input.relations.routineId) {
    const [routine] = await trackingService.listResearchRoutines(
      { id: input.relations.routineId, profile_id: input.profileId },
      { take: 1 },
    )

    if (!routine) {
      notFound()
    }
  }

  if (input.relations.confirmedLogId) {
    const [log] = await trackingService.listResearchRoutineLogs(
      { id: input.relations.confirmedLogId, profile_id: input.profileId },
      { take: 1 },
    )

    if (!log) {
      notFound()
    }

    if (log.status !== "confirmed") {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "confirmed_log_ineligible",
      )
    }
  }
}
