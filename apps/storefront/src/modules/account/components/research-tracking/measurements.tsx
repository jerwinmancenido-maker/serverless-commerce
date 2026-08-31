"use client"

import {
  createResearchMeasurementAction,
  recordResearchMeasurementConsentAction,
  transitionResearchMeasurementAction,
  type ResearchMeasurement,
  type ResearchMeasurementSummary,
  type ResearchPrivateRecordsConfiguration,
  type ResearchProfile,
  type ResearchProtocolAccess,
  type ResearchRoutine,
  type ResearchTrackingActionState,
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

function TrendChart({ summary }: { summary: ResearchMeasurementSummary }) {
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
  const span = max - min || 1
  const points = summary.points
    .map((point, index) => {
      const x = (index / (summary.points.length - 1)) * 100
      const y = 90 - ((point.value - min) / span) * 75
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="rounded-lg bg-ui-bg-subtle p-4">
      <svg viewBox="0 0 100 100" role="img" aria-label="Weight trend" className="h-52 w-full" preserveAspectRatio="none">
        <line x1="0" y1="90" x2="100" y2="90" stroke="currentColor" className="text-ui-border-base" vectorEffect="non-scaling-stroke" />
        <polyline points={points} fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {summary.points.map((point, index) => {
          const x = (index / (summary.points.length - 1)) * 100
          const y = 90 - ((point.value - min) / span) * 75
          return <circle key={point.id} cx={x} cy={y} r="1.7" className="fill-blue-600" />
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-ui-fg-muted">
        <span>{summary.points[0].date}</span>
        <span>{summary.points.at(-1)?.date}</span>
      </div>
    </div>
  )
}

function Consent({ configuration, countryCode, submissionKey }: Pick<Props, "configuration" | "countryCode"> & { submissionKey: string }) {
  const [state, action] = useActionState(recordResearchMeasurementConsentAction, initialState)
  return (
    <form action={action} className="space-y-4 rounded-xl border border-ui-border-base bg-white p-5">
      <input type="hidden" name="country_code" value={countryCode} />
      <input type="hidden" name="idempotency_key" value={submissionKey} />
      <input type="hidden" name="measurement_consent_version" value={configuration.consent_version ?? ""} />
      <h3 className="font-semibold">Turn on Measurements</h3>
      <p className="text-sm leading-6 text-ui-fg-subtle">
        Record weight, waist circumference, and body-fat percentage in your private profile.
      </p>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="accepted" required className="mt-1" />
        <span>
          I reviewed and accept the Measurements notice.
          {configuration.notice_url ? <a className="ml-1 underline" href={configuration.notice_url} target="_blank" rel="noreferrer">Read notice</a> : null}
        </span>
      </label>
      <StateMessage state={state} />
      <SubmitButton>Enable measurements</SubmitButton>
    </form>
  )
}

export default function Measurements(props: Props) {
  const [metric, setMetric] = useState<"weight" | "waist" | "body_fat">("weight")
  const [createState, createAction] = useActionState(createResearchMeasurementAction, initialState)
  const units = metric === "weight" ? ["kg", "lb"] : metric === "waist" ? ["cm", "in"] : ["percent"]
  const currentConsent = props.configuration.current_consent?.is_current

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
      ) : !currentConsent ? (
        <Consent configuration={props.configuration} countryCode={props.countryCode} submissionKey={props.submissionKeys.consent} />
      ) : (
        <div className="grid gap-5 large:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            {props.summary.summary ? (
              <div className="rounded-xl border border-ui-border-base bg-white p-5">
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
                <div className="mt-4"><TrendChart summary={props.summary} /></div>
              </div>
            ) : <TrendChart summary={props.summary} />}
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
