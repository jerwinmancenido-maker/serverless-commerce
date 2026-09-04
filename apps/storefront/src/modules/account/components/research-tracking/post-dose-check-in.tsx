"use client"

import {
  createResearchJournalEntryAction,
  createResearchMeasurementAction,
  type ResearchJournalEntry,
  type ResearchMeasurement,
  type ResearchOccurrence,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import { createResearchSubmissionKey } from "@lib/research-tracking-idempotency"
import { useActionState, useCallback, useState } from "react"
import { useFormStatus } from "react-dom"

type PostDoseCheckInProps = {
  countryCode: string
  occurrence: ResearchOccurrence
  routine: ResearchRoutine | undefined
  log?: ResearchRoutineLog | null
  today: string
  timezone?: string
  measurements?: ResearchMeasurement[]
  journalEntries?: ResearchJournalEntry[]
  initialMeasurementKey?: string
  initialJournalKey?: string
  onClose?: () => void
}

type CheckInTab = "measurement" | "journal"
type MetricType = "weight" | "waist" | "body_fat"

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

function createClientSubmissionKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    return `checkin-${Date.now()}`
  }
  return createResearchSubmissionKey(() => globalThis.crypto.randomUUID())
}

function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? "Saving..." : children}
    </button>
  )
}

function MetricSvg({ metric }: { metric: MetricType }) {
  if (metric === "weight") {
    return (
      <svg
        className="h-3.5 w-3.5"
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
        className="h-3.5 w-3.5"
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
      </svg>
    )
  }
  return (
    <svg
      className="h-3.5 w-3.5"
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

export default function PostDoseCheckIn({
  countryCode,
  occurrence,
  routine,
  log,
  today,
  timezone = "Asia/Manila",
  measurements,
  journalEntries,
  initialMeasurementKey,
  initialJournalKey,
  onClose,
}: PostDoseCheckInProps) {
  const [activeTab, setActiveTab] = useState<CheckInTab>("measurement")
  const [metric, setMetric] = useState<MetricType>("weight")
  const [unit, setUnit] = useState<string>("kg")
  const [dismissed, setDismissed] = useState(false)

  const [measurementKey, setMeasurementKey] = useState(
    () => initialMeasurementKey ?? createClientSubmissionKey(),
  )
  const [journalKey, setJournalKey] = useState(
    () => initialJournalKey ?? createClientSubmissionKey(),
  )

  const [measurementState, measurementAction] = useActionState(
    createResearchMeasurementAction,
    initialState,
  )
  const [journalState, journalAction] = useActionState(
    createResearchJournalEntryAction,
    initialState,
  )

  const rotateMeasurementKey = useCallback(() => {
    setMeasurementKey(createClientSubmissionKey())
  }, [])

  const rotateJournalKey = useCallback(() => {
    setJournalKey(createClientSubmissionKey())
  }, [])

  if (dismissed) {
    return (
      <div className="mt-3 flex items-center justify-between rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 px-4 py-2.5 text-xs text-ui-fg-muted">
        <span>Post-dose check-in minimized.</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
        >
          Reopen check-in
        </button>
      </div>
    )
  }

  const existingMeasurement = measurements?.find(
    (m) =>
      m.status === "active" &&
      m.current_revision.local_date === today &&
      (m.current_revision.routine_id === occurrence.routine_id ||
        (log && m.current_revision.routine_log_id === log.log_id)),
  )

  const existingJournal = journalEntries?.find(
    (j) =>
      j.status === "active" &&
      j.current_revision.local_date === today &&
      (j.current_revision.routine_id === occurrence.routine_id ||
        (log && j.current_revision.confirmed_log_id === log.log_id)),
  )

  const currentTime = new Date().toTimeString().slice(0, 5)
  const effectiveTime =
    occurrence.rescheduled_local_time ?? occurrence.local_time ?? currentTime

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-white to-white p-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-ui-fg-base">
              Dose Administered · Post-Dose Check-In
            </h4>
            <p className="mt-0.5 text-[11px] text-ui-fg-muted">
              Auto-linked to {routine?.tracked_material_label ?? "routine"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            onClose?.()
          }}
          className="text-xs text-ui-fg-muted hover:text-ui-fg-base"
        >
          Dismiss
        </button>
      </div>

      {/* Existing records indicator */}
      {(existingMeasurement || existingJournal) && (
        <div className="mb-3 space-y-1.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 text-xs text-emerald-800">
          {existingMeasurement && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>Already logged:</span>
              <span>
                {existingMeasurement.current_revision.original_value}{" "}
                {existingMeasurement.current_revision.original_unit} (
                {existingMeasurement.metric_type})
              </span>
            </div>
          )}
          {existingJournal && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="font-medium">Observation note:</span>
              <span className="italic truncate max-w-xs">
                &ldquo;{existingJournal.current_revision.note}&rdquo;
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab pill switcher */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("measurement")}
          className={`inline-flex items-center justify-center rounded-lg px-3 py-2 min-h-[40px] font-medium transition-all text-center touch-manipulation ${
            activeTab === "measurement"
              ? "bg-white font-semibold text-ui-fg-base shadow-2xs"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
        >
          Log Weight / Metric
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("journal")}
          className={`inline-flex items-center justify-center rounded-lg px-3 py-2 min-h-[40px] font-medium transition-all text-center touch-manipulation ${
            activeTab === "journal"
              ? "bg-white font-semibold text-ui-fg-base shadow-2xs"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
        >
          Quick Observation Note
        </button>
      </div>

      {/* Measurement Mode */}
      {activeTab === "measurement" && (
        <form
          action={async (formData) => {
            await measurementAction(formData)
            rotateMeasurementKey()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="country_code" value={countryCode} />
          <input type="hidden" name="idempotency_key" value={measurementKey} />
          <input type="hidden" name="metric_type" value={metric} />
          <input type="hidden" name="unit" value={unit} />
          <input type="hidden" name="local_date" value={today} />
          <input type="hidden" name="local_time" value={effectiveTime} />
          <input type="hidden" name="routine_id" value={occurrence.routine_id} />
          <input
            type="hidden"
            name="tracked_material_id"
            value={routine?.tracked_material_id ?? ""}
          />
          {log?.log_id && (
            <input type="hidden" name="routine_log_id" value={log.log_id} />
          )}
          <input type="hidden" name="source" value="customer" />

          {/* Metric switcher pills */}
          <div className="flex flex-wrap gap-1.5">
            {(["weight", "waist", "body_fat"] as MetricType[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMetric(m)
                  setUnit(
                    m === "weight" ? "kg" : m === "waist" ? "cm" : "percent",
                  )
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 min-h-[38px] text-xs font-medium transition-all touch-manipulation ${
                  metric === m
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-ui-border-base bg-white text-ui-fg-subtle hover:bg-ui-bg-subtle"
                }`}
              >
                <MetricSvg metric={m} />
                <span className="capitalize">{m.replace("_", " ")}</span>
              </button>
            ))}
          </div>

          {/* Input & Unit */}
          <div className="grid grid-cols-[1fr_84px] gap-2">
            <input
              name="value"
              type="number"
              step="any"
              inputMode="decimal"
              placeholder={`Enter today's ${metric}...`}
              required
              className="w-full rounded-xl border border-ui-border-base bg-white px-3.5 py-2.5 min-h-[44px] text-base sm:text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-xl border border-ui-border-base bg-white px-2 py-2.5 min-h-[44px] text-base sm:text-xs font-medium outline-none focus:border-indigo-500"
            >
              {metric === "weight" && (
                <>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </>
              )}
              {metric === "waist" && (
                <>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </>
              )}
              {metric === "body_fat" && <option value="percent">%</option>}
            </select>
          </div>

          <input
            name="note"
            type="text"
            placeholder="Optional check-in note (e.g. morning fasted)"
            className="w-full rounded-xl border border-ui-border-base bg-white px-3.5 py-2.5 min-h-[44px] text-base sm:text-xs outline-none focus:border-indigo-500"
          />

          {measurementState.error && (
            <p className="text-xs text-rose-600">{measurementState.error}</p>
          )}
          {measurementState.success && (
            <p className="text-xs font-medium text-emerald-700">
              Measurement saved and linked to this dose.
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <span className="text-[11px] text-ui-fg-muted">
              Records will appear in your Progress chart.
            </span>
            <SubmitButton className="w-full sm:w-auto">Save & Link to Dose</SubmitButton>
          </div>
        </form>
      )}

      {/* Journal Mode */}
      {activeTab === "journal" && (
        <form
          action={async (formData) => {
            await journalAction(formData)
            rotateJournalKey()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="country_code" value={countryCode} />
          <input type="hidden" name="idempotency_key" value={journalKey} />
          <input type="hidden" name="local_date" value={today} />
          <input type="hidden" name="local_time" value={effectiveTime} />
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="routine_id" value={occurrence.routine_id} />
          <input
            type="hidden"
            name="tracked_material_id"
            value={routine?.tracked_material_id ?? ""}
          />
          {log?.supply_id && (
            <input type="hidden" name="supply_id" value={log.supply_id} />
          )}
          {log?.log_id && (
            <input type="hidden" name="confirmed_log_id" value={log.log_id} />
          )}
          <input type="hidden" name="title" value={`Check-in: ${occurrence.label}`} />
          <input type="hidden" name="confirmed" value="on" />

          <textarea
            name="note"
            rows={3}
            required
            maxLength={2000}
            placeholder="How did the dose feel? Note injection site, tolerance, or research observations..."
            className="w-full resize-y rounded-xl border border-ui-border-base bg-white p-3 min-h-[100px] text-base sm:text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {journalState.error && (
            <p className="text-xs text-rose-600">{journalState.error}</p>
          )}
          {journalState.success && (
            <p className="text-xs font-medium text-emerald-700">
              Journal note saved and linked to this dose.
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <span className="text-[11px] text-ui-fg-muted">
              Note will appear in your Research Journal.
            </span>
            <SubmitButton className="w-full sm:w-auto">Save Journal Observation</SubmitButton>
          </div>
        </form>
      )}
    </div>
  )
}
