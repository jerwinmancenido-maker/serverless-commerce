"use client"

import {
  createResearchJournalEntryAction,
  reviseResearchJournalEntryAction,
  transitionResearchJournalEntryAction,
  type ResearchJournalEntry,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import { createResearchSubmissionKey } from "@lib/research-tracking-idempotency"
import { useActionState, useCallback, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

type JournalSubmissionKeys = {
  create: string
  byEntry: Record<string, { revise: string; transition: string }>
}

type JournalProps = {
  canMutate: boolean
  countryCode: string
  entries: ResearchJournalEntry[]
  logs: ResearchRoutineLog[]
  runtimeReady: boolean
  routines: ResearchRoutine[]
  submissionKeys: JournalSubmissionKeys
  timezone: string
  trackedMaterials: TrackedResearchMaterial[]
}

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"
const inputClass =
  "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base disabled:bg-ui-bg-subtle"

function createClientSubmissionKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("Secure submission key generation is unavailable")
  }

  return createResearchSubmissionKey(() => globalThis.crypto.randomUUID())
}

function useRotatingSubmissionKey(initialKey?: string) {
  const [submissionKey, setSubmissionKey] = useState(
    () => initialKey ?? createClientSubmissionKey(),
  )
  const rotate = useCallback(() => {
    setSubmissionKey(createClientSubmissionKey())
  }, [])

  return [submissionKey, rotate] as const
}

function useRotateConsumedKey(
  state: ResearchTrackingActionState,
  rotate: () => void,
) {
  useEffect(() => {
    if (state.submissionKeyConsumed) {
      rotate()
    }
  }, [rotate, state.submissionKeyConsumed])
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-ui-fg-base px-4 py-2.5 text-sm font-medium text-ui-bg-base disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  )
}

function ActionMessage({ state }: { state: ResearchTrackingActionState }) {
  if (!state.error && !state.success) {
    return null
  }

  return (
    <p
      aria-live="polite"
      className={`text-sm ${state.error ? "text-rose-700" : "text-emerald-700"}`}
    >
      {state.error || "Journal entry saved."}
    </p>
  )
}

function HiddenContext({
  countryCode,
  idempotencyKey,
}: {
  countryCode: string
  idempotencyKey: string
}) {
  return (
    <>
      <input type="hidden" name="country_code" value={countryCode} />
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
    </>
  )
}

function Confirmation() {
  return (
    <label className="flex items-start gap-3 text-sm leading-6">
      <input className="mt-1" type="checkbox" name="confirmed" required />
      <span>
        I reviewed this private research note and want to store this version in
        my account.
      </span>
    </label>
  )
}

function RelationFields({
  entries,
  logs,
  routines,
  trackedMaterials,
}: {
  entries?: ResearchJournalEntry["current_revision"]
  logs: ResearchRoutineLog[]
  routines: ResearchRoutine[]
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const supplies = trackedMaterials.flatMap((material) =>
    material.supplies.map((supply) => ({
      ...supply,
      materialLabel: material.label,
    })),
  )

  return (
    <details className="rounded-lg border border-ui-border-base p-3">
      <summary className="cursor-pointer text-sm font-medium">
        Link owned research records (optional)
      </summary>
      <p className="mt-2 text-xs leading-5 text-ui-fg-muted">
        Links are added only when you choose them; purchases and routines never
        create Journal entries automatically.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 medium:grid-cols-2">
        <label className="text-sm font-medium">
          Tracked material
          <select
            className={`mt-1 ${inputClass}`}
            name="tracked_material_id"
            defaultValue={entries?.tracked_material_id || ""}
          >
            <option value="">No linked material</option>
            {trackedMaterials.map((material) => (
              <option
                key={material.tracked_material_id}
                value={material.tracked_material_id}
              >
                {material.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Supply
          <select
            className={`mt-1 ${inputClass}`}
            name="supply_id"
            defaultValue={entries?.supply_id || ""}
          >
            <option value="">No linked supply</option>
            {supplies.map((supply) => (
              <option key={supply.supply_id} value={supply.supply_id}>
                {supply.materialLabel} · {supply.remaining_quantity_base_units} {supply.base_unit}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Personal routine
          <select
            className={`mt-1 ${inputClass}`}
            name="routine_id"
            defaultValue={entries?.routine_id || ""}
          >
            <option value="">No linked routine</option>
            {routines.map((routine) => (
              <option key={routine.routine_id} value={routine.routine_id}>
                {routine.current_revision.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Confirmed routine record
          <select
            className={`mt-1 ${inputClass}`}
            name="confirmed_log_id"
            defaultValue={entries?.confirmed_log_id || ""}
          >
            <option value="">No linked record</option>
            {logs
              .filter((log) => log.status === "confirmed")
              .map((log) => (
                <option key={log.log_id} value={log.log_id}>
                  {log.local_date} · {log.confirmed_quantity_base_units} {log.base_unit}
                </option>
              ))}
          </select>
        </label>
      </div>
    </details>
  )
}

function JournalEntryCard({
  canMutate,
  countryCode,
  entry,
  keys,
  logs,
  routines,
  trackedMaterials,
}: {
  canMutate: boolean
  countryCode: string
  entry: ResearchJournalEntry
  keys: { revise: string; transition: string }
  logs: ResearchRoutineLog[]
  routines: ResearchRoutine[]
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const [reviseState, reviseAction] = useActionState(
    reviseResearchJournalEntryAction,
    initialState,
  )
  const [transitionState, transitionAction] = useActionState(
    transitionResearchJournalEntryAction,
    initialState,
  )
  const [reviseKey, rotateReviseKey] = useRotatingSubmissionKey(keys?.revise)
  const [transitionKey, rotateTransitionKey] = useRotatingSubmissionKey(
    keys?.transition,
  )
  useRotateConsumedKey(reviseState, rotateReviseKey)
  useRotateConsumedKey(transitionState, rotateTransitionKey)
  const revision = entry.current_revision

  return (
    <article
      className={`rounded-lg border border-ui-border-base p-4 ${
        entry.status === "voided" ? "bg-ui-bg-subtle opacity-75" : "bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            {revision.title || "Untitled research note"}
          </h3>
          <p className="mt-1 text-xs text-ui-fg-muted">
            {revision.local_date} at {revision.local_time} · Revision {revision.revision_number} · {entry.status}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
        {revision.note}
      </p>

      {canMutate && entry.status === "active" && (
        <details className="mt-4 rounded-lg border border-ui-border-base p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Revise this entry
          </summary>
          <form action={reviseAction} className="mt-4 space-y-3">
            <HiddenContext
              countryCode={countryCode}
              idempotencyKey={reviseKey}
            />
            <input
              type="hidden"
              name="journal_entry_id"
              value={entry.journal_entry_id}
            />
            <input
              type="hidden"
              name="expected_revision_id"
              value={revision.revision_id}
            />
            <input type="hidden" name="timezone" value={revision.timezone} />
            <div className="grid grid-cols-1 gap-3 medium:grid-cols-2">
              <label className="text-sm font-medium">
                Local date
                <input
                  className={`mt-1 ${inputClass}`}
                  type="date"
                  name="local_date"
                  defaultValue={revision.local_date}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Local time
                <input
                  className={`mt-1 ${inputClass}`}
                  type="time"
                  name="local_time"
                  defaultValue={revision.local_time}
                  required
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Title (optional)
              <input
                className={`mt-1 ${inputClass}`}
                type="text"
                name="title"
                maxLength={120}
                defaultValue={revision.title || ""}
              />
            </label>
            <label className="block text-sm font-medium">
              Research note
              <textarea
                className={`mt-1 resize-y ${inputClass}`}
                name="note"
                rows={6}
                maxLength={4000}
                defaultValue={revision.note}
                required
              />
            </label>
            <RelationFields
              entries={revision}
              logs={logs}
              routines={routines}
              trackedMaterials={trackedMaterials}
            />
            <Confirmation />
            <ActionMessage state={reviseState} />
            <SubmitButton>Save new revision</SubmitButton>
          </form>
        </details>
      )}

      {canMutate && (
        <form action={transitionAction} className="mt-4 space-y-3">
          <HiddenContext
            countryCode={countryCode}
            idempotencyKey={transitionKey}
          />
          <input
            type="hidden"
            name="journal_entry_id"
            value={entry.journal_entry_id}
          />
          <input
            type="hidden"
            name="expected_revision_id"
            value={revision.revision_id}
          />
          <input
            type="hidden"
            name="operation"
            value={entry.status === "active" ? "void" : "restore"}
          />
          <Confirmation />
          <ActionMessage state={transitionState} />
          <SubmitButton>
            {entry.status === "active" ? "Void entry" : "Restore entry"}
          </SubmitButton>
        </form>
      )}
    </article>
  )
}

export default function Journal({
  canMutate,
  countryCode,
  entries,
  logs,
  runtimeReady,
  routines,
  submissionKeys,
  timezone,
  trackedMaterials,
}: JournalProps) {
  const [createState, createAction] = useActionState(
    createResearchJournalEntryAction,
    initialState,
  )
  const [createKey, rotateCreateKey] = useRotatingSubmissionKey(
    submissionKeys.create,
  )
  useRotateConsumedKey(createState, rotateCreateKey)

  return (
    <section className="mt-10" data-testid="research-journal">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Private account record
        </p>
        <h2 className="mt-1 text-lg font-semibold">Journal</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Keep private research observations in your account. Entries are
          descriptive records only and are not medical advice or clinical
          interpretation.
        </p>
      </div>

      {!runtimeReady ? (
        <div className={`${cardClass} border-sky-200 bg-sky-50 text-sm text-sky-900`}>
          Journal records are temporarily unavailable. No changes can be made
          until the current account data can be verified.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 large:grid-cols-2">
          <div className={cardClass}>
            <h3 className="text-base font-semibold">New journal entry</h3>
            {!canMutate ? (
              <p className="mt-3 text-sm leading-6 text-ui-fg-subtle">
                Existing entries remain visible, but new entries and changes
                are disabled while this profile is closed or its account
                consent is outdated.
              </p>
            ) : (
              <form action={createAction} className="mt-4 space-y-4">
                <HiddenContext
                  countryCode={countryCode}
                  idempotencyKey={createKey}
                />
                <input type="hidden" name="timezone" value={timezone} />
                <div className="grid grid-cols-1 gap-3 medium:grid-cols-2">
                  <label className="text-sm font-medium">
                    Local date
                    <input
                      className={`mt-1 ${inputClass}`}
                      type="date"
                      name="local_date"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Local time
                    <input
                      className={`mt-1 ${inputClass}`}
                      type="time"
                      name="local_time"
                      required
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  Title (optional)
                  <input
                    className={`mt-1 ${inputClass}`}
                    type="text"
                    name="title"
                    maxLength={120}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Research note
                  <textarea
                    className={`mt-1 resize-y ${inputClass}`}
                    name="note"
                    rows={7}
                    maxLength={4000}
                    required
                  />
                </label>
                <RelationFields
                  logs={logs}
                  routines={routines}
                  trackedMaterials={trackedMaterials}
                />
                <Confirmation />
                <ActionMessage state={createState} />
                <SubmitButton>Store journal entry</SubmitButton>
              </form>
            )}
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Journal timeline</h3>
                <p className="mt-1 text-xs text-ui-fg-muted">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>
            {entries.length === 0 ? (
              <div className="mt-5 rounded-lg bg-ui-bg-subtle p-5 text-sm leading-6 text-ui-fg-subtle">
                No journal entries have been stored yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {entries.map((entry) => (
                  <JournalEntryCard
                    key={entry.journal_entry_id}
                    canMutate={canMutate}
                    countryCode={countryCode}
                    entry={entry}
                    keys={submissionKeys.byEntry[entry.journal_entry_id]}
                    logs={logs}
                    routines={routines}
                    trackedMaterials={trackedMaterials}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
