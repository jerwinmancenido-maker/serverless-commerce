"use client"

import {
  adjustResearchOccurrenceAction,
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
  type ResearchProtocolAccess,
} from "@lib/data/research-tracking"
import { getCompoundProtocol } from "@lib/data/compound-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
  isMcgPreferredCompound,
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
  useMemo,
  useRef,
  useState,
} from "react"
import PostDoseCheckIn from "./post-dose-check-in"
import { useFormStatus } from "react-dom"
import type { HttpTypes } from "@medusajs/types"
import { resolveCompoundIdentity } from "@lib/util/compound-identity"

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
  products?: HttpTypes.StoreProduct[]
  protocols?: ResearchProtocolAccess[]
  isCreateOpen?: boolean
  onOpenChange?: (open: boolean) => void
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
  materialLabel?: string,
) {
  const profiles = Array.from(
    new Map(
      supplies
        .filter((supply) => supply.base_unit === baseUnit)
        .map((supply) => {
          const profile = resolveResearchUnitProfile(supply, materialLabel)
          const key = serializeResearchUnitProfile(profile, materialLabel)

          return [key, profile] as const
        }),
    ).values(),
  )

  return profiles.length === 1
    ? profiles[0]
    : defaultResearchUnitProfile(baseUnit, materialLabel)
}

function routineUnitOptions(
  supplies: TrackedResearchMaterial["supplies"],
  compoundNameOrLabel?: string | null,
) {
  const map = new Map<
    string,
    { key: string; profile: ReturnType<typeof resolveResearchUnitProfile> }
  >()

  for (const supply of supplies) {
    const profile = resolveResearchUnitProfile(supply, compoundNameOrLabel)
    if (!map.has(profile.display_unit)) {
      const key = serializeResearchUnitProfile(profile, compoundNameOrLabel)
      map.set(profile.display_unit, { key, profile })
    }
  }

  // If base unit is microgram, provide standard scientific options (mg and mcg) without duplicates
  const firstSupply = supplies[0]
  const isMicrogram =
    firstSupply?.base_unit === "microgram" ||
    (!supplies.length && isMcgPreferredCompound(compoundNameOrLabel))

  if (isMicrogram) {
    if (!map.has("mg")) {
      const mgProfile = defaultResearchUnitProfile("microgram", "standard")
      map.set("mg", {
        key: serializeResearchUnitProfile(mgProfile, compoundNameOrLabel),
        profile: mgProfile,
      })
    }
    if (!map.has("mcg")) {
      const mcgProfile = defaultResearchUnitProfile("microgram", "semax")
      map.set("mcg", {
        key: serializeResearchUnitProfile(mcgProfile, compoundNameOrLabel),
        profile: mcgProfile,
      })
    }
  }

  const profiles = Array.from(map.values())
  const iuProfiles = profiles.filter(
    ({ profile }) => profile.display_unit === "IU",
  )
  const hasUnambiguousIuProfile =
    iuProfiles.length === 1 &&
    supplies.every(
      (supply) =>
        serializeResearchUnitProfile(
          resolveResearchUnitProfile(supply, compoundNameOrLabel),
          compoundNameOrLabel,
        ) === iuProfiles[0].key,
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
  materialLabel?: string,
) {
  return (
    supplies.find((supply) => supply.supply_id === supplyId) ??
    profileForBaseUnit(baseUnit, supplies, materialLabel)
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

function ActionButton({
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
      className={`rounded-lg bg-ui-fg-base px-4 py-2.5 text-sm font-medium text-ui-bg-base disabled:opacity-50 ${className}`}
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
  products,
  protocols,
  isOpen: controlledIsOpen,
  onOpenChange,
}: {
  countryCode: string
  idempotencyKey: string
  trackedMaterials: TrackedResearchMaterial[]
  today: string
  products?: HttpTypes.StoreProduct[]
  protocols?: ResearchProtocolAccess[]
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false)
    }
    setInternalIsOpen(false)
  }, [onOpenChange])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleClose])

  const [selectedMaterialId, setSelectedMaterialId] = useState(
    trackedMaterials[0]?.tracked_material_id || ""
  )
  const selectedMaterial =
    trackedMaterials.find(
      (material) => material.tracked_material_id === selectedMaterialId
    ) || trackedMaterials[0]

  const materialIdentity = selectedMaterial
    ? resolveCompoundIdentity({
        label: selectedMaterial.label,
        productVariantId: selectedMaterial.product_variant_id,
        products,
      })
    : null

  const unitOptions = routineUnitOptions(
    selectedMaterial?.supplies ?? [],
    materialIdentity?.compoundName || selectedMaterial?.label
  )
  const [selectedUnitProfile, setSelectedUnitProfile] = useState("")

  useEffect(() => {
    if (!selectedUnitProfile && unitOptions.length > 0) {
      const preferred = isMcgPreferredCompound(materialIdentity?.compoundName) ? "mcg" : "mg"
      const matched = unitOptions.find(
        (o) => o.profile.display_unit.toLowerCase() === preferred.toLowerCase()
      )
      setSelectedUnitProfile(matched ? matched.key : unitOptions[0].key)
    }
  }, [selectedUnitProfile, unitOptions, materialIdentity?.compoundName])

  const activeUnitProfile =
    unitOptions.find((option) => option.key === selectedUnitProfile)?.profile ||
    unitOptions[0]?.profile

  const isMcg = materialIdentity
    ? isMcgPreferredCompound(materialIdentity.compoundName)
    : false

  const [routineLabel, setRoutineLabel] = useState(
    materialIdentity ? `${materialIdentity.compoundName} Protocol` : ""
  )
  const [plannedDose, setPlannedDose] = useState(isMcg ? "500" : "2.5")
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "once">("daily")
  const [dailyInterval, setDailyInterval] = useState(1)
  const [weeklyInterval, setWeeklyInterval] = useState(1)
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]) // Mon, Wed, Fri
  const [localTime, setLocalTime] = useState("08:00")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState("")
  const [appliedStageName, setAppliedStageName] = useState<string | null>(null)

  const matchedProtocolAccess = useMemo(() => {
    if (!protocols?.length) return null
    const cName = (materialIdentity?.compoundName || "").toLowerCase()
    const matLabel = (selectedMaterial?.label || "").toLowerCase()
    return (
      protocols.find((p) => {
        const pTitle = (p.protocol_title || "").toLowerCase()
        const pHandle = (p.protocol_handle || "").toLowerCase()
        const prodTitle = (p.product?.title || "").toLowerCase()
        return (
          (cName &&
            (pTitle.includes(cName) ||
              pHandle.includes(cName) ||
              prodTitle.includes(cName))) ||
          (matLabel &&
            (pTitle.includes(matLabel) || prodTitle.includes(matLabel)))
        )
      }) ?? null
    )
  }, [protocols, materialIdentity?.compoundName, selectedMaterial?.label])

  const analyticalProtocol = useMemo(() => {
    return getCompoundProtocol(
      materialIdentity?.compoundName ||
        selectedMaterial?.label ||
        matchedProtocolAccess?.protocol_handle
    )
  }, [
    materialIdentity?.compoundName,
    selectedMaterial?.label,
    matchedProtocolAccess?.protocol_handle,
  ])

  const protocolDocumentUrl = matchedProtocolAccess?.access_token
    ? `/research-protocol-access/${matchedProtocolAccess.access_token}`
    : matchedProtocolAccess?.protocol_handle
    ? `/research-protocols/${matchedProtocolAccess.protocol_handle}`
    : analyticalProtocol?.handles?.[0]
    ? `/research-protocols/${analyticalProtocol.handles[0]}`
    : `/research-protocols/${analyticalProtocol.id}`

  const protocolDocumentTitle =
    matchedProtocolAccess?.protocol_title ||
    analyticalProtocol.subtitle ||
    `${materialIdentity?.compoundName || "Compound"} Laboratory Protocol Standard`

  const isOrderPreserved = Boolean(matchedProtocolAccess?.access_token)
  const preservedRevision = matchedProtocolAccess?.preserved_revision ?? 1

  // Extract official protocol recommendations / stages from document
  const protocolRecommendations = useMemo(() => {
    // If order-preserved protocol has routine_levels with rows
    if (matchedProtocolAccess?.routine_levels?.length) {
      const rows = matchedProtocolAccess.routine_levels.flatMap((l) =>
        l.rows
          .filter((r) => r.routine_ready || r.amount)
          .map((r) => ({
            stage: l.title || r.period,
            doseDisplay: `${r.amount} ${r.unit}`,
            amount: r.amount,
            unit: r.unit,
            cadence: (r.recurrence_type === "weekly" ? "weekly" : "daily") as
              | "daily"
              | "weekly",
            frequencyText: r.frequency,
            focus: l.summary || r.period,
          }))
      )
      if (rows.length > 0) return rows
    }

    // Otherwise use analytical protocol titration steps
    if (analyticalProtocol?.dosing?.titrationSteps?.length) {
      return analyticalProtocol.dosing.titrationSteps
        .filter((step) => step.doseMcg > 0)
        .map((step) => {
          const isMcgUnit =
            step.doseMcg < 1000 || activeUnitProfile?.display_unit === "mcg"
          const displayAmount = isMcgUnit
            ? String(step.doseMcg)
            : String(step.doseMcg / 1000)
          const displayUnit = isMcgUnit ? "mcg" : "mg"
          const isWeekly =
            step.cadence.toLowerCase().includes("week") ||
            step.cadence.toLowerCase().includes("7 days")

          return {
            stage: step.stage,
            doseDisplay: step.doseDisplay,
            amount: displayAmount,
            unit: displayUnit,
            cadence: (isWeekly ? "weekly" : "daily") as "daily" | "weekly",
            frequencyText: step.cadence,
            focus: step.focus,
          }
        })
    }

    return []
  }, [
    matchedProtocolAccess,
    analyticalProtocol,
    activeUnitProfile?.display_unit,
  ])

  const handleApplyProtocolStage = (stage: {
    stage: string
    amount: string
    unit: string
    cadence: "daily" | "weekly"
    focus?: string
  }) => {
    setPlannedDose(stage.amount)
    setRecurrenceType(stage.cadence)
    setAppliedStageName(stage.stage)

    // Match unit profile in unitOptions
    const matchedOption = unitOptions.find(
      (opt) =>
        opt.profile.display_unit.toLowerCase() === stage.unit.toLowerCase()
    )
    if (matchedOption) {
      setSelectedUnitProfile(matchedOption.key)
    }

    if (materialIdentity) {
      setRoutineLabel(
        `${materialIdentity.compoundName} ${stage.stage} Protocol`
      )
    }
  }

  const handleMaterialChange = (matId: string) => {
    setSelectedMaterialId(matId)
    setAppliedStageName(null)
    const mat = trackedMaterials.find((m) => m.tracked_material_id === matId)
    if (mat) {
      const id = resolveCompoundIdentity({
        label: mat.label,
        productVariantId: mat.product_variant_id,
        products,
      })
      setRoutineLabel(`${id.compoundName} Protocol`)
      const opts = routineUnitOptions(mat.supplies ?? [], id.compoundName)
      if (opts.length > 0) {
        const preferredUnit = isMcgPreferredCompound(id.compoundName)
          ? "mcg"
          : "mg"
        const matched = opts.find(
          (o) =>
            o.profile.display_unit.toLowerCase() === preferredUnit.toLowerCase()
        )
        setSelectedUnitProfile(matched ? matched.key : opts[0].key)
        const mcg = isMcgPreferredCompound(id.compoundName)
        setPlannedDose(mcg ? "500" : "2.5")
      }
    }
  }

  const [state, action] = useActionState(
    createResearchRoutineAction,
    initialState,
  )
  const [submissionKey, rotateSubmissionKey] =
    useRotatingSubmissionKey(idempotencyKey)

  useInvalidateOnSuccess(
    state,
    [
      researchTrackingQueryKeys.routines.list,
      researchTrackingQueryKeys.occurrences.list(
        today,
        addCalendarDays(today, 6),
      ),
    ],
    rotateSubmissionKey
  )

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        handleClose()
      }, 750)
      return () => clearTimeout(timer)
    }
  }, [state.success, handleClose])

  // Total remaining mass in cold storage
  const totalRemainingBaseUnits =
    selectedMaterial?.supplies.reduce(
      (acc, s) => acc + s.remaining_quantity_base_units,
      0
    ) ?? 0

  const remainingMassDisplay =
    selectedMaterial?.supplies?.[0]?.base_unit === "microgram"
      ? `${totalRemainingBaseUnits / 1000} mg`
      : `${totalRemainingBaseUnits} ${selectedMaterial?.supplies?.[0]?.base_unit || "units"}`

  const doseNum = parseFloat(plannedDose) || 0
  const doseBaseUnits =
    activeUnitProfile && doseNum > 0
      ? convertResearchDisplayQuantityToBaseUnits(doseNum, activeUnitProfile) ?? 0
      : 0
  const estimatedDosesRemaining =
    doseBaseUnits > 0 && totalRemainingBaseUnits > 0
      ? Math.floor(totalRemainingBaseUnits / doseBaseUnits)
      : null

  const daysList = [
    { label: "M", full: "Mon", val: 1 },
    { label: "T", full: "Tue", val: 2 },
    { label: "W", full: "Wed", val: 3 },
    { label: "T", full: "Thu", val: 4 },
    { label: "F", full: "Fri", val: 5 },
    { label: "S", full: "Sat", val: 6 },
    { label: "S", full: "Sun", val: 0 },
  ]

  const toggleWeekday = (val: number) => {
    if (selectedWeekdays.includes(val)) {
      if (selectedWeekdays.length > 1) {
        setSelectedWeekdays(selectedWeekdays.filter((d) => d !== val))
      }
    } else {
      setSelectedWeekdays([...selectedWeekdays, val].sort())
    }
  }

  const quickDoses =
    activeUnitProfile?.display_unit === "mcg"
      ? ["250", "500", "750", "1000"]
      : ["1", "2", "2.5", "5", "10"]

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) {
          handleClose()
        }
      }}
    >
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 sm:p-7 shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-routine-drawer-title"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="create-routine-drawer-title" className="text-base font-bold text-slate-900 tracking-tight">
                    Create Routine Schedule
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                    Protocol Builder
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Define protocol parameters, target dosage, and recurring schedule linked to verified inventory.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form action={action} className="mt-6 space-y-6">
          {hiddenCommon(countryCode, submissionKey)}
          <input type="hidden" name="unit_profile" value={selectedUnitProfile} />
          <input type="hidden" name="recurrence_type" value={recurrenceType} />
          {recurrenceType === "daily" && (
            <input type="hidden" name="daily_interval" value={dailyInterval} />
          )}
          {recurrenceType === "weekly" && (
            <>
              <input type="hidden" name="weekly_interval" value={weeklyInterval} />
              {selectedWeekdays.map((day) => (
                <input key={day} type="hidden" name="weekdays" value={day} />
              ))}
            </>
          )}
          <input type="hidden" name="effective_from_date" value={today} />

          {/* Section 1: Compound & Label */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Compound &amp; Routine Label
              </label>
              {materialIdentity && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Available: {remainingMassDisplay} in Cold Storage
                </span>
              )}
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Compound / Product
                </label>
                <select
                  name="tracked_material_id"
                  required
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                >
                  {trackedMaterials.map((material) => {
                    const identity = resolveCompoundIdentity({
                      label: material.label,
                      productVariantId: material.product_variant_id,
                      products,
                    })
                    return (
                      <option key={material.tracked_material_id} value={material.tracked_material_id}>
                        {identity.compoundName} ({identity.variantLabel || "Standard Compound"})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Routine Regimen Name
                </label>
                <input
                  name="label"
                  required
                  maxLength={120}
                  value={routineLabel}
                  onChange={(e) => setRoutineLabel(e.target.value)}
                  placeholder="e.g. GHK-Cu Daily Protocol"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Protocol Document Connection Banner */}
            <div className="mt-3.5 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-slate-50/80 p-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-emerald-600 p-1.5 text-white shadow-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {protocolDocumentTitle}
                      </span>
                      <span className="rounded-full bg-emerald-100/80 border border-emerald-300/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                        {isOrderPreserved ? `Rev. ${preservedRevision} · Preserved` : "Standard Monograph"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                      Reconstitution standard: {analyticalProtocol.reconstitution.defaultDiluentMl} mL diluent per {analyticalProtocol.reconstitution.defaultVialNetMg} mg vial ({analyticalProtocol.reconstitution.resultingConcentrationMgPerMl} mg/mL yield).
                    </p>
                  </div>
                </div>
                <LocalizedClientLink
                  href={protocolDocumentUrl}
                  target="_blank"
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-300/80 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                  title="View full protocol document"
                >
                  <span>View Document</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </LocalizedClientLink>
              </div>
            </div>
          </div>

          {/* Section 2: Planned Dosage */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Target Dosage Per Administration
              </label>
              {estimatedDosesRemaining !== null && (
                <span className="text-[11px] text-slate-500 font-medium">
                  ~{estimatedDosesRemaining} administrations available from current balance
                </span>
              )}
            </div>

            {/* Documented Regimens (1-Click Apply) */}
            {protocolRecommendations.length > 0 && (
              <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Documented Protocol Regimens (1-Click Apply)
                    </span>
                  </div>
                  {appliedStageName && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ {appliedStageName} Applied
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {protocolRecommendations.map((rec) => {
                    const isSelected = appliedStageName === rec.stage
                    return (
                      <button
                        key={rec.stage}
                        type="button"
                        onClick={() => handleApplyProtocolStage(rec)}
                        className={`text-left rounded-xl p-2.5 transition-all border ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {rec.stage}
                          </span>
                          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700">
                            {rec.amount} {rec.unit}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                          {rec.frequencyText} · {rec.focus}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Dose Input with Unit Badge */}
              <div className="relative flex-1">
                <input
                  name="planned_quantity_display_units"
                  type="number"
                  min={activeUnitProfile ? researchDisplayStep(activeUnitProfile) : 0}
                  step={activeUnitProfile ? researchDisplayStep(activeUnitProfile) : "any"}
                  required
                  value={plannedDose}
                  onChange={(e) => setPlannedDose(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-4 pr-16 py-2.5 text-base font-bold font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
                <div className="absolute inset-y-0 right-1 flex items-center pr-2">
                  {unitOptions.length > 1 ? (
                    <select
                      value={selectedUnitProfile}
                      onChange={(e) => setSelectedUnitProfile(e.target.value)}
                      className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 outline-none"
                    >
                      {unitOptions.map(({ key, profile }) => (
                        <option key={key} value={key}>
                          {profile.display_unit}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-lg bg-slate-200/70 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {activeUnitProfile?.display_unit || "mg"}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Dosage Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">Presets:</span>
                {quickDoses.map((dose) => (
                  <button
                    key={dose}
                    type="button"
                    onClick={() => setPlannedDose(dose)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all touch-manipulation shadow-2xs ${
                      plannedDose === dose
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {dose} {activeUnitProfile?.display_unit || "mg"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Cadence & Timing */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              3. Schedule Cadence &amp; Frequency
            </label>

            {/* Frequency Segmented Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setRecurrenceType("daily")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  recurrenceType === "daily"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daily Interval
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType("weekly")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  recurrenceType === "weekly"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Specific Days (Weekly)
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType("once")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  recurrenceType === "once"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Single Session (Once)
              </button>
            </div>

            {/* Conditional Display: Daily Interval */}
            {recurrenceType === "daily" && (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">Daily Interval:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Every Day (Daily)", val: 1 },
                    { label: "Every 2 Days (EOD)", val: 2 },
                    { label: "Every 3 Days", val: 3 },
                    { label: "Every 4 Days", val: 4 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDailyInterval(item.val)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                        dailyInterval === item.val
                          ? "bg-emerald-700 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-xs text-slate-500">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={dailyInterval}
                      onChange={(e) => setDailyInterval(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs font-semibold text-slate-800 outline-none"
                    />
                    <span className="text-xs text-slate-500">days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Display: Weekly Days */}
            {recurrenceType === "weekly" && (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">Select Protocol Days:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedWeekdays([1, 3, 5])}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Mon / Wed / Fri
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWeekdays([1, 2, 3, 4, 5])}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Weekdays (M-F)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWeekdays([0, 1, 2, 3, 4, 5, 6])}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Every Day
                    </button>
                  </div>
                </div>

                {/* Circular Day Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {daysList.map((day) => {
                    const isSelected = selectedWeekdays.includes(day.val)
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => toggleWeekday(day.val)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all shadow-2xs ${
                          isSelected
                            ? "bg-emerald-700 text-white scale-105 ring-2 ring-emerald-500/20"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                        title={day.full}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <span>Repeat every:</span>
                  <select
                    value={weeklyInterval}
                    onChange={(e) => setWeeklyInterval(parseInt(e.target.value) || 1)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="1">1 week</option>
                    <option value="2">2 weeks</option>
                    <option value="3">3 weeks</option>
                    <option value="4">4 weeks</option>
                  </select>
                </div>
              </div>
            )}

            {/* Timing & Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Administration Time (Local):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="local_time"
                    type="time"
                    required
                    value={localTime}
                    onChange={(e) => setLocalTime(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-bold font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: "Morning", time: "08:00" },
                      { label: "Evening", time: "20:00" },
                    ].map((preset) => (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => setLocalTime(preset.time)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                          localTime === preset.time
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Date & Optional End Date */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Schedule Dates:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">Start</span>
                    <input
                      name="start_date"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">End (Optional)</span>
                    <input
                      name="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Summary Banner & Action Buttons */}
          <div className="border-t border-slate-100 pt-5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-900">{routineLabel || "Protocol Routine"}</span>
                  <span className="text-slate-500">
                    · {plannedDose} {activeUnitProfile?.display_unit || "mg"} ·{" "}
                    {recurrenceType === "daily"
                      ? dailyInterval === 1
                        ? "Daily"
                        : `Every ${dailyInterval} days`
                      : recurrenceType === "weekly"
                        ? `${selectedWeekdays.length}x / week`
                        : "Single session"}{" "}
                    at {localTime}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Starts {startDate}
                </span>
              </div>
            </div>

            <Message state={state} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <ActionButton className="!rounded-xl !bg-emerald-700 hover:!bg-emerald-800 text-white font-semibold px-6 py-2.5 text-xs shadow-2xs transition-all">
                Create Routine Schedule →
              </ActionButton>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
        </div>
      </aside>
    </div>
  )
}

function OccurrenceCard({
  countryCode,
  occurrence,
  routine,
  submissionKey,
  adjustmentKey,
  today,
  trackedMaterials,
}: {
  countryCode: string
  occurrence: ResearchOccurrence
  routine: ResearchRoutine
  submissionKey?: string
  adjustmentKey?: string
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
  const [adjustState, adjustAction] = useActionState(
    adjustResearchOccurrenceAction,
    initialState,
  )
  const [occurrenceAdjustmentKey, rotateOccurrenceAdjustmentKey] =
    useRotatingSubmissionKey(adjustmentKey)
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
  useInvalidateOnSuccess(adjustState, [
    researchTrackingQueryKeys.occurrences.list(
      today,
      addCalendarDays(today, 6),
    ),
  ], rotateOccurrenceAdjustmentKey)

  const adjustmentFields = (
    <>
      {hiddenCommon(countryCode, occurrenceAdjustmentKey)}
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
        Planned Dose Amount:{" "}
        {formatResearchQuantity(
          occurrence.planned_quantity_base_units,
          profileForBaseUnit(occurrence.base_unit, supplies, occurrence.label),
          occurrence.label,
        )}
      </p>
      {occurrence.status === "rescheduled" ? (
        <p className="mt-2 text-sm text-blue-700">
          Moved to {occurrence.rescheduled_local_date} at {occurrence.rescheduled_local_time}.
        </p>
      ) : null}
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
              Linked Supply / Vial
              <select
                name="supply_id"
                required
                defaultValue=""
                className={`${inputClass} mt-2`}
              >
                <option value="" disabled>
                  Select an available supply
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
            <ActionButton>Confirm Dose</ActionButton>
          </form>
        ) : (
          <p className="mt-4 text-sm text-amber-700">
            No active supply with the matching unit is available. Add or restore
            a compatible supply before logging this dose.
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
              I confirm this protocol administration and supply deduction.
            </span>
          </label>
          <Message state={confirmState} />
          <ActionButton>Confirm & Log Dose</ActionButton>
        </form>
      )}
      {(confirmState.success || occurrence.status === "confirmed") && (
        <PostDoseCheckIn
          countryCode={countryCode}
          occurrence={occurrence}
          routine={routine}
          today={today}
        />
      )}
      {occurrence.status === "scheduled" ? (
        <div className="mt-4 grid gap-3 border-t border-ui-border-base pt-4">
          <form action={adjustAction}>
            {adjustmentFields}
            <input type="hidden" name="operation" value="skip" />
            <button type="submit" className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium">
              Skip Dose
            </button>
          </form>
          <details className="rounded-lg border border-ui-border-base p-3">
            <summary className="cursor-pointer text-sm font-medium">Reschedule Dose</summary>
            <form action={adjustAction} className="mt-3 grid gap-3">
              {adjustmentFields}
              <input type="hidden" name="operation" value="reschedule" />
              <div className="grid grid-cols-2 gap-3">
                <input name="rescheduled_local_date" type="date" required className={inputClass} />
                <input name="rescheduled_local_time" type="time" required className={inputClass} />
              </div>
              <input name="note" placeholder="Optional note" className={inputClass} />
              <ActionButton>Save New Schedule</ActionButton>
            </form>
          </details>
          <Message state={adjustState} />
        </div>
      ) : occurrence.status === "skipped" || occurrence.status === "rescheduled" ? (
        <form action={adjustAction} className="mt-4 border-t border-ui-border-base pt-4">
          {adjustmentFields}
          <input type="hidden" name="operation" value="restore" />
          <button type="submit" className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium">
            Restore Original Schedule
          </button>
          <Message state={adjustState} />
        </form>
      ) : null}
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
  products,
}: {
  canMutate: boolean
  countryCode: string
  idempotencyKey?: string
  routine: ResearchRoutine
  trackedMaterials: TrackedResearchMaterial[]
  today: string
  updateIdempotencyKey?: string
  products?: HttpTypes.StoreProduct[]
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

  const matchingMaterial = trackedMaterials.find(
    (m) => m.tracked_material_id === routine.tracked_material_id,
  )
  const identity = resolveCompoundIdentity({
    label: routine.tracked_material_label,
    productVariantId: matchingMaterial?.product_variant_id,
    products,
  })

  const revision = routine.current_revision
  const schedule = revision.schedule
  const isActive = routine.status === "active"

  const formattedDose = formatResearchQuantity(
    revision.planned_quantity_base_units,
    defaultResearchUnitProfile(revision.base_unit, identity.compoundName),
    identity.compoundName,
  )

  const cadenceText = useMemo(() => {
    if (schedule.recurrence_type === "daily") {
      return schedule.daily_interval === 1 ? "Daily" : `Every ${schedule.daily_interval} days`
    }
    if (schedule.recurrence_type === "weekly") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const days = schedule.weekdays?.map((d) => dayNames[d]).join(", ") || "Weekly"
      return `${days}`
    }
    return "Single session"
  }, [schedule])

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isActive
          ? "border-slate-200/90 bg-white shadow-2xs hover:border-slate-300"
          : "border-slate-200/60 bg-slate-50/70 opacity-80"
      } p-5`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {isActive ? "Active Protocol" : "Archived Protocol"}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {identity.fullTitle}
            </span>
          </div>

          <h4 className="text-base font-bold tracking-tight text-slate-900">
            {revision.label}
          </h4>

          {/* Cadence chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-800">
              Target Dose: {formattedDose}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              Cadence: {cadenceText}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              Time: {schedule.local_time}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Starts {schedule.start_date}
            </span>
          </div>
        </div>

        {canMutate && (
          <div className="flex items-center gap-2 sm:self-start">
            <form action={action}>
              {hiddenCommon(countryCode, transitionKey)}
              <input type="hidden" name="routine_id" value={routine.routine_id} />
              <input
                type="hidden"
                name="operation"
                value={isActive ? "archive" : "resume"}
              />
              <input type="hidden" name="effective_from_date" value={today} />
              <ActionButton
                className={`!rounded-xl text-xs font-semibold px-3 py-2 border transition-all ${
                  isActive
                    ? "!bg-white hover:!bg-slate-100 text-slate-700 border-slate-200"
                    : "!bg-emerald-700 hover:!bg-emerald-800 text-white border-transparent"
                }`}
              >
                {isActive ? "Archive / Pause" : "Resume Protocol"}
              </ActionButton>
              <Message state={state} />
            </form>
          </div>
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
  const fallbackUnitProfile = defaultResearchUnitProfile(
    revision.base_unit,
    trackedMaterial?.label || revision.label,
  )
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
          Routine Name
          <input
            name="label"
            required
            maxLength={120}
            defaultValue={revision.label}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Target Dose Amount
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
          Frequency
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
          Administration Time
          <input
            name="local_time"
            type="time"
            required
            defaultValue={schedule.local_time}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block text-sm font-medium">
          Repeat Every (Days)
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
          Repeat Every (Weeks)
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
          <legend className="text-sm font-medium">Days of the Week</legend>
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
          <ActionButton>Save Routine Changes</ActionButton>
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
              Dose Supply / Vial
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
              Confirmed Dose Amount
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
        <ActionButton>
          Review {operation === "revise" ? "Adjustment" : operation === "void" ? "Void" : "Restore"}
        </ActionButton>
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
            <span>I confirm this dose record and supply adjustment.</span>
          </label>
          <Message state={mutationState} />
          <ActionButton>
            Confirm {operation === "revise" ? "Adjustment" : operation === "void" ? "Void" : "Restore"}
          </ActionButton>
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

  const linkedSupply = supplies.find((s) => s.supply_id === log.supply_id)
  const isConfirmed = log.status === "confirmed"
  const formattedDose = formatResearchQuantity(
    log.confirmed_quantity_base_units,
    profileForSupply(log.supply_id, log.base_unit, supplies),
  )

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isConfirmed ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isConfirmed ? "✓ Dose Confirmed" : "Voided Record"}
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {routine.current_revision.label}
            </span>
            <span className="text-[11px] text-slate-400">
              · {log.local_date} at {log.local_time}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-600">
            <span className="font-bold text-slate-900 bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5">
              Administered: {formattedDose}
            </span>
            {linkedSupply && (
              <span className="text-slate-500">
                via {linkedSupply.lot_number ? `Lot #${linkedSupply.lot_number}` : `Supply #${linkedSupply.supply_id.slice(-6)}`}
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              (action: {log.operation})
            </span>
          </div>
        </div>

        {canMutate && (log.status === "confirmed" ? (
          <div className="flex flex-wrap items-center gap-2">
            <details className="relative">
              <summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
                Revise Dose
              </summary>
              <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <LogMutationForm
                  countryCode={countryCode}
                  idempotencyKey={operationKeys.revise}
                  log={log}
                  operation="revise"
                  onSuccess={() => rotateOperationKey("revise")}
                  supplies={supplies}
                  today={today}
                />
              </div>
            </details>
            <details className="relative">
              <summary className="cursor-pointer rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100/80 transition-colors shadow-2xs">
                Void Dose
              </summary>
              <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
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
            </details>
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
  products,
  protocols,
  isCreateOpen,
  onOpenChange,
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

  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false)
  const isDrawerActive =
    isCreateOpen !== undefined ? isCreateOpen : internalDrawerOpen
  const handleOpenDrawer = () => {
    if (onOpenChange) {
      onOpenChange(true)
    } else {
      setInternalDrawerOpen(true)
    }
  }

  const [activeTab, setActiveTab] = useState<"protocols" | "logs" | "pending">(
    "protocols"
  )

  if (queryFailed) {
    return (
      <section className="mt-8">
        <div className={`${cardClass} border-amber-200 bg-amber-50/70 text-sm text-amber-900`}>
          Schedule telemetry is currently updating or could not be loaded. Please refresh shortly.
        </div>
      </section>
    )
  }

  if (!runtimeReady) {
    return (
      <section className="mt-8">
        <div className={`${cardClass} bg-ui-bg-subtle text-sm text-ui-fg-subtle`}>
          Personal routines are offline until private research tracking is
          changed.
        </div>
      </section>
    )
  }

  const activeRoutines = currentRoutines.filter((r) => r.status === "active")
  const archivedRoutines = currentRoutines.filter((r) => r.status === "archived")

  return (
    <section
      className="mt-8 space-y-5"
      aria-labelledby="personal-routines-title"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Protocol Management
        </p>
        <h2 id="personal-routines-title" className="mt-1 text-lg font-bold text-slate-900 tracking-tight">
          Protocol Regimens & Audit Workspace
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-ui-fg-subtle">
          Manage your configured recurring cycles, adjust dosages, and inspect certified administration logs.
        </p>
        {isRefreshing && (
          <p className="mt-2 text-xs text-ui-fg-muted" aria-live="polite">
            Updating schedule data…
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
        <CreateRoutineCard
          countryCode={countryCode}
          idempotencyKey={submissionKeys.create}
          trackedMaterials={currentTrackedMaterials}
          today={today}
          products={products}
          protocols={protocols}
          isOpen={isDrawerActive}
          onOpenChange={onOpenChange ?? setInternalDrawerOpen}
        />
      )}

      {/* Unified Tabbed Workspace */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {/* Tab Navigation Header & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-5 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("protocols")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "protocols"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/80"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  activeTab === "protocols" ? "bg-emerald-400" : "bg-emerald-500"
                }`}
              />
              <span>Active Protocols</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  activeTab === "protocols"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {activeRoutines.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "logs"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/80"
              }`}
            >
              <span>Administration Logs</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  activeTab === "logs"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {currentLogs.length}
              </span>
            </button>

            {currentOccurrences.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeTab === "pending"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Pending Quick Log</span>
                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 text-[10px] font-semibold">
                  {currentOccurrences.length}
                </span>
              </button>
            )}
          </div>

          {canMutate && activeTab === "protocols" && (
            <button
              type="button"
              onClick={handleOpenDrawer}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Configure New Routine</span>
            </button>
          )}
        </div>

        {/* Tab Panel Content */}
        <div className="p-5 sm:p-6">
          {activeTab === "protocols" && (
            <div className="space-y-4">
              {activeRoutines.length ? (
                <div className="space-y-3.5">
                  {activeRoutines.map((routine) => (
                    <RoutineTransitionRow
                      key={routine.routine_id}
                      canMutate={canMutate}
                      countryCode={countryCode}
                      idempotencyKey={submissionKeys.transitions[routine.routine_id]}
                      updateIdempotencyKey={submissionKeys.updates[routine.routine_id]}
                      routine={routine}
                      trackedMaterials={currentTrackedMaterials}
                      today={today}
                      products={products}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-700">
                    No active routines configured yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Click &ldquo;Configure New Routine&rdquo; above or from the calendar header to build your first protocol.
                  </p>
                </div>
              )}

              {archivedRoutines.length > 0 && (
                <details className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between">
                    <span>Archived Protocols ({archivedRoutines.length})</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Expand archived →
                    </span>
                  </summary>
                  <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
                    {archivedRoutines.map((routine) => (
                      <RoutineTransitionRow
                        key={routine.routine_id}
                        canMutate={canMutate}
                        countryCode={countryCode}
                        idempotencyKey={submissionKeys.transitions[routine.routine_id]}
                        updateIdempotencyKey={submissionKeys.updates[routine.routine_id]}
                        routine={routine}
                        trackedMaterials={currentTrackedMaterials}
                        today={today}
                        products={products}
                      />
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              {currentLogs.length ? (
                <div className="space-y-3">
                  {currentLogs.map((log) => {
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
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-700">
                    No administration logs recorded yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Doses confirmed from the schedule or quick log will appear here as a certified audit trail.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pending" && currentOccurrences.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-700">
                  Pending administrations requiring confirmation:
                </p>
                <span className="text-[11px] text-slate-400">
                  {currentOccurrences.length} dose(s) pending
                </span>
              </div>
              <div className="space-y-3">
                {currentOccurrences.map((occurrence) => {
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
                      adjustmentKey={
                        submissionKeys.occurrenceAdjustments[occurrence.occurrence_id]
                      }
                      today={today}
                      trackedMaterials={currentTrackedMaterials}
                    />
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
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
