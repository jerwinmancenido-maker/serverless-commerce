"use client"

import type {
  ResearchOccurrence,
} from "@lib/data/research-tracking"
import { defaultResearchUnitProfile, formatResearchQuantity } from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useMemo, useState } from "react"

import ResearchOccurrenceActions from "./research-occurrence-actions"

type CalendarView = "month" | "week" | "day" | "agenda"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function dateAt(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function dateString(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addDays(value: string, days: number) {
  const date = dateAt(value)
  date.setUTCDate(date.getUTCDate() + days)
  return dateString(date)
}

function shiftMonth(value: string, amount: number) {
  const date = dateAt(value)
  return dateString(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)),
  )
}

function monthCells(anchorDate: string) {
  const anchor = dateAt(anchorDate)
  const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1))
  const mondayOffset = (first.getUTCDay() + 6) % 7
  const start = new Date(first)
  start.setUTCDate(start.getUTCDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return dateString(date)
  })
}

function effectiveDate(occurrence: ResearchOccurrence) {
  return occurrence.rescheduled_local_date ?? occurrence.local_date
}

function effectiveTime(occurrence: ResearchOccurrence) {
  return occurrence.rescheduled_local_time ?? occurrence.local_time
}

function statusLabel(occurrence: ResearchOccurrence, today: string) {
  if (occurrence.status !== "scheduled") return occurrence.status
  if (effectiveDate(occurrence) === today) return "Due today"
  if (effectiveDate(occurrence) < today) return "Missed"
  return "Upcoming"
}

export default function ResearchCalendar({
  anchorDate,
  countryCode,
  occurrences,
  today,
}: {
  anchorDate: string
  countryCode: string
  occurrences: ResearchOccurrence[]
  today: string
}) {
  const [view, setView] = useState<CalendarView>("month")
  const [selectedDate, setSelectedDate] = useState(anchorDate)
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<ResearchOccurrence | null>(null)
  const anchor = dateAt(anchorDate)
  const currentMonth = anchor.getUTCMonth()
  const monthLabel = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(anchor)
  const cells = useMemo(() => monthCells(anchorDate), [anchorDate])
  const byDate = useMemo(() => {
    const result = new Map<string, ResearchOccurrence[]>()
    occurrences.forEach((occurrence) => {
      const date = effectiveDate(occurrence)
      result.set(date, [...(result.get(date) ?? []), occurrence])
    })
    result.forEach((items) =>
      items.sort((left, right) => effectiveTime(left).localeCompare(effectiveTime(right))),
    )
    return result
  }, [occurrences])
  const selectedItems = byDate.get(selectedDate) ?? []
  const agendaItems = [...occurrences].sort((left, right) =>
    `${effectiveDate(left)} ${effectiveTime(left)}`.localeCompare(
      `${effectiveDate(right)} ${effectiveTime(right)}`,
    ),
  )

  return (
    <section className="space-y-5" aria-labelledby="research-calendar-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
            Personal schedule
          </p>
          <h2 id="research-calendar-title" className="mt-2 text-xl font-semibold">
            Calendar
          </h2>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Schedule changes affect this personal calendar only. Warehouse inventory is unchanged.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Calendar view">
          {(["month", "week", "day", "agenda"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              aria-pressed={view === item}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                view === item
                  ? "bg-ui-fg-base text-ui-bg-base"
                  : "border border-ui-border-base bg-white"
              }`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ui-border-base bg-white">
        <div className="flex items-center justify-between border-b border-ui-border-base p-4">
          <LocalizedClientLink
            href={`/account/research-hub?section=calendar&calendarDate=${shiftMonth(anchorDate, -1)}`}
            className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
            aria-label="Previous month"
          >
            Previous
          </LocalizedClientLink>
          <h3 className="font-semibold">{monthLabel}</h3>
          <LocalizedClientLink
            href={`/account/research-hub?section=calendar&calendarDate=${shiftMonth(anchorDate, 1)}`}
            className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
            aria-label="Next month"
          >
            Next
          </LocalizedClientLink>
        </div>

        {view === "month" ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-7 border-b border-ui-border-base bg-ui-bg-subtle">
              {weekDays.map((day) => (
                <div key={day} className="p-3 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid min-w-[760px] grid-cols-7">
              {cells.map((date) => {
                const dateValue = dateAt(date)
                const inMonth = dateValue.getUTCMonth() === currentMonth
                const items = byDate.get(date) ?? []
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date)
                      setView("day")
                    }}
                    className={`min-h-28 border-b border-r border-ui-border-base p-2 text-left align-top hover:bg-ui-bg-subtle ${
                      !inMonth ? "bg-ui-bg-subtle text-ui-fg-muted" : ""
                    }`}
                  >
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${date === today ? "bg-ui-fg-base text-ui-bg-base" : ""}`}>
                      {dateValue.getUTCDate()}
                    </span>
                    <span className="mt-2 block space-y-1">
                      {items.slice(0, 3).map((occurrence) => (
                        <span key={occurrence.occurrence_id} className="block truncate rounded bg-blue-50 px-2 py-1 text-xs text-blue-900">
                          {effectiveTime(occurrence)} {occurrence.label}
                        </span>
                      ))}
                      {items.length > 3 ? <span className="block text-xs text-ui-fg-muted">+{items.length - 3} more</span> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {view === "week" ? (
          <div className="grid grid-cols-1 divide-y divide-ui-border-base small:grid-cols-7 small:divide-x small:divide-y-0">
            {Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index - ((dateAt(selectedDate).getUTCDay() + 6) % 7))).map((date) => (
              <button key={date} type="button" onClick={() => { setSelectedDate(date); setView("day") }} className="min-h-36 p-3 text-left hover:bg-ui-bg-subtle">
                <span className="text-xs font-semibold">{date}</span>
                {(byDate.get(date) ?? []).map((occurrence) => (
                  <span key={occurrence.occurrence_id} className="mt-2 block rounded bg-blue-50 p-2 text-xs text-blue-900">
                    {effectiveTime(occurrence)} {occurrence.label}
                  </span>
                ))}
              </button>
            ))}
          </div>
        ) : null}

        {view === "day" ? (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="text-sm font-medium underline">Previous day</button>
              <h3 className="font-semibold">{selectedDate}</h3>
              <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="text-sm font-medium underline">Next day</button>
            </div>
            {selectedItems.length ? (
              <div className="space-y-3">
                {selectedItems.map((occurrence) => (
                  <button key={occurrence.occurrence_id} type="button" onClick={() => setSelectedOccurrence(occurrence)} className="flex w-full items-center justify-between rounded-lg border border-ui-border-base p-4 text-left hover:bg-ui-bg-subtle">
                    <span><span className="font-semibold">{effectiveTime(occurrence)}</span><span className="ml-3">{occurrence.label}</span></span>
                    <span className="text-xs font-medium text-ui-fg-muted">{statusLabel(occurrence, today)}</span>
                  </button>
                ))}
              </div>
            ) : <p className="py-8 text-center text-sm text-ui-fg-subtle">No activities on this day.</p>}
          </div>
        ) : null}

        {view === "agenda" ? (
          <div className="divide-y divide-ui-border-base">
            {agendaItems.length ? agendaItems.map((occurrence) => (
              <button key={occurrence.occurrence_id} type="button" onClick={() => setSelectedOccurrence(occurrence)} className="flex w-full flex-col gap-1 p-4 text-left hover:bg-ui-bg-subtle small:flex-row small:items-center small:justify-between">
                <span><span className="font-semibold">{effectiveDate(occurrence)} · {effectiveTime(occurrence)}</span><span className="ml-3">{occurrence.label}</span></span>
                <span className="text-xs font-medium text-ui-fg-muted">{statusLabel(occurrence, today)}</span>
              </button>
            )) : <p className="p-8 text-center text-sm text-ui-fg-subtle">No activities in this month.</p>}
          </div>
        ) : null}
      </div>

      {selectedOccurrence ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedOccurrence(null) }}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="calendar-event-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ui-fg-subtle">{effectiveDate(selectedOccurrence)} at {effectiveTime(selectedOccurrence)}</p>
                <h3 id="calendar-event-title" className="mt-1 text-lg font-semibold">{selectedOccurrence.label}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOccurrence(null)} className="rounded-lg border border-ui-border-base px-3 py-2 text-sm">Close</button>
            </div>
            <div className="mt-5 rounded-lg bg-ui-bg-subtle p-4">
              <p className="text-xs uppercase tracking-wide text-ui-fg-muted">Planned amount</p>
              <p className="mt-1 font-semibold">{formatResearchQuantity(selectedOccurrence.planned_quantity_base_units, defaultResearchUnitProfile(selectedOccurrence.base_unit))}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-ui-fg-muted">Status</p>
              <p className="mt-1 font-semibold">{statusLabel(selectedOccurrence, today)}</p>
              <p className="mt-3 text-xs text-ui-fg-muted">{selectedOccurrence.timezone}</p>
            </div>
            <ResearchOccurrenceActions countryCode={countryCode} occurrence={selectedOccurrence} />
          </aside>
        </div>
      ) : null}
    </section>
  )
}
