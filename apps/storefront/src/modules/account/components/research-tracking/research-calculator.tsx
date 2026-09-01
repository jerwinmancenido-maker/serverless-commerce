"use client"

import {
  mutateResearchCalculationAction,
  saveResearchCalculationAction,
  type ResearchCalculationSnapshot,
  type ResearchJournalEntry,
  type ResearchProtocolAccess,
  type ResearchRoutine,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import { calculateProtocol } from "@modules/research-protocols/calculate-protocol"
import { useResearchSubmissionKey } from "./use-research-submission-key"
import { useActionState, useCallback, useEffect, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"

const initialState: ResearchTrackingActionState = { success: false, error: null }
const inputClass = "mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return <button disabled={pending || disabled} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50">{pending ? "Saving…" : "Save calculation"}</button>
}

const resultText = (value: number | null | undefined, precision: number) =>
  value == null || !Number.isFinite(value) ? "—" : Number(value.toFixed(precision)).toString()

export default function ResearchCalculator({
  countryCode,
  protocols,
  routines,
  journalEntries,
  calculations,
  submissionKey,
}: {
  countryCode: string
  protocols: ResearchProtocolAccess[]
  routines: ResearchRoutine[]
  journalEntries: ResearchJournalEntry[]
  calculations: ResearchCalculationSnapshot[]
  submissionKey: string
}) {
  const availableProtocols = protocols.filter((item) => item.calculator?.enabled)
  const [mode, setMode] = useState<"quick" | "protocol" | "compare">(
    availableProtocols.length ? "protocol" : "quick",
  )
  const [accessId, setAccessId] = useState(availableProtocols[0]?.profile_access_id || "")
  const protocol = availableProtocols.find((item) => item.profile_access_id === accessId) || null
  const config = protocol?.calculator
  const [mass, setMass] = useState("")
  const [massUnit, setMassUnit] = useState<"mcg" | "mg" | "g" | "IU">("mg")
  const [volume, setVolume] = useState("")
  const [target, setTarget] = useState("")
  const [targetUnit, setTargetUnit] = useState<"mcg" | "mg" | "IU">("mcg")
  const [comparisonTarget, setComparisonTarget] = useState("")
  const [iuPerMg, setIuPerMg] = useState("")
  const [deviceVolume, setDeviceVolume] = useState("")
  const [deviceLabel, setDeviceLabel] = useState("Device units")
  const [precision, setPrecision] = useState(2)
  const [saveState, saveAction] = useActionState(saveResearchCalculationAction, initialState)
  const saveSubmissionKey = useResearchSubmissionKey(saveState, submissionKey)

  useEffect(() => {
    if (!config || mode === "quick") return
    setMass(config.default_compound_mass || "")
    setMassUnit(config.compound_mass_unit)
    setVolume(config.default_final_volume_ml || "")
    setTarget(config.default_target_amount || "")
    setTargetUnit(config.target_amount_unit)
    setIuPerMg(config.iu_per_mg || "")
    setDeviceVolume(config.device_volume_ml || "")
    setDeviceLabel(config.device_label || "Device units")
    setPrecision(config.rounding_precision)
  }, [accessId, config, mode])

  const calculate = useCallback(
    (amount: string) =>
      calculateProtocol({
        compoundMass: Number(mass),
        compoundMassUnit: massUnit,
        finalVolumeMl: Number(volume),
        targetAmount: Number(amount),
        targetAmountUnit: targetUnit,
        iuPerMg: iuPerMg ? Number(iuPerMg) : null,
        deviceVolumeMl: deviceVolume ? Number(deviceVolume) : null,
      }),
    [deviceVolume, iuPerMg, mass, massUnit, targetUnit, volume],
  )
  const result = useMemo(() => calculate(target), [calculate, target])
  const comparison = useMemo(
    () => mode === "compare" && comparisonTarget ? calculate(comparisonTarget) : null,
    [calculate, comparisonTarget, mode],
  )
  const canSave = Boolean(result && (mode !== "compare" || comparison))

  return <section className="mt-10 space-y-5" data-testid="research-hub-calculator">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">Explicit save only</p>
      <h2 className="mt-2 text-xl font-semibold">Calculator</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ui-fg-subtle">Calculate concentration, volume, device units and container uses. Inputs remain in this browser until you choose Save calculation.</p>
    </div>
    <div className="rounded-xl border border-ui-border-base bg-white p-5">
      <div className="grid gap-4 small:grid-cols-3">
        <label className="text-sm font-medium">Mode<select className={inputClass} value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="quick">Quick</option><option value="protocol" disabled={!availableProtocols.length}>Protocol defaults</option><option value="compare" disabled={!availableProtocols.length}>Compare targets</option></select></label>
        {mode !== "quick" ? <label className="text-sm font-medium small:col-span-2">Protocol revision<select className={inputClass} value={accessId} onChange={(event) => setAccessId(event.target.value)}>{availableProtocols.map((item) => <option key={item.profile_access_id} value={item.profile_access_id}>{item.protocol_title} · revision {item.preserved_revision}</option>)}</select></label> : null}
      </div>
      {config?.instructions && mode !== "quick" ? <p className="mt-4 rounded-lg bg-ui-bg-subtle p-3 text-sm text-ui-fg-subtle">{config.instructions}</p> : null}
      <div className="mt-5 grid gap-4 small:grid-cols-2 medium:grid-cols-4">
        <label className="text-sm font-medium">Compound mass<input required inputMode="decimal" className={inputClass} value={mass} onChange={(event) => setMass(event.target.value)} /></label>
        <label className="text-sm font-medium">Mass unit<select className={inputClass} value={massUnit} onChange={(event) => setMassUnit(event.target.value as typeof massUnit)}><option>mcg</option><option>mg</option><option>g</option><option>IU</option></select></label>
        <label className="text-sm font-medium">Final volume (mL)<input required inputMode="decimal" className={inputClass} value={volume} onChange={(event) => setVolume(event.target.value)} /></label>
        <label className="text-sm font-medium">Target amount<input required inputMode="decimal" className={inputClass} value={target} onChange={(event) => setTarget(event.target.value)} /></label>
        <label className="text-sm font-medium">Target unit<select className={inputClass} value={targetUnit} onChange={(event) => setTargetUnit(event.target.value as typeof targetUnit)}><option>mcg</option><option>mg</option><option>IU</option></select></label>
        {mode === "compare" ? <label className="text-sm font-medium">Comparison target<input required inputMode="decimal" className={inputClass} value={comparisonTarget} onChange={(event) => setComparisonTarget(event.target.value)} /></label> : null}
        <label className="text-sm font-medium">IU per mg (when needed)<input inputMode="decimal" className={inputClass} value={iuPerMg} onChange={(event) => setIuPerMg(event.target.value)} /></label>
        <label className="text-sm font-medium">mL per device unit<input inputMode="decimal" className={inputClass} value={deviceVolume} onChange={(event) => setDeviceVolume(event.target.value)} /></label>
      </div>
      <div className="mt-5 grid gap-3 small:grid-cols-2 medium:grid-cols-4">
        <Result label="Concentration" value={`${resultText(result?.concentrationMgPerMl, precision)} mg/mL`} />
        <Result label="Volume" value={`${resultText(result?.volumeMl, precision)} mL`} />
        <Result label={deviceLabel} value={resultText(result?.deviceMeasurements, precision)} />
        <Result label="Uses per container" value={resultText(result?.usesPerContainer, precision)} />
      </div>
      {mode === "compare" ? <div className="mt-4 rounded-lg border border-ui-border-base p-4"><p className="text-sm font-semibold">Comparison target: {comparisonTarget || "—"} {targetUnit}</p><p className="mt-2 text-sm text-ui-fg-subtle">Volume {resultText(comparison?.volumeMl, precision)} mL · {deviceLabel} {resultText(comparison?.deviceMeasurements, precision)} · uses per container {resultText(comparison?.usesPerContainer, precision)}</p></div> : null}
      <form action={saveAction} className="mt-6 grid gap-4 border-t border-ui-border-base pt-5 small:grid-cols-3">
        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="idempotency_key" value={saveSubmissionKey} />
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="protocol_series_id" value={protocol?.protocol_series_id || ""} />
        <input type="hidden" name="protocol_revision_id" value={protocol?.protocol_revision_id || ""} />
        <input type="hidden" name="profile_protocol_access_id" value={protocol?.profile_access_id || ""} />
        <input type="hidden" name="compound_mass" value={mass} />
        <input type="hidden" name="compound_mass_unit" value={massUnit} />
        <input type="hidden" name="final_volume_ml" value={volume} />
        <input type="hidden" name="target_amount" value={target} />
        <input type="hidden" name="target_amount_unit" value={targetUnit} />
        <input type="hidden" name="comparison_target_amount" value={mode === "compare" ? comparisonTarget : ""} />
        <input type="hidden" name="iu_per_mg" value={iuPerMg} />
        <input type="hidden" name="device_volume_ml" value={deviceVolume} />
        <input type="hidden" name="device_label" value={deviceLabel} />
        <input type="hidden" name="rounding_precision" value={precision} />
        <label className="text-sm font-medium">Name<input name="title" required maxLength={120} className={inputClass} defaultValue={protocol ? `${protocol.protocol_title} calculation` : "Quick calculation"} /></label>
        <label className="text-sm font-medium">Attach to routine (optional)<select name="routine_id" className={inputClass}><option value="">Not attached</option>{routines.map((item) => <option key={item.routine_id} value={item.routine_id}>{item.current_revision.label}</option>)}</select></label>
        <label className="text-sm font-medium">Attach to Journal entry (optional)<select name="journal_entry_id" className={inputClass}><option value="">Not attached</option>{journalEntries.map((item) => <option key={item.journal_entry_id} value={item.journal_entry_id}>{item.current_revision.title || item.current_revision.local_date}</option>)}</select></label>
        <div className="small:col-span-3 flex items-center gap-3"><SaveButton disabled={!canSave} />{!canSave ? <p className="text-sm text-amber-700">Enter valid positive values before saving.</p> : null}{saveState.error ? <p className="text-sm text-red-600">{saveState.error}</p> : null}{saveState.success ? <p className="text-sm text-emerald-700">Calculation saved.</p> : null}</div>
      </form>
    </div>
    <SavedCalculations countryCode={countryCode} calculations={calculations} routines={routines} journalEntries={journalEntries} />
  </section>
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-ui-bg-subtle p-4"><p className="text-xs text-ui-fg-subtle">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>
}

function SavedCalculations({ countryCode, calculations, routines, journalEntries }: { countryCode: string; calculations: ResearchCalculationSnapshot[]; routines: ResearchRoutine[]; journalEntries: ResearchJournalEntry[] }) {
  const [state, action] = useActionState(mutateResearchCalculationAction, initialState)
  const submissionKey = useResearchSubmissionKey(state)
  return <div className="rounded-xl border border-ui-border-base bg-white p-5"><h3 className="text-base font-semibold">Saved calculations</h3>{calculations.length ? <div className="mt-4 space-y-3">{calculations.map((item) => {
    const attachedRoutine = routines.find((routine) => routine.routine_id === item.routine_id)
    const attachedJournalEntry = journalEntries.find((entry) => entry.journal_entry_id === item.journal_entry_id)
    return <details key={item.id} className="rounded-lg border border-ui-border-base p-4"><summary className="cursor-pointer"><span className="font-medium">{item.title}</span><span className="ml-2 text-xs text-ui-fg-muted">{item.mode} · {new Date(item.saved_at).toLocaleString("en-PH")}</span></summary>{attachedRoutine || attachedJournalEntry ? <p className="mt-3 text-sm text-ui-fg-subtle">Attached to {attachedRoutine ? `routine ${attachedRoutine.current_revision.label}` : ""}{attachedRoutine && attachedJournalEntry ? " and " : ""}{attachedJournalEntry ? `Journal entry ${attachedJournalEntry.current_revision.title || attachedJournalEntry.current_revision.local_date}` : ""}.</p> : <p className="mt-3 text-sm text-ui-fg-muted">Not attached to a routine or Journal entry.</p>}<pre className="mt-3 overflow-auto rounded-lg bg-ui-bg-subtle p-3 text-xs">{JSON.stringify({ input: item.input, result: item.result, units: item.unit_context }, null, 2)}</pre><form action={action} className="mt-3 flex flex-wrap items-end gap-2"><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="idempotency_key" value={submissionKey} /><input type="hidden" name="calculation_id" value={item.id} /><select name="routine_id" defaultValue={item.routine_id || ""} className={inputClass}><option value="">Routine…</option>{routines.map((routine) => <option key={routine.routine_id} value={routine.routine_id}>{routine.current_revision.label}</option>)}</select><select name="journal_entry_id" defaultValue={item.journal_entry_id || ""} className={inputClass}><option value="">Journal entry…</option>{journalEntries.map((entry) => <option key={entry.journal_entry_id} value={entry.journal_entry_id}>{entry.current_revision.title || entry.current_revision.local_date}</option>)}</select><button name="action" value="attach" className="rounded-lg border border-ui-border-base px-3 py-2 text-sm">Save attachment</button><button name="action" value="archive" className="rounded-lg border border-ui-border-base px-3 py-2 text-sm text-red-600">Archive</button></form></details>
  })}</div> : <p className="mt-2 text-sm text-ui-fg-subtle">Nothing saved yet. Calculator inputs are not persisted automatically.</p>}{state.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}{state.success ? <p className="mt-3 text-sm text-emerald-700">Calculation updated.</p> : null}</div>
}
