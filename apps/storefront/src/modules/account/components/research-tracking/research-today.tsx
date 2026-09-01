"use client"

import type {
  ResearchOccurrence,
  ResearchNotification,
  ResearchRoutine,
  TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  defaultResearchUnitProfile,
  formatResearchQuantity,
  resolveResearchUnitProfile,
} from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ResearchOccurrenceActions from "./research-occurrence-actions"
import NotificationInbox from "./notification-inbox"

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
}: {
  countryCode: string
  occurrences: ResearchOccurrence[]
  routines: ResearchRoutine[]
  today: string
  trackedMaterials: TrackedResearchMaterial[]
  notifications: ResearchNotification[]
  notificationUnreadCount: number
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
        <div className="flex gap-2">
          <LocalizedClientLink
            href={`/account/research-hub?section=calendar&calendarDate=${today}`}
            className="rounded-lg border border-ui-border-base bg-white px-4 py-2 text-sm font-medium"
          >
            Open calendar
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/research-hub?section=calculator"
            className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base"
          >
            Quick calculator
          </LocalizedClientLink>
        </div>
      </div>

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
                />
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
