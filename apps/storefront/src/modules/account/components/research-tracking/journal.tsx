"use client"

import {
  createResearchJournalEntryAction,
  removeResearchJournalAttachmentAction,
  retrieveResearchJournalAttachmentUrl,
  reviseResearchJournalEntryAction,
  transitionResearchJournalEntryAction,
  uploadResearchJournalAttachmentAction,
  type ResearchJournalEntry,
  type ResearchPrivateRecordsConfiguration,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import { createResearchSubmissionKey } from "@lib/research-tracking-idempotency"
import { formatResearchQuantity } from "@lib/research-quantity"
import Link from "next/link"
import { useActionState, useCallback, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

type JournalSubmissionKeys = {
  create: string
  byEntry: Record<string, { revise: string; transition: string }>
}

type JournalProps = {
  canMutate: boolean
  configuration: ResearchPrivateRecordsConfiguration["journal"]
  consentSubmissionKey: string
  countryCode: string
  entries: ResearchJournalEntry[]
  entryCount: number
  limit: number
  logs: ResearchRoutineLog[]
  offset: number
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

const inputClass =
  "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base disabled:bg-ui-bg-subtle"

function createClientSubmissionKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("Secure submission key generation is unavailable")
  }

  return createResearchSubmissionKey(() => globalThis.crypto.randomUUID())
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ""
  const str = String(val)
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// ─── Rating & tag helpers (encode into note prefix, no backend change) ────────

const RATING_PREFIX_RE = /^\[ratings:M(\d)E(\d)A(\d)\]\n?/
const TAG_PREFIX_RE = /^\[tags:([^\]]+)\]\n?/

type Ratings = { mood: number; energy: number; appetite: number }
type Tag = "observation" | "side-effect" | "lab" | "photo-note"

const TAG_LABELS: Record<Tag, string> = {
  observation: "Observation",
  "side-effect": "Side Effect",
  lab: "Lab Result",
  "photo-note": "Photo Note",
}

const TAG_COLORS: Record<Tag, string> = {
  observation: "border-blue-200 bg-blue-50 text-blue-700",
  "side-effect": "border-rose-200 bg-rose-50 text-rose-700",
  lab: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "photo-note": "border-amber-200 bg-amber-50 text-amber-700",
}

function encodeNotePrefix(note: string, ratings: Ratings, tags: Tag[]): string {
  let prefix = ""
  if (ratings.mood || ratings.energy || ratings.appetite) {
    prefix += `[ratings:M${ratings.mood}E${ratings.energy}A${ratings.appetite}]\n`
  }
  if (tags.length) {
    prefix += `[tags:${tags.join(",")}]\n`
  }
  return prefix + note
}

function parseNotePrefix(raw: string): {
  note: string
  ratings: Ratings | null
  tags: Tag[]
} {
  let rest = raw
  let ratings: Ratings | null = null
  let tags: Tag[] = []

  const ratingMatch = RATING_PREFIX_RE.exec(rest)
  if (ratingMatch) {
    ratings = {
      mood: parseInt(ratingMatch[1], 10),
      energy: parseInt(ratingMatch[2], 10),
      appetite: parseInt(ratingMatch[3], 10),
    }
    rest = rest.slice(ratingMatch[0].length)
  }

  const tagMatch = TAG_PREFIX_RE.exec(rest)
  if (tagMatch) {
    tags = tagMatch[1].split(",").filter((t) => Object.keys(TAG_LABELS).includes(t)) as Tag[]
    rest = rest.slice(tagMatch[0].length)
  }

  return { note: rest, ratings, tags }
}

// ─── RatingInput ────────────────────────────────────────────────────────────

const RATING_EMOJI: Record<string, string[]> = {
  mood:     ["😞", "😔", "😐", "🙂", "😄"],
  energy:   ["🪫", "😴", "⚡", "🔋", "🚀"],
  appetite: ["🚫", "😶", "🍽️", "😋", "🤤"],
}

function RatingInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-ui-fg-subtle">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n} of 5`}
            onClick={() => onChange(n)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all ${
              value === n
                ? "border-emerald-500 bg-emerald-50 shadow-xs"
                : "border-ui-border-base bg-white hover:border-emerald-300"
            }`}
          >
            {RATING_EMOJI[name]?.[n - 1] ?? n}
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs text-ui-fg-muted">{value}/5</span>
      )}
    </div>
  )
}

// ─── TagSelector ─────────────────────────────────────────────────────────────

function TagSelector({
  selected,
  onChange,
}: {
  selected: Tag[]
  onChange: (tags: Tag[]) => void
}) {
  function toggle(tag: Tag) {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TAG_LABELS) as Tag[]).map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={selected.includes(tag)}
          onClick={() => toggle(tag)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
            selected.includes(tag)
              ? TAG_COLORS[tag]
              : "border-ui-border-base bg-white text-ui-fg-muted hover:border-ui-fg-muted"
          }`}
        >
          {TAG_LABELS[tag]}
        </button>
      ))}
    </div>
  )
}

// ─── RatingDisplay ────────────────────────────────────────────────────────────

function RatingDisplay({ ratings }: { ratings: Ratings }) {
  const items = [
    { label: "Mood",     value: ratings.mood,     emoji: "😐" },
    { label: "Energy",   value: ratings.energy,   emoji: "⚡" },
    { label: "Appetite", value: ratings.appetite, emoji: "🍽️" },
  ]
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map(({ label, value, emoji }) =>
        value > 0 ? (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
          >
            {emoji} {label} {value}/5
          </span>
        ) : null,
      )}
    </div>
  )
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

function JournalAttachments({
  canMutate,
  countryCode,
  entry,
}: {
  canMutate: boolean
  countryCode: string
  entry: ResearchJournalEntry
}) {
  const [uploadState, uploadAction] = useActionState(
    uploadResearchJournalAttachmentAction,
    initialState,
  )
  const [removeState, removeAction] = useActionState(
    removeResearchJournalAttachmentAction,
    initialState,
  )
  const [removeSubmissionKey, rotateRemoveSubmissionKey] =
    useRotatingSubmissionKey()
  useRotateConsumedKey(removeState, rotateRemoveSubmissionKey)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)

  async function openAttachment(attachmentId: string) {
    setOpeningId(attachmentId)
    setOpenError(null)
    try {
      const url = await retrieveResearchJournalAttachmentUrl(attachmentId)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      setOpenError(
        error instanceof Error ? error.message : "Attachment could not be opened.",
      )
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium">Private attachments</h4>
          <p className="mt-1 text-xs leading-5 text-ui-fg-muted">
            PNG, JPEG, or PDF up to 10 MiB. Files are private to this account.
            Automated malware scanning is not configured in this environment.
          </p>
        </div>
      </div>
      {entry.attachments.length ? (
        <ul className="mt-3 space-y-2">
          {entry.attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{attachment.file_name}</p>
                <p className="text-xs text-ui-fg-muted">
                  {(attachment.size_bytes / 1024).toFixed(1)} KiB · scan {attachment.scan_status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium"
                  disabled={openingId === attachment.id}
                  onClick={() => openAttachment(attachment.id)}
                >
                  {openingId === attachment.id ? "Opening…" : "Open"}
                </button>
                {canMutate && (
                  <form action={removeAction}>
                    <input type="hidden" name="country_code" value={countryCode} />
                    <input type="hidden" name="attachment_id" value={attachment.id} />
                    <input type="hidden" name="idempotency_key" value={removeSubmissionKey} />
                    <button
                      type="submit"
                      className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-ui-fg-muted">No attachments.</p>
      )}
      {canMutate && entry.status === "active" && (
        <form action={uploadAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="country_code" value={countryCode} />
          <input type="hidden" name="journal_entry_id" value={entry.journal_entry_id} />
          <label className="min-w-0 flex-1 text-xs font-medium">
            Add a file
            <input
              className="mt-1 block w-full text-xs"
              type="file"
              name="attachment"
              accept="image/png,image/jpeg,application/pdf"
              required
            />
          </label>
          <SubmitButton>Upload</SubmitButton>
        </form>
      )}
      <ActionMessage state={uploadState} />
      <ActionMessage state={removeState} />
      {openError && <p className="mt-2 text-sm text-rose-700">{openError}</p>}
    </div>
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
                {supply.materialLabel} · {formatResearchQuantity(
                  supply.remaining_quantity_base_units,
                  supply,
                )}
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
                  {log.local_date} · {formatResearchQuantity(
                    log.confirmed_quantity_base_units,
                    supplies.find((supply) => supply.supply_id === log.supply_id) ?? {
                      base_unit: log.base_unit,
                      display_unit: null,
                      base_units_per_display_unit: null,
                      display_precision: null,
                    },
                  )}
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
  const [confirmingTransition, setConfirmingTransition] = useState(false)
  const revision = entry.current_revision

  const linkedMaterial = trackedMaterials.find(
    (m) => m.tracked_material_id === revision.tracked_material_id,
  )
  const linkedSupply = trackedMaterials
    .flatMap((m) => m.supplies.map((s) => ({ ...s, materialLabel: m.label })))
    .find((s) => s.supply_id === revision.supply_id)
  const linkedRoutine = routines.find(
    (r) => r.routine_id === revision.routine_id,
  )
  const linkedLog = logs.find((l) => l.log_id === revision.confirmed_log_id)
  const isVoided = entry.status === "voided"

  return (
    <article
      className={`rounded-lg border border-ui-border-base p-4 ${
        isVoided ? "bg-ui-bg-subtle opacity-75" : "bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">
              {revision.title || "Untitled research note"}
            </h3>
            {isVoided && (
              <span className="rounded-md bg-ui-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-ui-fg-muted">
                Voided
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ui-fg-muted">
            {revision.local_date} at {revision.local_time} · Revision {revision.revision_number} · {entry.status}
          </p>
          {(linkedMaterial || linkedSupply || linkedRoutine || linkedLog) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {linkedMaterial && (
                <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Compound: {linkedMaterial.label}
                </span>
              )}
              {linkedSupply && (
                <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Vial: {linkedSupply.lot_number ? `Lot ${linkedSupply.lot_number}` : `Supply ${linkedSupply.supply_id.slice(-6)}`}
                </span>
              )}
              {linkedRoutine && (
                <span className="inline-flex items-center rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                  Routine: {linkedRoutine.current_revision.label}
                </span>
              )}
              {linkedLog && (
                <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Dose: {linkedLog.local_date}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Parse and display ratings + tags from note prefix */}
      {(() => {
        const { note, ratings, tags } = parseNotePrefix(revision.note)
        return (
          <>
            {(ratings || tags.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {ratings && <RatingDisplay ratings={ratings} />}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TAG_COLORS[tag]}`}
                  >
                    {TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
              {note}
            </p>
          </>
        )
      })()}

      <JournalAttachments
        canMutate={canMutate}
        countryCode={countryCode}
        entry={entry}
      />

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
        <div className="mt-4 border-t border-ui-border-base pt-3">
          {!confirmingTransition ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmingTransition(true)}
                className={`text-xs underline underline-offset-2 transition-colors ${
                  isVoided
                    ? "text-emerald-600 hover:text-emerald-700"
                    : "text-ui-fg-muted hover:text-rose-600"
                }`}
              >
                {isVoided ? "Restore entry" : "Void entry"}
              </button>
            </div>
          ) : (
            <div
              className={`rounded-xl border p-4 ${
                isVoided
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-rose-200 bg-rose-50/60"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  isVoided ? "text-emerald-900" : "text-rose-800"
                }`}
              >
                {isVoided
                  ? "Restore this voided research note?"
                  : "Void this research note? This entry will be archived."}
              </p>
              <form action={transitionAction} className="mt-3 space-y-3">
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
                  value={isVoided ? "restore" : "void"}
                />
                <Confirmation />
                <ActionMessage state={transitionState} />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmingTransition(false)}
                    className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`rounded-xl px-4 py-2 text-xs font-medium text-white transition-colors ${
                      isVoided
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {isVoided ? "Confirm Restore" : "Confirm Void"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function Journal({
  canMutate,
  configuration: _configuration,
  consentSubmissionKey: _consentSubmissionKey,
  countryCode,
  entries,
  entryCount,
  limit,
  logs,
  offset,
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
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(entryCount / limit))
  const [showForm, setShowForm] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [pendingRatings, setPendingRatings] = useState<Ratings>({ mood: 0, energy: 0, appetite: 0 })
  const [pendingTags, setPendingTags] = useState<Tag[]>([])

  const now = new Date()
  const localDate = now.toISOString().slice(0, 10)
  const localTime = now.toTimeString().slice(0, 5)

  const inputCls =
    "w-full rounded-xl border border-ui-border-base bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-ui-bg-subtle"

  return (
    <section className="mt-6 space-y-6" data-testid="research-journal">

      {/* ── New entry trigger / form ──────────────────────────────── */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ui-border-base py-4 text-sm font-medium text-ui-fg-subtle transition-colors hover:border-emerald-400 hover:text-emerald-600"
        >
          <span className="text-lg">&#x270F;&#xFE0F;</span> Write a Journal Note
        </button>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white">
          <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-4">
            <div>
              <h3 className="font-semibold text-ui-fg-base">New Journal Entry</h3>
              <p className="mt-0.5 text-xs text-ui-fg-muted">Private &#x2014; visible only to you</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowForm(false); setAdvanced(false) }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-ui-fg-muted hover:bg-ui-bg-subtle"
              aria-label="Close"
            >
              &#x2715;
            </button>
          </div>

          {!runtimeReady ? (
            <div className="p-5 text-sm text-amber-700">Journal records are temporarily unavailable.</div>
          ) : !canMutate ? (
            <div className="p-5 text-sm leading-6 text-ui-fg-subtle">
              New entries are disabled while this profile is closed or consent is outdated.
            </div>
          ) : (
            <form
              action={createAction}
              className="space-y-4 p-5"
              onSubmit={(e) => {
                // Encode ratings + tags into the note field before submit
                const form = e.currentTarget
                const noteEl = form.elements.namedItem("note") as HTMLTextAreaElement
                if (noteEl) {
                  noteEl.value = encodeNotePrefix(
                    noteEl.value,
                    pendingRatings,
                    pendingTags,
                  )
                }
              }}
            >
              <HiddenContext countryCode={countryCode} idempotencyKey={createKey} />
              <input type="hidden" name="timezone" value={timezone} />

              <label className="block text-sm font-medium text-ui-fg-subtle">
                Research note
                <textarea
                  className={`mt-1.5 resize-y ${inputCls}`}
                  name="note"
                  rows={5}
                  maxLength={4000}
                  required
                  placeholder="What did you observe today? Side effects, how you felt, dose timing&#x2026;"
                />
              </label>

              {/* ── Ratings ────────────────────────────────────────── */}
              <div className="space-y-2 rounded-xl border border-ui-border-base/60 bg-ui-bg-subtle/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ui-fg-muted">How are you feeling?</p>
                <RatingInput
                  label="Mood"
                  name="mood"
                  value={pendingRatings.mood}
                  onChange={(v) => setPendingRatings((r) => ({ ...r, mood: v }))}
                />
                <RatingInput
                  label="Energy"
                  name="energy"
                  value={pendingRatings.energy}
                  onChange={(v) => setPendingRatings((r) => ({ ...r, energy: v }))}
                />
                <RatingInput
                  label="Appetite"
                  name="appetite"
                  value={pendingRatings.appetite}
                  onChange={(v) => setPendingRatings((r) => ({ ...r, appetite: v }))}
                />
              </div>

              {/* ── Tags ───────────────────────────────────────────── */}
              <div>
                <p className="mb-2 text-xs font-medium text-ui-fg-muted">Entry type</p>
                <TagSelector selected={pendingTags} onChange={setPendingTags} />
              </div>

              <button
                type="button"
                onClick={() => setAdvanced((v) => !v)}
                className="text-xs font-medium text-emerald-600 underline underline-offset-2"
              >
                {advanced ? "Hide advanced fields &#x2191;" : "Add title, date &#x26; links &#x2193;"}
              </button>

              {advanced && (
                <div className="space-y-4 rounded-xl border border-ui-border-base/60 bg-ui-bg-subtle/40 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-medium text-ui-fg-subtle">
                      Local date
                      <input className={`mt-1.5 ${inputCls}`} type="date" name="local_date" defaultValue={localDate} required />
                    </label>
                    <label className="text-sm font-medium text-ui-fg-subtle">
                      Local time
                      <input className={`mt-1.5 ${inputCls}`} type="time" name="local_time" defaultValue={localTime} required />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-ui-fg-subtle">
                    Title (optional)
                    <input className={`mt-1.5 ${inputCls}`} type="text" name="title" maxLength={120} placeholder="e.g. Week 3 check-in" />
                  </label>
                  <RelationFields logs={logs} routines={routines} trackedMaterials={trackedMaterials} />
                </div>
              )}

              <Confirmation />
              <ActionMessage state={createState} />
              <button
                type="submit"
                className="w-full rounded-xl bg-ui-fg-base py-3 text-sm font-semibold text-ui-bg-base transition-opacity hover:opacity-80"
              >
                Store Journal Entry
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Journal timeline ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-ui-border-base bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">Research Journal</p>
            <h3 className="mt-0.5 text-base font-semibold text-ui-fg-base">All entries</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ui-bg-subtle px-2.5 py-0.5 text-xs font-medium text-ui-fg-muted">
              {entryCount} {entryCount === 1 ? "entry" : "entries"}
            </span>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const headers = [
                    "Date",
                    "Time",
                    "Title",
                    "Tags",
                    "Mood",
                    "Energy",
                    "Appetite",
                    "Routine",
                    "Status",
                    "Note",
                  ]
                  const rows = entries.map((entry) => {
                    const rev = entry.current_revision
                    const { note, ratings, tags } = parseNotePrefix(rev.note ?? "")
                    const linkedRoutine = routines.find((r) => r.routine_id === rev.routine_id)

                    return [
                      escapeCsv(rev.local_date),
                      escapeCsv(rev.local_time),
                      escapeCsv(rev.title ?? ""),
                      escapeCsv(tags.join("; ")),
                      escapeCsv(ratings?.mood ? `${ratings.mood}/5` : ""),
                      escapeCsv(ratings?.energy ? `${ratings.energy}/5` : ""),
                      escapeCsv(ratings?.appetite ? `${ratings.appetite}/5` : ""),
                      escapeCsv(linkedRoutine?.current_revision?.label ?? ""),
                      escapeCsv(entry.status),
                      escapeCsv(note),
                    ].join(",")
                  })

                  const csvContent = [headers.join(","), ...rows].join("\r\n")
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `research-journal-${new Date().toISOString().slice(0, 10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors shadow-2xs"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            )}
          </div>
        </div>

        {!runtimeReady ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            Journal records are temporarily unavailable.
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <svg
              className="h-12 w-12 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M6 14h6" />
            </svg>
            <p className="text-sm font-medium text-ui-fg-subtle">No journal entries yet.</p>
            <p className="max-w-xs text-xs text-ui-fg-muted">
              Use your journal to record observations, side effects, how you felt after a dose, or any research notes.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Write your first entry &#x2192;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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

        {entryCount > 0 && (
          <nav
            aria-label="Journal pages"
            className="mt-5 flex items-center justify-between border-t border-ui-border-base pt-4"
          >
            {currentPage > 1 ? (
              <Link
                className="flex items-center gap-1 rounded-xl border border-ui-border-base px-3 py-1.5 text-xs font-medium hover:bg-ui-bg-subtle"
                href={`/${countryCode}/account/research-hub?section=progress&journalPage=${currentPage - 1}`}
              >
                &#x2190; Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs text-ui-fg-muted">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages ? (
              <Link
                className="flex items-center gap-1 rounded-xl border border-ui-border-base px-3 py-1.5 text-xs font-medium hover:bg-ui-bg-subtle"
                href={`/${countryCode}/account/research-hub?section=progress&journalPage=${currentPage + 1}`}
              >
                Next &#x2192;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </section>
  )
}


