"use client"

import { useMemo, useState } from "react"
import { calculateProtocol } from "./calculate-protocol"

type ProtocolCalculatorProps = {
  compoundName: string
  defaultVialNetMg: number
  defaultDiluentMl: number
  standardDoseMcg: number
  standardDoseDisplay?: string
  dosePresets?: number[]
  initialRoute?: "subq" | "nasal"
}

const DILUENT_OPTIONS = [1, 2, 3, 5, 10]
const NASAL_BOTTLE_OPTIONS = [5, 8, 10]

export default function ProtocolCalculator({
  compoundName,
  defaultVialNetMg,
  defaultDiluentMl,
  standardDoseMcg,
  standardDoseDisplay: _standardDoseDisplay,
  dosePresets,
  initialRoute,
}: ProtocolCalculatorProps) {
  const isNasalDefault = useMemo(() => {
    if (initialRoute) return initialRoute === "nasal"
    const lower = (compoundName || "").toLowerCase()
    return lower.includes("adamax") || lower.includes("semax") || lower.includes("selank")
  }, [initialRoute, compoundName])

  const [route, setRoute] = useState<"subq" | "nasal">(isNasalDefault ? "nasal" : "subq")
  
  // SubQ State
  const [vialMg, setVialMg] = useState<number>(defaultVialNetMg || 10)
  const [diluentMl, setDiluentMl] = useState<number>(defaultDiluentMl || 2.0)
  const [targetMcg, setTargetMcg] = useState<number>(standardDoseMcg || 250)

  // Nasal State
  const [nasalVialMg, setNasalVialMg] = useState<number>(defaultVialNetMg || 10)
  const [nasalBottleMl, setNasalBottleMl] = useState<number>(5.0)
  const [sprayCount, setSprayCount] = useState<number>(1)

  const presets = useMemo(() => {
    if (dosePresets && dosePresets.length > 0) return dosePresets
    const base = [100, 250, 500, 750, 1000]
    if (!base.includes(standardDoseMcg) && standardDoseMcg > 0) {
      base.push(standardDoseMcg)
      base.sort((a, b) => a - b)
    }
    return base
  }, [dosePresets, standardDoseMcg])

  // SubQ Calculation
  const subqCalc = useMemo(() => {
    return calculateProtocol({
      compoundMass: Math.max(0.1, vialMg || 1),
      compoundMassUnit: "mg",
      finalVolumeMl: Math.max(0.1, diluentMl || 1),
      targetAmount: Math.max(1, targetMcg || 10),
      targetAmountUnit: "mcg",
      deviceVolumeMl: 1.0, // Standard 1.0 mL (100 units)
    })
  }, [vialMg, diluentMl, targetMcg])

  const concentrationMgPerMl = subqCalc?.concentrationMgPerMl ?? 0
  const concentrationMcgPerMl = concentrationMgPerMl * 1000
  const volumeMl = subqCalc?.volumeMl ?? 0
  const volumeUl = volumeMl * 1000
  const syringeIU = volumeMl * 100
  const usesPerVial = subqCalc?.usesPerContainer ?? 0

  // Nasal Calculation
  const pumpOutputMl = 0.10 // Standard calibrated fine-mist atomizer
  const nasalConcMgPerMl = nasalVialMg / (nasalBottleMl || 5.0)
  const nasalConcMcgPerMl = nasalConcMgPerMl * 1000.0
  const singleSprayMcg = Math.round(nasalConcMcgPerMl * pumpOutputMl)
  const currentSprayDoseMcg = singleSprayMcg * sprayCount
  const totalRatedSprays = Math.round(nasalBottleMl / pumpOutputMl)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
              {route === "nasal" ? "💨" : "µL"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Interactive Reconstitution &amp; Dispensing Calculator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stoichiometric dilution parameters and volumetric calibrations for {compoundName}.
          </p>
        </div>

        {/* Administration Route Toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setRoute("subq")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              route === "subq"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            💉 SubQ Syringe
          </button>
          <button
            type="button"
            onClick={() => setRoute("nasal")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              route === "nasal"
                ? "bg-white text-cyan-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            💨 Intranasal Spray
          </button>
        </div>
      </div>

      {route === "subq" ? (
        /* ── SUBQ INJECTION CALCULATOR ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: SubQ Input Controls */}
          <div className="space-y-5">
            {/* 1. Vial Net Mass */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="calc-vial-mass" className="text-xs font-semibold text-slate-700">
                  1. Lyophilized Vial Net Content (mg)
                </label>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {vialMg} mg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="calc-vial-mass"
                  type="number"
                  min="0.5"
                  max="500"
                  step="0.5"
                  value={vialMg}
                  onChange={(e) => setVialMg(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[5, 10, 20, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setVialMg(val)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        vialMg === val
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      {val} mg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Diluent Added (mL) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  2. Bacteriostatic Water USP Added (mL)
                </label>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {diluentMl.toFixed(1)} mL
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DILUENT_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDiluentMl(val)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      diluentMl === val
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/40"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val}.0 mL
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Resulting Concentration:{" "}
                <strong className="text-slate-900 font-mono">
                  {concentrationMgPerMl.toFixed(2)} mg/mL
                </strong>{" "}
                ({concentrationMcgPerMl.toLocaleString()} mcg/mL)
              </p>
            </div>

            {/* 3. Target Desired Assay Dose (mcg) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="calc-target-dose" className="text-xs font-semibold text-slate-700">
                  3. Target Research Assay Dose (mcg)
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {targetMcg >= 1000 ? `${(targetMcg / 1000).toFixed(2)} mg` : `${targetMcg} mcg`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="calc-target-dose"
                  type="number"
                  min="1"
                  max="50000"
                  step="50"
                  value={targetMcg}
                  onChange={(e) => setTargetMcg(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetMcg(val)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        targetMcg === val
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000}mg` : `${val}mcg`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: SubQ Volumetric Dispensing Readout */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Volumetric Syringe Calibration
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500">
                100 IU = 1.0 mL (U-100 Standard)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Syringe Graduation Mark
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1">
                  {syringeIU.toFixed(1)} <span className="text-sm font-sans font-medium text-emerald-700">IU Units</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Draw to {syringeIU.toFixed(1)} mark on a 1.0 mL syringe
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Volumetric Liquid Measure
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                  {volumeUl.toFixed(0)} <span className="text-sm font-sans font-medium text-slate-500">µL ({volumeMl.toFixed(3)} mL)</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Precision SubQ injection volume
                </p>
              </div>
            </div>

            {/* Stoichiometric Summary */}
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-200/60 text-xs space-y-1.5 font-mono text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Concentration:</span>
                <span className="font-bold text-slate-900">{concentrationMgPerMl.toFixed(2)} mg/mL ({concentrationMcgPerMl.toLocaleString()} mcg/mL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Assays Per Vial:</span>
                <span className="font-bold text-slate-900">~{Math.floor(usesPerVial)} doses ({usesPerVial.toFixed(1)} exact)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reconstituted Cold Shelf-Life:</span>
                <span className="font-bold text-emerald-800">28 Days (Refrigerated 2°C–8°C)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── INTRANASAL SPRAY CALCULATOR ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Nasal Controls */}
          <div className="space-y-5">
            {/* 1. Vial Mass */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  1. Lyophilized Peptide Vial Content (mg)
                </label>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {nasalVialMg} mg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={nasalVialMg}
                  onChange={(e) => setNasalVialMg(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[5, 10, 30, 60].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNasalVialMg(val)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        nasalVialMg === val
                          ? "bg-cyan-900 text-white border-cyan-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      {val} mg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Bottle Capacity Added (mL) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  2. Nasal Spray Bottle Diluent Fill (mL)
                </label>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {nasalBottleMl.toFixed(1)} mL
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {NASAL_BOTTLE_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNasalBottleMl(val)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      nasalBottleMl === val
                        ? "border-cyan-600 bg-cyan-50 text-cyan-950 font-bold ring-1 ring-cyan-500/40"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val}.0 mL Bottle
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Dispenser: <strong className="text-slate-900">0.10 mL Calibrated Fine-Mist Atomizer</strong> ({totalRatedSprays} Rated Actuations)
              </p>
            </div>

            {/* 3. Number of Sprays */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  3. Dispensed Actuations per Administration
                </label>
                <span className="text-xs font-bold text-cyan-900 font-mono">
                  {currentSprayDoseMcg} mcg total ({sprayCount} {sprayCount === 1 ? "Spray" : "Sprays"})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((count) => {
                  const dose = singleSprayMcg * count
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSprayCount(count)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                        sprayCount === count
                          ? "bg-cyan-900 text-white border-cyan-900 font-bold shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>{count} {count === 1 ? "Spray" : "Sprays"}</span>
                      <span className={`text-[10px] font-mono ${sprayCount === count ? "text-cyan-200" : "text-slate-400"}`}>
                        {dose} mcg
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Nasal Volumetric Dispensing Readout */}
          <div className="p-5 rounded-2xl border border-cyan-200 bg-cyan-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                Metered Intranasal Calibration
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500">
                0.10 mL / Mist Actuation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-cyan-200/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Dose per Spray
                </span>
                <span className="text-2xl font-bold font-mono text-cyan-950 block mt-1">
                  {singleSprayMcg} <span className="text-sm font-sans font-medium text-cyan-700">mcg</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Each 0.10 mL mist discharge delivers {singleSprayMcg} mcg
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-cyan-200/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Total Rated Output
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                  {totalRatedSprays} <span className="text-sm font-sans font-medium text-slate-500">Sprays</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  In {nasalBottleMl.toFixed(1)} mL volumetric fill
                </p>
              </div>
            </div>

            {/* Stoichiometric Summary */}
            <div className="p-3 rounded-xl bg-white/80 border border-cyan-200/60 text-xs space-y-1.5 font-mono text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Solution Concentration:</span>
                <span className="font-bold text-slate-900">{nasalConcMgPerMl.toFixed(2)} mg/mL ({Math.round(nasalConcMcgPerMl).toLocaleString()} mcg/mL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Container Closure:</span>
                <span className="font-bold text-slate-900">18/410 Silicone Gasket Seal (Leak-Proof)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Refrigerated Stability:</span>
                <span className="font-bold text-cyan-800">28 Days (Refrigerated 2°C–8°C)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
