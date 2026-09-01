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

type Props = {
  configuration: ResearchPrivateRecordsConfiguration["measurements"]
  countryCode: string
  measurements: ResearchMeasurement[]
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
  trackedMaterials: TrackedResearchMaterial[]
  timeline: ResearchTimelineEvent[]
}

const initialState: ResearchTrackingActionState = { success: false, error: null }
const inputClass =
  "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base"

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-ui-fg-base px-4 py-2.5 text-sm font-medium text-ui-bg-base disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  )
}

function StateMessage({ state }: { state: ResearchTrackingActionState }) {
  if (!state.error && !state.success) return null
  return (
    <p className={`text-sm ${state.error ? "text-red-600" : "text-emerald-700"}`}>
      {state.error ?? "Saved."}
    </p>
  )
}

function TrendChart({
  summary,
  target,
}: {
  summary: ResearchMeasurementSummary
  target: number | null
}) {
  if (summary.points.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center rounded-lg bg-ui-bg-subtle text-sm text-ui-fg-subtle">
        Add at least two weight entries to see a trend.
      </div>
    )
  }
  const values = summary.points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const chartMin = target === null ? min : Math.min(min, target)
  const chartMax = target === null ? max : Math.max(max, target)
  const chartSpan = chartMax - chartMin || 1
  const points = summary.points
    .map((point, index) => {
      const x = (index / (summary.points.length - 1)) * 100
      const y = 90 - ((point.value - chartMin) / chartSpan) * 75
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="rounded-lg bg-ui-bg-subtle p-4">
      <svg viewBox="0 0 100 100" role="img" aria-label="Weight trend" className="h-52 w-full" preserveAspectRatio="none">
        <line x1="0" y1="90" x2="100" y2="90" stroke="currentColor" className="text-ui-border-base" vectorEffect="non-scaling-stroke" />
        {target !== null && (
          <line
            x1="0"
            y1={90 - ((target - chartMin) / chartSpan) * 75}
            x2="100"
            y2={90 - ((target - chartMin) / chartSpan) * 75}
            stroke="currentColor"
            className="text-emerald-600"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <polyline points={points} fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {summary.points.map((point, index) => {
          const x = (index / (summary.points.length - 1)) * 100
          const y = 90 - ((point.value - chartMin) / chartSpan) * 75
          return <circle key={point.id} cx={x} cy={y} r="1.7" className="fill-blue-600" />
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-ui-fg-muted">
        <span>{summary.points[0].date}</span>
        <span>{summary.points.at(-1)?.date}</span>
      </div>
      {target !== null && (
        <p className="mt-2 text-xs text-emerald-700">
          Dashed line: personal comparison target {target} {summary.points[0].unit}
        </p>
      )}
    </div>
  )
}

export default function Measurements(props: Props) {
  const [metric, setMetric] = useState<"weight" | "waist" | "body_fat">("weight")
  const [createState, createAction] = useActionState(createResearchMeasurementAction, initialState)
  const units = metric === "weight" ? ["kg", "lb"] : metric === "waist" ? ["cm", "in"] : ["percent"]
  const [range, setRange] = useState<"30" | "90" | "all">("90")
  const [targetText, setTargetText] = useState("")
  const cutoff = range === "all" ? null : new Date(Date.now() - Number(range) * 86_400_000)
  const filteredPoints = props.summary.points.filter(
    (point) => !cutoff || new Date(`${point.date}T23:59:59`) >= cutoff,
  )
  const filteredSummary = { ...props.summary, points: filteredPoints }
  const target = targetText.trim() && Number.isFinite(Number(targetText)) ? Number(targetText) : null
  const milestones = props.timeline
    .filter((event) => ["protocol", "routine", "measurement", "goal"].some((value) => event.type.includes(value)))
    .filter((event) => !cutoff || new Date(event.occurred_at) >= cutoff)
    .slice(0, 6)

  function exportCsv() {
    const rows = ["date,value,unit", ...filteredPoints.map((point) => `${point.date},${point.value},${point.unit}`)]
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `research-progress-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mt-10" data-testid="measurements">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Measurements & progress</h2>
        <p className="mt-1 text-sm text-ui-fg-subtle">Private numeric progress records connected to your routines and protocol history.</p>
      </div>
      {!props.runtimeReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Measurements could not be loaded.</div>
      ) : !props.configuration.available ? (
        <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">Measurements are not enabled in this environment.</div>
      ) : (
        <div className="grid gap-5 large:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            {props.summary.summary ? (
              <div className="rounded-xl border border-ui-border-base bg-white p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="text-xs font-medium">Date range
                      <select className={`mt-1 ${inputClass}`} value={range} onChange={(event) => setRange(event.target.value as typeof range)}>
                        <option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium">Comparison target (optional)
                      <input className={`mt-1 ${inputClass}`} inputMode="decimal" value={targetText} onChange={(event) => setTargetText(event.target.value)} placeholder={props.summary.summary.current_value.toString()} />
                    </label>
                  </div>
                  <button type="button" onClick={exportCsv} className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-xs font-medium">Export CSV</button>
                </div>
                <div className="grid grid-cols-2 gap-3 medium:grid-cols-4">
                  {[
                    ["Current", props.summary.summary.current_value],
                    ["Change", props.summary.summary.absolute_change],
                    ["Lowest", props.summary.summary.lowest_value],
                    ["Entries", props.summary.summary.measurement_count],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-ui-bg-subtle p-3">
                      <p className="text-xs text-ui-fg-muted">{label}</p>
                      <p className="mt-1 text-lg font-semibold">{value}{label !== "Entries" ? ` ${props.summary.summary?.normalized_unit}` : ""}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4"><TrendChart summary={filteredSummary} target={target} /></div>
                {milestones.length > 0 && (
                  <div className="mt-4 border-t border-ui-border-base pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">Timeline markers</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {milestones.map((event) => <span key={event.id} className="rounded-full bg-ui-bg-subtle px-3 py-1 text-xs">{new Date(event.occurred_at).toLocaleDateString("en-PH")} · {event.title}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : <TrendChart summary={filteredSummary} target={target} />}
            <div className="rounded-xl border border-ui-border-base bg-white p-5">
              <h3 className="font-semibold">Recent entries</h3>
              <div className="mt-3 divide-y divide-ui-border-base">
                {props.measurements.length ? props.measurements.map((measurement) => (
                  <MeasurementRow key={measurement.measurement_entry_id} measurement={measurement} countryCode={props.countryCode} submissionKey={props.submissionKeys.byEntry[measurement.measurement_entry_id] ?? ""} />
                )) : <p className="py-4 text-sm text-ui-fg-subtle">No measurements yet.</p>}
              </div>
            </div>
          </div>
          <form action={createAction} className="h-fit space-y-4 rounded-xl border border-ui-border-base bg-white p-5">
            <input type="hidden" name="country_code" value={props.countryCode} />
            <input type="hidden" name="idempotency_key" value={props.submissionKeys.create} />
            <h3 className="font-semibold">Record measurement</h3>
            <label className="block text-sm font-medium">Metric
              <select name="metric_type" value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)} className={`mt-1 ${inputClass}`}>
                <option value="weight">Weight</option><option value="waist">Waist circumference</option><option value="body_fat">Body-fat percentage</option>
              </select>
            </label>
            <div className="grid grid-cols-[1fr_8rem] gap-2">
              <label className="text-sm font-medium">Value<input name="value" inputMode="decimal" required className={`mt-1 ${inputClass}`} /></label>
              <label className="text-sm font-medium">Unit<select name="unit" key={metric} className={`mt-1 ${inputClass}`}>{units.map((unit) => <option key={unit} value={unit}>{unit === "percent" ? "%" : unit}</option>)}</select></label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-medium">Date<input type="date" name="local_date" required className={`mt-1 ${inputClass}`} /></label>
              <label className="text-sm font-medium">Time<input type="time" name="local_time" required className={`mt-1 ${inputClass}`} /></label>
            </div>
            <label className="block text-sm font-medium">Routine (optional)<select name="routine_id" className={`mt-1 ${inputClass}`}><option value="">No routine</option>{props.routines.map((routine) => <option key={routine.routine_id} value={routine.routine_id}>{routine.current_revision.label}</option>)}</select></label>
            <label className="block text-sm font-medium">Note (optional)<textarea name="note" rows={3} className={`mt-1 ${inputClass}`} /></label>
            <StateMessage state={createState} /><SubmitButton>Save measurement</SubmitButton>
          </form>
        </div>
      )}
    </section>
  )
}

function MeasurementRow({ measurement, countryCode, submissionKey }: { measurement: ResearchMeasurement; countryCode: string; submissionKey: string }) {
  const [state, action] = useActionState(transitionResearchMeasurementAction, initialState)
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div><p className="text-sm font-medium">{measurement.current_revision.original_value} {measurement.current_revision.original_unit}</p><p className="text-xs text-ui-fg-muted">{measurement.metric_type.replace("_", " ")} · {measurement.current_revision.local_date} · revision {measurement.current_revision.revision_number}</p></div>
      <form action={action}>
        <input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="idempotency_key" value={submissionKey} /><input type="hidden" name="measurement_entry_id" value={measurement.measurement_entry_id} /><input type="hidden" name="expected_revision_id" value={measurement.current_revision.revision_id} /><input type="hidden" name="operation" value={measurement.status === "voided" ? "restore" : "void"} />
        <button className="text-xs underline" type="submit">{measurement.status === "voided" ? "Restore" : "Void"}</button>
        <StateMessage state={state} />
      </form>
    </div>
  )
}
