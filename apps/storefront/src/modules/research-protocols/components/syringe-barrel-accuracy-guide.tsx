"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/syringe-barrel-accuracy-guide.tsx
 * @module  SyringeBarrelAccuracyGuide (Research Protocols Module)
 * @purpose Optical tick resolution, dead space, and volumetric accuracy guide across 0.3/0.5/1.0 mL syringes.
 * @contracts
 *   Component: SyringeBarrelAccuracyGuide
 *   Consumer:  FullProtocol (@modules/research-protocols/full-protocol)
 */

import React, { useState, useMemo, useEffect } from "react"

export interface SyringeBarrelAccuracyGuideProps {
  activeConcMgMl?: number
  targetDoseUnits?: number
  targetDoseDisplay?: string
  compoundName?: string
  className?: string
}

interface BarrelSpec {
  sizeMl: number
  capacityUnits: number
  tickResolutionUnits: number
  volumePerTickMicroliters: number
  deadSpaceResidualUl: number
  volumetricAccuracyPct: number
  recommendedUnitRange: string
  needleSpecs: string
  needleGauge: string
  needleLength: string
  bestFor: string
  opticalPrecision: "Highest" | "Balanced" | "Coarse"
  opticalSpacingMultiplier: number
}

const BARREL_SPECS: BarrelSpec[] = [
  {
    sizeMl: 0.3,
    capacityUnits: 30,
    tickResolutionUnits: 0.5,
    volumePerTickMicroliters: 5,
    deadSpaceResidualUl: 0.4,
    volumetricAccuracyPct: 1.5,
    recommendedUnitRange: "1 to 25 units (10–250 µL)",
    needleSpecs: "31G × 5/16\" (8mm) Integrated Ultra-Fine",
    needleGauge: "31G (0.26mm)",
    needleLength: "5/16\" (8mm)",
    bestFor: "Micro-titration, low-dose initiation, and peptide research where high volumetric resolution prevents under/over-dosing.",
    opticalPrecision: "Highest",
    opticalSpacingMultiplier: 2.0,
  },
  {
    sizeMl: 0.5,
    capacityUnits: 50,
    tickResolutionUnits: 1.0,
    volumePerTickMicroliters: 10,
    deadSpaceResidualUl: 0.8,
    volumetricAccuracyPct: 2.5,
    recommendedUnitRange: "10 to 45 units (100–450 µL)",
    needleSpecs: "30G–31G × 5/16\" (8mm) Integrated",
    needleGauge: "30G (0.31mm)",
    needleLength: "5/16\" (8mm)",
    bestFor: "Intermediate escalation schedules and daily peptide administration. The gold standard research workhorse balance.",
    opticalPrecision: "Balanced",
    opticalSpacingMultiplier: 1.2,
  },
  {
    sizeMl: 1.0,
    capacityUnits: 100,
    tickResolutionUnits: 2.0,
    volumePerTickMicroliters: 20,
    deadSpaceResidualUl: 2.1,
    volumetricAccuracyPct: 4.5,
    recommendedUnitRange: "45 to 100 units (450–1,000 µL)",
    needleSpecs: "29G–30G × 1/2\" (12.7mm) Integrated",
    needleGauge: "29G (0.33mm)",
    needleLength: "1/2\" (12.7mm)",
    bestFor: "High-dose maintenance, diluent volume transfers, and high-volume peptide flushes. Required when single-dose volume exceeds 0.50 mL.",
    opticalPrecision: "Coarse",
    opticalSpacingMultiplier: 0.7,
  },
]

export default function SyringeBarrelAccuracyGuide({
  activeConcMgMl = 5.0,
  targetDoseUnits = 25,
  targetDoseDisplay: _targetDoseDisplay,
  compoundName = "Target Compound",
  className = "",
}: SyringeBarrelAccuracyGuideProps) {
  // Interactive unit override slider
  const [currentUnits, setCurrentUnits] = useState<number>(() => {
    return Math.max(1, Math.min(100, Math.round(targetDoseUnits || 25)))
  })

  // Sync when prop changes
  useEffect(() => {
    if (targetDoseUnits && targetDoseUnits > 0) {
      setCurrentUnits(Math.max(1, Math.min(100, Math.round(targetDoseUnits))))
    }
  }, [targetDoseUnits])

  // Determine optimal recommendation based on active units
  const recommendedIndex = useMemo(() => {
    if (currentUnits <= 25) return 0
    if (currentUnits <= 45) return 1
    return 2
  }, [currentUnits])

  const [selectedBarrelIndex, setSelectedBarrelIndex] = useState<number>(recommendedIndex)

  // Auto-switch to recommended barrel if capacity is exceeded
  useEffect(() => {
    if (currentUnits > BARREL_SPECS[selectedBarrelIndex].capacityUnits) {
      setSelectedBarrelIndex(recommendedIndex)
    }
  }, [currentUnits, selectedBarrelIndex, recommendedIndex])

  const activeSpec = BARREL_SPECS[selectedBarrelIndex]

  // Derived stoichiometric metrics for currentUnits
  const derivedMetrics = useMemo(() => {
    const volumeMl = Number((currentUnits / 100).toFixed(3))
    const volumeUl = currentUnits * 10
    const conc = activeConcMgMl > 0 ? activeConcMgMl : 5.0
    const massMg = Number((volumeMl * conc).toFixed(3))
    const massMcg = Math.round(massMg * 1000)

    // Dead-space comparison: Low-Dead-Space (LDS) vs Standard Detachable Luer-Lock
    const ldsDeadSpaceUl = activeSpec.deadSpaceResidualUl // e.g. 0.4 - 2.1 uL
    const detachableDeadSpaceUl = 55.0 // typical 45 - 70 uL in Luer needle hub

    const ldsWastePct = Number(((ldsDeadSpaceUl / (volumeUl + ldsDeadSpaceUl)) * 100).toFixed(2))
    const detachableWastePct = Number(((detachableDeadSpaceUl / (volumeUl + detachableDeadSpaceUl)) * 100).toFixed(1))

    // 12-week protocol waste (assuming 84 daily doses)
    const dailyDoses12 = 84

    const ldsLoss12WeekDailyMg = Number(((dailyDoses12 * ldsDeadSpaceUl * 0.001 * conc)).toFixed(3))
    const detachableLoss12WeekDailyMg = Number(((dailyDoses12 * detachableDeadSpaceUl * 0.001 * conc)).toFixed(2))

    // Tick optical alignment
    const tickResolution = activeSpec.tickResolutionUnits
    const remainder = currentUnits % tickResolution
    const isExactTick = remainder === 0

    return {
      volumeMl,
      volumeUl,
      massMg,
      massMcg,
      ldsDeadSpaceUl,
      detachableDeadSpaceUl,
      ldsWastePct,
      detachableWastePct,
      ldsLoss12WeekDailyMg,
      detachableLoss12WeekDailyMg,
      isExactTick,
      nearestLowerTick: Math.floor(currentUnits / tickResolution) * tickResolution,
      nearestUpperTick: Math.ceil(currentUnits / tickResolution) * tickResolution,
    }
  }, [currentUnits, activeConcMgMl, activeSpec])

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs print:p-3 print:border-slate-300 print-break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-5 gap-3 print:pb-2 print:mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💉</span>
            <h3 className="text-base sm:text-lg print:text-sm font-extrabold uppercase tracking-tight text-slate-900">
              Syringe Barrel Resolution &amp; Dead-Space Calculator
            </h3>
          </div>
          <p className="text-xs print:text-[10px] text-slate-500 mt-1">
            ISO 8537 Sterile Insulin Syringe Standard · Optical Meniscus Resolution &amp; Volumetric Parallax Engineering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-mono font-bold text-teal-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {currentUnits} U-100 Units ({derivedMetrics.volumeMl} mL)
          </span>
        </div>
      </div>

      {/* Interactive Dose Scrubber Slider */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 mb-5 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label htmlFor="dose-units-slider" className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎚️</span> Interactive Plunger Calibration Scrubber:
          </label>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Mass @ {activeConcMgMl.toFixed(1)} mg/mL:</span>
            <span className="font-bold text-teal-900 bg-white border border-teal-200 px-2 py-0.5 rounded">
              {derivedMetrics.massMg >= 1.0 ? `${derivedMetrics.massMg} mg` : `${derivedMetrics.massMcg} mcg`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            id="dose-units-slider"
            type="range"
            min={1}
            max={100}
            step={0.5}
            value={currentUnits}
            onChange={(e) => setCurrentUnits(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
          />
          <div className="w-16 shrink-0">
            <input
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={currentUnits}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) setCurrentUnits(Math.max(1, Math.min(100, val)))
              }}
              className="w-full text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg py-1 px-1.5 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-0.5">
          <span>1 Unit (0.01 mL)</span>
          <span>25 Units</span>
          <span>50 Units (0.50 mL)</span>
          <span>75 Units</span>
          <span>100 Units (1.00 mL)</span>
        </div>
      </div>

      {/* Syringe Selector Tabs */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 print:hidden">
        {BARREL_SPECS.map((spec, idx) => {
          const isSelected = selectedBarrelIndex === idx
          const isRecommended = recommendedIndex === idx
          const isOverCapacity = currentUnits > spec.capacityUnits

          return (
            <button
              key={spec.sizeMl}
              type="button"
              disabled={isOverCapacity}
              onClick={() => setSelectedBarrelIndex(idx)}
              className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-left transition-all ${
                isOverCapacity
                  ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-100"
                  : isSelected
                  ? "border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-600/30 cursor-pointer"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 cursor-pointer"
              }`}
            >
              {isRecommended && !isOverCapacity ? (
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-teal-800 text-[9px] font-mono font-bold text-white shadow-xs tracking-wider">
                  ★ RECOMMENDED
                </span>
              ) : null}

              {isOverCapacity ? (
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-rose-700 text-[9px] font-mono font-bold text-white shadow-xs">
                  EXCEEDS CAPACITY
                </span>
              ) : null}

              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                {spec.sizeMl} mL ({spec.capacityUnits} Units)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {spec.tickResolutionUnits}-Unit Ticks ({spec.volumePerTickMicroliters} µL)
              </div>
              <div className="text-[10px] font-semibold text-teal-800 mt-1">
                {spec.opticalPrecision} Optical Accuracy
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Barrel Optical Meniscus Cross-Section Visualizer */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-4 mb-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
              Optical Meniscus &amp; Plunger Seal Alignment:
            </span>
            <span className="text-xs font-bold text-white">
              {activeSpec.sizeMl} mL Barrel Standard
            </span>
          </div>

          <div className="text-xs font-mono">
            {derivedMetrics.isExactTick ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Exact Tick Mark Alignment ({currentUnits} Units)
              </span>
            ) : (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                ⚠️ Interpolating Between {derivedMetrics.nearestLowerTick} &amp; {derivedMetrics.nearestUpperTick} Units
              </span>
            )}
          </div>
        </div>

        {/* SVG Simulated Micro-Barrel */}
        <div className="relative w-full h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-hidden flex items-center">
          <svg className="w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none">
            {/* Grid & Background markings */}
            <rect x="0" y="10" width="800" height="60" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />

            {/* Fluid Column fill */}
            {(() => {
              const maxUnits = activeSpec.capacityUnits
              const fillPct = Math.min(100, Math.max(0, (currentUnits / maxUnits) * 100))
              const fillWidth = (fillPct / 100) * 720
              return (
                <React.Fragment key={activeSpec.sizeMl}>
                  <rect
                    x="20"
                    y="12"
                    width={fillWidth}
                    height="56"
                    fill="url(#fluidGradient)"
                    className="transition-all duration-300"
                  />
                  {/* Plunger Rubber Head */}
                  <rect
                    x={20 + fillWidth - 10}
                    y="12"
                    width="14"
                    height="56"
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                  {/* Leading Edge Ring (Alignment Target) */}
                  <line
                    x1={20 + fillWidth}
                    y1="10"
                    x2={20 + fillWidth}
                    y2="70"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeDasharray="2,2"
                    className="transition-all duration-300"
                  />
                </React.Fragment>
              )
            })()}

            {/* Graduation Ticks */}
            {Array.from({ length: Math.floor(activeSpec.capacityUnits / activeSpec.tickResolutionUnits) + 1 }).map((_, i) => {
              const unitVal = i * activeSpec.tickResolutionUnits
              const maxUnits = activeSpec.capacityUnits
              const xPos = 20 + (unitVal / maxUnits) * 720
              const isMajor = unitVal % (activeSpec.tickResolutionUnits * 5) === 0
              const isTens = unitVal % 10 === 0

              return (
                <g key={i}>
                  <line
                    x1={xPos}
                    y1={12}
                    x2={xPos}
                    y2={isTens ? 36 : isMajor ? 28 : 20}
                    stroke={isTens ? "#f8fafc" : isMajor ? "#94a3b8" : "#475569"}
                    strokeWidth={isTens ? 2 : 1}
                  />
                  {isTens && (
                    <text
                      x={xPos}
                      y={48}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {unitVal}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Needle Shaft representation on the left */}
            <rect x="2" y="38" width="18" height="4" fill="#cbd5e1" />

            {/* Defs for gradients */}
            <defs>
              <linearGradient id="fluidGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                <stop offset="90%" stopColor="#14b8a6" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Optical Alignment Rule Note */}
        <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-teal-400 inline-block" />
            <strong>Rule:</strong> Align leading front edge of black rubber seal precisely with line of sight at eye level.
          </span>
          <span className="font-mono text-teal-300">
            Current Fill: {((currentUnits / activeSpec.capacityUnits) * 100).toFixed(1)}% of barrel
          </span>
        </div>
      </div>

      {/* 4 Quantitative Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 print:gap-1.5">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tick Increment</div>
          <div className="text-sm print:text-xs font-mono font-bold text-slate-900 mt-1">
            {activeSpec.tickResolutionUnits} Unit ({activeSpec.volumePerTickMicroliters} µL)
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Volumetric step</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Low-Dead-Space (LDS)</div>
          <div className="text-sm print:text-xs font-mono font-bold text-teal-700 mt-1">
            &lt;{activeSpec.deadSpaceResidualUl} µL ({derivedMetrics.ldsWastePct}%)
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Integrated needle waste</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Measurement Error</div>
          <div className="text-sm print:text-xs font-mono font-bold text-emerald-700 mt-1">
            ±{activeSpec.volumetricAccuracyPct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ISO 8537 tolerance</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Needle Configuration</div>
          <div className="text-sm print:text-xs font-mono font-bold text-slate-800 mt-1">
            {activeSpec.needleGauge}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{activeSpec.needleLength} length</div>
        </div>
      </div>

      {/* Dead-Space Comparative Waste Studio: LDS vs Detachable Luer Hub */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 mb-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⚖️</span>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wider">
            Critical Dead-Space Compound Preservation Analysis ({compoundName})
          </h4>
        </div>

        <p className="text-xs text-amber-900/90 leading-relaxed mb-3">
          Detachable needles leave significant fluid trapped in the plastic hub collar. In peptide protocols, this causes substantial loss of active ingredient per administration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Integrated Fixed Needle Card */}
          <div className="rounded-lg border border-emerald-300 bg-white p-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Integrated Fixed-Needle (LDS)
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                RECOMMENDED
              </span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Residual Hub Volume:</span>
                <span className="font-bold text-emerald-800">&lt; {derivedMetrics.ldsDeadSpaceUl} µL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wastage per Titration:</span>
                <span className="font-bold text-emerald-800">{derivedMetrics.ldsWastePct}% of dose</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                <span className="text-slate-500">84-Day Cumulative Loss:</span>
                <span className="font-bold text-emerald-800">{derivedMetrics.ldsLoss12WeekDailyMg} mg</span>
              </div>
            </div>
          </div>

          {/* Detachable Luer-Lock Needle Card */}
          <div className="rounded-lg border border-rose-300 bg-white p-3">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2 mb-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Standard Detachable Luer-Lock
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                SEVERE LOSS HAZARD
              </span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Residual Hub Volume:</span>
                <span className="font-bold text-rose-700">~{derivedMetrics.detachableDeadSpaceUl} µL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wastage per Titration:</span>
                <span className="font-bold text-rose-700">{derivedMetrics.detachableWastePct}% of dose</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                <span className="text-slate-500">84-Day Cumulative Loss:</span>
                <span className="font-bold text-rose-700">{derivedMetrics.detachableLoss12WeekDailyMg} mg (Multiple Vials!)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Specification Matrix Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left text-xs print:text-[8.5px] border border-slate-200">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <th className="py-2.5 px-3 print:py-1">Barrel Capacity</th>
              <th className="py-2.5 px-3 print:py-1">Graduation Interval</th>
              <th className="py-2.5 px-3 print:py-1">Volume per Tick</th>
              <th className="py-2.5 px-3 print:py-1">Hub Dead-Space</th>
              <th className="py-2.5 px-3 print:py-1">Needle Spec</th>
              <th className="py-2.5 px-3 print:py-1">Suitability for {currentUnits} Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
            {BARREL_SPECS.map((spec, idx) => {
              const isRec = recommendedIndex === idx
              const isOver = currentUnits > spec.capacityUnits
              return (
                <tr key={spec.sizeMl} className={isRec ? "bg-teal-50/50 font-semibold" : idx % 2 === 1 ? "bg-slate-50/40" : ""}>
                  <td className="py-2.5 px-3 print:py-1 font-bold text-slate-900">
                    {spec.sizeMl} mL ({spec.capacityUnits} Units)
                    {isRec ? (
                      <span className="ml-1.5 inline-block text-[9px] font-sans font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-300">
                        BEST FIT
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-3 print:py-1">{spec.tickResolutionUnits} Unit</td>
                  <td className="py-2.5 px-3 print:py-1">{spec.volumePerTickMicroliters} µL (0.0{spec.volumePerTickMicroliters >= 10 ? spec.volumePerTickMicroliters : `0${spec.volumePerTickMicroliters}`} mL)</td>
                  <td className="py-2.5 px-3 print:py-1 text-teal-700">&lt; {spec.deadSpaceResidualUl} µL</td>
                  <td className="py-2.5 px-3 print:py-1 font-sans text-slate-600">{spec.needleSpecs}</td>
                  <td className="py-2.5 px-3 print:py-1 font-sans">
                    {!isOver ? (
                      <span className="text-emerald-700 font-semibold">✓ Accommodates {currentUnits} units</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">✕ Exceeded by {currentUnits - spec.capacityUnits} units</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Critical Analytical Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800">
          <div className="font-bold flex items-center gap-1.5 text-slate-900 mb-1">
            <span>📏</span> Parallax Error Elimination SOP
          </div>
          <p className="leading-relaxed text-slate-600">
            Viewing the syringe from an angle introduces a 1.0–2.5 unit parallax error. Always raise the barrel to direct eye level against a high-contrast white background. Align the front edge of the top black plunger seal ring with the target line.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800">
          <div className="font-bold flex items-center gap-1.5 text-slate-900 mb-1">
            <span>📐</span> Analytical Dispensing Angle &amp; Vessel Depth
          </div>
          <p className="leading-relaxed text-slate-600">
            Standard 5/16&quot; (8mm) laboratory dispensing needles are calibrated for direct <strong>90° fluid transfer</strong> into target analytical matrix vials. If utilizing 1/2&quot; (12.7mm) cannulas in deep laboratory vessels, introduce at a <strong>45° angle</strong> to avoid contact with vessel sidewalls.
          </p>
        </div>
      </div>
    </div>
  )
}
