"use client"

import {
  confirmResearchRoutineLogAction,
  createResearchRoutineAction,
  mutateResearchRoutineLogAction,
  previewResearchRoutineLogMutationAction,
  previewResearchRoutineLogAction,
  retrieveResearchOccurrences,
  retrieveResearchRoutineLogs,
  retrieveResearchRoutines,
  retrieveTrackedResearchMaterials,
  transitionResearchRoutineAction,
  updateResearchRoutineAction,
  type ResearchOccurrence,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchRoutineLogActionState,
  type ResearchRoutineLogMutationActionState,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  createResearchSubmissionKey,
  type ResearchLogMutationOperation,
  type RoutineSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import { researchTrackingQueryKeys } from "@lib/research-tracking-query-keys"
import {
  convertResearchDisplayQuantityToBaseUnits,
  defaultResearchUnitProfile,
  formatResearchQuantity,
  researchDisplayQuantity,
  researchDisplayStep,
  resolveResearchUnitProfile,
  serializeResearchUnitProfile,
} from "@lib/research-quantity"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useFormStatus } from "react-dom"

type PersonalRoutinesProps = {
  canMutate: boolean
  countryCode: string
  occurrences: ResearchOccurrence[]
  logs: ResearchRoutineLog[]
  routines: ResearchRoutine[]
  runtimeReady: boolean
  submissionKeys: RoutineSubmissionKeys
  today: string
  trackedMaterials: TrackedResearchMaterial[]
}

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"
const inputClass =
  "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base disabled:bg-ui-bg-subtle"
const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}
const initialPreviewState: ResearchRoutineLogActionState = {
  success: false,
  error: null,
  preview: null,
}
const initialMutationPreviewState: ResearchRoutineLogMutationActionState = {
  success: false,
  error: null,
  preview: null,
}

type ResearchTrackingQueryKey = readonly unknown[]

function profileForBaseUnit(
  baseUnit: ResearchOccurrence["base_unit"],
  supplies: TrackedResearchMaterial["supplies"],
) {
  const profiles = Array.from(
    new Map(
      supplies
        .filter((supply) => supply.base_unit === baseUnit)
        .map((supply) => {
          const profile = resolveResearchUnitProfile(supply)
          const key = serializeResearchUnitProfile(profile)

          return [key, profile] as const
        }),
    ).values(),
  )

  return profiles.length === 1
    ? profiles[0]
    : defaultResearchUnitProfile(baseUnit)
}

function routineUnitOptions(
  supplies: TrackedResearchMaterial["supplies"],
) {
  const profiles = Array.from(
    new Map(
      supplies.map((supply) => {
        const profile = resolveResearchUnitProfile(supply)
        const key = serializeResearchUnitProfile(profile)

        return [key, { key, profile }] as const
      }),
    ).values(),
  )
  const iuProfiles = profiles.filter(
    ({ profile }) => profile.display_unit === "IU",
  )
  const hasUnambiguousIuProfile =
    iuProfiles.length === 1 &&
    supplies.every(
      (supply) =>
        serializeResearchUnitProfile(resolveResearchUnitProfile(supply)) ===
        iuProfiles[0].key,
    )

  return profiles.filter(
    ({ profile }) =>
      profile.display_unit !== "IU" || hasUnambiguousIuProfile,
  )
}

function profileForSupply(
  supplyId: string,
  baseUnit: ResearchOccurrence["base_unit"],
  supplies: TrackedResearchMaterial["supplies"],
) {
  return (
    supplies.find((supply) => supply.supply_id === supplyId) ??
    profileForBaseUnit(baseUnit, supplies)
  )
}

function addCalendarDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

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
  const rotateSubmissionKey = useCallback(() => {
    setSubmissionKey(createClientSubmissionKey())
  }, [])

  return [submissionKey, rotateSubmissionKey] as const
}

function useInvalidateOnSuccess(
  state: ResearchTrackingActionState,
  keys: ResearchTrackingQueryKey[],
  onSubmissionKeyConsumed?: () => void,
) {
  const queryClient = useQueryClient()
  const keysRef = useRef(keys)
  const onSubmissionKeyConsumedRef = useRef(onSubmissionKeyConsumed)
  keysRef.current = keys
  onSubmissionKeyConsumedRef.current = onSubmissionKeyConsumed

  useEffect(() => {
    if (state.submissionKeyConsumed) {
      onSubmissionKeyConsumedRef.current?.()
    }

    if (!state.success) {
      return
    }

    void Promise.all(
      keysRef.current.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey, exact: true }),
      ),
    )
  }, [queryClient, state])
}

function ActionButton({ children }: { children: React.ReactNode }) {
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

function Message({ state }: { state: ResearchTrackingActionState }) {
  if (state.error) {
    return <p className="text-sm text-red-600">{state.error}</p>
  }

  if (state.success) {
    return <p className="text-sm text-emerald-700">Saved successfully.</p>
  }

  return null
}

function hiddenCommon(countryCode: string, idempotencyKey?: string) {
  return (
    <>
      <input type="hidden" name="country_code" value={countryCode} />
      {idempotencyKey && (
        <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      )}
    </>
  )
}

function CreateRoutineCard({
  countryCode,
  idempotencyKey,
  trackedMaterials,
  today,
}: {
  countryCode: string
  idempotencyKey: string
  trackedMaterials: TrackedResearchMaterial[]
  today: string
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("")
  const [selectedUnitProfile, setSelectedUnitProfile] = useState("")
  const [state, action] = useActionState(
    createResearchRoutineAction,
    initialState,
  )
  const [submissionKey, rotateSubmissionKey] =
    useRotatingSubmissionKey(idempotencyKey)
  useInvalidateOnSuccess(state, [
    researchTrackingQueryKeys.routines.list,
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
  ], rotateSubmissionKey)
  const selectedMaterial = trackedMaterials.find(
    (material) => material.tracked_material_id === selectedMaterialId,
  )
  const unitOptions = routineUnitOptions(selectedMaterial?.supplies ?? [])
  const activeUnitProfile = unitOptions.find(
    (option) => option.key === selectedUnitProfile,
  )?.profile

  return (
    <form action={action} className={`${cardClass} space-y-4`}>
      {hiddenCommon(countryCode, submissionKey)}
      <h3 className="text-base font-semibold">Create a personal routine</h3>
      <p className="text-sm leading-6 text-ui-fg-subtle">
        Enter your own neutral organization details. The store does not suggest
        quantities, schedules, routes, or intended outcomes.
      </p>
      <label className="block text-sm font-medium">
        Tracked material
        <select
          name="tracked_material_id"
          required
          value={selectedMaterialId}
          onChange={(event) => {
            setSelectedMaterialId(event.target.value)
            setSelectedUnitProfile("")
          }}
          className={`${inputClass} mt-2`}
        >
          <option value="" disabled>
            Select a tracked material
          </option>
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
      <label className="block text-sm font-medium">
        Routine label
        <input
          name="label"
          required
          maxLength={120}
          className={`${inputClass} mt-2`}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
        <label className="block text-sm font-medium">
          Planned material quantity
          <input
            name="planned_quantity_display_units"
            type="number"
            min={activeUnitProfile ? researchDisplayStep(activeUnitProfile) : 0}
            step={activeUnitProfile ? researchDisplayStep(activeUnitProfile) : "any"}
            required
            disabled={!activeUnitProfile}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Unit
          <select
            name="unit_profile"
            required
            value={selectedUnitProfile}
            onChange={(event) => setSelectedUnitProfile(event.target.value)}
            disabled={!unitOptions.length}
            className={`${inputClass} mt-2`}
          >
            <option value="" disabled>
              Select unit
            </option>
            {unitOptions.map(({ key, profile }) => (
              <option key={key} value={key}>
                {profile.display_unit}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selectedMaterial && !unitOptions.length && (
        <p className="text-sm text-amber-700">
          This material does not have a verified quantity-unit profile yet.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
        <label className="block text-sm font-medium">
          Recurrence
          <select
            name="recurrence_type"
            defaultValue="once"
            className={`${inputClass} mt-2`}
          >
            <option value="once">Once</option>
            <option value="daily">Daily interval</option>
            <option value="weekly">Weekly interval</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Local time
          <input
            name="local_time"
            type="time"
            required
            className={`${inputClass} mt-2`}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
        <label className="block text-sm font-medium">
          Daily interval (1–30)
          <input
            name="daily_interval"
            type="number"
            min="1"
            max="30"
            defaultValue="1"
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Weekly interval (1–12)
          <input
            name="weekly_interval"
            type="number"
            min="1"
            max="12"
            defaultValue="1"
            className={`${inputClass} mt-2`}
          />
        </label>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Weekly weekdays</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <label key={day} className="flex items-center gap-1.5">
                <input type="checkbox" name="weekdays" value={index} /> {day}
              </label>
            ),
          )}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
        <label className="block text-sm font-medium">
          Start date
          <input
            name="start_date"
            type="date"
            required
            defaultValue={today}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Optional end date
          <input name="end_date" type="date" className={`${inputClass} mt-2`} />
        </label>
      </div>
      <input type="hidden" name="effective_from_date" value={today} />
      <Message state={state} />
      <ActionButton>Create routine</ActionButton>
    </form>
  )
}

function OccurrenceCard({
  countryCode,
  occurrence,
  routine,
  submissionKey,
  today,
  trackedMaterials,
}: {
  countryCode: string
  occurrence: ResearchOccurrence
  routine: ResearchRoutine
  submissionKey?: string
  today: string
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const [previewState, previewAction] = useActionState(
    previewResearchRoutineLogAction,
    initialPreviewState,
  )
  const [confirmState, confirmAction] = useActionState(
    confirmResearchRoutineLogAction,
    initialState,
  )
  const [confirmationKey, rotateConfirmationKey] =
    useRotatingSubmissionKey(submissionKey)
  const supplies =
    trackedMaterials
      .find(
        (material) =>
          material.tracked_material_id === routine.tracked_material_id,
      )
      ?.supplies.filter(
        (supply) =>
          supply.status === "active" &&
          supply.base_unit === occurrence.base_unit,
      ) ?? []
  useInvalidateOnSuccess(confirmState, [
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
    researchTrackingQueryKeys.occurrences.detail(occurrence.occurrence_id),
    researchTrackingQueryKeys.logs.list,
    researchTrackingQueryKeys.supplies.list,
    ...(previewState.preview
      ? [researchTrackingQueryKeys.supplies.detail(previewState.preview.supply_id)]
      : []),
  ], rotateConfirmationKey)

  return (
    <div className="rounded-lg border border-ui-border-base p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{occurrence.label}</p>
          <p className="mt-1 text-xs text-ui-fg-muted">
            {occurrence.local_date} at {occurrence.local_time} ·{" "}
            {occurrence.timezone}
          </p>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-ui-fg-muted">
          {occurrence.status}
        </span>
      </div>
      <p className="mt-3 text-sm">
        Planned material quantity:{" "}
        {formatResearchQuantity(
          occurrence.planned_quantity_base_units,
          profileForBaseUnit(occurrence.base_unit, supplies),
        )}
      </p>
      {occurrence.status === "scheduled" &&
        (supplies.length ? (
          <form action={previewAction} className="mt-4 space-y-3">
            {hiddenCommon(countryCode)}
            <input
              type="hidden"
              name="routine_id"
              value={occurrence.routine_id}
            />
            <input
              type="hidden"
              name="routine_revision_id"
              value={occurrence.routine_revision_id}
            />
            <input
              type="hidden"
              name="occurrence_id"
              value={occurrence.occurrence_id}
            />
            <input
              type="hidden"
              name="local_date"
              value={occurrence.local_date}
            />
            <input
              type="hidden"
              name="confirmed_quantity_base_units"
              value={occurrence.planned_quantity_base_units}
            />
            <input
              type="hidden"
              name="base_unit"
              value={occurrence.base_unit}
            />
            <label className="block text-sm font-medium">
              Private supply
              <select
                name="supply_id"
                required
                defaultValue=""
                className={`${inputClass} mt-2`}
              >
                <option value="" disabled>
                  Select a supply
                </option>
                {supplies.map((supply) => (
                  <option key={supply.supply_id} value={supply.supply_id}>
                    {formatResearchQuantity(
                      supply.remaining_quantity_base_units,
                      supply,
                    )} remaining
                  </option>
                ))}
              </select>
            </label>
            {previewState.error && (
              <p className="text-sm text-red-600">{previewState.error}</p>
            )}
            <ActionButton>Review record</ActionButton>
          </form>
        ) : (
          <p className="mt-4 text-sm text-amber-700">
            No active supply with the matching unit is available. Add or restore
            a compatible supply before recording this occurrence.
          </p>
        ))}
      {previewState.preview && (
        <form
          action={confirmAction}
          className="mt-4 space-y-3 rounded-lg bg-ui-bg-subtle p-4"
        >
          {hiddenCommon(countryCode, confirmationKey)}
          <input
            type="hidden"
            name="routine_id"
            value={previewState.preview.routine_id}
          />
          <input
            type="hidden"
            name="routine_revision_id"
            value={previewState.preview.routine_revision_id}
          />
          <input
            type="hidden"
            name="occurrence_id"
            value={previewState.preview.occurrence_id}
          />
          <input
            type="hidden"
            name="local_date"
            value={previewState.preview.local_date}
          />
          <input
            type="hidden"
            name="supply_id"
            value={previewState.preview.supply_id}
          />
          <input
            type="hidden"
            name="confirmed_quantity_base_units"
            value={previewState.preview.confirmed_quantity_base_units}
          />
          <input
            type="hidden"
            name="base_unit"
            value={previewState.preview.base_unit}
          />
          <input
            type="hidden"
            name="preview_token"
            value={previewState.preview.preview_token}
          />
          <p className="text-sm">
            Remaining after confirmation:{" "}
            {formatResearchQuantity(
              previewState.preview.projected_remaining_quantity_base_units,
              profileForSupply(
                previewState.preview.supply_id,
                previewState.preview.base_unit,
                supplies,
              ),
            )}
          </p>
          <p className="text-xs leading-5 text-ui-fg-subtle">
            {previewState.preview.notice}
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="confirm_record"
              required
              className="mt-1"
            />
            <span>
              I reviewed this private research record and supply change.
            </span>
          </label>
          <Message state={confirmState} />
          <ActionButton>Confirm record</ActionButton>
        </form>
      )}
    </div>
  )
}

function RoutineTransitionRow({
  canMutate,
  countryCode,
  idempotencyKey,
  routine,
  trackedMaterials,
  today,
  updateIdempotencyKey,
}: {
  canMutate: boolean
  countryCode: string
  idempotencyKey?: string
  routine: ResearchRoutine
  trackedMaterials: TrackedResearchMaterial[]
  today: string
  updateIdempotencyKey?: string
}) {
  const [state, action] = useActionState(
    transitionResearchRoutineAction,
    initialState,
  )
  const [transitionKey, rotateTransitionKey] =
    useRotatingSubmissionKey(idempotencyKey)
  const [updateKey, rotateUpdateKey] = useRotatingSubmissionKey(
    updateIdempotencyKey,
  )
  useInvalidateOnSuccess(state, [
    researchTrackingQueryKeys.routines.list,
    researchTrackingQueryKeys.routines.detail(routine.routine_id),
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
  ], rotateTransitionKey)

  return (
    <div className="rounded-lg border border-ui-border-base p-4">
      <div className="flex flex-col justify-between gap-3 small:flex-row">
        <div>
          <p className="text-sm font-semibold">
            {routine.current_revision.label}
          </p>
          <p className="mt-1 text-xs text-ui-fg-muted">
            {routine.tracked_material_label} ·{" "}
            {routine.current_revision.schedule.recurrence_type} ·{" "}
            {routine.status}
          </p>
        </div>
        {canMutate && (
          <form action={action} className="space-y-2">
            {hiddenCommon(countryCode, transitionKey)}
            <input type="hidden" name="routine_id" value={routine.routine_id} />
            <input
              type="hidden"
              name="operation"
              value={routine.status === "active" ? "archive" : "resume"}
            />
            <input type="hidden" name="effective_from_date" value={today} />
            <ActionButton>
              {routine.status === "active" ? "Archive" : "Resume"}
            </ActionButton>
            <Message state={state} />
          </form>
        )}
      </div>
      {canMutate && routine.status === "active" && (
        <RoutineEditForm
          countryCode={countryCode}
          idempotencyKey={updateKey}
          onSuccess={rotateUpdateKey}
          routine={routine}
          trackedMaterial={trackedMaterials.find(
            (material) =>
              material.tracked_material_id === routine.tracked_material_id,
          )}
          today={today}
        />
      )}
    </div>
  )
}

function RoutineEditForm({
  countryCode,
  idempotencyKey,
  onSuccess,
  routine,
  trackedMaterial,
  today,
}: {
  countryCode: string
  idempotencyKey: string
  onSuccess: () => void
  routine: ResearchRoutine
  trackedMaterial?: TrackedResearchMaterial
  today: string
}) {
  const [state, action] = useActionState(
    updateResearchRoutineAction,
    initialState,
  )
  useInvalidateOnSuccess(state, [
    researchTrackingQueryKeys.routines.list,
    researchTrackingQueryKeys.routines.detail(routine.routine_id),
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
  ], onSuccess)
  const revision = routine.current_revision
  const schedule = revision.schedule
  const unitOptions = routineUnitOptions(
    (trackedMaterial?.supplies ?? []).filter(
      (supply) => supply.base_unit === revision.base_unit,
    ),
  )
  const fallbackUnitProfile = defaultResearchUnitProfile(revision.base_unit)
  const initialUnitProfile = unitOptions[0]?.profile ?? fallbackUnitProfile
  const [selectedUnitProfile, setSelectedUnitProfile] = useState(
    () => unitOptions[0]?.key ?? serializeResearchUnitProfile(fallbackUnitProfile),
  )
  const activeUnitProfile =
    unitOptions.find((option) => option.key === selectedUnitProfile)?.profile ??
    fallbackUnitProfile
  const [displayQuantity, setDisplayQuantity] = useState(() =>
    String(
      researchDisplayQuantity(
        revision.planned_quantity_base_units,
        initialUnitProfile,
      ),
    ),
  )

  return (
    <details className="mt-4 border-t border-ui-border-base pt-4">
      <summary className="cursor-pointer text-sm font-medium">
        Edit routine details
      </summary>
      <form
        action={action}
        className="mt-4 grid grid-cols-1 gap-3 small:grid-cols-2"
      >
        {hiddenCommon(countryCode, idempotencyKey)}
        <input type="hidden" name="routine_id" value={routine.routine_id} />
        <input type="hidden" name="effective_from_date" value={today} />
        <label className="block text-sm font-medium small:col-span-2">
          Routine label
          <input
            name="label"
            required
            maxLength={120}
            defaultValue={revision.label}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Planned material quantity
          <input
            name="planned_quantity_display_units"
            type="number"
            min={researchDisplayStep(activeUnitProfile)}
            step={researchDisplayStep(activeUnitProfile)}
            required
            value={displayQuantity}
            onChange={(event) => setDisplayQuantity(event.target.value)}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Unit
          <select
            name="unit_profile"
            required
            value={selectedUnitProfile}
            onChange={(event) => {
              const nextKey = event.target.value
              const nextProfile = unitOptions.find(
                (option) => option.key === nextKey,
              )?.profile
              const baseUnits = convertResearchDisplayQuantityToBaseUnits(
                Number(displayQuantity),
                activeUnitProfile,
              )

              if (nextProfile && baseUnits) {
                setDisplayQuantity(
                  String(researchDisplayQuantity(baseUnits, nextProfile)),
                )
              }
              setSelectedUnitProfile(nextKey)
            }}
            className={`${inputClass} mt-2`}
          >
            {(unitOptions.length
              ? unitOptions
              : [
                  {
                    key: serializeResearchUnitProfile(fallbackUnitProfile),
                    profile: fallbackUnitProfile,
                  },
                ]
            ).map(({ key, profile }) => (
              <option key={key} value={key}>
                {profile.display_unit}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Recurrence
          <select
            name="recurrence_type"
            defaultValue={schedule.recurrence_type}
            className={`${inputClass} mt-2`}
          >
            <option value="once">Once</option>
            <option value="daily">Daily interval</option>
            <option value="weekly">Weekly interval</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Local time
          <input
            name="local_time"
            type="time"
            required
            defaultValue={schedule.local_time}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Daily interval
          <input
            name="daily_interval"
            type="number"
            min="1"
            max="30"
            defaultValue={schedule.daily_interval ?? 1}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Weekly interval
          <input
            name="weekly_interval"
            type="number"
            min="1"
            max="12"
            defaultValue={schedule.weekly_interval ?? 1}
            className={`${inputClass} mt-2`}
          />
        </label>
        <fieldset className="space-y-2 small:col-span-2">
          <legend className="text-sm font-medium">Weekly weekdays</legend>
          <div className="flex flex-wrap gap-3 text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => (
                <label key={day} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="weekdays"
                    value={index}
                    defaultChecked={schedule.weekdays.includes(index)}
                  />{" "}
                  {day}
                </label>
              ),
            )}
          </div>
        </fieldset>
        <label className="block text-sm font-medium">
          Start date
          <input
            name="start_date"
            type="date"
            required
            defaultValue={schedule.start_date}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Optional end date
          <input
            name="end_date"
            type="date"
            defaultValue={schedule.end_date ?? ""}
            className={`${inputClass} mt-2`}
          />
        </label>
        <div className="space-y-2 small:col-span-2">
          <Message state={state} />
          <ActionButton>Save routine revision</ActionButton>
        </div>
      </form>
    </details>
  )
}

function LogMutationForm({
  countryCode,
  idempotencyKey,
  log,
  operation,
  onSuccess,
  supplies,
  today,
}: {
  countryCode: string
  idempotencyKey: string
  log: ResearchRoutineLog
  operation: "revise" | "void" | "restore"
  onSuccess: () => void
  supplies: TrackedResearchMaterial["supplies"]
  today: string
}) {
  const [selectedSupplyId, setSelectedSupplyId] = useState(log.supply_id)
  const [previewState, previewAction] = useActionState(
    previewResearchRoutineLogMutationAction,
    initialMutationPreviewState,
  )
  const [mutationState, mutationAction] = useActionState(
    mutateResearchRoutineLogAction,
    initialState,
  )
  useInvalidateOnSuccess(mutationState, [
    researchTrackingQueryKeys.logs.list,
    researchTrackingQueryKeys.logs.detail(log.log_id),
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
    researchTrackingQueryKeys.occurrences.detail(log.occurrence_id),
    researchTrackingQueryKeys.supplies.list,
    ...(previewState.preview?.supply_changes.map((supply) =>
      researchTrackingQueryKeys.supplies.detail(supply.supply_id),
    ) ?? []),
  ], onSuccess)
  const needsSupply = operation !== "void"
  const selectedSupply =
    supplies.find((supply) => supply.supply_id === selectedSupplyId) ??
    supplies[0]
  const unitProfile = selectedSupply
    ? resolveResearchUnitProfile(selectedSupply)
    : defaultResearchUnitProfile(log.base_unit)

  return (
    <div className="rounded-lg border border-ui-border-base p-3">
      <form action={previewAction} className="space-y-3">
        {hiddenCommon(countryCode)}
        <input type="hidden" name="log_id" value={log.log_id} />
        <input type="hidden" name="operation" value={operation} />
        {needsSupply && (
          <>
            <label className="block text-sm font-medium">
              Private supply
              <select
                name="supply_id"
                required
                value={selectedSupplyId}
                onChange={(event) => setSelectedSupplyId(event.target.value)}
                className={`${inputClass} mt-2`}
              >
                {supplies.map((supply) => (
                  <option key={supply.supply_id} value={supply.supply_id}>
                    {formatResearchQuantity(
                      supply.remaining_quantity_base_units,
                      supply,
                    )} remaining
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Confirmed quantity
              <input
                key={selectedSupplyId}
                name="confirmed_quantity_display_units"
                type="number"
                min={researchDisplayStep(unitProfile)}
                step={researchDisplayStep(unitProfile)}
                required
                defaultValue={researchDisplayQuantity(
                  log.confirmed_quantity_base_units,
                  unitProfile,
                )}
                className={`${inputClass} mt-2`}
              />
            </label>
            <input
              type="hidden"
              name="unit_profile"
              value={serializeResearchUnitProfile(unitProfile)}
            />
          </>
        )}
        {previewState.error && (
          <p className="text-sm text-red-600">{previewState.error}</p>
        )}
        <ActionButton>Review {operation}</ActionButton>
      </form>
      {previewState.preview && (
        <form
          action={mutationAction}
          className="mt-3 space-y-3 bg-ui-bg-subtle p-3"
        >
          {hiddenCommon(countryCode, idempotencyKey)}
          <input type="hidden" name="log_id" value={log.log_id} />
          <input type="hidden" name="operation" value={operation} />
          <input
            type="hidden"
            name="preview_token"
            value={previewState.preview.preview_token}
          />
          {operation !== "void" && (
            <>
              <input
                type="hidden"
                name="supply_id"
                value={previewState.preview.supply_changes.at(-1)?.supply_id}
              />
              <input
                type="hidden"
                name="confirmed_quantity_base_units"
                value={previewState.preview.confirmed_quantity_base_units}
              />
              <input
                type="hidden"
                name="base_unit"
                value={previewState.preview.base_unit}
              />
            </>
          )}
          {previewState.preview.supply_changes.map((change) => (
            <p key={change.supply_id} className="text-sm">
              Supply balance:{" "}
              {formatResearchQuantity(
                change.current_remaining_quantity_base_units,
                profileForSupply(change.supply_id, change.base_unit, supplies),
              )}{" "}
              →{" "}
              {formatResearchQuantity(
                change.projected_remaining_quantity_base_units,
                profileForSupply(change.supply_id, change.base_unit, supplies),
              )}
            </p>
          ))}
          <p className="text-xs leading-5 text-ui-fg-subtle">
            {previewState.preview.notice}
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="confirm_record"
              required
              className="mt-1"
            />
            <span>I reviewed this record and every supply balance change.</span>
          </label>
          <Message state={mutationState} />
          <ActionButton>Confirm {operation}</ActionButton>
        </form>
      )}
    </div>
  )
}

function RoutineLogCard({
  canMutate,
  countryCode,
  idempotencyKeys,
  log,
  routine,
  today,
  trackedMaterials,
}: {
  canMutate: boolean
  countryCode: string
  idempotencyKeys?: RoutineSubmissionKeys["logMutations"][string]
  log: ResearchRoutineLog
  routine: ResearchRoutine
  today: string
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const [operationKeys, setOperationKeys] = useState(() => ({
    revise: idempotencyKeys?.revise ?? createClientSubmissionKey(),
    void: idempotencyKeys?.void ?? createClientSubmissionKey(),
    restore: idempotencyKeys?.restore ?? createClientSubmissionKey(),
  }))
  const rotateOperationKey = useCallback(
    (operation: ResearchLogMutationOperation) => {
      setOperationKeys((current) => ({
        ...current,
        [operation]: createClientSubmissionKey(),
      }))
    },
    [],
  )
  const supplies =
    trackedMaterials
      .find(
        (material) =>
          material.tracked_material_id === routine.tracked_material_id,
      )
      ?.supplies.filter(
        (supply) =>
          supply.base_unit === log.base_unit &&
          (supply.status === "active" || supply.supply_id === log.supply_id),
      ) ?? []

  return (
    <div className="space-y-3 rounded-lg border border-ui-border-base p-4">
      <div>
        <p className="text-sm font-semibold">
          {routine.current_revision.label}
        </p>
        <p className="mt-1 text-xs text-ui-fg-muted">
          {log.local_date} at {log.local_time} · {log.status} · last action{" "}
          {log.operation}
        </p>
        <p className="mt-2 text-sm">
          Recorded material quantity:{" "}
          {formatResearchQuantity(
            log.confirmed_quantity_base_units,
            profileForSupply(log.supply_id, log.base_unit, supplies),
          )}
        </p>
      </div>
      {canMutate && (log.status === "confirmed" ? (
        <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
          <LogMutationForm
            countryCode={countryCode}
            idempotencyKey={operationKeys.revise}
            log={log}
            operation="revise"
            onSuccess={() => rotateOperationKey("revise")}
            supplies={supplies}
            today={today}
          />
          <LogMutationForm
            countryCode={countryCode}
            idempotencyKey={operationKeys.void}
            log={log}
            operation="void"
            onSuccess={() => rotateOperationKey("void")}
            supplies={supplies}
            today={today}
          />
        </div>
      ) : (
        <LogMutationForm
          countryCode={countryCode}
          idempotencyKey={operationKeys.restore}
          log={log}
          operation="restore"
          onSuccess={() => rotateOperationKey("restore")}
          supplies={supplies}
          today={today}
        />
      ))}
    </div>
  )
}

function PersonalRoutinesContent({
  canMutate,
  countryCode,
  occurrences,
  logs,
  routines,
  runtimeReady,
  submissionKeys,
  today,
  trackedMaterials,
}: PersonalRoutinesProps) {
  const rangeEnd = addCalendarDays(today, 6)
  const routinesQuery = useQuery({
    queryKey: researchTrackingQueryKeys.routines.list,
    queryFn: retrieveResearchRoutines,
    initialData: routines,
    enabled: runtimeReady,
  })
  const occurrencesQuery = useQuery({
    queryKey: researchTrackingQueryKeys.occurrences.list(today, rangeEnd),
    queryFn: () => retrieveResearchOccurrences(today, rangeEnd),
    initialData: occurrences,
    enabled: runtimeReady && canMutate,
  })
  const logsQuery = useQuery({
    queryKey: researchTrackingQueryKeys.logs.list,
    queryFn: retrieveResearchRoutineLogs,
    initialData: logs,
    enabled: runtimeReady,
  })
  const suppliesQuery = useQuery({
    queryKey: researchTrackingQueryKeys.supplies.list,
    queryFn: retrieveTrackedResearchMaterials,
    initialData: trackedMaterials,
    enabled: runtimeReady && canMutate,
  })
  const currentRoutines = routinesQuery.data
  const currentOccurrences = occurrencesQuery.data
  const currentLogs = logsQuery.data
  const currentTrackedMaterials = suppliesQuery.data
  const queryFailed =
    routinesQuery.isError ||
    occurrencesQuery.isError ||
    logsQuery.isError ||
    suppliesQuery.isError
  const isRefreshing =
    routinesQuery.isFetching ||
    occurrencesQuery.isFetching ||
    logsQuery.isFetching ||
    suppliesQuery.isFetching

  if (!runtimeReady || queryFailed) {
    return (
      <section className="mt-10">
        <div
          className={`${cardClass} border-amber-200 bg-amber-50 text-sm text-amber-900`}
        >
          Personal routines are temporarily unavailable. No private record was
          changed.
        </div>
      </section>
    )
  }

  return (
    <section
      className="mt-10 space-y-5"
      aria-labelledby="personal-routines-title"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Private organization
        </p>
        <h2 id="personal-routines-title" className="mt-2 text-lg font-semibold">
          Today & Personal Routines
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Customer-authored schedules and review-first records. This area does
          not provide medical guidance or store recommendations.
        </p>
        {isRefreshing && (
          <p className="mt-2 text-xs text-ui-fg-muted" aria-live="polite">
            Refreshing private routine data…
          </p>
        )}
      </div>
      {!canMutate && (
        <div className={`${cardClass} bg-ui-bg-subtle text-sm`}>
          Personal routines and records are read-only. An active profile with
          current consent is required to create or change them.
        </div>
      )}
      {canMutate && (
        <div className="grid grid-cols-1 gap-5 large:grid-cols-2">
          <div className={`${cardClass} space-y-3`}>
            <h3 className="text-base font-semibold">Today and upcoming</h3>
            {currentOccurrences.length ? (
              currentOccurrences.map((occurrence) => {
                const routine = currentRoutines.find(
                  (item) => item.routine_id === occurrence.routine_id,
                )
                return routine ? (
                  <OccurrenceCard
                    key={occurrence.occurrence_id}
                    countryCode={countryCode}
                    occurrence={occurrence}
                    routine={routine}
                    submissionKey={
                      submissionKeys.confirmations[occurrence.occurrence_id]
                    }
                    today={today}
                    trackedMaterials={currentTrackedMaterials}
                  />
                ) : null
              })
            ) : (
              <p className="text-sm text-ui-fg-subtle">
                {currentRoutines.length > 0 &&
                currentRoutines.every((routine) => routine.status === "archived")
                  ? "All personal routines are archived. Resume a routine to project future records."
                  : "No scheduled records in this seven-day view."}
              </p>
            )}
          </div>
          <CreateRoutineCard
            countryCode={countryCode}
            idempotencyKey={submissionKeys.create}
            trackedMaterials={currentTrackedMaterials}
            today={today}
          />
        </div>
      )}
      <div className={`${cardClass} space-y-3`}>
        <h3 className="text-base font-semibold">Your routines</h3>
        {currentRoutines.length ? (
          currentRoutines.map((routine) => (
            <RoutineTransitionRow
              key={routine.routine_id}
              canMutate={canMutate}
              countryCode={countryCode}
              idempotencyKey={submissionKeys.transitions[routine.routine_id]}
              updateIdempotencyKey={submissionKeys.updates[routine.routine_id]}
              routine={routine}
              trackedMaterials={currentTrackedMaterials}
              today={today}
            />
          ))
        ) : (
          <p className="text-sm text-ui-fg-subtle">No personal routines yet.</p>
        )}
      </div>
      <div className={`${cardClass} space-y-3`}>
        <h3 className="text-base font-semibold">Private routine records</h3>
        {currentLogs.length ? (
          currentLogs.map((log) => {
            const routine = currentRoutines.find(
              (item) => item.routine_id === log.routine_id,
            )
            return routine ? (
              <RoutineLogCard
                key={log.log_id}
                canMutate={canMutate}
                countryCode={countryCode}
                idempotencyKeys={submissionKeys.logMutations[log.log_id]}
                log={log}
                routine={routine}
                today={today}
                trackedMaterials={currentTrackedMaterials}
              />
            ) : null
          })
        ) : (
          <p className="text-sm text-ui-fg-subtle">
            No private routine records yet.
          </p>
        )}
      </div>
    </section>
  )
}

export default function PersonalRoutines(props: PersonalRoutinesProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Number.POSITIVE_INFINITY,
            gcTime: 0,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PersonalRoutinesContent {...props} />
    </QueryClientProvider>
  )
}
