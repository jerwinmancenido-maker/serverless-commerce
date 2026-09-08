"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SyringeVisualizer from "@modules/account/components/research-tracking/syringe-visualizer"
import { calculateProtocol } from "./calculate-protocol"

export type CompoundPreset = {
  id: string
  name: string
  mass: number
  massUnit: "mg" | "mcg" | "g" | "IU"
  volumeMl: number
  targetAmount: number
  targetUnit: "mcg" | "mg" | "IU"
  iuPerMg?: number
  protocolHandle?: string
}

export const COMPOUND_PRESETS: CompoundPreset[] = [
  {
    id: "bpc-157",
    name: "BPC-157 (10 mg)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 2.0,
    targetAmount: 250,
    targetUnit: "mcg",
    protocolHandle: "bpc-157",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide (10 mg)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 2.0,
    targetAmount: 2.5,
    targetUnit: "mg",
    protocolHandle: "tirzepatide",
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu (50 mg)",
    mass: 50,
    massUnit: "mg",
    volumeMl: 2.5,
    targetAmount: 2.0,
    targetUnit: "mg",
    protocolHandle: "ghk-cu",
  },
  {
    id: "semaglutide",
    name: "Semaglutide (5 mg)",
    mass: 5,
    massUnit: "mg",
    volumeMl: 2.0,
    targetAmount: 0.25,
    targetUnit: "mg",
    protocolHandle: "semaglutide",
  },
  {
    id: "hgh",
    name: "HGH (24 IU)",
    mass: 24,
    massUnit: "IU",
    volumeMl: 2.0,
    targetAmount: 2.0,
    targetUnit: "IU",
    iuPerMg: 3,
    protocolHandle: "hgh-somatropin",
  },
  {
    id: "hmg",
    name: "HMG (75 IU)",
    mass: 75,
    massUnit: "IU",
    volumeMl: 1.0,
    targetAmount: 37.5,
    targetUnit: "IU",
    iuPerMg: 75,
    protocolHandle: "hmg-75iu",
  },
  {
    id: "tb-500",
    name: "TB-500 (10 mg)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 2.0,
    targetAmount: 2.0,
    targetUnit: "mg",
    protocolHandle: "tb-500",
  },
  {
    id: "cjc-ipamorelin",
    name: "CJC-1295 + Ipamorelin (10 mg)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 2.5,
    targetAmount: 500,
    targetUnit: "mcg",
    protocolHandle: "cjc-ipam-blend",
  },
  {
    id: "nad-plus",
    name: "NAD+ (500 mg)",
    mass: 500,
    massUnit: "mg",
    volumeMl: 5.0,
    targetAmount: 50,
    targetUnit: "mg",
    protocolHandle: "nad-plus",
  },
  {
    id: "epithalon",
    name: "Epithalon (10 mg)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 2.0,
    targetAmount: 500,
    targetUnit: "mcg",
    protocolHandle: "epithalon",
  },
  {
    id: "adamax",
    name: "Adamax (10 mg · Nasal)",
    mass: 10,
    massUnit: "mg",
    volumeMl: 5.0,
    targetAmount: 200,
    targetUnit: "mcg",
    protocolHandle: "adamax-1032",
  },
  {
    id: "semax",
    name: "Semax (30 mg · Nasal)",
    mass: 30,
    massUnit: "mg",
    volumeMl: 5.0,
    targetAmount: 600,
    targetUnit: "mcg",
    protocolHandle: "semax",
  },
  {
    id: "selank",
    name: "Selank (5 mg · Nasal)",
    mass: 5,
    massUnit: "mg",
    volumeMl: 5.0,
    targetAmount: 100,
    targetUnit: "mcg",
    protocolHandle: "selank",
  },
]

export default function StandaloneReconstitutionCalculator({
  initialPresetId,
}: {
  initialPresetId?: string
}) {
  const searchParams = useSearchParams()

  const [activePreset, setActivePreset] = useState<string>(
    initialPresetId || "bpc-157"
  )
  const [compoundName, setCompoundName] = useState("BPC-157")
  const [compoundMass, setCompoundMass] = useState("10")
  const [compoundMassUnit, setCompoundMassUnit] = useState<"mg" | "mcg" | "g" | "IU">("mg")
  const [diluentVolume, setDiluentVolume] = useState("2.0")
  const [targetDose, setTargetDose] = useState("250")
  const [targetDoseUnit, setTargetDoseUnit] = useState<"mcg" | "mg" | "IU">("mcg")
  const [iuPerMg, setIuPerMg] = useState<number | null>(null)
  const [activeProtocolHandle, setActiveProtocolHandle] = useState<string | undefined>("bpc-157-protocol")
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)

  // Hydrate from search params if provided
  useEffect(() => {
    const pName = searchParams.get("name")
    const pMass = searchParams.get("mass")
    const pUnit = searchParams.get("unit")
    const pVolume = searchParams.get("volume")
    const pDose = searchParams.get("dose")
    const pDoseUnit = searchParams.get("doseUnit")
    const pPreset = searchParams.get("preset")

    if (pPreset) {
      const found = COMPOUND_PRESETS.find((p) => p.id === pPreset)
      if (found) {
        selectPreset(found)
        return
      }
    }

    if (pMass || pVolume || pDose) {
      setActivePreset("custom")
      if (pName) setCompoundName(pName)
      if (pMass) setCompoundMass(pMass)
      if (pUnit && (pUnit === "mg" || pUnit === "mcg" || pUnit === "g" || pUnit === "IU")) {
        setCompoundMassUnit(pUnit)
      }
      if (pVolume) setDiluentVolume(pVolume)
      if (pDose) setTargetDose(pDose)
      if (pDoseUnit && (pDoseUnit === "mcg" || pDoseUnit === "mg" || pDoseUnit === "IU")) {
        setTargetDoseUnit(pDoseUnit)
      }
    }
  }, [searchParams])

  const selectPreset = (preset: CompoundPreset) => {
    setActivePreset(preset.id)
    setCompoundName(preset.name.split(" ")[0])
    setCompoundMass(String(preset.mass))
    setCompoundMassUnit(preset.massUnit)
    setDiluentVolume(String(preset.volumeMl))
    setTargetDose(String(preset.targetAmount))
    setTargetDoseUnit(preset.targetUnit)
    setIuPerMg(preset.iuPerMg ?? null)
    setActiveProtocolHandle(preset.protocolHandle)
  }

  const setCustom = () => {
    setActivePreset("custom")
    setActiveProtocolHandle(undefined)
  }

  const numMass = Number(compoundMass) || 0
  const numVolume = Number(diluentVolume) || 0
  const numTarget = Number(targetDose) || 0

  const resolvedIuPerMg = iuPerMg ?? (activePreset === "hgh" ? 3 : activePreset === "hmg" ? 75 : null)

  const result = useMemo(() => {
    return calculateProtocol({
      compoundMass: numMass,
      compoundMassUnit,
      finalVolumeMl: numVolume,
      targetAmount: numTarget,
      targetAmountUnit: targetDoseUnit,
      iuPerMg: resolvedIuPerMg,
    })
  }, [numMass, compoundMassUnit, numVolume, numTarget, targetDoseUnit, resolvedIuPerMg])

  // Conversion check for sanity warnings
  const massInMg = useMemo(() => {
    if (compoundMassUnit === "mcg") return numMass / 1000
    if (compoundMassUnit === "g") return numMass * 1000
    if (compoundMassUnit === "IU" && resolvedIuPerMg) return numMass / resolvedIuPerMg
    return numMass
  }, [numMass, compoundMassUnit, resolvedIuPerMg])

  const targetInMg = useMemo(() => {
    if (targetDoseUnit === "mcg") return numTarget / 1000
    if (targetDoseUnit === "IU" && resolvedIuPerMg) return numTarget / resolvedIuPerMg
    return numTarget
  }, [numTarget, targetDoseUnit, resolvedIuPerMg])

  const isDoseExceedingVial = targetInMg > 0 && massInMg > 0 && targetInMg > massInMg
  const isVolumeOver1mL = result?.volumeMl != null && result.volumeMl > 1.0

  const unitsOnU100 = result?.volumeMl != null ? Number((result.volumeMl * 100).toFixed(1)) : null

  // Copy lab recipe to clipboard
  const handleCopyRecipe = async () => {
    const summaryText = `[PEPSTACK RECONSTITUTION RECIPE]
Compound: ${compoundName} (${compoundMass} ${compoundMassUnit})
Diluent: ${diluentVolume} mL Bacteriostatic Water
Concentration: ${result?.concentrationMgPerMl ? result.concentrationMgPerMl.toFixed(2) : "—"} mg/mL
Target Dose: ${targetDose} ${targetDoseUnit} (${result?.volumeMl ? result.volumeMl.toFixed(3) : "—"} mL)
Syringe Draw: ${unitsOnU100 != null ? unitsOnU100 : "—"} Units on U-100 syringe
Total Yield: ${result?.usesPerContainer ? Math.floor(result.usesPerContainer) : "—"} doses
Reconstitution: Angle BAC water stream against inner glass wall. Swirl gently. Do not shake.
Storage: 2°C - 8°C (Refrigerate once reconstituted)`

    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyFeedback("Recipe copied to clipboard")
      setTimeout(() => setCopyFeedback(null), 3000)
    } catch {
      setCopyFeedback("Unable to copy automatically")
    }
  }

  // Share link
  const handleShareLink = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("mass", compoundMass)
    url.searchParams.set("unit", compoundMassUnit)
    url.searchParams.set("volume", diluentVolume)
    url.searchParams.set("dose", targetDose)
    url.searchParams.set("doseUnit", targetDoseUnit)
    url.searchParams.set("name", compoundName)
    url.searchParams.set("preset", activePreset)

    try {
      await navigator.clipboard.writeText(url.toString())
      setShareFeedback("Deep link copied")
      setTimeout(() => setShareFeedback(null), 3000)
    } catch {
      setShareFeedback("Unable to copy link")
    }
  }

  // Smart bridge link to customer private hub
  const bridgeUrl = `/account/research-hub?section=calculator&mass=${encodeURIComponent(
    compoundMass
  )}&unit=${encodeURIComponent(compoundMassUnit)}&name=${encodeURIComponent(
    compoundName
  )}`

  return (
    <div id="calculator" className="scroll-mt-24 space-y-8">
      {/* ── Main Calculator Console (Clean Clinical Light) ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
        {/* Top Control Bar with Presets */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-5 small:p-6">
          <div className="flex flex-col gap-4 medium:flex-row medium:items-center medium:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Interactive Math Engine
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 small:text-2xl">
                Peptide Reconstitution &amp; Syringe Calculator
              </h2>
            </div>

            {/* Actions: Share & Copy */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                title="Share calculation link"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {shareFeedback || "Share Link"}
              </button>

              <button
                type="button"
                onClick={handleCopyRecipe}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100"
                title="Copy formatted recipe for lab notebook"
              >
                <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {copyFeedback || "Copy Lab Recipe"}
              </button>
            </div>
          </div>

          {/* Preset Selector Chips */}
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Quick Compound Presets
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {COMPOUND_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                    }`}
                  >
                    {preset.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={setCustom}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activePreset === "custom"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                }`}
              >
                Custom Parameter
              </button>
            </div>
          </div>
        </div>

        {/* ── Inputs & Real-Time Readout Grid ── */}
        <div className="grid gap-6 p-6 small:p-8 large:grid-cols-12">
          {/* Left Column: Input Form (5 cols) */}
          <div className="space-y-5 large:col-span-5">
            {/* Compound Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Compound Name
              </label>
              <input
                type="text"
                value={compoundName}
                onChange={(e) => {
                  setCompoundName(e.target.value)
                  setActivePreset("custom")
                }}
                placeholder="e.g. BPC-157"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Mass in Vial */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Vial Content Mass
                </label>
                <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs">
                  {(["mg", "mcg", "g", "IU"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        setCompoundMassUnit(unit)
                        setActivePreset("custom")
                      }}
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        compoundMassUnit === unit
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={compoundMass}
                onChange={(e) => {
                  setCompoundMass(e.target.value)
                  setActivePreset("custom")
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Diluent Added (BAC Water) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Bacteriostatic Water Added
                </label>
                <span className="text-xs text-slate-500 font-medium">mL</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.1"
                value={diluentVolume}
                onChange={(e) => {
                  setDiluentVolume(e.target.value)
                  setActivePreset("custom")
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
              {/* Quick volume chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["1.0", "2.0", "3.0", "5.0"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setDiluentVolume(v)
                      setActivePreset("custom")
                    }}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      diluentVolume === v
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {v} mL
                  </button>
                ))}
              </div>
            </div>

            {/* Target Research Dose */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Target Research Dose
                </label>
                <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs">
                  {(["mcg", "mg", "IU"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        setTargetDoseUnit(unit)
                        setActivePreset("custom")
                      }}
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        targetDoseUnit === unit
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={targetDose}
                onChange={(e) => {
                  setTargetDose(e.target.value)
                  setActivePreset("custom")
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Right Column: Calculated Results & Metrics (7 cols) */}
          <div className="flex flex-col justify-between space-y-6 large:col-span-7">
            {/* Safety Alerts (if any) */}
            {isDoseExceedingVial ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Unit Verification Warning
                    </p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      Target dose ({targetDose} {targetDoseUnit}) exceeds total vial mass ({compoundMass} {compoundMassUnit}). Please verify if your intended target is in <strong>mcg</strong> instead of <strong>mg</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isVolumeOver1mL && !isDoseExceedingVial ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      High Draw Volume
                    </p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      Calculated draw volume is {result?.volumeMl?.toFixed(2)} mL, exceeding standard 1.0 mL insulin syringe capacity. Check reconstitution diluent ratio or target dose units.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Primary Hero Readout Card */}
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white p-5 small:p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Recommended Syringe Draw
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  U-100 Standard
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-slate-900 tabular-nums small:text-5xl">
                  {unitsOnU100 != null ? unitsOnU100 : "—"}
                </span>
                <span className="text-xl font-bold text-emerald-600">Units</span>
                {result?.volumeMl != null && (
                  <span className="text-sm font-medium text-slate-500">
                    ({result.volumeMl.toFixed(3)} mL)
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Draw solution until the front sealing ring of the plunger reaches mark{" "}
                <strong className="text-slate-900">{unitsOnU100 != null ? unitsOnU100 : "—"}</strong>{" "}
                on your standard 100-unit insulin syringe.
              </p>
            </div>

            {/* Supporting Clinical Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 small:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Final Concentration
                </p>
                <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
                  {result?.concentrationMgPerMl != null
                    ? `${result.concentrationMgPerMl.toFixed(2)} mg/mL`
                    : "—"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {result?.concentrationMgPerMl != null
                    ? `${(result.concentrationMgPerMl * 1000).toLocaleString()} mcg/mL`
                    : ""}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Draw Volume
                </p>
                <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
                  {result?.volumeMl != null ? `${result.volumeMl.toFixed(3)} mL` : "—"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">per target dose</p>
              </div>

              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 small:col-span-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Doses Per Vial
                </p>
                <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
                  {result?.usesPerContainer != null
                    ? `${Math.floor(result.usesPerContainer)} Doses`
                    : "—"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">at current target dose</p>
              </div>
            </div>

            {/* Protocol Link (if preset is associated with an active protocol) */}
            {activeProtocolHandle ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    Published {compoundName} Protocol Available
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Review storage temps, handling precautions, and published literature.
                  </p>
                </div>
                <LocalizedClientLink
                  href={`/research-protocols/${activeProtocolHandle}`}
                  className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  View Dossier →
                </LocalizedClientLink>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Visual Syringe Gauge (Integrated & Calibrated) ── */}
      <div>
        <SyringeVisualizer
          volumeMl={result?.volumeMl}
          compoundName={compoundName}
          deviceLabel="U-100 Insulin Syringe"
        />
      </div>

      {/* ── Smart Bridge: Public Visitor vs. Customer Private Hub ── */}
      <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white p-6 small:p-8 shadow-xs">
        <div className="flex flex-col gap-6 medium:flex-row medium:items-center medium:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Customer Research Hub Integration
              </p>
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Save This Calculation to Your Private Vial Inventory
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every verified PepStack order grants full access to the encrypted Private Vial Hub. Log reconstitution dates, track remaining doses per vial, configure custom administration calendars, and unlock protected titration schedules.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LocalizedClientLink
              href={bridgeUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-emerald-500"
            >
              Open in Private Vial Hub
              <span aria-hidden="true">→</span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50"
            >
              Browse Catalog
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* ── Handling Guidelines ── */}
      <div className="grid gap-4 small:grid-cols-2 large:grid-cols-4">
        <div className="rounded-xl border border-ui-border-base bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Step 1: Sanitize</p>
          <p className="mt-2 text-xs font-medium text-ui-fg-base">Alcohol Swab Seal</p>
          <p className="mt-1 text-xs text-ui-fg-subtle leading-relaxed">
            Clean rubber septums of both BAC water and peptide vials with sterile 70% isopropyl alcohol. Allow to air dry completely.
          </p>
        </div>

        <div className="rounded-xl border border-ui-border-base bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Step 2: Wall Intro</p>
          <p className="mt-2 text-xs font-medium text-ui-fg-base">Slow Stream Down Wall</p>
          <p className="mt-1 text-xs text-ui-fg-subtle leading-relaxed">
            Angle needle so diluent trickles down the inner glass wall. Never spray diluent directly onto the lyophilized cake.
          </p>
        </div>

        <div className="rounded-xl border border-ui-border-base bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Step 3: Dissolve</p>
          <p className="mt-2 text-xs font-medium text-ui-fg-base">Do Not Agitate or Shake</p>
          <p className="mt-1 text-xs text-ui-fg-subtle leading-relaxed">
            Allow lyophilized compound to dissolve spontaneously. Swirl gently if necessary. Never shake shear-sensitive peptide bonds.
          </p>
        </div>

        <div className="rounded-xl border border-ui-border-base bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Step 4: Cold-Chain</p>
          <p className="mt-2 text-xs font-medium text-ui-fg-base">Store at 2°C to 8°C</p>
          <p className="mt-1 text-xs text-ui-fg-subtle leading-relaxed">
            Refrigerate immediately after reconstitution. Protect from direct ultraviolet light exposure. Use within stability window.
          </p>
        </div>
      </div>
    </div>
  )
}
