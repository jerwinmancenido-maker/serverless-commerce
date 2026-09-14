"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/multi-vial-stoichiometry-studio.tsx
 * @module  MultiVialStoichiometryStudio (Research Protocol Tools)
 * @purpose Dual-channel multi-vial reconstitution stoichiometry, calibrated syringe fill, and supply planning.
 * @contracts
 *   Service: ResearchProtocolModuleService
 */

import React, { useState, useMemo } from "react"
import type { ResearchBundleVial } from "../types"
import InteractiveSyringeStoichiometry from "./interactive-syringe-stoichiometry"
import { getCompoundProtocol } from "@lib/data/compound-protocols"

interface MultiVialStoichiometryStudioProps {
  bundleVials: ResearchBundleVial[]
  compoundName?: string
  className?: string
}

function parseMassMg(massStr: string): number {
  const match = massStr.match(/([\d.]+)\s*(mg|g|mcg)/i)
  if (!match) return 5
  const val = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  if (unit === "g") return val * 1000
  if (unit === "mcg") return val / 1000
  return val
}

function parseDoseMcg(doseStr: string): number {
  const mcgMatch = doseStr.match(/([\d.]+)\s*mcg/i)
  if (mcgMatch) return parseFloat(mcgMatch[1])
  const mgMatch = doseStr.match(/([\d.]+)\s*mg/i)
  if (mgMatch) return parseFloat(mgMatch[1]) * 1000
  return 250
}

// Colors per vial
const VIAL_THEMES = [
  {
    name: "Sapphire Cyan",
    badgeBg: "bg-cyan-50 border-cyan-200 text-cyan-800",
    accentBorder: "border-cyan-500",
    pillActive: "bg-cyan-600 text-white border-cyan-600",
    fillColor: "#00B9E6",
    lightFill: "#E0F7FC",
    ringColor: "ring-cyan-500",
  },
  {
    name: "Royal Violet",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
    accentBorder: "border-purple-500",
    pillActive: "bg-purple-600 text-white border-purple-600",
    fillColor: "#8B5CF6",
    lightFill: "#F3E8FF",
    ringColor: "ring-purple-500",
  },
  {
    name: "Emerald Matrix",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    accentBorder: "border-emerald-500",
    pillActive: "bg-emerald-600 text-white border-emerald-600",
    fillColor: "#10B981",
    lightFill: "#ECFDF5",
    ringColor: "ring-emerald-500",
  },
]

export default function MultiVialStoichiometryStudio({
  bundleVials,
  compoundName: _compoundName,
  className = "",
}: MultiVialStoichiometryStudioProps) {
  const [activeVialIndex, setActiveVialIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"tabs" | "side_by_side">("tabs")
  const [_barrelCapacity, _setBarrelCapacity] = useState<30 | 50 | 100>(100)
  const [_cycleWeeks, _setCycleWeeks] = useState<8 | 12 | 16>(12)

  // Per-vial custom mass override state
  const [_customMasses, _setCustomMasses] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {}
    bundleVials.forEach((vial, idx) => {
      initial[idx] = parseMassMg(vial.vialNetMass)
    })
    return initial
  })

  // Per-vial custom diluent override state (diluentMl)
  const [diluents, _setDiluents] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {}
    bundleVials.forEach((vial, idx) => {
      initial[idx] = vial.diluentMl || 2.0
    })
    return initial
  })

  // Per-vial custom dose override state (doseMcg)
  const [customDoses, _setCustomDoses] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {}
    bundleVials.forEach((vial, idx) => {
      initial[idx] = parseDoseMcg(vial.targetDose)
    })
    return initial
  })

  const calculatedVials = useMemo(() => {
    return bundleVials.map((vial, idx) => {
      const netMg = parseMassMg(vial.vialNetMass)
      const currentDiluent = diluents[idx] || vial.diluentMl || 2.0
      const currentDoseMcg = customDoses[idx] || parseDoseMcg(vial.targetDose)
      const concMgMl = Number((netMg / currentDiluent).toFixed(2))
      const volumeMl = Number(((currentDoseMcg / 1000) / concMgMl).toFixed(4))
      const syringeUnits = Number((volumeMl * 100).toFixed(1))
      const totalDoses = Math.floor((netMg * 1000) / currentDoseMcg)
      const theme = VIAL_THEMES[idx % VIAL_THEMES.length]
      const protocol = getCompoundProtocol(vial.compoundName)
      const isKnown = protocol && protocol.id !== "generic-peptide"

      return {
        ...vial,
        index: idx,
        netMg,
        currentDiluent,
        currentDoseMcg,
        concMgMl,
        volumeMl,
        syringeUnits,
        totalDoses,
        theme,
        protocol,
        isKnown,
      }
    })
  }, [bundleVials, diluents, customDoses])

  const activeVial = calculatedVials[activeVialIndex] || calculatedVials[0]

  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-white ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-1 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            Dual-Channel Multi-Vial Syringe Calibration
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Dual-Channel Reconstitution &amp; Stoichiometry Station
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Independent volumetric stoichiometry, fluid graduation, and U-100 syringe barrel calibration for each constituent physical vial.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("tabs")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "tabs"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tabbed Channel
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side_by_side")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "side_by_side"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Side-by-Side Channels
          </button>
        </div>
      </div>

      {/* Vial Channel Selector Navigation (in Tabs mode) */}
      {viewMode === "tabs" && calculatedVials.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-5 pb-3">
          {calculatedVials.map((v, i) => {
            const isSelected = activeVialIndex === i
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveVialIndex(i)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-sky-950/80 border-sky-400 text-white shadow-lg shadow-sky-950/50 ring-2 ring-sky-400/30"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-mono font-black ${
                    isSelected ? "bg-sky-400 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-semibold text-sm">{v.compoundName}</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/10 text-sky-300">
                  {v.vialNetMass}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Flagship Syringe Stoichiometry Renderers */}
      <div className={`mt-6 ${viewMode === "side_by_side" ? "grid grid-cols-1 xl:grid-cols-2 gap-8" : ""}`}>
        {(viewMode === "side_by_side" ? calculatedVials : [activeVial]).map((vial) => {
          const proto = vial.protocol
          return (
            <div key={`calibrated-vial-${vial.index}-${vial.compoundName}`} className="space-y-4">
              {viewMode === "side_by_side" && (
                <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[11px] font-black">
                      {vial.index + 1}
                    </span>
                    <span className="font-bold text-white uppercase tracking-wider">
                      Channel #{vial.index + 1}: {vial.compoundName}
                    </span>
                  </div>
                  <span className="text-sky-400 font-bold">{vial.vialNetMass} Vial</span>
                </div>
              )}

              <InteractiveSyringeStoichiometry
                key={`interactive-syringe-${vial.index}-${vial.compoundName}`}
                compoundId={vial.isKnown ? proto?.id : vial.compoundName.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                compoundName={vial.compoundName}
                subtitle={`Constituent Channel #${vial.index + 1} of ${calculatedVials.length} (${vial.compoundName})`}
                vialMg={vial.netMg}
                diluentMl={vial.currentDiluent}
                concMgMl={vial.concMgMl}
                standardDoseMcg={vial.currentDoseMcg}
                standardDoseDisplay={vial.targetDose}
                cadence={vial.cadence}
                graduations={vial.isKnown ? proto?.syringeGuide?.graduations : undefined}
                titrationSteps={vial.isKnown ? proto?.dosing?.titrationSteps : undefined}
                vialStrengthOptions={vial.isKnown ? proto?.vialStrengthOptions : undefined}
                reconstitutionOptions={vial.isKnown ? proto?.reconstitutionOptions : undefined}
                needleGauge={vial.isKnown ? proto?.syringeGuide?.needleGauge : undefined}
                needleLength={vial.isKnown ? proto?.syringeGuide?.needleLength : undefined}
                hubType={vial.isKnown ? proto?.syringeGuide?.hubType : undefined}
                recommendedBarrel={vial.isKnown ? proto?.syringeGuide?.recommendedBarrel : undefined}
                transferNeedle={vial.isKnown ? proto?.syringeGuide?.transferNeedle : undefined}
                syringeType={vial.isKnown ? proto?.syringeGuide?.syringeType : undefined}
                standardIUDisplay={vial.isKnown ? proto?.syringeGuide?.standardIUDisplay : undefined}
                hideHardwareSpec={false}
                hideTitrationTable={false}
                className="border-slate-800/80 bg-slate-900/60 shadow-xl"
              />

              {/* Reconstitution Instructions Footnote */}
              {vial.reconstitutionInstructions && (
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 text-xs text-slate-300">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                    <span>🧪</span> Aseptic Reconstitution Directive ({vial.compoundName}):
                  </span>
                  <p className="leading-relaxed text-slate-400 font-mono text-[11px]">
                    {vial.reconstitutionInstructions}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Aseptic Protocol & Cross-Contamination Guardrail */}
      <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide mb-2">
          <span>⚠️</span> Non-Negotiable Aseptic Stacking Rules
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-950">
          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 shadow-2xs">
            <span className="font-bold text-amber-900 block mb-1">
              1. Zero Cross-Vial Needle Reuse
            </span>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Never re-insert a needle into Vial B after drawing from Vial A. Doing so introduces cross-compound enzymes and permanently ruins lot purity.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 shadow-2xs">
            <span className="font-bold text-amber-900 block mb-1">
              2. Independent Sterile Syringes
            </span>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Always use separate U-100 insulin syringes for each constituent compound. Ensure both syringes are labeled before administration.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 shadow-2xs">
            <span className="font-bold text-amber-900 block mb-1">
              3. Isolated Assay Channels
            </span>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Dispense constituent peptides into isolated in-vitro assay channels or separate analytical vessels to prevent unquantified cross-reactivity prior to scheduled observation.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
