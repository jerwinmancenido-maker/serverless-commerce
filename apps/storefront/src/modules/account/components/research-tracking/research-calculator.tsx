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
import { getClinicalTrialSchedulesForProtocol } from "@lib/data/clinical-trials-registry"
import SyringeVisualizer from "./syringe-visualizer"
import { useResearchSubmissionKey } from "./use-research-submission-key"
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useFormStatus } from "react-dom"

// ─── constants ───────────────────────────────────────────────────────────────

const initialState: ResearchTrackingActionState = { success: false, error: null }

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const fmt = (value: number | null | undefined, precision: number) =>
  value == null || !Number.isFinite(value)
    ? "—"
    : Number(value.toFixed(precision)).toString()

/** Safe typed read from Record<string, unknown> */
const rget = (rec: Record<string, unknown> | undefined, key: string) =>
  rec?.[key] as string | number | null | undefined
// ─── sub-components ───────────────────────────────────────────────────────────

/** Pill mode switcher */
function ModeTab({
  value: _value,
  active,
  disabled,
  onClick,
  children,
}: {
  value: string
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
        active
          ? "bg-ui-fg-base text-ui-bg-base shadow-sm"
          : "text-ui-fg-subtle hover:text-ui-fg-base",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

/** Slider + synced numeric input */
function SliderInput({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  step: number
}) {
  const numVal = parseFloat(value) || 0
  const pct = Math.max(0, Math.min(100, ((numVal - min) / (max - min)) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-ui-fg-muted">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 rounded-lg border border-ui-border-base bg-white px-2 py-1 text-right text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-ui-fg-base/20"
          />
          <span className="text-xs font-medium text-ui-fg-subtle">{unit}</span>
        </div>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-ui-border-base">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ui-fg-base transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[10px] text-ui-fg-muted">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  )
}

/** Color-coded result card */
const RESULT_COLORS: Record<string, string> = {
  blue: "from-slate-50 to-slate-100/70 border-slate-200 text-slate-800",
  indigo: "from-teal-50 to-teal-100/70 border-teal-200 text-teal-800",
  violet: "from-emerald-50 to-emerald-100/70 border-emerald-200 text-emerald-800",
  emerald: "from-emerald-50/90 to-teal-50/70 border-emerald-300 text-emerald-700",
}

function ResultCard({
  label,
  value,
  color,
  dim,
}: {
  label: string
  value: string
  color: keyof typeof RESULT_COLORS
  dim?: boolean
}) {
  const prevRef = useRef(value)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value
      setBump(true)
      const t = setTimeout(() => setBump(false), 300)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div
      className={[
        "rounded-xl border bg-gradient-to-br p-4 transition-all duration-300",
        RESULT_COLORS[color],
        dim ? "opacity-50" : "",
        bump ? "scale-[1.03]" : "scale-100",
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

/** Save button with pending state */
function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending || disabled}
      className="rounded-lg bg-ui-fg-base px-5 py-2.5 text-sm font-semibold text-ui-bg-base transition-opacity disabled:opacity-40"
    >
      {pending ? "Saving…" : "Save Calculation"}
    </button>
  )
}

// ─── main calculator ──────────────────────────────────────────────────────────

export default function ResearchCalculator({
  countryCode,
  protocols,
  routines,
  journalEntries,
  calculations,
  submissionKey,
  initialMass,
  initialUnit,
  initialName,
}: {
  countryCode: string
  protocols: ResearchProtocolAccess[]
  routines: ResearchRoutine[]
  journalEntries: ResearchJournalEntry[]
  calculations: ResearchCalculationSnapshot[]
  submissionKey: string
  initialMass?: string
  initialUnit?: string
  initialName?: string
}) {
  const availableProtocols = protocols.filter((item) => item.calculator?.enabled)
  const [mode, setMode] = useState<"quick" | "protocol" | "compare">(
    initialMass ? "quick" : availableProtocols.length ? "protocol" : "quick",
  )
  const [accessId, setAccessId] = useState(
    availableProtocols[0]?.profile_access_id || "",
  )
  const protocol =
    availableProtocols.find((item) => item.profile_access_id === accessId) || null
  const config = protocol?.calculator

  const clinicalMatrix = useMemo(() => {
    const query = protocol?.protocol_title || initialName || ""
    if (!query) return null
    return getClinicalTrialSchedulesForProtocol(query)
  }, [initialName, protocol?.protocol_title])

  const quickPresets = useMemo(() => {
    if (!clinicalMatrix) return []
    if (clinicalMatrix.phase3 && clinicalMatrix.phase3.length > 0) {
      return clinicalMatrix.phase3
    }
    if (clinicalMatrix.phase2 && clinicalMatrix.phase2.length > 0) {
      return clinicalMatrix.phase2
    }
    return clinicalMatrix.standard || []
  }, [clinicalMatrix])

  // primary inputs
  const [mass, setMass] = useState(initialMass || "")
  const [massUnit, setMassUnit] = useState<"mcg" | "mg" | "g" | "IU">(
    (initialUnit as "mcg" | "mg" | "g" | "IU") || "mg",
  )
  const [volume, setVolume] = useState("")
  const [target, setTarget] = useState("")
  const [targetUnit, setTargetUnit] = useState<"mcg" | "mg" | "IU">("mcg")
  const [comparisonTarget, setComparisonTarget] = useState("")

  // advanced inputs
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [iuPerMg, setIuPerMg] = useState("")
  const [deviceVolume, setDeviceVolume] = useState("")
  const [deviceLabel, setDeviceLabel] = useState("Device units")
  const [precision, setPrecision] = useState(2)
  const [copiedSummary, setCopiedSummary] = useState(false)

  const [saveState, saveAction] = useActionState(
    saveResearchCalculationAction,
    initialState,
  )
  const saveSubmissionKey = useResearchSubmissionKey(saveState, submissionKey)

  // load protocol defaults
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
    () =>
      mode === "compare" && comparisonTarget ? calculate(comparisonTarget) : null,
    [calculate, comparisonTarget, mode],
  )
  const canSave = Boolean(result && (mode !== "compare" || comparison))

  const handleCopySummary = useCallback(() => {
    if (!result) return
    const compound = initialName || protocol?.protocol_title || "Research Compound"
    const text = [
      `[Research Protocol Formulation Summary]`,
      `Compound: ${compound}`,
      `Reconstitution Mass: ${mass} ${massUnit}`,
      `Diluent: ${volume} mL (Bacteriostatic 0.9% Benzyl Alcohol Water)`,
      `Final Concentration: ${fmt(result.concentrationMgPerMl, precision)} mg/mL`,
      `Target Unit Dose: ${target} ${targetUnit}`,
      `Syringe Draw Volume: ${fmt(result.volumeMl, precision)} mL (${fmt(result.deviceMeasurements, precision)} Units on ${deviceLabel})`,
      `Estimated Viable Yield: ${fmt(result.usesPerContainer, precision)} doses`,
      `Refrigerated Viability: Store refrigerated at 2°C – 8°C (36°F – 46°F). Maximum analytical viability: 28 days post-reconstitution.`,
    ].join("\n")

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSummary(true)
        setTimeout(() => setCopiedSummary(false), 2500)
      })
    }
  }, [result, initialName, protocol, mass, massUnit, volume, precision, target, targetUnit, deviceLabel])

  // slider ranges — fall back to sensible defaults
  const massMin = 0.1
  const massMax = config ? Math.max(50, Number(config.default_compound_mass || 10) * 5) : 50
  const volMin = 0.5
  const volMax = config ? Math.max(10, Number(config.default_final_volume_ml || 2) * 5) : 10
  const tgtMin = 10
  const tgtMax = config ? Math.max(2000, Number(config.default_target_amount || 250) * 8) : 2000

  return (
    <section className="mt-10 space-y-6" data-testid="research-hub-calculator">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ui-fg-muted">
          Reconstitution Tool
        </p>
        <h2 className="mt-1 text-xl font-bold">Reconstitution Calculator</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Calculate concentration, volume, and device measurements. Inputs persist
          locally — results are only saved when you choose{" "}
          <span className="font-medium text-ui-fg-base">Save Calculation</span>.
        </p>
      </div>

      {initialMass && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs text-emerald-950">
          <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>
            <strong className="font-semibold">Vial Pre-loaded:</strong> Reconstituting{" "}
            <span className="font-semibold">{initialName || "Tracked Compound"}</span> with initial mass of{" "}
            <span className="font-semibold">{initialMass} {initialUnit || "mg"}</span>.
          </span>
        </div>
      )}

      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm">
        {/* Mode + protocol bar */}
        <div className="flex flex-col gap-3 border-b border-ui-border-base bg-ui-bg-subtle px-5 py-4 small:flex-row small:items-center small:justify-between">
          {/* Pill switcher */}
          <div className="flex items-center gap-1 rounded-full border border-ui-border-base bg-white px-1 py-1 w-fit">
            <ModeTab
              value="quick"
              active={mode === "quick"}
              onClick={() => setMode("quick")}
            >
              Quick
            </ModeTab>
            <ModeTab
              value="protocol"
              active={mode === "protocol"}
              disabled={!availableProtocols.length}
              onClick={() => setMode("protocol")}
            >
              Protocol Defaults
            </ModeTab>
            <ModeTab
              value="compare"
              active={mode === "compare"}
              disabled={!availableProtocols.length}
              onClick={() => setMode("compare")}
            >
              Compare Targets
            </ModeTab>
          </div>

          {/* Protocol selector */}
          {mode !== "quick" && availableProtocols.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ui-fg-muted whitespace-nowrap">
                Protocol
              </span>
              <select
                value={accessId}
                onChange={(e) => setAccessId(e.target.value)}
                className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ui-fg-base/20 max-w-xs"
              >
                {availableProtocols.map((item) => (
                  <option
                    key={item.profile_access_id}
                    value={item.profile_access_id}
                  >
                    {item.protocol_title} · Rev {item.preserved_revision}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Protocol instructions banner */}
        {config?.instructions && mode !== "quick" && (
          <div className="border-b border-ui-border-base bg-blue-50/60 px-5 py-3">
            <p className="text-xs leading-5 text-blue-700">{config.instructions}</p>
          </div>
        )}

        {/* Two-panel body */}
        <div className="grid small:grid-cols-[1fr_1.1fr]">
          {/* Left: inputs */}
          <div className="space-y-6 border-b border-ui-border-base p-5 small:border-b-0 small:border-r">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
              Input Parameters
            </p>

            {/* Compound mass */}
            <div className="space-y-1">
              <SliderInput
                label="Compound Mass"
                unit={massUnit}
                value={mass}
                onChange={setMass}
                min={massMin}
                max={massMax}
                step={0.1}
              />
              {mode === "quick" && (
                <div className="pt-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-ui-fg-muted">
                    Mass Unit
                  </label>
                  <select
                    value={massUnit}
                    onChange={(e) =>
                      setMassUnit(e.target.value as typeof massUnit)
                    }
                    className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-sm focus:outline-none"
                  >
                    <option>mcg</option>
                    <option>mg</option>
                    <option>g</option>
                    <option>IU</option>
                  </select>
                </div>
              )}
            </div>

            {/* Final volume */}
            <SliderInput
              label="Final Volume"
              unit="mL"
              value={volume}
              onChange={setVolume}
              min={volMin}
              max={volMax}
              step={0.1}
            />

            {/* Target dose */}
            <div className="space-y-1">
              <SliderInput
                label="Target Dose"
                unit={targetUnit}
                value={target}
                onChange={setTarget}
                min={tgtMin}
                max={tgtMax}
                step={mode === "quick" ? 10 : 1}
              />
              {mode === "quick" && (
                <div className="pt-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-ui-fg-muted">
                    Target Unit
                  </label>
                  <select
                    value={targetUnit}
                    onChange={(e) =>
                      setTargetUnit(e.target.value as typeof targetUnit)
                    }
                    className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-sm focus:outline-none"
                  >
                    <option>mcg</option>
                    <option>mg</option>
                    <option>IU</option>
                  </select>
                </div>
              )}
              {quickPresets.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Clinical Titration Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPresets.map((step, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (targetUnit === "mcg") {
                            setTarget(Math.round(step.doseMg * 1000).toString())
                          } else {
                            setTarget(step.doseMg.toString())
                          }
                        }}
                        className="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 transition-colors"
                        title={`${step.phase}: ${step.notes || ""}`}
                      >
                        {step.doseDisplay}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Compare target */}
            {mode === "compare" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                  Comparison Target ({targetUnit})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={comparisonTarget}
                  onChange={(e) => setComparisonTarget(e.target.value)}
                  placeholder="e.g. 500"
                  className="mt-2 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-fg-base/20"
                />
              </div>
            )}

            {/* Advanced toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-ui-fg-muted transition-colors hover:text-ui-fg-base"
              >
                <span
                  className={`transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
                >
                  ›
                </span>
                Advanced parameters
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                      IU per mg (when needed)
                    </label>
                    <input
                      inputMode="decimal"
                      className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
                      value={iuPerMg}
                      onChange={(e) => setIuPerMg(e.target.value)}
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                      mL per device unit
                    </label>
                    <input
                      inputMode="decimal"
                      className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
                      value={deviceVolume}
                      onChange={(e) => setDeviceVolume(e.target.value)}
                      placeholder="e.g. 0.1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                      Device label
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
                      value={deviceLabel}
                      onChange={(e) => setDeviceLabel(e.target.value)}
                      placeholder="e.g. U-100 Insulin Syringe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                      Decimal precision
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
                      value={precision}
                      onChange={(e) => setPrecision(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: live results + save */}
          <div className="flex flex-col justify-between p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                Live Results
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ResultCard
                  label="Concentration"
                  value={`${fmt(result?.concentrationMgPerMl, precision)} mg/mL`}
                  color="blue"
                  dim={!result}
                />
                <ResultCard
                  label="Volume"
                  value={`${fmt(result?.volumeMl, precision)} mL`}
                  color="indigo"
                  dim={!result}
                />
                <ResultCard
                  label={deviceLabel}
                  value={fmt(result?.deviceMeasurements, precision)}
                  color="violet"
                  dim={!result}
                />
                <ResultCard
                  label="Uses per Container"
                  value={fmt(result?.usesPerContainer, precision)}
                  color="emerald"
                  dim={!result}
                />
              </div>

              {/* Compare mode results */}
              {mode === "compare" && comparison && (
                <div className="mt-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
                  <p className="text-xs font-bold text-ui-fg-muted">
                    Comparison — {comparisonTarget || "—"} {targetUnit}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span className="text-ui-fg-subtle">Volume</span>
                    <span className="font-semibold tabular-nums">
                      {fmt(comparison.volumeMl, precision)} mL
                    </span>
                    <span className="text-ui-fg-subtle">{deviceLabel}</span>
                    <span className="font-semibold tabular-nums">
                      {fmt(comparison.deviceMeasurements, precision)}
                    </span>
                    <span className="text-ui-fg-subtle">Uses</span>
                    <span className="font-semibold tabular-nums">
                      {fmt(comparison.usesPerContainer, precision)}
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Syringe Visualizer */}
              {result && (
                <div className="mt-5">
                  <SyringeVisualizer
                    volumeMl={result.volumeMl}
                    deviceMeasurements={result.deviceMeasurements}
                    deviceLabel={deviceLabel}
                    compoundName={initialName || protocol?.protocol_title}
                  />
                </div>
              )}

              {/* Stoichiometry & Formula Card */}
              {result && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span className="font-semibold text-emerald-950">Stoichiometry & Yield Formula</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">C = M / V</span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Concentration Yield:</span>
                      <span className="font-mono">{mass} {massUnit} ÷ {volume} mL = </span>
                      <span className="font-bold text-emerald-800">{fmt(result.concentrationMgPerMl, precision)} mg/mL</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Unit Draw:</span>
                      <span className="font-mono">{target} {targetUnit} ÷ {fmt(result.concentrationMgPerMl, precision)} = </span>
                      <span className="font-bold text-emerald-800">{fmt(result.volumeMl, precision)} mL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Copy Formulation Summary to Clipboard */}
              {result && (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors shadow-2xs"
                  >
                    {copiedSummary ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-emerald-700">Copied Formulation Summary</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5 text-ui-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy Formulation Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 28-Day Stability & Refrigeration Advisory Banner */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/80 to-emerald-50/50 p-3.5 text-xs text-teal-950">
                <svg className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <p className="font-semibold text-teal-900">28-Day Refrigerated Stability Advisory</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-teal-800">
                    Reconstituted solutions utilizing Bacteriostatic 0.9% Benzyl Alcohol Water must be stored refrigerated between 2°C – 8°C (36°F – 46°F). To prevent peptide degradation, conclude analytical research within 28 days of reconstitution. Protect from direct light.
                  </p>
                </div>
              </div>
            </div>

            {/* Save form */}
            <form
              action={saveAction}
              className="mt-6 space-y-3 border-t border-ui-border-base pt-5"
            >
              {/* hidden fields */}
              <input type="hidden" name="country_code" value={countryCode} />
              <input type="hidden" name="idempotency_key" value={saveSubmissionKey} />
              <input type="hidden" name="mode" value={mode} />
              <input
                type="hidden"
                name="protocol_series_id"
                value={protocol?.protocol_series_id || ""}
              />
              <input
                type="hidden"
                name="protocol_revision_id"
                value={protocol?.protocol_revision_id || ""}
              />
              <input
                type="hidden"
                name="profile_protocol_access_id"
                value={protocol?.profile_access_id || ""}
              />
              <input type="hidden" name="compound_mass" value={mass} />
              <input type="hidden" name="compound_mass_unit" value={massUnit} />
              <input type="hidden" name="final_volume_ml" value={volume} />
              <input type="hidden" name="target_amount" value={target} />
              <input type="hidden" name="target_amount_unit" value={targetUnit} />
              <input
                type="hidden"
                name="comparison_target_amount"
                value={mode === "compare" ? comparisonTarget : ""}
              />
              <input type="hidden" name="iu_per_mg" value={iuPerMg} />
              <input type="hidden" name="device_volume_ml" value={deviceVolume} />
              <input type="hidden" name="device_label" value={deviceLabel} />
              <input type="hidden" name="rounding_precision" value={precision} />

              <p className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
                Save this calculation
              </p>
              <input
                name="title"
                required
                maxLength={120}
                placeholder="Calculation name"
                className="w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-fg-base/20"
                defaultValue={
                  initialName
                    ? `${initialName} Reconstitution`
                    : protocol
                      ? `${protocol.protocol_title} calculation`
                      : "Quick calculation"
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="routine_id"
                  className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">No routine</option>
                  {routines.map((item) => (
                    <option key={item.routine_id} value={item.routine_id}>
                      {item.current_revision.label}
                    </option>
                  ))}
                </select>
                <select
                  name="journal_entry_id"
                  className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">No journal entry</option>
                  {journalEntries.map((item) => (
                    <option key={item.journal_entry_id} value={item.journal_entry_id}>
                      {item.current_revision.title || item.current_revision.local_date}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <SaveButton disabled={!canSave} />
                {!canSave && (
                  <p className="text-xs text-amber-600">
                    Enter valid positive values to save.
                  </p>
                )}
                {saveState.error && (
                  <p className="text-xs text-red-600">{saveState.error}</p>
                )}
                {saveState.success && (
                  <p className="text-xs font-medium text-emerald-600">
                    ✓ Calculation saved
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Saved calculations history */}
      <SavedCalculations
        countryCode={countryCode}
        calculations={calculations}
        routines={routines}
        journalEntries={journalEntries}
      />
    </section>
  )
}

// ─── saved calculations ───────────────────────────────────────────────────────

function SavedCalculations({
  countryCode,
  calculations,
  routines,
  journalEntries,
}: {
  countryCode: string
  calculations: ResearchCalculationSnapshot[]
  routines: ResearchRoutine[]
  journalEntries: ResearchJournalEntry[]
}) {
  const [state, action] = useActionState(mutateResearchCalculationAction, initialState)
  const submissionKey = useResearchSubmissionKey(state)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted">
          Saved Calculations
        </p>
        <span className="rounded-full bg-ui-bg-subtle px-2 py-0.5 text-xs font-semibold text-ui-fg-subtle">
          {calculations.length}
        </span>
      </div>

      {calculations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ui-border-base bg-ui-bg-subtle p-6 text-center">
          <p className="text-sm text-ui-fg-subtle">No calculations saved yet.</p>
          <p className="mt-1 text-xs text-ui-fg-muted">
            Calculator inputs are not persisted automatically — use Save Calculation above.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {calculations.map((item) => {
          const attachedRoutine = routines.find(
            (r) => r.routine_id === item.routine_id,
          )
          const attachedEntry = journalEntries.find(
            (e) => e.journal_entry_id === item.journal_entry_id,
          )
          return (
            <HistoryCard
              key={item.id}
              item={item}
              countryCode={countryCode}
              submissionKey={submissionKey}
              action={action}
              routines={routines}
              journalEntries={journalEntries}
              attachedRoutine={attachedRoutine}
              attachedEntry={attachedEntry}
            />
          )
        })}
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs font-medium text-emerald-600">
          ✓ Calculation updated.
        </p>
      )}
    </div>
  )
}

function HistoryCard({
  item,
  countryCode,
  submissionKey,
  action,
  routines,
  journalEntries,
  attachedRoutine,
  attachedEntry,
}: {
  item: ResearchCalculationSnapshot
  countryCode: string
  submissionKey: string
  action: (payload: FormData) => void
  routines: ResearchRoutine[]
  journalEntries: ResearchJournalEntry[]
  attachedRoutine: ResearchRoutine | undefined
  attachedEntry: ResearchJournalEntry | undefined
}) {
  const [expanded, setExpanded] = useState(false)

  const savedDate = new Date(item.saved_at).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  const concRaw = rget(item.result, "concentrationMgPerMl")
  const concValue = concRaw != null ? `${concRaw} mg/mL` : null
  const volRaw = rget(item.result, "volumeMl")
  const volValue = volRaw != null ? `${volRaw} mL` : null

  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-ui-bg-subtle"
      >
        <div>
          <p className="text-sm font-semibold">{item.title}</p>
          <p className="mt-0.5 text-xs text-ui-fg-muted">
            {item.mode} · {savedDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick result preview chips */}
          {concValue && (
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 small:inline-block">
              {concValue}
            </span>
          )}
          {volValue && (
            <span className="hidden rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 small:inline-block">
              {volValue}
            </span>
          )}
          {(attachedRoutine || attachedEntry) && (
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 small:inline-block">
              Attached
            </span>
          )}
          <span
            className={`text-ui-fg-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            ⌄
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-ui-border-base px-5 pb-5 pt-4 space-y-4">
          {/* Input summary */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-ui-bg-subtle p-3 text-xs">
            <div>
              <p className="text-ui-fg-muted">Compound mass</p>
              <p className="font-semibold">
                {String(rget(item.input, "compound_mass") ?? "—")}{" "}
                {String(rget(item.unit_context, "compound_mass_unit") ?? "")}
              </p>
            </div>
            <div>
              <p className="text-ui-fg-muted">Final volume</p>
              <p className="font-semibold">{String(rget(item.input, "final_volume_ml") ?? "—")} mL</p>
            </div>
            <div>
              <p className="text-ui-fg-muted">Target dose</p>
              <p className="font-semibold">
                {String(rget(item.input, "target_amount") ?? "—")}{" "}
                {String(rget(item.unit_context, "target_amount_unit") ?? "")}
              </p>
            </div>
          </div>

          {/* Results summary */}
          <div className="grid grid-cols-4 gap-2">
            <ResultCard
              label="Conc."
              value={`${rget(item.result, "concentrationMgPerMl") ?? "—"} mg/mL`}
              color="blue"
            />
            <ResultCard
              label="Volume"
              value={`${rget(item.result, "volumeMl") ?? "—"} mL`}
              color="indigo"
            />
            <ResultCard
              label={String(rget(item.unit_context, "device_label") ?? "Device")}
              value={String(rget(item.result, "deviceMeasurements") ?? "—")}
              color="violet"
            />
            <ResultCard
              label="Uses"
              value={String(rget(item.result, "usesPerContainer") ?? "—")}
              color="emerald"
            />
          </div>

          {/* Attachments */}
          {attachedRoutine || attachedEntry ? (
            <p className="text-xs text-ui-fg-subtle">
              Attached to{" "}
              {attachedRoutine ? (
                <span className="font-medium text-ui-fg-base">
                  {attachedRoutine.current_revision.label}
                </span>
              ) : null}
              {attachedRoutine && attachedEntry ? " and " : ""}
              {attachedEntry ? (
                <span className="font-medium text-ui-fg-base">
                  {attachedEntry.current_revision.title ||
                    attachedEntry.current_revision.local_date}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-xs text-ui-fg-muted">
              Not attached to a routine or journal entry.
            </p>
          )}

          {/* Edit attachment + archive */}
          <form
            action={action}
            className="flex flex-wrap items-end gap-2 border-t border-ui-border-base pt-4"
          >
            <input type="hidden" name="country_code" value={countryCode} />
            <input type="hidden" name="idempotency_key" value={submissionKey} />
            <input type="hidden" name="calculation_id" value={item.id} />
            <select
              name="routine_id"
              defaultValue={item.routine_id || ""}
              className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
            >
              <option value="">Routine…</option>
              {routines.map((r) => (
                <option key={r.routine_id} value={r.routine_id}>
                  {r.current_revision.label}
                </option>
              ))}
            </select>
            <select
              name="journal_entry_id"
              defaultValue={item.journal_entry_id || ""}
              className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
            >
              <option value="">Journal entry…</option>
              {journalEntries.map((e) => (
                <option key={e.journal_entry_id} value={e.journal_entry_id}>
                  {e.current_revision.title || e.current_revision.local_date}
                </option>
              ))}
            </select>
            <button
              name="action"
              value="attach"
              className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium transition-colors hover:bg-ui-bg-subtle"
            >
              Save attachment
            </button>
            <button
              name="action"
              value="archive"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Archive
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
