"use client"

import type {
  ResearchOccurrence,
  ResearchNotification,
  ResearchRoutine,
  TrackedResearchMaterial,
  ResearchRoutineLog,
  ResearchMeasurement,
  ResearchJournalEntry,
  PurchasedItemCandidate,
} from "@lib/data/research-tracking"
import {
  defaultResearchUnitProfile,
  formatResearchQuantity,
  resolveResearchUnitProfile,
} from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ResearchOccurrenceActions from "./research-occurrence-actions"
import NotificationInbox from "./notification-inbox"
import PostDoseCheckIn from "./post-dose-check-in"

function unitProfile(
  occurrence: ResearchOccurrence,
  material: TrackedResearchMaterial | undefined,
) {
  const matching = material?.supplies.filter(
    (supply) => supply.base_unit === occurrence.base_unit,
  ) ?? []

  if (matching.length === 1) {
    return resolveResearchUnitProfile(matching[0])
  }

  return defaultResearchUnitProfile(occurrence.base_unit)
}

function displayStatus(occurrence: ResearchOccurrence, today: string) {
  if (occurrence.status !== "scheduled") {
    return occurrence.status
  }

  if (occurrence.local_date === today) {
    return "Due today"
  }

  return occurrence.local_date < today ? "Missed" : "Upcoming"
}

export default function ResearchToday({
  countryCode,
  occurrences,
  routines,
  today,
  trackedMaterials,
  notifications,
  notificationUnreadCount,
  logs,
  measurements,
  journalEntries,
  timezone,
  measurementSubmissionKey,
  journalSubmissionKey,
  purchasedItems,
}: {
  countryCode: string
  occurrences: ResearchOccurrence[]
  routines: ResearchRoutine[]
  today: string
  trackedMaterials: TrackedResearchMaterial[]
  notifications: ResearchNotification[]
  notificationUnreadCount: number
  logs?: ResearchRoutineLog[]
  measurements?: ResearchMeasurement[]
  journalEntries?: ResearchJournalEntry[]
  timezone?: string
  measurementSubmissionKey?: string
  journalSubmissionKey?: string
  purchasedItems?: PurchasedItemCandidate[]
}) {
  const todayOccurrences = occurrences
    .filter((occurrence) => {
      const effectiveDate = occurrence.rescheduled_local_date ?? occurrence.local_date
      return effectiveDate === today
    })
    .sort((left, right) =>
      (left.rescheduled_local_time ?? left.local_time).localeCompare(
        right.rescheduled_local_time ?? right.local_time,
      ),
    )
  const completed = todayOccurrences.filter(
    (occurrence) => occurrence.status === "confirmed",
  ).length

  const unactivatedPurchases = (purchasedItems || []).filter(
    (p) => p.added_to_tracking_at === null && p.eligibility === "eligible",
  )

  return (
    <section className="space-y-6" aria-labelledby="research-today-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
            Daily workspace
          </p>
          <h2 id="research-today-title" className="mt-2 text-xl font-semibold">
            Today
          </h2>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            {today} · {completed} of {todayOccurrences.length} completed
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <LocalizedClientLink
            href={`/account/research-hub?section=calendar&calendarDate=${today}`}
            className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-4 py-2.5 min-h-[44px] text-sm font-semibold hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto text-center"
          >
            Open calendar
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/research-hub?section=calculator"
            className="inline-flex items-center justify-center rounded-lg bg-ui-fg-base px-4 py-2.5 min-h-[44px] text-sm font-semibold text-ui-bg-base hover:bg-ui-fg-subtle transition-colors touch-manipulation w-full sm:w-auto text-center"
          >
            Quick calculator
          </LocalizedClientLink>
        </div>
      </div>

      {unactivatedPurchases.length > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-600 p-2 text-white shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-950">
                  {unactivatedPurchases.length === 1
                    ? `New Compound Received: ${unactivatedPurchases[0].label}`
                    : `${unactivatedPurchases.length} New Compounds Received`}
                </p>
                <p className="mt-0.5 text-xs text-indigo-800 leading-relaxed">
                  Order #{unactivatedPurchases[0].order_display_id} is fulfilled. Activate your vial to track inventory, calculate reconstitution, and set up your dosing protocol.
                </p>
              </div>
            </div>
            <LocalizedClientLink
              href="/account/research-hub?section=supplies"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white transition-colors hover:bg-indigo-700 touch-manipulation w-full sm:w-auto"
            >
              Activate & Setup Vial →
            </LocalizedClientLink>
          </div>
        </div>
      )}

      {todayOccurrences.length ? (
        <div className="grid grid-cols-1 gap-4 large:grid-cols-2">
          {todayOccurrences.map((occurrence) => {
            const routine = routines.find(
              (item) => item.routine_id === occurrence.routine_id,
            )
            const material = trackedMaterials.find(
              (item) => item.tracked_material_id === routine?.tracked_material_id,
            )
            const matchingSupplies = material?.supplies.filter(
              (supply) =>
                supply.status === "active" &&
                supply.base_unit === occurrence.base_unit,
            ) ?? []
            const remaining = matchingSupplies.reduce(
              (total, supply) => total + supply.remaining_quantity_base_units,
              0,
            )
            const matchingLog = logs?.find(
              (item) =>
                item.routine_id === occurrence.routine_id &&
                item.local_date ===
                  (occurrence.rescheduled_local_date ?? occurrence.local_date) &&
                item.status === "confirmed",
            )
            const profile = unitProfile(occurrence, material)

            return (
              <article
                key={occurrence.occurrence_id}
                className="rounded-xl border border-ui-border-base bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ui-fg-subtle">
                      {occurrence.rescheduled_local_time ?? occurrence.local_time}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">
                      {occurrence.label}
                    </h3>
                    <p className="mt-1 text-sm text-ui-fg-subtle">
                      {routine?.tracked_material_label ?? "Personal routine"}
                    </p>
                  </div>
                  <span className="rounded-full bg-ui-bg-subtle px-2.5 py-1 text-xs font-medium">
                    {displayStatus(occurrence, today)}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-ui-bg-subtle p-4 text-sm">
                  <div>
                    <dt className="text-ui-fg-muted">Planned amount</dt>
                    <dd className="mt-1 font-semibold">
                      {formatResearchQuantity(
                        occurrence.planned_quantity_base_units,
                        profile,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ui-fg-muted">Personal supply estimate</dt>
                    <dd className="mt-1 font-semibold">
                      {matchingSupplies.length
                        ? formatResearchQuantity(remaining, profile)
                        : "Not linked"}
                    </dd>
                  </div>
                </dl>

                <ResearchOccurrenceActions
                  countryCode={countryCode}
                  occurrence={occurrence}
                  routine={routine}
                  supplies={matchingSupplies}
                  today={today}
                  unitProfile={profile}
                />

                {occurrence.status === "confirmed" && (
                  <PostDoseCheckIn
                    countryCode={countryCode}
                    occurrence={occurrence}
                    routine={routine}
                    log={matchingLog}
                    today={today}
                    timezone={timezone}
                    measurements={measurements}
                    journalEntries={journalEntries}
                    initialMeasurementKey={measurementSubmissionKey}
                    initialJournalKey={journalSubmissionKey}
                  />
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-ui-border-base bg-white p-8 text-center">
          <h3 className="text-base font-semibold">Nothing scheduled today</h3>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Review the upcoming calendar or create a personal routine.
          </p>
          <LocalizedClientLink
            href="/account/research-hub?section=routines"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            Manage routines
          </LocalizedClientLink>
        </div>
      )}

      <NotificationInbox
        countryCode={countryCode}
        notifications={notifications}
        unreadCount={notificationUnreadCount}
      />
    </section>
  )
}
