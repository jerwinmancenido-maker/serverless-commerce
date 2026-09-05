"use client"

import {
  retrieveResearchOccurrences,
  type ResearchOccurrence,
} from "@lib/data/research-tracking"
import {
  defaultResearchUnitProfile,
  formatResearchQuantity,
} from "@lib/research-quantity"
import { useCallback, useEffect, useMemo, useState } from "react"

import ResearchOccurrenceActions from "./research-occurrence-actions"

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

function statusBadge(occurrence: ResearchOccurrence, today: string) {
  if (occurrence.status === "confirmed") {
    return {
      label: "Confirmed",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    }
  }
  if (occurrence.status === "skipped") {
    return {
      label: "Skipped",
      color: "bg-gray-50 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    }
  }
  if (occurrence.status === "rescheduled") {
    return {
      label: "Rescheduled",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    }
  }
  const date = effectiveDate(occurrence)
  if (date === today) {
    return {
      label: "Due Today",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    }
  }
  if (date < today) {
    return {
      label: "Missed",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    }
  }
  return {
    label: "Upcoming",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  }
}

function formatDisplayDate(dateStr: string) {
  const d = dateAt(dateStr)
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

function formatFullDate(dateStr: string) {
  const d = dateAt(dateStr)
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

export default function RoutinesCalendarPanel({
  occurrences: initialOccurrences,
  today,
  countryCode,
}: {
  occurrences: ResearchOccurrence[]
  today: string
  countryCode: string
}) {
  const [currentAnchor, setCurrentAnchor] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<ResearchOccurrence | null>(null)
  const [extraOccurrences, setExtraOccurrences] = useState<ResearchOccurrence[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [quickFilter, setQuickFilter] = useState<"all" | "today" | "upcoming" | "confirmed">("all")

  const anchor = dateAt(currentAnchor)
  const currentMonth = anchor.getUTCMonth()
  const monthLabel = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(anchor)

  const cells = useMemo(() => monthCells(currentAnchor), [currentAnchor])

  // Combine initial occurrences with any dynamically fetched occurrences for navigated months
  const allOccurrences = useMemo(() => {
    const map = new Map<string, ResearchOccurrence>()
    initialOccurrences.forEach((item) => map.set(item.occurrence_id, item))
    extraOccurrences.forEach((item) => map.set(item.occurrence_id, item))
    return Array.from(map.values())
  }, [initialOccurrences, extraOccurrences])

  // Fetch occurrences when navigating to a different month
  const fetchMonthOccurrences = useCallback(async (anchorDate: string) => {
    const d = dateAt(anchorDate)
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
    const startStr = dateString(start)
    const endStr = dateString(end)

    setIsLoadingMonth(true)
    try {
      const fetched = await retrieveResearchOccurrences(startStr, endStr)
      setExtraOccurrences((prev) => {
        const map = new Map<string, ResearchOccurrence>()
        prev.forEach((item) => map.set(item.occurrence_id, item))
        fetched.forEach((item) => map.set(item.occurrence_id, item))
        return Array.from(map.values())
      })
    } catch {
      // Graceful fallback: keep current occurrences
    } finally {
      setIsLoadingMonth(false)
    }
  }, [])

  const handlePrevMonth = () => {
    const newAnchor = shiftMonth(currentAnchor, -1)
    setCurrentAnchor(newAnchor)
    fetchMonthOccurrences(newAnchor)
  }

  const handleNextMonth = () => {
    const newAnchor = shiftMonth(currentAnchor, 1)
    setCurrentAnchor(newAnchor)
    fetchMonthOccurrences(newAnchor)
  }

  const handleToday = () => {
    setCurrentAnchor(today)
    setSelectedDate(today)
    fetchMonthOccurrences(today)
  }

  // Group occurrences by date
  const byDate = useMemo(() => {
    const result = new Map<string, ResearchOccurrence[]>()
    allOccurrences.forEach((occurrence) => {
      const date = effectiveDate(occurrence)
      result.set(date, [...(result.get(date) ?? []), occurrence])
    })
    result.forEach((items) =>
      items.sort((left, right) =>
        effectiveTime(left).localeCompare(effectiveTime(right)),
      ),
    )
    return result
  }, [allOccurrences])

  // Items for selected day
  const selectedItems = byDate.get(selectedDate) ?? []

  // Computed displayed items based on quickFilter
  const displayedItems = useMemo(() => {
    if (quickFilter === "today") {
      return byDate.get(today) ?? []
    }
    if (quickFilter === "confirmed") {
      return allOccurrences
        .filter((o) => o.status === "confirmed")
        .sort((a, b) => effectiveDate(b).localeCompare(effectiveDate(a)))
    }
    if (quickFilter === "upcoming") {
      return allOccurrences
        .filter((o) => {
          const d = effectiveDate(o)
          return d >= today && o.status === "scheduled"
        })
        .sort((a, b) => effectiveDate(a).localeCompare(effectiveDate(b)))
    }
    return selectedItems
  }, [allOccurrences, byDate, quickFilter, selectedItems, today])

  // Upcoming items in next 7 days from today
  const upcomingGrouped = useMemo(() => {
    const next7End = addDays(today, 7)
    const upcomingList = allOccurrences.filter((item) => {
      const date = effectiveDate(item)
      return date > today && date <= next7End && item.status === "scheduled"
    })

    const grouped = new Map<string, ResearchOccurrence[]>()
    upcomingList.forEach((item) => {
      const d = effectiveDate(item)
      grouped.set(d, [...(grouped.get(d) ?? []), item])
    })

    // Sort by date ascending
    const sortedKeys = Array.from(grouped.keys()).sort()
    return sortedKeys.map((key) => ({
      date: key,
      items: grouped.get(key) ?? [],
    }))
  }, [allOccurrences, today])

  // Initial load check if navigated
  useEffect(() => {
    // Keep in sync if today changes
  }, [today])

  return (
    <div className="rounded-2xl border border-ui-border-base bg-white shadow-2xs overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-base px-6 py-4 bg-gradient-to-r from-emerald-50/40 via-white to-white">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <h3 className="text-base font-bold tracking-tight text-ui-fg-base">
              Protocol Schedule & Calendar
            </h3>
            {isLoadingMonth && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-pulse">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
                Updating…
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ui-fg-subtle">
            Monthly view of scheduled doses, adherence tracking, and upcoming routine dates.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-ui-fg-muted font-medium">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Due Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" />
            Missed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400" />
            Upcoming
          </span>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-ui-border-base">
        {/* Left Panel: Full Month Calendar Grid */}
        <div className="lg:col-span-7 p-5 sm:p-6">
          {/* Month Navigation Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-ui-fg-base tracking-tight">
                {monthLabel}
              </h4>
              {currentAnchor !== today && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  Return to Today
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex size-8 items-center justify-center rounded-lg border border-ui-border-base bg-white text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex size-8 items-center justify-center rounded-lg border border-ui-border-base bg-white text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-1.5 text-[11px] font-bold uppercase tracking-wider text-ui-fg-muted"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 42-day Month Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {cells.map((date) => {
              const d = dateAt(date)
              const inMonth = d.getUTCMonth() === currentMonth
              const isToday = date === today
              const isSelected = date === selectedDate
              const items = byDate.get(date) ?? []
              const count = items.length

              // Determine indicator color
              let dotColor = "bg-slate-400"
              if (items.some((i) => i.status === "confirmed")) {
                dotColor = items.every((i) => i.status === "confirmed")
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              } else if (items.some((i) => i.status === "scheduled" && date < today)) {
                dotColor = "bg-rose-500"
              } else if (items.some((i) => i.status === "scheduled" && date === today)) {
                dotColor = "bg-blue-500"
              }

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date)
                    setQuickFilter("all")
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${formatFullDate(date)}, ${count} routines`}
                  className={`group relative flex flex-col items-center justify-between rounded-xl py-2 px-1 text-center transition-all duration-150 min-h-[58px] sm:min-h-[64px] ${
                    isSelected
                      ? "bg-ui-fg-base text-white shadow-md ring-2 ring-ui-fg-base scale-[1.02] z-10"
                      : isToday
                      ? "border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold hover:bg-emerald-50"
                      : inMonth
                      ? "border border-ui-border-base bg-white hover:bg-ui-bg-subtle text-ui-fg-base"
                      : "border border-transparent bg-ui-bg-subtle/30 text-ui-fg-muted/40 hover:bg-ui-bg-subtle/60"
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-xs sm:text-sm font-semibold leading-none ${
                      isSelected
                        ? "text-white"
                        : isToday
                        ? "text-emerald-600 font-extrabold"
                        : inMonth
                        ? "text-ui-fg-base"
                        : "text-ui-fg-muted/40"
                    }`}
                  >
                    {d.getUTCDate()}
                  </span>

                  {/* Indicator Dot / Count Badge */}
                  {count > 0 ? (
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <span
                        className={`size-2 rounded-full ${
                          isSelected ? "bg-white ring-1 ring-white/40" : dotColor
                        }`}
                      />
                      {count > 1 && (
                        <span
                          className={`text-[10px] font-bold leading-none ${
                            isSelected ? "text-white/90" : "text-ui-fg-muted"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="h-2" />
                  )}

                  {/* Tiny Today Label */}
                  {isToday && !isSelected && (
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter leading-none">
                      Today
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Panel: Day Detail + Upcoming Next 7 Days */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-gradient-to-b from-ui-bg-subtle/30 to-white flex flex-col justify-between space-y-6">
          {/* Selected Day Header & List */}
          <div className="space-y-4">
            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setQuickFilter("all")}
                className={`flex-1 rounded-lg py-1.5 px-2 text-center transition-all ${
                  quickFilter === "all"
                    ? "bg-white text-ui-fg-base shadow-xs font-bold"
                    : "text-ui-fg-muted hover:text-ui-fg-base font-medium"
                }`}
              >
                Day View
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickFilter("today")
                  setSelectedDate(today)
                }}
                className={`flex-1 rounded-lg py-1.5 px-2 text-center transition-all ${
                  quickFilter === "today"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-ui-fg-muted hover:text-ui-fg-base font-medium"
                }`}
              >
                Due Today
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter("upcoming")}
                className={`flex-1 rounded-lg py-1.5 px-2 text-center transition-all ${
                  quickFilter === "upcoming"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-ui-fg-muted hover:text-ui-fg-base font-medium"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter("confirmed")}
                className={`flex-1 rounded-lg py-1.5 px-2 text-center transition-all ${
                  quickFilter === "confirmed"
                    ? "bg-slate-800 text-white shadow-xs font-bold"
                    : "text-ui-fg-muted hover:text-ui-fg-base font-medium"
                }`}
              >
                Confirmed
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-ui-border-base pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight text-ui-fg-base">
                    {quickFilter === "today"
                      ? "Doses Due Today"
                      : quickFilter === "confirmed"
                      ? "Confirmed Protocol Doses"
                      : quickFilter === "upcoming"
                      ? "All Upcoming Scheduled Doses"
                      : formatFullDate(selectedDate)}
                  </h4>
                  {quickFilter === "all" && selectedDate === today && (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Today
                    </span>
                  )}
                  {quickFilter === "all" && selectedDate === addDays(today, 1) && (
                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                      Tomorrow
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ui-fg-subtle">
                  {displayedItems.length === 0
                    ? "No doses found in this view"
                    : `${displayedItems.length} ${
                        displayedItems.length === 1 ? "dose" : "doses"
                      }`}
                </p>
              </div>

              {selectedDate !== today && quickFilter === "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(today)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  Go to today
                </button>
              )}
            </div>

            {/* Displayed occurrences list */}
            {displayedItems.length > 0 ? (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {displayedItems.map((occurrence) => {
                  const badge = statusBadge(occurrence, today)
                  const unitProfile = defaultResearchUnitProfile(occurrence.base_unit)
                  const formattedQuantity = formatResearchQuantity(
                    occurrence.planned_quantity_base_units,
                    unitProfile,
                  )

                  return (
                    <div
                      key={occurrence.occurrence_id}
                      className="group flex flex-col justify-between gap-2 rounded-xl border border-ui-border-base bg-white p-3.5 shadow-2xs hover:border-ui-border-strong hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ui-fg-base">
                              {effectiveTime(occurrence)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}
                            >
                              <span className={`size-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-ui-fg-base leading-snug">
                            {occurrence.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-ui-border-base/60 pt-2 text-xs">
                        <span className="text-ui-fg-muted font-medium">
                          Planned: <span className="font-semibold text-ui-fg-base">{formattedQuantity}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOccurrence(occurrence)}
                          className="inline-flex items-center gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-2.5 py-1 text-xs font-semibold text-ui-fg-base hover:bg-ui-fg-base hover:text-white transition-all"
                        >
                          Log Dose
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ui-border-base bg-white/60 p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-muted mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <p className="text-xs font-semibold text-ui-fg-base">
                  No doses scheduled for {formatDisplayDate(selectedDate)}
                </p>
                <p className="mt-1 text-[11px] text-ui-fg-subtle max-w-[240px]">
                  Click any highlighted day on the calendar or view upcoming doses below.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Section (Next 7 Days Agenda) */}
          <div className="border-t border-ui-border-base pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">
                  Upcoming (Next 7 Days)
                </h5>
              </div>
              <span className="rounded-full bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-bold text-ui-fg-muted">
                {upcomingGrouped.reduce((sum, g) => sum + g.items.length, 0)} doses scheduled
              </span>
            </div>

            {upcomingGrouped.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {upcomingGrouped.map((group) => (
                  <div
                    key={group.date}
                    onClick={() => setSelectedDate(group.date)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-ui-border-base bg-white p-2.5 text-xs hover:border-ui-border-strong hover:bg-ui-bg-subtle transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-[11px] font-bold text-ui-fg-base">
                        {dateAt(group.date).getUTCDate()}
                      </span>
                      <div>
                        <p className="font-semibold text-ui-fg-base leading-tight">
                          {formatDisplayDate(group.date)}
                        </p>
                        <p className="text-[11px] text-ui-fg-subtle truncate max-w-[180px]">
                          {group.items.map((i) => i.label).join(", ")}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-medium text-ui-fg-muted shrink-0">
                      {group.items.length} {group.items.length === 1 ? "dose" : "doses"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ui-fg-subtle py-2 text-center bg-white rounded-lg border border-dashed border-ui-border-base">
                No upcoming doses scheduled in the next 7 days.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Action Drawer */}
      {selectedOccurrence ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setSelectedOccurrence(null)
            }
          }}
        >
          <aside
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
            aria-labelledby="routines-drawer-title"
          >
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-ui-border-base pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-600" />
                    Scheduled Dose
                  </span>
                  <h3 id="routines-drawer-title" className="mt-1 text-lg font-bold text-ui-fg-base tracking-tight">
                    {selectedOccurrence.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-ui-fg-subtle">
                    {effectiveDate(selectedOccurrence)} at {effectiveTime(selectedOccurrence)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOccurrence(null)}
                  className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium hover:bg-ui-bg-subtle transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-3 rounded-xl bg-ui-bg-subtle/80 p-4 border border-ui-border-base">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ui-fg-muted">
                    Target Dosage
                  </p>
                  <p className="mt-1 text-base font-bold text-ui-fg-base">
                    {formatResearchQuantity(
                      selectedOccurrence.planned_quantity_base_units,
                      defaultResearchUnitProfile(selectedOccurrence.base_unit),
                    )}
                  </p>
                </div>

                <div className="border-t border-ui-border-base/60 pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-ui-fg-muted font-medium">Status: </span>
                    <span className="font-bold text-ui-fg-base capitalize">
                      {selectedOccurrence.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-ui-fg-muted">
                    {selectedOccurrence.timezone}
                  </span>
                </div>
              </div>

              {/* Actions: Skip, Reschedule, Complete, Calculator */}
              <div className="mt-4">
                <ResearchOccurrenceActions
                  countryCode={countryCode}
                  occurrence={selectedOccurrence}
                />
              </div>
            </div>

            <p className="mt-6 text-[11px] text-ui-fg-muted border-t border-ui-border-base pt-3">
              Schedule adjustments update your personal calendar. Supply deductions occur automatically upon dose confirmation.
            </p>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
