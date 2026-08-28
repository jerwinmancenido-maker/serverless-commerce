import { randomUUID } from "node:crypto"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  retrieveCurrentResearchDeletionRequest,
  retrievePurchasedItemCandidates,
  retrieveResearchProfile,
  retrieveResearchJournalEntries,
  retrieveResearchPrivateRecordsConfiguration,
  retrieveResearchOccurrences,
  retrieveResearchRoutineLogs,
  retrieveResearchRoutines,
  retrieveResearchTrackingConfiguration,
  retrieveTrackedResearchMaterials,
  type PurchasedItemCandidate,
  type ResearchPrivacyRequest,
  type ResearchJournalEntry,
  type ResearchPrivateRecordsConfiguration,
  type ResearchProfile,
  type ResearchOccurrence,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  createPurchasedActivationSubmissionKeys,
  createResearchSubmissionKeys,
  createRoutineSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import ResearchTracking from "@modules/account/components/research-tracking"

export const metadata: Metadata = {
  title: "Research & Tracking",
  description: "Private research organization and data controls.",
}

const unavailableConfiguration: ResearchTrackingConfiguration = {
  available: false,
  purchased_activation_available: false,
  consent_version: null,
  notice_url: null,
  default_timezone: "Asia/Manila",
  supported_locales: ["en-PH"],
  journal: {
    available: false,
    consent_version: null,
    notice_url: null,
    effective_at: null,
  },
}

const unavailablePrivateRecords: ResearchPrivateRecordsConfiguration = {
  journal: {
    available: false,
    consent_version: null,
    notice_url: null,
    effective_at: null,
    current_consent: null,
  },
  measurements: {
    available: false,
    allowlist_version: null,
  },
}

function localDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

function addCalendarDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export default async function ResearchTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ journalPage?: string }>
}) {
  const { countryCode } = await params
  const requestedJournalPage = Number((await searchParams).journalPage ?? "1")
  const journalPage =
    Number.isInteger(requestedJournalPage) && requestedJournalPage > 0
      ? requestedJournalPage
      : 1
  const journalLimit = 10
  const journalOffset = (journalPage - 1) * journalLimit
  let configuration = unavailableConfiguration
  let profile: ResearchProfile | null = null
  let privacyRequest: ResearchPrivacyRequest | null = null
  let runtimeReady = true
  let purchasedItems: PurchasedItemCandidate[] = []
  let trackedMaterials: TrackedResearchMaterial[] = []
  let purchasedRuntimeReady = true
  let routines: ResearchRoutine[] = []
  let occurrences: ResearchOccurrence[] = []
  let routineLogs: ResearchRoutineLog[] = []
  let routineToday = localDateInTimezone(new Date(), "Asia/Manila")
  let routineRuntimeReady = true
  let journalEntries: ResearchJournalEntry[] = []
  let journalCount = 0
  let privateRecords = unavailablePrivateRecords
  let journalRuntimeReady = true

  try {
    configuration = await retrieveResearchTrackingConfiguration()
  } catch {
    runtimeReady = false
  }

  if (runtimeReady && !configuration.available) {
    notFound()
  }

  try {
    if (!runtimeReady) {
      throw new Error("Research & Tracking configuration is unavailable")
    }

    profile = await retrieveResearchProfile()
    privacyRequest = profile
      ? await retrieveCurrentResearchDeletionRequest()
      : null

    const privateTrackingReady =
      profile?.status === "active" &&
      profile.consent_version === configuration.consent_version

    if (privateTrackingReady) {
      try {
        trackedMaterials = await retrieveTrackedResearchMaterials()

        if (configuration.purchased_activation_available) {
          purchasedItems = await retrievePurchasedItemCandidates()
        }
      } catch {
        purchasedRuntimeReady = false
      }
    }

    if (profile) {
      try {
        privateRecords = await retrieveResearchPrivateRecordsConfiguration()
        const journalPageResult = await retrieveResearchJournalEntries({
          limit: journalLimit,
          offset: journalOffset,
        })
        journalEntries = journalPageResult.entries
        journalCount = journalPageResult.count
      } catch {
        journalRuntimeReady = false
      }

      try {
        routines = await retrieveResearchRoutines()
        routineLogs = await retrieveResearchRoutineLogs()

        if (profile.status === "active") {
          routineToday = localDateInTimezone(new Date(), profile.timezone)
          occurrences = await retrieveResearchOccurrences(
            routineToday,
            addCalendarDays(routineToday, 6),
          )
        }
      } catch {
        routineRuntimeReady = false
      }
    }
  } catch {
    runtimeReady = false
  }

  return (
    <ResearchTracking
      configuration={configuration}
      countryCode={countryCode}
      profile={profile}
      privacyRequest={privacyRequest}
      purchasedActivationKeys={createPurchasedActivationSubmissionKeys(
        purchasedItems.map((item) => item.line_item_id),
        randomUUID,
      )}
      purchasedItems={purchasedItems}
      purchasedRuntimeReady={purchasedRuntimeReady}
      occurrences={occurrences}
      journalEntries={journalEntries}
      journalCount={journalCount}
      journalLimit={journalLimit}
      journalOffset={journalOffset}
      journalConsentKey={randomUUID()}
      privateRecords={privateRecords}
      journalRuntimeReady={journalRuntimeReady}
      journalSubmissionKeys={{
        create: randomUUID(),
        byEntry: Object.fromEntries(
          journalEntries.map((entry) => [
            entry.journal_entry_id,
            {
              revise: randomUUID(),
              transition: randomUUID(),
            },
          ]),
        ),
      }}
      routineLogs={routineLogs}
      routineToday={routineToday}
      routineRuntimeReady={routineRuntimeReady}
      routines={routines}
      routineSubmissionKeys={createRoutineSubmissionKeys(
        routines.map((routine) => routine.routine_id),
        occurrences.map((occurrence) => occurrence.occurrence_id),
        routineLogs.map((log) => log.log_id),
        randomUUID,
      )}
      runtimeReady={runtimeReady}
      submissionKeys={createResearchSubmissionKeys(randomUUID)}
      trackedMaterials={trackedMaterials}
    />
  )
}
