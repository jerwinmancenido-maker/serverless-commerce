"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/interactive-nasal-stoichiometry.tsx
 * @module  InteractiveNasalStoichiometry (Research Protocols Module)
 * @purpose Flagship metered nasal atomizer stoichiometry engine, SVG spray plume simulator, and non-injectable aerosol dosing console.
 * @checklist pepstack-frontend-nasal-interface-checklist.md
 */

import React, { useId, useState, useEffect } from "react"
import { Sparkles, ExclamationCircle } from "@medusajs/icons"

export interface NasalTitrationStepItem {
  stage?: string
  timeframe?: string
  doseDisplay?: string
  doseMcg?: number
  sprays?: number
  notes?: string
}

export interface InteractiveNasalStoichiometryProps {
  compoundId?: string
  compoundName?: string
  subtitle?: string
  vialMg?: number
  diluentMl?: number
  concMgMl?: number
  standardDoseMcg?: number
  standardDoseDisplay?: string
  cadence?: string
  titrationSteps?: NasalTitrationStepItem[]
  sprayVolumeMl?: number
  className?: string
  onCalibrationChange?: (metrics: {
    mass: number
    volumeMl: number
    concMgMl: number
    mcgPerSpray: number
    targetMcg: number
    spraysNeeded: number
    totalSprays: number
  }) => void
}

const NASAL_CATALOG_PRESETS = [
  { id: "semax", label: "Semax (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
  { id: "selank", label: "Selank (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
  { id: "na-semax-amidate", label: "NA-Semax Amidate (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
  { id: "na-selank-amidate", label: "NA-Selank Amidate (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
  { id: "adamax-1032", label: "Adamax (10mg)", mass: 10, vol: 5, target: 250, doseDisplay: "250 mcg / spray" },
  { id: "oxytocin", label: "Oxytocin (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
  { id: "pinealon", label: "Pinealon (10mg)", mass: 10, vol: 5, target: 200, doseDisplay: "200 mcg / spray" },
]

export function InteractiveNasalStoichiometry({
  compoundId: _compoundId = "nasal-peptide",
  compoundName = "Neuropeptide Nasal Solution",
  subtitle,
  vialMg: initialVialMg = 10,
  diluentMl: initialDiluentMl = 5,
  concMgMl: _initialConcMgMl,
  standardDoseMcg: initialStandardDoseMcg = 200,
  standardDoseDisplay: _standardDoseDisplay,
  cadence = "1–2 sprays per nostril daily",
  titrationSteps: _titrationSteps = [],
  sprayVolumeMl: initialSprayVolumeMl = 0.1,
  className = "",
  onCalibrationChange,
}: InteractiveNasalStoichiometryProps) {
  const componentId = useId()

  // State
  const [compoundMassInput, setCompoundMassInput] = useState(String(initialVialMg))
  const [finalVolumeInput, setFinalVolumeInput] = useState(String(initialDiluentMl))
  const [targetDoseInput, setTargetDoseInput] = useState(String(initialStandardDoseMcg))
  const [targetDoseUnit, setTargetDoseUnit] = useState<"mcg" | "mg">("mcg")
  const [isSpraying, setIsSpraying] = useState(false)
  const [sprayCount, setSprayCount] = useState(0)

  // Synchronize when initial props change
  useEffect(() => {
    if (initialVialMg) setCompoundMassInput(String(initialVialMg))
  }, [initialVialMg])

  useEffect(() => {
    if (initialDiluentMl) setFinalVolumeInput(String(initialDiluentMl))
  }, [initialDiluentMl])

  useEffect(() => {
    if (initialStandardDoseMcg) {
      if (targetDoseUnit === "mg") {
        setTargetDoseInput((initialStandardDoseMcg / 1000).toFixed(2))
      } else {
        setTargetDoseInput(String(initialStandardDoseMcg))
      }
    }
  }, [initialStandardDoseMcg, targetDoseUnit])

  // Calculated Stoichiometry
  const massMg = Math.max(0.1, parseFloat(compoundMassInput) || 10)
  const volumeMl = Math.max(0.5, parseFloat(finalVolumeInput) || 5)
  const pumpVolumeMl = Math.max(0.01, initialSprayVolumeMl || 0.1)

  const concMgMl = volumeMl > 0 ? massMg / volumeMl : 0
  const concMcgMl = concMgMl * 1000

  const amountPerSprayMg = concMgMl * pumpVolumeMl
  const amountPerSprayMcg = Math.round(amountPerSprayMg * 1000)

  const rawTargetDose = parseFloat(targetDoseInput) || 200
  const targetDoseMcg = targetDoseUnit === "mg" ? rawTargetDose * 1000 : rawTargetDose

  const spraysNeededRaw = amountPerSprayMcg > 0 ? targetDoseMcg / amountPerSprayMcg : 0
  const spraysNeededFormatted =
    spraysNeededRaw > 0
      ? Math.abs(spraysNeededRaw - Math.round(spraysNeededRaw)) < 0.0001
        ? String(Math.round(spraysNeededRaw))
        : spraysNeededRaw.toFixed(1)
      : "—"

  const totalTheoreticalSprays =
    volumeMl > 0 && pumpVolumeMl > 0 ? Math.floor(volumeMl / pumpVolumeMl) : 0

  // Liquid level fraction for SVG visualizer
  const liquidFraction = Math.min(1, Math.max(0.1, volumeMl / 15))

  // Inform parent callback
  useEffect(() => {
    onCalibrationChange?.({
      mass: massMg,
      volumeMl,
      concMgMl: Number(concMgMl.toFixed(3)),
      mcgPerSpray: amountPerSprayMcg,
      targetMcg: targetDoseMcg,
      spraysNeeded: Number(spraysNeededRaw.toFixed(2)),
      totalSprays: totalTheoreticalSprays,
    })
  }, [
    massMg,
    volumeMl,
    concMgMl,
    amountPerSprayMcg,
    targetDoseMcg,
    spraysNeededRaw,
    totalTheoreticalSprays,
    onCalibrationChange,
  ])

  // Actuation Trigger
  const triggerSpray = () => {
    setIsSpraying(true)
    setSprayCount((prev) => prev + 1)
    setTimeout(() => setIsSpraying(false), 900)
  }

  // Quick Preset Selection
  const handleSelectPreset = (preset: (typeof NASAL_CATALOG_PRESETS)[0]) => {
    setCompoundMassInput(String(preset.mass))
    setFinalVolumeInput(String(preset.vol))
    setTargetDoseUnit("mcg")
    setTargetDoseInput(String(preset.target))
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {/* ── 1. SCREEN LABORATORY VISUALIZER CARD ── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/90 bg-white p-5 sm:p-6 text-slate-900 shadow-sm print:hidden">
        {/* Subtle Radial Glow */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)",
          }}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs text-lg">
              👃
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Metered Nasal Atomizer Stoichiometry</span>
                {compoundName && compoundName !== "Neuropeptide Nasal Solution" && (
                  <span className="text-xs font-mono font-normal text-purple-800">
                    — {compoundName}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                {subtitle ||
                  "Precision 0.10 mL micro-mist pump calibration, final prepared volume, and mucosal spray yield."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[10px] font-mono font-bold text-purple-900">
              Metered Atomizer ({pumpVolumeMl.toFixed(2)} mL/actuation)
            </span>
            <span className="hidden sm:inline-block rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-mono text-slate-700">
              Sterile Saline / USP Vehicle
            </span>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-purple-900/60 shrink-0">
            Presets:
          </span>
          {NASAL_CATALOG_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                Math.abs(massMg - preset.mass) < 0.1 &&
                Math.abs(volumeMl - preset.vol) < 0.1 &&
                Math.abs(targetDoseMcg - preset.target) < 1
                  ? "bg-purple-800 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-purple-900"
              }`}
            >
              {preset.label}
            </button>
          ))}
          {cadence && (
            <span className="ml-auto hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200 shrink-0">
              Cadence: {cadence}
            </span>
          )}
        </div>

        {/* ── INTEGRATED PARAMETER CALIBRATION BAR ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 mb-4 shadow-2xs">
          {/* 1. Compound Mass */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-purple-700 font-mono">1.</span> Peptide in Vial
              </span>
              <span className="text-[10px] font-mono text-purple-800 font-bold">{massMg} mg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.5"
                step="1"
                value={compoundMassInput}
                onChange={(e) => setCompoundMassInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
                placeholder="10"
                aria-label="Peptide net mass in mg"
              />
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 font-mono">
                mg
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Quick:</span>
              {[5, 10, 20, 30, 60].map((m) => (
                <button
                  key={`mass-${m}`}
                  type="button"
                  onClick={() => setCompoundMassInput(String(m))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    Math.abs(massMg - m) < 0.1
                      ? "bg-purple-800 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {m}mg
                </button>
              ))}
            </div>
          </div>

          {/* 2. Final Prepared Volume / Nasal Vehicle */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-purple-700 font-mono">2.</span> Final Volume / Nasal Vehicle
              </span>
              <span className="text-[10px] font-mono text-purple-800 font-bold">
                {volumeMl.toFixed(1)} mL
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={finalVolumeInput}
                onChange={(e) => setFinalVolumeInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
                placeholder="5.0"
                aria-label="Final prepared volume in mL"
              />
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 font-mono">
                mL
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Quick:</span>
              {[2.5, 3.0, 5.0, 10.0, 15.0].map((v) => (
                <button
                  key={`vol-${v}`}
                  type="button"
                  onClick={() => setFinalVolumeInput(String(v))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    Math.abs(volumeMl - v) < 0.05
                      ? "bg-purple-800 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {v}mL
                </button>
              ))}
            </div>
          </div>

          {/* 3. Desired Target Assay Amount */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-purple-700 font-mono">3.</span> Target Assay Amount
              </span>
              <span className="text-[10px] font-mono text-purple-900 font-bold">
                {spraysNeededFormatted} Sprays
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="10"
                step={targetDoseUnit === "mg" ? "0.05" : "50"}
                value={targetDoseInput}
                onChange={(e) => setTargetDoseInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
                placeholder="200"
                aria-label="Target assay amount"
              />
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                {(["mcg", "mg"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => {
                      if (unit !== targetDoseUnit) {
                        const num = parseFloat(targetDoseInput) || 0
                        if (unit === "mg") {
                          setTargetDoseInput((num / 1000).toFixed(2))
                        } else {
                          setTargetDoseInput(Math.round(num * 1000).toString())
                        }
                        setTargetDoseUnit(unit)
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      targetDoseUnit === unit
                        ? "bg-purple-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Target:</span>
              {[100, 200, 300, 400, 500].map((dose) => (
                <button
                  key={`target-${dose}`}
                  type="button"
                  onClick={() => {
                    setTargetDoseUnit("mcg")
                    setTargetDoseInput(String(dose))
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    Math.abs(targetDoseMcg - dose) < 1
                      ? "bg-purple-800 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {dose}µg
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. SVG NASAL ATOMIZER & PLUME SIMULATION CANVAS ── */}
        <div className="relative rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/40 via-white to-slate-50/80 p-5 mb-5 shadow-2xs overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Interactive Graphic */}
            <div className="relative flex flex-col items-center justify-center select-none w-full lg:w-72">
              {/* SVG Atomizer */}
              <svg
                viewBox="0 0 200 240"
                className="w-48 h-56 transition-transform duration-300"
                aria-label="Calibrated Metered Nasal Atomizer"
              >
                <defs>
                  <linearGradient id={`${componentId}-amber`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="35%" stopColor="#b45309" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id={`${componentId}-liquid`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Spray Plume Aerosol Animation */}
                {isSpraying && (
                  <g className="animate-pulse">
                    {/* Plume Rays */}
                    <path
                      d="M 100 25 L 30 -20 M 100 25 L 60 -35 M 100 25 L 100 -40 M 100 25 L 140 -35 M 100 25 L 170 -20"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {/* Aerosol Micro-Mist Droplets */}
                    <circle cx="50" cy="-10" r="3" fill="#0284c7" opacity="0.9" />
                    <circle cx="70" cy="-25" r="2" fill="#38bdf8" opacity="0.8" />
                    <circle cx="100" cy="-32" r="3.5" fill="#0284c7" opacity="0.95" />
                    <circle cx="130" cy="-25" r="2" fill="#38bdf8" opacity="0.8" />
                    <circle cx="150" cy="-10" r="3" fill="#0284c7" opacity="0.9" />
                    <circle cx="85" cy="-12" r="2.5" fill="#0284c7" opacity="0.75" />
                    <circle cx="115" cy="-12" r="2.5" fill="#0284c7" opacity="0.75" />
                  </g>
                )}

                {/* Amber Glass Bottle Body */}
                <rect
                  x="60"
                  y="100"
                  width="80"
                  height="125"
                  rx="12"
                  fill={`url(#${componentId}-amber)`}
                  stroke="#451a03"
                  strokeWidth="2"
                />

                {/* Liquid Level Indicator inside Amber Glass */}
                <rect
                  x="65"
                  y={220 - 110 * liquidFraction}
                  width="70"
                  height={110 * liquidFraction}
                  rx="4"
                  fill={`url(#${componentId}-liquid)`}
                />

                {/* Internal Dip Tube */}
                <line
                  x1="100"
                  y1="75"
                  x2="100"
                  y2="215"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  opacity="0.5"
                  strokeDasharray="4,2"
                />

                {/* Label on Bottle */}
                <rect
                  x="68"
                  y="125"
                  width="64"
                  height="60"
                  rx="4"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x="100"
                  y="142"
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  NASAL SPRAY
                </text>
                <text x="100" y="156" textAnchor="middle" fontSize="7.5" fill="#64748b">
                  {concMgMl.toFixed(1)} mg/mL
                </text>
                <text
                  x="100"
                  y="172"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="bold"
                  fill="#6b21a8"
                >
                  {amountPerSprayMcg} µg/spray
                </text>

                {/* Bottle Neck Thread */}
                <rect
                  x="84"
                  y="82"
                  width="32"
                  height="18"
                  rx="2"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="1.5"
                />

                {/* Mechanical Actuator Collar */}
                <rect
                  x="80"
                  y="70"
                  width="40"
                  height="13"
                  rx="2"
                  fill="#e2e8f0"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />

                {/* Ergonomic Finger Flanges */}
                <path
                  d="M 50 76 Q 80 76 80 70 L 120 70 Q 120 76 150 76 L 150 82 L 50 82 Z"
                  fill="#cbd5e1"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* Atomizer Nozzle Stem */}
                <rect
                  x="92"
                  y="30"
                  width="16"
                  height="40"
                  rx="4"
                  fill="#f1f5f9"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* Spray Orifice Hole */}
                <circle cx="100" cy="32" r="2.5" fill="#0f172a" />
              </svg>

              {/* Actuate Plume Action Button */}
              <button
                type="button"
                onClick={triggerSpray}
                disabled={isSpraying}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-purple-800 hover:bg-purple-900 active:scale-95 text-white px-4 py-2 text-xs font-bold font-mono shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>{isSpraying ? "Actuating Plume..." : "Simulate Metered Spray (0.10 mL)"}</span>
              </button>
              {sprayCount > 0 && (
                <span className="text-[10px] font-mono text-purple-900/70 mt-1">
                  Actuation #{sprayCount} • {sprayCount * amountPerSprayMcg} µg cumulative delivered
                </span>
              )}
            </div>

            {/* Right: Real-time Stoichiometric Yield Specs */}
            <div className="flex-1 w-full space-y-3">
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-purple-200/60 pb-2">
                  <span className="font-bold text-purple-950 uppercase tracking-wider text-[11px]">
                    Verified Metered Pump Output
                  </span>
                  <span className="font-mono font-bold text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded-md text-[11px]">
                    {pumpVolumeMl.toFixed(2)} mL (100 µL) ± 3%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Active Yield per Single Spray:
                    </span>
                    <span className="text-base font-mono font-extrabold text-purple-900">
                      {amountPerSprayMcg} µg
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      ({amountPerSprayMg.toFixed(3)} mg / actuation)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Sprays for Target Amount ({targetDoseMcg} µg):
                    </span>
                    <span className="text-base font-mono font-extrabold text-purple-900">
                      {spraysNeededFormatted} {spraysNeededFormatted === "1" ? "Spray" : "Sprays"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      ({(Number(spraysNeededFormatted) * pumpVolumeMl).toFixed(2)} mL delivered)
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 block uppercase">Bottle Capacity</span>
                  <span className="font-bold text-slate-800">{volumeMl.toFixed(1)} mL Net</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 block uppercase">Theoretical Sprays</span>
                  <span className="font-bold text-slate-800">~{totalTheoreticalSprays} Sprays</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Droplet Plume</span>
                  <span className="font-bold text-slate-800">30–60 µm MMAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. FOUR CORE RESULT TILES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {/* Tile 1: Concentration */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 text-sky-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
              Concentration
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-extrabold text-sky-950">
                {concMgMl.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-sky-800">mg/mL</span>
            </div>
            <span className="text-[10px] font-mono text-sky-700 mt-0.5 block">
              {concMcgMl.toLocaleString()} µg/mL
            </span>
          </div>

          {/* Tile 2: Amount per Spray */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 text-purple-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
              Amount per Spray
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-extrabold text-purple-950">
                {amountPerSprayMcg}
              </span>
              <span className="text-xs font-bold text-purple-800">µg</span>
            </div>
            <span className="text-[10px] font-mono text-purple-700 mt-0.5 block">
              {amountPerSprayMg.toFixed(3)} mg @ {pumpVolumeMl.toFixed(2)} mL/spray
            </span>
          </div>

          {/* Tile 3: Sprays for Target */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Sprays for Target
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-extrabold text-amber-950">
                {spraysNeededFormatted}
              </span>
              <span className="text-xs font-bold text-amber-800">
                {spraysNeededFormatted === "1" ? "spray" : "sprays"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-800 mt-0.5 block truncate">
              For {targetDoseMcg} µg target
            </span>
          </div>

          {/* Tile 4: Total Device Sprays */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 text-teal-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
              Theoretical Total Sprays
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-extrabold text-teal-950">
                ~{totalTheoreticalSprays}
              </span>
              <span className="text-xs font-bold text-teal-800">sprays</span>
            </div>
            <span className="text-[10px] font-mono text-teal-700 mt-0.5 block truncate">
              Before priming &amp; residual
            </span>
          </div>
        </div>

        {/* ── 4. METERED SPRAY TITRATION / CALIBRATION TABLE ── */}
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
          <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Metered Nasal Atomizer Calibration Scale
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              Verified Pump: {pumpVolumeMl.toFixed(2)} mL/actuation
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-700">
                  <th className="py-2 px-3">Actuations</th>
                  <th className="py-2 px-3">Delivered Volume</th>
                  <th className="py-2 px-3">Delivered Dose (µg)</th>
                  <th className="py-2 px-3 font-sans">Administration SOP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {[1, 2, 3, 4].map((actuationCount) => {
                  const deliveredMcg = actuationCount * amountPerSprayMcg
                  const deliveredVol = (actuationCount * pumpVolumeMl).toFixed(2)
                  const isCurrentTarget =
                    Math.abs(deliveredMcg - targetDoseMcg) < amountPerSprayMcg * 0.5
                  return (
                    <tr
                      key={actuationCount}
                      className={isCurrentTarget ? "bg-purple-50/80 font-bold text-purple-950" : ""}
                    >
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span>
                            {actuationCount} {actuationCount === 1 ? "Spray" : "Sprays"}
                          </span>
                          {isCurrentTarget && (
                            <span className="text-[9px] font-sans font-bold bg-purple-800 text-white px-1.5 py-0.2 rounded">
                              Target
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 px-3">{deliveredVol} mL</td>
                      <td className="py-2 px-3 text-purple-900 font-bold">{deliveredMcg} µg</td>
                      <td className="py-2 px-3 font-sans text-slate-600">
                        {actuationCount === 1
                          ? "1 spray into 1 nostril"
                          : actuationCount === 2
                          ? "1 spray per nostril (bilateral distribution)"
                          : actuationCount === 3
                          ? "2 sprays in first nostril, 1 spray in opposite nostril"
                          : "2 sprays per nostril (spaced 60s apart to prevent drainage)"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. SCIENTIFIC RECONSTITUTION VEHICLE SAFETY ALERT ── */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ExclamationCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Nasal Mucosal Vehicle Warning (Benzyl Alcohol Contraindication)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900/90 font-sans">
            <strong>Never use standard Bacteriostatic Water (0.9% Benzyl Alcohol) for intranasal preparations.</strong>{" "}
            Benzyl alcohol causes intense burning, nasal mucosal irritation, and ciliary arrest. Reconstitute lyophilized neuropeptide vials intended for intranasal study strictly using <strong>Sterile 0.9% Sodium Chloride (Saline) USP</strong> or <strong>Sterile Deionized Water USP</strong>. Use within 14–21 days of reconstitution and store refrigerated at 2°C–8°C.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InteractiveNasalStoichiometry
