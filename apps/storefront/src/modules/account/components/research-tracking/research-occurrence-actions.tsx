"use client"

import {
  adjustResearchOccurrenceAction,
  confirmResearchRoutineLogAction,
  previewResearchRoutineLogAction,
  type ResearchOccurrence,
  type ResearchRoutine,
  type ResearchRoutineLogActionState,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  defaultResearchUnitProfile,
  formatResearchQuantity,
  type ResearchUnitProfile,
} from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React, { useActionState, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

const initialPreviewState: ResearchRoutineLogActionState = {
  success: false,
  error: null,
  preview: null,
}

function SubmitButton({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "primary" | "confirm"
  className?: string
}) {
  const { pending } = useFormStatus()

  const variantClass =
    variant === "confirm"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
      : variant === "primary"
        ? "bg-ui-fg-base hover:bg-ui-fg-subtle text-ui-bg-base shadow-xs"
        : "border border-ui-border-base bg-white text-ui-fg-base hover:bg-ui-bg-subtle"

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
    >
      {pending ? "Processing…" : children}
    </button>
  )
}

function createSubmissionKey() {
  return globalThis.crypto?.randomUUID?.() ?? `occurrence-${Date.now()}`
}

export type ResearchOccurrenceActionsProps = {
  countryCode: string
  occurrence: ResearchOccurrence
  routine?: ResearchRoutine
  supplies?: TrackedResearchMaterial["supplies"]
  today?: string
  unitProfile?: ResearchUnitProfile
}

export default function ResearchOccurrenceActions({
  countryCode,
  occurrence,
  routine,
  supplies,
  today: _today,
  unitProfile,
}: ResearchOccurrenceActionsProps) {
  const [state, action] = useActionState(
    adjustResearchOccurrenceAction,
    initialState,
  )
  const [isInlineOpen, setIsInlineOpen] = useState(false)
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>(
    supplies?.[0]?.supply_id ?? "",
  )

  const [previewState, previewAction] = useActionState(
    previewResearchRoutineLogAction,
    initialPreviewState,
  )
  const [confirmState, confirmAction] = useActionState(
    confirmResearchRoutineLogAction,
    initialState,
  )

  const activeProfile =
    unitProfile ??
    defaultResearchUnitProfile(occurrence.base_unit, occurrence.label)

  const submissionKey = useMemo(createSubmissionKey, [occurrence.occurrence_id])
  const confirmSubmissionKey = useMemo(
    createSubmissionKey,
    [occurrence.occurrence_id, previewState.preview?.preview_token],
  )

  const commonFields = (
    <>
      <input type="hidden" name="country_code" value={countryCode} />
      <input type="hidden" name="idempotency_key" value={submissionKey} />
      <input type="hidden" name="occurrence_id" value={occurrence.occurrence_id} />
      <input type="hidden" name="routine_id" value={occurrence.routine_id} />
      <input type="hidden" name="routine_revision_id" value={occurrence.routine_revision_id} />
      <input
        type="hidden"
        name="routine_schedule_segment_id"
        value={occurrence.routine_schedule_segment_id ?? ""}
      />
      <input type="hidden" name="planned_local_date" value={occurrence.local_date} />
      <input type="hidden" name="planned_local_time" value={occurrence.local_time} />
      <input type="hidden" name="timezone" value={occurrence.timezone} />
    </>
  )

  const hasInlineCapability = Boolean(routine && supplies !== undefined)

  return (
    <div className="space-y-3 border-t border-ui-border-base pt-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {occurrence.status === "scheduled" ? (
          <>
            {hasInlineCapability ? (
              <button
                type="button"
                onClick={() => setIsInlineOpen((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all touch-manipulation shadow-xs w-full sm:w-auto ${
                  isInlineOpen
                    ? "bg-emerald-700 text-white ring-2 ring-emerald-600 ring-offset-1"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{isInlineOpen ? "Close Logger" : "Confirm & Log Dose"}</span>
              </button>
            ) : (
              <LocalizedClientLink
                href={`/account/research-hub?section=routines&occurrence=${encodeURIComponent(occurrence.occurrence_id)}`}
                className="inline-flex items-center justify-center rounded-lg bg-ui-fg-base px-4 py-2.5 min-h-[44px] text-sm font-medium text-ui-bg-base touch-manipulation w-full sm:w-auto"
              >
                Confirm & Log Dose
              </LocalizedClientLink>
            )}

            <form action={action} className="w-full sm:w-auto">
              {commonFields}
              <input type="hidden" name="operation" value="skip" />
              <SubmitButton className="w-full sm:w-auto">Skip</SubmitButton>
            </form>
          </>
        ) : occurrence.status === "skipped" || occurrence.status === "rescheduled" ? (
          <form action={action} className="w-full sm:w-auto">
            {commonFields}
            <input type="hidden" name="operation" value="restore" />
            <SubmitButton className="w-full sm:w-auto">Restore original schedule</SubmitButton>
          </form>
        ) : null}

        <LocalizedClientLink
          href={`/account/research-hub?section=calculator&occurrence=${encodeURIComponent(occurrence.occurrence_id)}`}
          className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-4 py-2.5 min-h-[44px] text-sm font-medium hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto"
        >
          Dose Calculator
        </LocalizedClientLink>
      </div>

      {/* Inline Dose Logger Drawer */}
      {isInlineOpen && occurrence.status === "scheduled" && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Confirm Dose Administration
                </h4>
                <p className="text-[11px] text-emerald-850">
                  Deduct from storage and record this protocol administration.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsInlineOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md p-1 text-ui-fg-muted hover:bg-emerald-100/60 hover:text-ui-fg-base touch-manipulation"
              aria-label="Close logger"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {!supplies || supplies.length === 0 ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">No active vial in storage</p>
              <p className="mt-1">
                You don&apos;t have an active supply with matching unit ({occurrence.base_unit}). Please activate a purchased compound or add a vial in Tracked Supplies.
              </p>
              <div className="mt-2.5">
                <LocalizedClientLink
                  href="/account/research-hub?section=supplies"
                  className="inline-flex min-h-[44px] items-center text-xs font-semibold text-amber-800 underline hover:text-amber-950 touch-manipulation"
                >
                  Go to Tracked Supplies →
                </LocalizedClientLink>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 border border-ui-border-base text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ui-fg-muted">
                    Scheduled Dose
                  </span>
                  <p className="mt-0.5 text-sm font-extrabold text-ui-fg-base">
                    {formatResearchQuantity(occurrence.planned_quantity_base_units, activeProfile)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ui-fg-muted">
                    Target Date & Time
                  </span>
                  <p className="mt-0.5 font-medium text-ui-fg-base">
                    {occurrence.rescheduled_local_date ?? occurrence.local_date} at {occurrence.rescheduled_local_time ?? occurrence.local_time}
                  </p>
                </div>
              </div>

              {!previewState.preview ? (
                <form action={previewAction} className="space-y-3">
                  <input type="hidden" name="country_code" value={countryCode} />
                  <input type="hidden" name="routine_id" value={occurrence.routine_id} />
                  <input type="hidden" name="routine_revision_id" value={occurrence.routine_revision_id} />
                  <input type="hidden" name="occurrence_id" value={occurrence.occurrence_id} />
                  <input
                    type="hidden"
                    name="local_date"
                    value={occurrence.rescheduled_local_date ?? occurrence.local_date}
                  />
                  <input
                    type="hidden"
                    name="confirmed_quantity_base_units"
                    value={occurrence.planned_quantity_base_units}
                  />
                  <input type="hidden" name="base_unit" value={occurrence.base_unit} />

                  <div>
                    <label className="block text-xs font-semibold text-ui-fg-base">
                      Deduct from Active Vial
                    </label>
                    {supplies.length === 1 ? (
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-2.5 text-xs">
                        <span className="font-medium text-ui-fg-base">
                          {supplies[0].lot_number || supplies[0].batch_number
                            ? `Batch / Lot ${supplies[0].lot_number || supplies[0].batch_number}`
                            : "Active In-Service Vial"}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {formatResearchQuantity(
                            supplies[0].remaining_quantity_base_units,
                            supplies[0],
                            occurrence.label,
                          )} available
                        </span>
                        <input type="hidden" name="supply_id" value={supplies[0].supply_id} />
                      </div>
                    ) : (
                      <select
                        name="supply_id"
                        required
                        value={selectedSupplyId || supplies[0]?.supply_id}
                        onChange={(e) => setSelectedSupplyId(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 min-h-[44px] text-base sm:text-xs font-medium text-ui-fg-base focus:border-emerald-500 focus:outline-none"
                      >
                        {supplies.map((sup) => (
                          <option key={sup.supply_id} value={sup.supply_id}>
                            {sup.lot_number ? `Lot ${sup.lot_number} — ` : ""}
                            {formatResearchQuantity(
                              sup.remaining_quantity_base_units,
                              sup,
                              occurrence.label,
                            )} remaining
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {previewState.error && (
                    <p className="text-xs font-medium text-rose-600">{previewState.error}</p>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsInlineOpen(false)}
                      className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-4 py-2.5 min-h-[44px] text-xs font-medium text-ui-fg-subtle hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <SubmitButton variant="primary" className="w-full sm:w-auto">
                      Review Deduction →
                    </SubmitButton>
                  </div>
                </form>
              ) : (
                <form action={confirmAction} className="space-y-3 rounded-lg border border-emerald-200 bg-white p-3.5 text-xs">
                  <input type="hidden" name="country_code" value={countryCode} />
                  <input type="hidden" name="idempotency_key" value={confirmSubmissionKey} />
                  <input type="hidden" name="routine_id" value={previewState.preview.routine_id} />
                  <input type="hidden" name="routine_revision_id" value={previewState.preview.routine_revision_id} />
                  <input type="hidden" name="occurrence_id" value={previewState.preview.occurrence_id} />
                  <input type="hidden" name="local_date" value={previewState.preview.local_date} />
                  <input type="hidden" name="supply_id" value={previewState.preview.supply_id} />
                  <input
                    type="hidden"
                    name="confirmed_quantity_base_units"
                    value={previewState.preview.confirmed_quantity_base_units}
                  />
                  <input type="hidden" name="base_unit" value={previewState.preview.base_unit} />
                  <input type="hidden" name="preview_token" value={previewState.preview.preview_token} />
                  <input type="hidden" name="refresh_page" value="true" />

                  <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-100">
                    <div className="flex items-center justify-between text-emerald-950">
                      <span className="text-[11px] font-medium">Projected Remaining Stock:</span>
                      <span className="font-extrabold text-sm text-emerald-900">
                        {formatResearchQuantity(
                          previewState.preview.projected_remaining_quantity_base_units,
                          activeProfile,
                        )}
                      </span>
                    </div>
                    {previewState.preview.notice && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-800">
                        {previewState.preview.notice}
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 py-1 cursor-pointer select-none min-h-[44px] touch-manipulation">
                    <input
                      type="checkbox"
                      name="confirm_record"
                      required
                      className="h-5 w-5 shrink-0 rounded border-ui-border-base text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-ui-fg-base leading-snug">
                      I confirm this protocol administration and supply deduction.
                    </span>
                  </label>

                  {confirmState.error && (
                    <p className="text-xs font-medium text-rose-600">{confirmState.error}</p>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-ui-border-base">
                    <button
                      type="button"
                      onClick={() => {
                        setIsInlineOpen(false)
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-4 py-2.5 min-h-[44px] text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <SubmitButton variant="confirm" className="w-full sm:w-auto">
                      Confirm & Deduct Dose
                    </SubmitButton>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {confirmState.success && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-semibold">
            <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Dose confirmed and recorded!</span>
          </div>
          <p className="mt-1 text-emerald-800">
            Supply has been deducted from your active inventory.
          </p>
        </div>
      )}

      {occurrence.status === "scheduled" ? (
        <details className="rounded-lg border border-ui-border-base bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium py-1.5 touch-manipulation">Reschedule Dose</summary>
          <form action={action} className="mt-3 grid gap-3">
            {commonFields}
            <input type="hidden" name="operation" value="reschedule" />
            <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
              <input
                name="rescheduled_local_date"
                type="date"
                required
                className="rounded-lg border border-ui-border-base px-3 py-2.5 min-h-[44px] text-base sm:text-sm"
              />
              <input
                name="rescheduled_local_time"
                type="time"
                required
                className="rounded-lg border border-ui-border-base px-3 py-2.5 min-h-[44px] text-base sm:text-sm"
              />
            </div>
            <input
              name="note"
              placeholder="Optional private note"
              className="rounded-lg border border-ui-border-base px-3 py-2.5 min-h-[44px] text-base sm:text-sm"
            />
            <div>
              <SubmitButton className="w-full sm:w-auto">Save New Schedule</SubmitButton>
            </div>
          </form>
        </details>
      ) : null}

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">Schedule updated.</p> : null}
    </div>
  )
}
