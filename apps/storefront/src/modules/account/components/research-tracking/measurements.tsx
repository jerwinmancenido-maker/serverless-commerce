"use client"

import {
  createResearchMeasurementAction,
  transitionResearchMeasurementAction,
  type ResearchMeasurement,
  type ResearchMeasurementSummary,
  type ResearchPrivateRecordsConfiguration,
  type ResearchProfile,
  type ResearchProtocolAccess,
  type ResearchRoutine,
  type ResearchTrackingActionState,
  type ResearchTimelineEvent,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import AdherenceHeatmap from "./adherence-heatmap"
import type { ResearchOccurrence } from "@lib/data/research-tracking"

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  configuration: ResearchPrivateRecordsConfiguration["measurements"]
  countryCode: string
  measurements: ResearchMeasurement[]
  occurrences?: ResearchOccurrence[]
  profile: ResearchProfile
  protocols: ResearchProtocolAccess[]
  routines: ResearchRoutine[]
  runtimeReady: boolean
  submissionKeys: {
    consent: string
    create: string
    byEntry: Record<string, string>
  }
  summary: ResearchMeasurementSummary
  today?: string
  trackedMaterials: TrackedResearchMaterial[]
  timeline: ResearchTimelineEvent[]
}

type Metric = "weight" | "waist" | "body_fat"
type Range = "30" | "90" | "all"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initialState: ResearchTrackingActionState = { success: false, error: null }

const METRIC_LABELS: Record<Metric, string> = {
  weight: "Weight",
  waist: "Waist",
  body_fat: "Body Fat",
}

function MetricIcon({
  metric,
  className = "h-4 w-4",
}: {
  metric: Metric
  className?: string
}) {
  if (metric === "weight") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    )
  }
  if (metric === "waist") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z" />
        <path d="m14.5 5.5-2.5 2.5" />
        <path d="m11.5 8.5-1.5 1.5" />
        <path d="m8.5 11.5-2.5 2.5" />
      </svg>
    )
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateStr}T12:00:00`))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-ui-fg-base py-3 text-sm font-semibold text-ui-bg-base transition-opacity disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  )
}

function StateMessage({ state }: { state: ResearchTrackingActionState }) {
  if (!state.error && !state.success) return null
  return (
    <p
      aria-live="polite"
      className={`text-sm ${state.error ? "text-rose-600" : "text-emerald-700"}`}
    >
      {state.error ?? "Saved successfully."}
    </p>
  )
}

// Hero delta chip
function DeltaChip({
  label,
  value,
  unit,
  favorable,
}: {
  label: string
  value: number | null
  unit: string
  favorable: "down" | "up" | "neutral"
}) {
  if (value === null) return null
  const isGood =
    favorable === "down" ? value < 0 : favorable === "up" ? value > 0 : false
  const isBad =
    favorable === "down" ? value > 0 : favorable === "up" ? value < 0 : false
  const color = isGood
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isBad
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base"
  const arrow = isGood ? "↓" : isBad ? "↑" : "—"
  const sign = value > 0 ? "+" : ""

  return (
    <div
      className={`flex flex-col rounded-2xl border px-4 py-3 ${color} min-w-[120px]`}
    >
      <span className="text-xs font-medium opacity-70">{label}</span>
      <span className="mt-1 text-xl font-bold leading-tight">
        {arrow} {sign}{Math.abs(value).toFixed(1)}
        <span className="ml-1 text-sm font-normal opacity-70">{unit}</span>
      </span>
    </div>
  )
}

// Stat tile
function StatTile({
  label,
  value,
  unit,
}: {
  label: string
  value: number | string
  unit?: string
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-ui-bg-subtle px-5 py-4">
      <span className="text-xs font-medium text-ui-fg-muted">{label}</span>
      <span className="mt-1 text-2xl font-bold text-ui-fg-base">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-ui-fg-subtle">
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}

// Metric switcher pills
function MetricSwitcher({
  active,
  available,
  onChange,
}: {
  active: Metric
  available: Metric[]
  onChange: (m: Metric) => void
}) {
  if (available.length <= 1) return null
  return (
    <div className="inline-flex gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1">
      {available.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            m === active
              ? "bg-white text-ui-fg-base shadow-sm"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <MetricIcon metric={m} className="h-3.5 w-3.5" />
            <span>{METRIC_LABELS[m]}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

// Modern area + line chart
function TrendChart({
  summary,
  target,
  confirmedDates,
}: {
  summary: ResearchMeasurementSummary
  target: number | null
  confirmedDates: Set<string>
}) {
  const pts = summary.points

  if (pts.length < 2) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-ui-bg-subtle to-ui-bg-base">
        {/* Empty state illustration */}
        <svg
          className="h-14 w-14 text-ui-fg-muted opacity-40"
          fill="none"
          viewBox="0 0 64 64"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M8 48 L20 32 L30 38 L44 18 L56 24" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="56" cy="24" r="3" fill="currentColor" />
        </svg>
        <p className="text-sm font-medium text-ui-fg-subtle">
          {pts.length === 0
            ? "Log your first measurement to begin tracking."
            : "Log one more entry to see your trend."}
        </p>
      </div>
    )
  }

  const values = pts.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const chartMin = target === null ? min : Math.min(min, target)
  const chartMax = target === null ? max : Math.max(max, target)
  const span = chartMax - chartMin || 1

  const toXY = (value: number, index: number) => {
    const x = (index / (pts.length - 1)) * 96 + 2
    const y = 90 - ((value - chartMin) / span) * 78
    return { x, y }
  }

  const linePoints = pts
    .map((p, i) => {
      const { x, y } = toXY(p.value, i)
      return `${x},${y}`
    })
    .join(" ")

  const { x: x0, y: y0 } = toXY(pts[0].value, 0)
  const { x: xN } = toXY(pts[pts.length - 1].value, pts.length - 1)
  const areaPath = `M ${x0},${y0} ${pts.slice(1).map((p, i) => { const { x, y } = toXY(p.value, i + 1); return `L ${x},${y}` }).join(" ")} L ${xN},92 L ${x0},92 Z`

  const targetY =
    target !== null ? 90 - ((target - chartMin) / span) * 78 : null

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white p-1">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label="Measurement trend"
        className="h-56 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Baseline */}
        <line
          x1="0"
          y1="92"
          x2="100"
          y2="92"
          stroke="currentColor"
          className="text-ui-border-base"
          vectorEffect="non-scaling-stroke"
        />

        {/* Target reference line */}
        {targetY !== null && (
          <line
            x1="0"
            y1={targetY}
            x2="100"
            y2={targetY}
            stroke="#10b981"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Trend line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points — green if confirmed dose that day, indigo otherwise */}
        {pts.map((point, index) => {
          const { x, y } = toXY(point.value, index)
          const isDoseDay = confirmedDates.has(point.date)
          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r="2.2"
              fill={isDoseDay ? "#22c55e" : "#6366f1"}
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {formatDate(point.date)}: {point.value} {point.unit}
                {isDoseDay ? " · ✅ Dose confirmed" : ""}
              </title>
            </circle>
          )
        })}
      </svg>

      {/* X-axis labels */}
      <div className="mt-1 flex justify-between px-2 text-[10px] text-ui-fg-muted">
        <span>{formatDate(pts[0].date)}</span>
        <span>{formatDate(pts[pts.length - 1].date)}</span>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 px-2 text-[10px] text-ui-fg-muted">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
          Measurement
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Dose day
        </div>
        {target !== null && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 border-t-2 border-dashed border-emerald-500" />
            Target
          </div>
        )}
      </div>
    </div>
  )
}

// Void confirmation for a measurement row
function MeasurementRow({
  measurement,
  countryCode,
  submissionKey,
  routines,
  trackedMaterials,
}: {
  measurement: ResearchMeasurement
  countryCode: string
  submissionKey: string
  routines: ResearchRoutine[]
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const [state, action] = useActionState(
    transitionResearchMeasurementAction,
    initialState,
  )
  const [confirming, setConfirming] = useState(false)
  const rev = measurement.current_revision
  const isVoided = measurement.status === "voided"

  const linkedRoutine = routines.find((r) => r.routine_id === rev.routine_id)
  const linkedMaterial = trackedMaterials.find(
    (m) => m.tracked_material_id === rev.tracked_material_id,
  )

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border border-ui-border-base px-4 py-3 transition-opacity ${
        isVoided ? "opacity-50" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
          <MetricIcon metric={measurement.metric_type as Metric} className="h-4 w-4" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">
              {rev.original_value}{" "}
              <span className="font-normal text-ui-fg-muted">{rev.original_unit}</span>
            </p>
            {isVoided && (
              <span className="rounded-md bg-ui-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-ui-fg-muted">
                Voided
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ui-fg-muted">
            {METRIC_LABELS[measurement.metric_type as Metric]} ·{" "}
            {formatDate(rev.local_date)} · rev {rev.revision_number}
          </p>
          {(linkedMaterial || linkedRoutine) && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {linkedMaterial && (
                <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                  Compound: {linkedMaterial.label}
                </span>
              )}
              {linkedRoutine && (
                <span className="inline-flex items-center rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                  Routine: {linkedRoutine.current_revision.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {confirming ? (
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs text-ui-fg-subtle">
              {isVoided ? "Restore this entry?" : "Void this entry?"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium"
              >
                Cancel
              </button>
              <form action={action}>
                <input type="hidden" name="country_code" value={countryCode} />
                <input type="hidden" name="idempotency_key" value={submissionKey} />
                <input
                  type="hidden"
                  name="measurement_entry_id"
                  value={measurement.measurement_entry_id}
                />
                <input
                  type="hidden"
                  name="expected_revision_id"
                  value={rev.revision_id}
                />
                <input
                  type="hidden"
                  name="operation"
                  value={isVoided ? "restore" : "void"}
                />
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                    isVoided
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isVoided ? "Restore" : "Void"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`text-xs underline underline-offset-2 ${
              isVoided ? "text-indigo-600" : "text-ui-fg-muted hover:text-rose-600"
            }`}
          >
            {isVoided ? "Restore" : "Void"}
          </button>
        )}
        <StateMessage state={state} />
      </div>
    </div>
  )
}

// Inline log form — triggered by button, not always visible
function InlineLogForm({
  countryCode,
  routines,
  submissionKeys,
  onClose,
}: {
  countryCode: string
  routines: ResearchRoutine[]
  submissionKeys: { create: string }
  onClose: () => void
}) {
  const [metric, setMetric] = useState<Metric>("weight")
  const [state, action] = useActionState(createResearchMeasurementAction, initialState)
  const units =
    metric === "weight" ? ["kg", "lb"] : metric === "waist" ? ["cm", "in"] : ["percent"]

  const now = new Date()
  const localDate = now.toISOString().slice(0, 10)
  const localTime = now.toTimeString().slice(0, 5)

  const inputCls =
    "w-full rounded-xl border border-ui-border-base bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-4">
        <h3 className="font-semibold text-ui-fg-base">Log a Measurement</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ui-fg-muted hover:bg-ui-bg-subtle"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <form action={action} className="space-y-4 p-5">
        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="idempotency_key" value={submissionKeys.create} />

        {/* Metric switcher pills inside form */}
        <div>
          <p className="mb-2 text-xs font-medium text-ui-fg-muted">What are you logging?</p>
          <div className="flex flex-wrap gap-2">
            {(["weight", "waist", "body_fat"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                  m === metric
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-ui-border-base bg-white text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                <MetricIcon metric={m} className="h-4 w-4" />
                <span>{METRIC_LABELS[m]}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="metric_type" value={metric} />
        </div>

        {/* Value + unit */}
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <label className="text-sm font-medium text-ui-fg-subtle">
            Value
            <input
              name="value"
              inputMode="decimal"
              required
              placeholder="0.0"
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
          <label className="text-sm font-medium text-ui-fg-subtle">
            Unit
            <select name="unit" key={metric} className={`mt-1.5 ${inputCls}`}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u === "percent" ? "%" : u}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Date + time (pre-filled) */}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-ui-fg-subtle">
            Date
            <input
              type="date"
              name="local_date"
              required
              defaultValue={localDate}
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
          <label className="text-sm font-medium text-ui-fg-subtle">
            Time
            <input
              type="time"
              name="local_time"
              required
              defaultValue={localTime}
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
        </div>

        {/* Routine link */}
        {routines.length > 0 && (
          <label className="block text-sm font-medium text-ui-fg-subtle">
            Link to routine (optional)
            <select name="routine_id" className={`mt-1.5 ${inputCls}`}>
              <option value="">No routine</option>
              {routines.map((r) => (
                <option key={r.routine_id} value={r.routine_id}>
                  {r.current_revision.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Note */}
        <label className="block text-sm font-medium text-ui-fg-subtle">
          Note (optional)
          <textarea
            name="note"
            rows={2}
            placeholder="How are you feeling today?"
            className={`mt-1.5 resize-none ${inputCls}`}
          />
        </label>

        <StateMessage state={state} />
        <SubmitButton>Save Measurement</SubmitButton>
      </form>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Measurements(props: Props) {
  const [metric, setMetric] = useState<Metric>("weight")
  const [range, setRange] = useState<Range>("90")
  const [targetText, setTargetText] = useState("")
  const [showLogForm, setShowLogForm] = useState(false)

  const cutoff =
    range === "all"
      ? null
      : new Date(Date.now() - Number(range) * 86_400_000)

  const filteredPoints = props.summary.points.filter(
    (p) => !cutoff || new Date(`${p.date}T23:59:59`) >= cutoff,
  )
  const filteredSummary = { ...props.summary, points: filteredPoints }

  const target =
    targetText.trim() && Number.isFinite(Number(targetText))
      ? Number(targetText)
      : null

  // Build set of dates with confirmed dose occurrences for dot coloring
  const confirmedDates = new Set<string>(
    (props.occurrences ?? [])
      .filter((o) => o.status === "confirmed")
      .map((o) => o.rescheduled_local_date ?? o.local_date),
  )

  // Protocol start date from protocols
  const startDate =
    props.protocols.length > 0
      ? props.protocols
          .map((p) => p.granted_at)
          .sort()[0]
          ?.slice(0, 10)
      : null

  const daysActive = startDate
    ? Math.floor(
        (Date.now() - new Date(`${startDate}T00:00:00`).getTime()) /
          86_400_000,
      )
    : null

  const s = props.summary.summary

  // Available metrics based on configuration
  const availableMetrics: Metric[] = (
    props.configuration.supported_metrics?.map((m) => m.key) ?? ["weight"]
  ) as Metric[]

  function exportCsv() {
    const rows = [
      "date,value,unit",
      ...filteredPoints.map((p) => `${p.date},${p.value},${p.unit}`),
    ]
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `research-progress-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!props.runtimeReady) {
    return (
      <section className="mt-10" data-testid="measurements">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Measurements could not be loaded. Please refresh the page.
        </div>
      </section>
    )
  }

  if (!props.configuration.available) {
    return (
      <section className="mt-10" data-testid="measurements">
        <div className="rounded-2xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">
          Measurements are not enabled in this environment.
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 space-y-6" data-testid="measurements">

      {/* ── Hero stat card ─────────────────────────────────────────── */}
      {s && (
        <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white">
          <div className="border-b border-ui-border-base bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
                  Progress Summary
                </p>
                <p className="mt-1 text-2xl font-bold text-ui-fg-base">
                  {s.current_value}{" "}
                  <span className="text-base font-normal text-ui-fg-muted">
                    {s.normalized_unit}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ui-fg-muted">
                  Current {METRIC_LABELS[metric]}
                  {startDate && ` · tracking since ${formatDate(startDate)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {daysActive !== null && (
                  <StatTile label="Days active" value={daysActive} />
                )}
                <StatTile
                  label="Entries logged"
                  value={s.measurement_count}
                />
              </div>
            </div>
          </div>

          {/* Delta chips */}
          <div className="flex flex-wrap gap-3 px-6 py-4">
            <DeltaChip
              label="Total change"
              value={s.absolute_change}
              unit={s.normalized_unit}
              favorable="down"
            />
            <DeltaChip
              label="% change"
              value={s.percentage_change}
              unit="%"
              favorable="down"
            />
            <DeltaChip
              label="Avg per week"
              value={s.average_weekly_change}
              unit={s.normalized_unit}
              favorable="down"
            />
            <div className="flex flex-col rounded-2xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3 min-w-[120px]">
              <span className="text-xs font-medium text-ui-fg-muted">Lowest recorded</span>
              <span className="mt-1 text-xl font-bold text-ui-fg-base">
                {s.lowest_value}
                <span className="ml-1 text-sm font-normal text-ui-fg-muted">
                  {s.normalized_unit}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Chart card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-ui-border-base bg-white p-5">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <MetricSwitcher
              active={metric}
              available={availableMetrics}
              onChange={setMetric}
            />
            {/* Range switcher */}
            <div className="inline-flex gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1">
              {(["30", "90", "all"] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    r === range
                      ? "bg-white text-ui-fg-base shadow-sm"
                      : "text-ui-fg-subtle hover:text-ui-fg-base"
                  }`}
                >
                  {r === "all" ? "All time" : `${r}d`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              placeholder="Target…"
              className="w-24 rounded-xl border border-ui-border-base bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium hover:bg-ui-bg-subtle"
            >
              Export CSV
            </button>
          </div>
        </div>

        <TrendChart
          summary={filteredSummary}
          target={target}
          confirmedDates={confirmedDates}
        />
      </div>

      {/* ── Adherence heatmap card ──────────────────────────────────── */}
      {props.occurrences && props.occurrences.length > 0 && props.today && (
        <div className="rounded-2xl border border-ui-border-base bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
                Dose Adherence
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-ui-fg-base">
                12-week heatmap
              </h3>
            </div>
          </div>
          <AdherenceHeatmap
            occurrences={props.occurrences}
            today={props.today}
          />
        </div>
      )}

      {/* ── Log measurement button / inline form ───────────────────── */}
      {!showLogForm ? (
        <button
          type="button"
          onClick={() => setShowLogForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ui-border-base py-4 text-sm font-medium text-ui-fg-subtle transition-colors hover:border-indigo-400 hover:text-indigo-600"
        >
          <span className="text-lg">+</span> Log a Measurement
        </button>
      ) : (
        <InlineLogForm
          countryCode={props.countryCode}
          routines={props.routines}
          submissionKeys={props.submissionKeys}
          onClose={() => setShowLogForm(false)}
        />
      )}

      {/* ── Recent entries ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-ui-border-base bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-ui-fg-base">Recent Entries</h3>
          <span className="rounded-full bg-ui-bg-subtle px-2.5 py-0.5 text-xs text-ui-fg-muted">
            {props.measurements.length} record{props.measurements.length !== 1 ? "s" : ""}
          </span>
        </div>

        {props.measurements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <svg
              className="h-12 w-12 text-indigo-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <p className="text-sm text-ui-fg-subtle">
              No measurements logged yet.
            </p>
            <button
              type="button"
              onClick={() => setShowLogForm(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Log your first entry →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {props.measurements.map((m) => (
              <MeasurementRow
                key={m.measurement_entry_id}
                measurement={m}
                countryCode={props.countryCode}
                submissionKey={
                  props.submissionKeys.byEntry[m.measurement_entry_id] ?? ""
                }
                routines={props.routines}
                trackedMaterials={props.trackedMaterials}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Timeline markers ───────────────────────────────────────── */}
      {props.timeline.length > 0 && (() => {
        const milestones = props.timeline
          .filter((e) =>
            ["protocol", "routine", "measurement", "goal"].some((v) =>
              e.type.includes(v),
            ),
          )
          .slice(0, 8)
        if (milestones.length === 0) return null
        return (
          <div className="rounded-2xl border border-ui-border-base bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
              Protocol Timeline
            </p>
            <ol className="space-y-3">
              {milestones.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                  <div>
                    <p className="text-sm font-medium capitalize text-ui-fg-base">
                      {event.title}
                    </p>
                    <time className="text-xs text-ui-fg-muted">
                      {new Date(event.occurred_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )
      })()}
    </section>
  )
}
