"use client"

import {
  adjustResearchOccurrenceAction,
  type ResearchOccurrence,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState, useMemo } from "react"
import { useFormStatus } from "react-dom"

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  )
}

function createSubmissionKey() {
  return globalThis.crypto?.randomUUID?.() ?? `occurrence-${Date.now()}`
}

export default function ResearchOccurrenceActions({
  countryCode,
  occurrence,
}: {
  countryCode: string
  occurrence: ResearchOccurrence
}) {
  const [state, action] = useActionState(
    adjustResearchOccurrenceAction,
    initialState,
  )
  const submissionKey = useMemo(createSubmissionKey, [occurrence.occurrence_id])
  const commonFields = (
    <>
      <input type="hidden" name="country_code" value={countryCode} />
      <input type="hidden" name="idempotency_key" value={submissionKey} />
      <input type="hidden" name="occurrence_id" value={occurrence.occurrence_id} />
      <input type="hidden" name="routine_id" value={occurrence.routine_id} />
      <input type="hidden" name="routine_revision_id" value={occurrence.routine_revision_id} />
      <input type="hidden" name="routine_schedule_segment_id" value={occurrence.routine_schedule_segment_id ?? ""} />
      <input type="hidden" name="planned_local_date" value={occurrence.local_date} />
      <input type="hidden" name="planned_local_time" value={occurrence.local_time} />
      <input type="hidden" name="timezone" value={occurrence.timezone} />
    </>
  )

  return (
    <div className="space-y-3 border-t border-ui-border-base pt-4">
      <div className="flex flex-wrap gap-2">
        {occurrence.status === "scheduled" ? (
          <>
            <LocalizedClientLink
              href={`/account/research-hub?section=routines&occurrence=${encodeURIComponent(occurrence.occurrence_id)}`}
              className="rounded-lg bg-ui-fg-base px-3 py-2 text-sm font-medium text-ui-bg-base"
            >
              Complete
            </LocalizedClientLink>
            <form action={action}>
              {commonFields}
              <input type="hidden" name="operation" value="skip" />
              <SubmitButton>Skip</SubmitButton>
            </form>
          </>
        ) : occurrence.status === "skipped" || occurrence.status === "rescheduled" ? (
          <form action={action}>
            {commonFields}
            <input type="hidden" name="operation" value="restore" />
            <SubmitButton>Restore original schedule</SubmitButton>
          </form>
        ) : null}
        <LocalizedClientLink
          href={`/account/research-hub?section=calculator&occurrence=${encodeURIComponent(occurrence.occurrence_id)}`}
          className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm font-medium"
        >
          Open calculator
        </LocalizedClientLink>
      </div>

      {occurrence.status === "scheduled" ? (
        <details className="rounded-lg border border-ui-border-base bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium">Reschedule this activity</summary>
          <form action={action} className="mt-3 grid gap-3">
            {commonFields}
            <input type="hidden" name="operation" value="reschedule" />
            <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
              <input name="rescheduled_local_date" type="date" required className="rounded-lg border border-ui-border-base px-3 py-2 text-sm" />
              <input name="rescheduled_local_time" type="time" required className="rounded-lg border border-ui-border-base px-3 py-2 text-sm" />
            </div>
            <input name="note" placeholder="Optional private note" className="rounded-lg border border-ui-border-base px-3 py-2 text-sm" />
            <div><SubmitButton>Confirm new time</SubmitButton></div>
          </form>
        </details>
      ) : null}

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">Schedule updated.</p> : null}
    </div>
  )
}
