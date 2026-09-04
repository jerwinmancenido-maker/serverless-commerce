"use client"

import { useMemo, useState } from "react"
import type { ResearchOccurrence, ResearchTimelineEvent } from "@lib/data/research-tracking"

type Props = {
  occurrences: ResearchOccurrence[]
  today: string
  timeline?: ResearchTimelineEvent[]
}

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatLabel(dateStr: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateStr}T00:00:00.000Z`))
}

const WEEKS = 12
const DAYS = WEEKS * 7

export default function AdherenceHeatmap({ occurrences, today, timeline = [] }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; confirmed: number; total: number } | null>(null)
  const [milestoneTooltip, setMilestoneTooltip] = useState<{ weekCol: number; label: string } | null>(null)

  // Build start date (12 weeks ago, aligned to Monday)
  const startDate = useMemo(() => {
    const d = new Date(`${today}T00:00:00.000Z`)
    d.setUTCDate(d.getUTCDate() - DAYS + 1)
    // Align to Monday
    const dayOfWeek = (d.getUTCDay() + 6) % 7
    d.setUTCDate(d.getUTCDate() - dayOfWeek)
    return d.toISOString().slice(0, 10)
  }, [today])

  // Build all cell dates
  const cells = useMemo(() =>
    Array.from({ length: WEEKS * 7 }, (_, i) => addDays(startDate, i)),
    [startDate]
  )

  // Group occurrences by effective date
  const byDate = useMemo(() => {
    const map = new Map<string, { confirmed: number; total: number }>()
    occurrences.forEach((occ) => {
      const date = occ.rescheduled_local_date ?? occ.local_date
      if (date < startDate || date > today) return
      const prev = map.get(date) ?? { confirmed: 0, total: 0 }
      map.set(date, {
        confirmed: prev.confirmed + (occ.status === "confirmed" ? 1 : 0),
        total: prev.total + 1,
      })
    })
    return map
  }, [occurrences, startDate, today])

  // Month labels — find first cell of each month
  const monthLabels = useMemo(() => {
    const seen = new Set<string>()
    return cells
      .map((date, col) => {
        const m = date.slice(0, 7)
        if (seen.has(m)) return null
        seen.add(m)
        const weekCol = Math.floor(col / 7)
        const label = new Intl.DateTimeFormat("en-PH", { month: "short", timeZone: "UTC" })
          .format(new Date(`${date}T00:00:00.000Z`))
        return { weekCol, label }
      })
      .filter(Boolean) as { weekCol: number; label: string }[]
  }, [cells])

  const weekDayLabels = ["M", "W", "F"]
  const weekDayRows = [0, 2, 4] // Mon=0, Wed=2, Fri=4

  // Milestone events within the heatmap window (protocol start / dose escalation)
  const milestones = useMemo(() => {
    const relevant = timeline.filter((e) => {
      const date = e.occurred_at.slice(0, 10)
      return date >= startDate && date <= today
    })
    return relevant.map((e) => {
      const date = e.occurred_at.slice(0, 10)
      const dayIndex = Math.floor(
        (new Date(`${date}T00:00:00.000Z`).getTime() -
          new Date(`${startDate}T00:00:00.000Z`).getTime()) /
          86_400_000,
      )
      return { weekCol: Math.floor(dayIndex / 7), label: e.title, date }
    })
  }, [timeline, startDate, today])

  // Streak counter
  const { currentStreak, longestStreak, adherenceRate } = useMemo(() => {
    const pastDates = cells.filter((d) => d <= today)
    let cur = 0
    let longest = 0
    let run = 0
    let totalConfirmed = 0
    let totalScheduled = 0

    for (const date of pastDates) {
      const data = byDate.get(date)
      if (data && data.total > 0) {
        totalScheduled += data.total
        totalConfirmed += data.confirmed
        if (data.confirmed > 0) {
          run++
          if (run > longest) longest = run
        } else {
          run = 0
        }
      }
    }
    // current streak — count backwards from today
    for (let i = pastDates.length - 1; i >= 0; i--) {
      const data = byDate.get(pastDates[i])
      if (data && data.confirmed > 0) {
        cur++
      } else if (data && data.total > 0) {
        break
      }
    }
    const rate = totalScheduled > 0 ? Math.round((totalConfirmed / totalScheduled) * 100) : 0
    return { currentStreak: cur, longestStreak: longest, adherenceRate: rate }
  }, [cells, byDate, today])

  function cellColor(date: string) {
    if (date > today) return "bg-ui-bg-base border border-dashed border-ui-border-base"
    const data = byDate.get(date)
    if (!data) return "bg-ui-bg-subtle"
    if (data.total === 0) return "bg-ui-bg-subtle"
    const ratio = data.confirmed / data.total
    if (ratio >= 1) return "bg-emerald-500"
    if (ratio >= 0.5) return "bg-emerald-300"
    if (ratio > 0) return "bg-amber-300"
    return "bg-red-200"
  }

  // Reshape cells into weeks (columns of 7 days)
  const weeks = useMemo(() =>
    Array.from({ length: WEEKS }, (_, w) => cells.slice(w * 7, w * 7 + 7)),
    [cells]
  )

  return (
    <div className="space-y-3">
      {/* Month labels row — with milestone pin markers above */}
      <div style={{ display: "grid", gridTemplateColumns: `24px repeat(${WEEKS}, 1fr)` }}>
        <div />
        {Array.from({ length: WEEKS }, (_, w) => {
          const monthLabel = monthLabels.find((m) => m.weekCol === w)
          const milestonesInWeek = milestones.filter((m) => m.weekCol === w)
          return (
            <div key={w} className="relative flex flex-col items-start">
              {/* Milestone pin(s) */}
              {milestonesInWeek.map((ms, i) => (
                <button
                  key={i}
                  type="button"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  aria-label={ms.label}
                  onMouseEnter={() => setMilestoneTooltip({ weekCol: w, label: ms.label })}
                  onMouseLeave={() => setMilestoneTooltip(null)}
                  onClick={() => setMilestoneTooltip((prev) => prev?.weekCol === w ? null : { weekCol: w, label: ms.label })}
                >
                  {/* Downward triangle pin */}
                  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                    <polygon points="4,0 8,8 0,8" fill="currentColor" />
                  </svg>
                </button>
              ))}
              <span className="text-[10px] text-ui-fg-muted truncate">{monthLabel?.label ?? ""}</span>
            </div>
          )
        })}
      </div>

      {/* Milestone tooltip */}
      {milestoneTooltip && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-800 shadow-sm">
          📍 {milestoneTooltip.label}
        </div>
      )}

      {/* Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: `24px repeat(${WEEKS}, 1fr)`, gap: "2px" }}
      >
        {/* Day labels column */}
        <div className="flex flex-col justify-between" style={{ gap: "2px" }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex h-3 items-center justify-end pr-1 text-[9px] text-ui-fg-muted">
              {weekDayRows.includes(i) ? weekDayLabels[weekDayRows.indexOf(i)] : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col" style={{ gap: "2px" }}>
            {week.map((date) => {
              const data = byDate.get(date)
              return (
                <div
                  key={date}
                  className={`h-3 w-full rounded-[2px] cursor-default transition-opacity hover:opacity-75 ${cellColor(date)}`}
                  onMouseEnter={() => date <= today ? setTooltip({ date, confirmed: data?.confirmed ?? 0, total: data?.total ?? 0 }) : undefined}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Dose tooltip */}
      {tooltip && (
        <div className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-xs shadow-md">
          <span className="font-semibold text-ui-fg-base">{formatLabel(tooltip.date)}</span>
          <span className="ml-2 text-ui-fg-subtle">
            {tooltip.total === 0
              ? "No routines"
              : `${tooltip.confirmed} of ${tooltip.total} confirmed`}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-ui-fg-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {["bg-ui-bg-subtle", "bg-amber-300", "bg-emerald-300", "bg-emerald-500"].map((c) => (
            <div key={c} className={`h-3 w-3 rounded-[2px] ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Streak counter */}
      <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 p-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-bold text-indigo-600">{currentStreak}</span>
          <span className="text-[10px] text-ui-fg-muted">Current streak</span>
          <span className="text-[9px] text-ui-fg-muted">days</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-bold text-emerald-600">{longestStreak}</span>
          <span className="text-[10px] text-ui-fg-muted">Best streak</span>
          <span className="text-[9px] text-ui-fg-muted">days</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-bold text-ui-fg-base">{adherenceRate}%</span>
          <span className="text-[10px] text-ui-fg-muted">Adherence</span>
          <span className="text-[9px] text-ui-fg-muted">12 weeks</span>
        </div>
      </div>
    </div>
  )
}
