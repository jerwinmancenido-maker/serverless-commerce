"use client"

import React, { useState } from "react"
import type { ResearchProtocolStorageDetails } from "../types"

export interface PhysicochemicalStabilityTimelineProps {
  compoundName: string
  storageDetails?: ResearchProtocolStorageDetails | null
  className?: string
}

interface ThermalPhase {
  id: string
  title: string
  tempRange: string
  state: "Lyophilized Solid" | "Reconstituted Solution" | "Degradation Hazard"
  stabilityHorizon: string
  purityRetention: string
  icon: string
  statusColor: "emerald" | "blue" | "teal" | "rose"
  summary: string
  laboratoryGuidelines: string[]
}

const THERMAL_PHASES: ThermalPhase[] = [
  {
    id: "deep_freeze",
    title: "Phase 1: Deep Freeze Cryo-Archive",
    tempRange: "-20°C to -80°C (-4°F to -112°F)",
    state: "Lyophilized Solid",
    stabilityHorizon: "24 to 36 Months",
    purityRetention: "High (Annual degradation <0.8%)",
    icon: "❄️",
    statusColor: "blue",
    summary: "Long-term baseline archival storage for unopened, vacuum-sealed borosilicate glass vials.",
    laboratoryGuidelines: [
      "Store in a dedicated laboratory freezer equipped with automated temperature logging.",
      "Ensure dessicant pack remains inside secondary container to eliminate moisture ingress.",
      "Allow unopened vial to equilibrate to room temperature for 15 minutes before reconstitution to avoid condensation forming on dry cake.",
    ],
  },
  {
    id: "ambient_transit",
    title: "Phase 2: Ambient Courier Transit Window",
    tempRange: "+15°C to +25°C (59°F to 77°F)",
    state: "Lyophilized Solid",
    stabilityHorizon: "Up to 21–30 Days",
    purityRetention: "Preserved (Negligible variance vs frozen control)",
    icon: "📦",
    statusColor: "teal",
    summary: "Courier transit tolerance of dry lyophilized peptide cake prior to solvent introduction.",
    laboratoryGuidelines: [
      "Lyophilized peptide cakes are inherently stable in dry crystalline state because peptide hydrolysis requires liquid water.",
      "Stability literature confirms <0.5% degradation variance after 21 days at 25°C.",
      "Upon receipt in laboratory, immediately transfer un-reconstituted vials to -20°C freezer for long-term holding.",
    ],
  },
  {
    id: "reconstituted_cold",
    title: "Phase 3: Reconstituted Refrigerated Storage (2°C–8°C)",
    tempRange: "+2°C to +8°C (36°F to 46°F)",
    state: "Reconstituted Solution",
    stabilityHorizon: "28 to 35 Days",
    purityRetention: "Active across 28-day window",
    icon: "💧",
    statusColor: "emerald",
    summary: "Active working solution dissolved in Bacteriostatic Water USP (0.9% Benzyl Alcohol).",
    laboratoryGuidelines: [
      "Store exclusively in central refrigerator cavity where temperature is stable; NEVER store in refrigerator door shelves where opening causes thermal fluctuation.",
      "Bacteriostatic benzyl alcohol preserves aseptic sterility; do not use plain sterile water for multi-dose schedules.",
      "Inspect solution visually before each draw: solution must remain water-clear without turbidity, filaments, or particulate precipitates.",
    ],
  },
  {
    id: "thermal_prohibitions",
    title: "Phase 4: Critical Degradation Thresholds",
    tempRange: ">37°C (>98.6°F) or Liquid Freeze-Thaw",
    state: "Degradation Hazard",
    stabilityHorizon: "Immediate Degradation Hazard",
    purityRetention: "Rapid irreversible deamidation & aggregation",
    icon: "🚫",
    statusColor: "rose",
    summary: "Strict environmental prohibitions that compromise peptide tertiary folding and biological activity.",
    laboratoryGuidelines: [
      "NEVER re-freeze a reconstituted liquid peptide. Ice crystals form needle-like matrices that shear peptide bonds, causing irreversible precipitation.",
      "Protect from direct sunlight and UV radiation: aromatic residues (Tryptophan, Tyrosine) undergo rapid photo-oxidation.",
      "Avoid vigorous shaking or vortexing: mechanical shear stress can denature delicate peptide chains. Always use gentle circular swirls.",
    ],
  },
]

export default function PhysicochemicalStabilityTimeline({
  compoundName,
  storageDetails,
  className = "",
}: PhysicochemicalStabilityTimelineProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("reconstituted_cold")

  const activePhase = THERMAL_PHASES.find((p) => p.id === selectedPhaseId) || THERMAL_PHASES[2]

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2 print:pb-1.5 print:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🌡️</span>
            <h3 className="text-sm print:text-xs font-bold uppercase tracking-wider text-slate-900">
              Physicochemical Thermostability &amp; Environmental Tolerance Matrix
            </h3>
          </div>
          <p className="text-xs print:text-[9px] text-slate-500 mt-0.5">
            4-phase stability timeline, RP-HPLC degradation benchmarks, and storage SOPs for {compoundName}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase self-start sm:self-auto">
          USP &lt;659&gt; Packaging &amp; Storage
        </span>
      </div>

      {/* 4 Phase Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 print:hidden">
        {THERMAL_PHASES.map((phase) => {
          const isSelected = selectedPhaseId === phase.id
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => setSelectedPhaseId(phase.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? phase.statusColor === "rose"
                    ? "border-rose-600 bg-rose-50/70 shadow-xs ring-1 ring-rose-600"
                    : "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{phase.icon}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500">
                    {phase.state.split(" ")[0]}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono">
                  {phase.tempRange.split(" ")[0]}
                </div>
                <div className="text-[10px] text-slate-600 font-semibold line-clamp-1 mt-0.5">
                  {phase.title.split(": ")[1]}
                </div>
              </div>
              <div className="text-[9.5px] text-slate-400 mt-2 font-mono">
                {phase.stabilityHorizon}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Phase Deep Dive */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 mb-4 print:p-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-2.5 mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activePhase.icon}</span>
            <div>
              <h4 className="font-mono text-sm print:text-xs font-bold text-slate-900">
                {activePhase.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                Operating Window: {activePhase.tempRange}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-300 text-slate-800">
              State: {activePhase.state}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                activePhase.statusColor === "emerald"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : activePhase.statusColor === "blue"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : activePhase.statusColor === "teal"
                  ? "bg-teal-100 text-teal-800 border border-teal-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
              }`}
            >
              {activePhase.stabilityHorizon}
            </span>
          </div>
        </div>

        <p className="text-xs print:text-[9.5px] text-slate-700 leading-relaxed mb-3">
          {activePhase.summary}
        </p>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div className="rounded bg-white border border-slate-200 p-2 text-center">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Target Temperature</div>
            <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
              {activePhase.tempRange.split("(")[0]}
            </div>
          </div>
          <div className="rounded bg-white border border-slate-200 p-2 text-center">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Maximum Duration</div>
            <div className="text-xs font-mono font-bold text-teal-700 mt-0.5">
              {activePhase.stabilityHorizon}
            </div>
          </div>
          <div className="rounded bg-white border border-slate-200 p-2 text-center">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Integrity Profile</div>
            <div className="text-xs font-mono font-bold text-indigo-700 mt-0.5">
              {activePhase.purityRetention.split(" ")[0]}
            </div>
          </div>
        </div>

        {/* Laboratory Guidelines Bulleted Card */}
        <div className="rounded bg-white border border-slate-200 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Analytical Handling Standard Operating Procedures:
          </div>
          <ul className="space-y-1.5 text-xs print:text-[9px] text-slate-700">
            {activePhase.laboratoryGuidelines.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-600 font-bold mt-0.5">▪</span>
                <span className="leading-relaxed">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary Matrix Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs print:text-[8.5px] border border-slate-200">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <th className="py-2 px-3 print:py-1">Storage Condition</th>
              <th className="py-2 px-3 print:py-1">Temperature Boundary</th>
              <th className="py-2 px-3 print:py-1">Physical Form</th>
              <th className="py-2 px-3 print:py-1">Valid Duration</th>
              <th className="py-2 px-3 print:py-1">Degradation Mechanism</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
            {THERMAL_PHASES.map((phase) => (
              <tr key={phase.id} className={phase.id === selectedPhaseId ? "bg-teal-50/40 font-semibold" : ""}>
                <td className="py-2 px-3 print:py-1 font-bold text-slate-900">
                  <span className="mr-1.5">{phase.icon}</span>
                  {phase.title.split(": ")[1]}
                </td>
                <td className="py-2 px-3 print:py-1">{phase.tempRange.split(" ")[0]}</td>
                <td className="py-2 px-3 print:py-1">{phase.state}</td>
                <td className="py-2 px-3 print:py-1 text-teal-800 font-bold">{phase.stabilityHorizon}</td>
                <td className="py-2 px-3 print:py-1 font-sans text-slate-600">
                  {phase.id === "deep_freeze"
                    ? "Negligible (<0.8%/yr)"
                    : phase.id === "ambient_transit"
                    ? "Minimal without solvent (<0.5%)"
                    : phase.id === "reconstituted_cold"
                    ? "Gradual deamidation >28 days"
                    : "Rapid peptide cleavage & aggregation"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Light Protection and Dessication Callout */}
      {storageDetails?.light_protection !== false ? (
        <div className="mt-4 rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs print:text-[9px] text-amber-950 flex items-start gap-2.5">
          <span className="text-base mt-0.5">☀️</span>
          <div>
            <span className="font-bold text-amber-900">Photosensitivity &amp; Secondary Vial Protection: </span>
            <span>
              Store both lyophilized and reconstituted vials in dark secondary packaging or amber sleeve. Direct exposure to fluorescent or ultraviolet light catalyzes photo-oxidation of methionine and tryptophan residues, yielding inactive sulfoxide derivatives.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
