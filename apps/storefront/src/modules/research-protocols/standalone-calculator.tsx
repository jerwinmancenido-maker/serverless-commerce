"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/standalone-calculator.tsx
 * @module  StandaloneReconstitutionCalculator (Research Protocols Module)
 * @purpose Flagship universal reconstitution console with interactive SVG micro-barrel stoichiometry,
 *          delivery route mode toggling (SubQ vs Nasal vs Oral), and 88-compound catalog presets.
 * @contracts
 *   Component: StandaloneReconstitutionCalculator
 *   Consumer:  ResearchLibraryDirectory (Tab 4: calculator)
 */

import React, { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ChevronUpDown,
  MagnifyingGlass,
} from "@medusajs/icons"
import InteractiveSyringeStoichiometry, {
  type CalibrationMetricsPayload,
} from "./components/interactive-syringe-stoichiometry"
import InteractiveNasalStoichiometry from "./components/interactive-nasal-stoichiometry"
import { ALL_COMPOUND_PROTOCOLS, getCompoundProtocol } from "@lib/data/compound-protocols"

const POPULAR_INSTRUMENT_PRESETS = [
  { id: "bpc-157", label: "BPC-157 (5mg)", route: "subq", doseDisplay: "250 mcg", category: "Tissue Repair" },
  { id: "tb-500", label: "TB-500 (10mg)", route: "subq", doseDisplay: "2.5 mg", category: "Tissue Repair" },
  { id: "retatrutide", label: "Retatrutide (10mg)", route: "subq", doseDisplay: "2 mg", category: "Incretin" },
  { id: "tirzepatide", label: "Tirzepatide (10mg)", route: "subq", doseDisplay: "2.5 mg", category: "Incretin" },
  { id: "semaglutide", label: "Semaglutide (5mg)", route: "subq", doseDisplay: "0.25 mg", category: "Incretin" },
  { id: "semax", label: "Semax (10mg Nasal)", route: "nasal", doseDisplay: "200 mcg / spray", category: "Cognitive" },
  { id: "selank", label: "Selank (10mg Nasal)", route: "nasal", doseDisplay: "200 mcg / spray", category: "Cognitive" },
  { id: "ghk-cu", label: "GHK-Cu (50mg)", route: "subq", doseDisplay: "2.0 mg", category: "Cellular Matrix" },
  { id: "nad-plus", label: "NAD+ (500mg)", route: "subq", doseDisplay: "50 mg", category: "Longevity" },
  { id: "cjc-1295-no-dac", label: "CJC-1295 (5mg)", route: "subq", doseDisplay: "100 mcg", category: "GH Axis" },
]

function StandaloneCalculatorInner({
  initialPresetId,
}: {
  initialPresetId?: string
}) {
  const searchParams = useSearchParams()

  const presetFromParam = searchParams.get("preset") || searchParams.get("compound")
  const activeInitialId = presetFromParam || initialPresetId || "bpc-157"

  const [activeMetrics, setActiveMetrics] = useState<CalibrationMetricsPayload | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activeInitialId)
  const [routeMode, setRouteMode] = useState<"subq" | "nasal" | "oral">("subq")
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const allAvailableProtocols = useMemo(() => {
    return ALL_COMPOUND_PROTOCOLS.filter(
      (p) => p.category !== "Laboratory Supplies" && !p.isSupply
    )
  }, [])

  const filteredCatalogProtocols = useMemo(() => {
    if (!catalogSearch.trim()) return allAvailableProtocols
    const q = catalogSearch.toLowerCase().trim()
    return allAvailableProtocols.filter(
      (p) =>
        p.compoundName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q))
    )
  }, [allAvailableProtocols, catalogSearch])

  // Construct private hub bridge URL
  const bridgeUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (activeMetrics) {
      params.set("mass", activeMetrics.mass.toString())
      params.set("diluent", activeMetrics.diluent.toString())
      params.set("dose", activeMetrics.targetDose.toString())
      params.set("unit", activeMetrics.targetDoseUnit)
      if (selectedPresetId) {
        params.set("compound", selectedPresetId)
      }
    }
    return `/account/research-hub?${params.toString()}`
  }, [activeMetrics, selectedPresetId])

  // Resolve active protocol metadata
  const activeProtocol = useMemo(() => {
    return getCompoundProtocol(selectedPresetId)
  }, [selectedPresetId])

  // Nasal calculation parameters (if nasal mode)
  const nasalStats = useMemo(() => {
    const massMg = activeMetrics?.mass || activeProtocol?.reconstitution?.defaultVialNetMg || 10
    const diluentMl = activeMetrics?.diluent || 5.0
    const pumpVolumeMl = 0.10 // standard metered pump
    const totalSprays = Math.floor(diluentMl / pumpVolumeMl)
    const concMgMl = diluentMl > 0 ? massMg / diluentMl : 2.0
    const mcgPerSpray = Math.round(concMgMl * pumpVolumeMl * 1000)
    return {
      massMg,
      diluentMl,
      totalSprays,
      mcgPerSpray,
      concMgMl: concMgMl.toFixed(2),
    }
  }, [activeMetrics, activeProtocol])

  const handleCopyRecipe = async () => {
    if (!activeMetrics) return
    const text = [
      `🧪 RECONSTITUTION PROTOCOL RECIPE: ${activeProtocol?.compoundName || selectedPresetId.toUpperCase()}`,
      `Active Compound Mass: ${activeMetrics.mass} ${activeMetrics.massUnit}`,
      `Diluent Added: ${activeMetrics.diluent} mL (${routeMode === "nasal" ? "Sterile 0.9% Saline USP (Benzyl Alcohol Free)" : "Bacteriostatic Water USP"})`,
      `Resulting Concentration: ${activeMetrics.conc.toFixed(2)} mg/mL`,
      `Target Assay Dose: ${activeMetrics.targetDose} ${activeMetrics.targetDoseUnit}`,
      routeMode === "nasal"
        ? `Nasal Atomizer Yield: ~${nasalStats.mcgPerSpray} mcg per 0.10 mL spray (${nasalStats.totalSprays} total sprays / ${nasalStats.diluentMl} mL bottle)`
        : `U-100 Syringe Draw Mark: ${activeMetrics.units.toFixed(1)} Units (${activeMetrics.volumeMl.toFixed(3)} mL)`,
      `Single Vial Protocol Yield: ~${Math.floor(activeMetrics.totalDoses)} Standard Doses`,
      `Analytical Standard: GLP Aseptic Reconstitution / 28-Day Refrigerated Stability Window`,
      `Calculated via PepStack Universal Stoichiometry Engine`,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback("Copied to clipboard!")
      setTimeout(() => setCopyFeedback(null), 3000)
    } catch {
      setCopyFeedback("Copy failed")
      setTimeout(() => setCopyFeedback(null), 3000)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareFeedback("URL link copied!")
      setTimeout(() => setShareFeedback(null), 3000)
    } catch {
      setShareFeedback("Share link failed")
      setTimeout(() => setShareFeedback(null), 3000)
    }
  }

  const handleSelectPreset = (presetId: string, route?: string) => {
    setSelectedPresetId(presetId)
    if (route === "nasal") {
      setRouteMode("nasal")
    } else if (route === "oral") {
      setRouteMode("oral")
    } else {
      setRouteMode("subq")
    }
  }

  return (
    <div className="space-y-6">
      {/* Eyebrow & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              Flagship Stoichiometric Instrument
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              88 Analytical Protocols Calibrated
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Universal Reconstitution &amp; Micro-Plunger Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calibrated analytical stoichiometry with live graphical feedback, 88-compound catalog presets, and delivery route calibrations.
          </p>
        </div>

        {/* Quick Utilities: Copy & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyRecipe}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <span>📋</span>
            <span>{copyFeedback || "Copy Lab Recipe"}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <span>🔗</span>
            <span>{shareFeedback || "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* Delivery Route Mode Toggle Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Delivery Route &amp; Dispensing Instrument Mode:
            </span>
            <span className="text-[11px] text-slate-500">
              Select dispensing instrument to simulate micro-barrel syringe draw or metered pump volume.
            </span>
          </div>

          <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRouteMode("subq")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                routeMode === "subq"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💉 SubQ Syringe (U-100)
            </button>
            <button
              type="button"
              onClick={() => setRouteMode("nasal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                routeMode === "nasal"
                  ? "bg-purple-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👃 Intranasal Spray (0.10 mL)
            </button>
            <button
              type="button"
              onClick={() => setRouteMode("oral")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                routeMode === "oral"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💧 Oral Solution (Pipette)
            </button>
          </div>
        </div>

        {/* 88-Compound Searchable Quick-Fill Selector & Active Protocol Header */}
        <div className="mt-4 pt-3.5 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Protocol:
              </span>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
                {activeProtocol?.compoundName || selectedPresetId.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({activeProtocol?.reconstitution?.defaultVialNetMg || 10}mg default)
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                <MagnifyingGlass className="h-3.5 w-3.5 text-slate-500" />
                <span>Search All 88 Protocols...</span>
                <ChevronUpDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search by name, CAS, category..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none"
                      autoFocus
                    />
                    <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {filteredCatalogProtocols.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No compounds found matching &quot;{catalogSearch}&quot;
                      </div>
                    ) : (
                      filteredCatalogProtocols.map((proto) => {
                        const isCurrent = selectedPresetId === proto.id
                        const route = proto.primaryDeliveryRoute || "subq"
                        return (
                          <button
                            key={proto.id}
                            type="button"
                            onClick={() => {
                              handleSelectPreset(proto.id, route)
                              setIsDropdownOpen(false)
                              setCatalogSearch("")
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-sky-50 text-sky-900 font-bold border border-sky-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold block truncate">
                                {proto.compoundName}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {proto.category}
                              </span>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {proto.reconstitution?.defaultVialNetMg || 10}mg
                              </span>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                                {route}
                              </span>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Popular Presets Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">Popular:</span>
            {POPULAR_INSTRUMENT_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id, preset.route)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset.label}
                  <span className="text-[10px] font-sans font-normal opacity-80 ml-1">
                    ({preset.doseDisplay})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Route-Specific Helper Callout: Nasal Mode */}
      {routeMode === "nasal" && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 text-xs text-purple-950 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-xl">👃</span>
            <div className="space-y-1">
              <span className="font-bold text-purple-900 text-sm block">
                Metered Intranasal Atomizer Calibration Mode
              </span>
              <p className="text-[11px] leading-relaxed text-purple-900/90">
                Calibrated for a standard metered nasal pump discharging exactly <strong>0.10 mL per actuation</strong>. Reconstituting a <strong>{nasalStats.massMg} mg</strong> neuropeptide vial with <strong>{nasalStats.diluentMl} mL</strong> Sterile 0.9% Saline or USP Nasal Vehicle yields a concentration of <strong>{nasalStats.concMgMl} mg/mL</strong>, delivering approximately <strong>{nasalStats.mcgPerSpray} mcg per single spray</strong> across <strong>{nasalStats.totalSprays} total sprays</strong> per bottle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route-Specific Helper Callout: Oral Solution Mode */}
      {routeMode === "oral" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-xl">💧</span>
            <div className="space-y-1">
              <span className="font-bold text-amber-900 text-sm block">
                Oral Gastro-Resistant Solution Mode (Arg Salt / Liquid Suspension)
              </span>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                For non-injectable oral research formulations (e.g. stable Arginate BPC-157, 5-Amino-1MQ, MK-677). Administer using a calibrated 1.0 mL oral pipette. Store aqueous suspensions refrigerated at +2°C to +8°C and use within 30 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flagship Interactive Stoichiometry Console */}
      {routeMode === "nasal" ? (
        <InteractiveNasalStoichiometry
          key={selectedPresetId}
          compoundId={selectedPresetId}
          compoundName={activeProtocol?.compoundName || selectedPresetId}
          vialMg={nasalStats.massMg}
          diluentMl={nasalStats.diluentMl}
          concMgMl={parseFloat(nasalStats.concMgMl)}
          standardDoseMcg={nasalStats.mcgPerSpray}
          onCalibrationChange={(m) => {
            setActiveMetrics({
              mass: m.mass,
              massUnit: "mg",
              diluent: m.volumeMl,
              conc: m.concMgMl,
              targetDose: m.targetMcg,
              targetDoseUnit: "mcg",
              volumeMl: 0.10,
              units: 0,
              totalDoses: m.totalSprays,
            })
          }}
        />
      ) : (
        <InteractiveSyringeStoichiometry
          key={selectedPresetId}
          enableCatalogPicker={true}
          initialCompoundId={selectedPresetId}
          onCalibrationChange={setActiveMetrics}
        />
      )}

      {/* Smart Bridge: Public Visitor vs. Customer Private Hub */}
      <div className="rounded-2xl border border-sky-200/90 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">
                Customer Research Hub Integration
              </p>
            </div>
            <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">
              Save This Calculation to Your Private Vial Inventory
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every verified PepStack order grants full access to the encrypted Private Vial Hub. Log reconstitution dates, track remaining doses per vial, configure custom administration calendars, and unlock protected titration schedules.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LocalizedClientLink
              href={bridgeUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-sky-500"
            >
              Open in Private Vial Hub
              <span aria-hidden="true">→</span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50"
            >
              Browse Catalog
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Handling Guidelines */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1: Sanitize</p>
          <p className="mt-1.5 text-xs font-bold text-slate-900">Alcohol Swab Septum</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Clean rubber septums of both BAC water and peptide vials with sterile 70% isopropyl alcohol. Allow to air dry completely.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2: Wall Intro</p>
          <p className="mt-1.5 text-xs font-bold text-slate-900">Slow Stream Down Wall</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Angle needle so diluent trickles down the inner glass wall. Never spray diluent directly onto the lyophilized cake.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3: Dissolve</p>
          <p className="mt-1.5 text-xs font-bold text-slate-900">Do Not Agitate or Shake</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Allow lyophilized compound to dissolve spontaneously. Swirl gently horizontally. Never shake shear-sensitive peptide chains.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4: Refrigerated Storage</p>
          <p className="mt-1.5 text-xs font-bold text-slate-900">Store at 2°C to 8°C</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Refrigerate immediately after reconstitution. Protect from direct ultraviolet light exposure. Use within 28-day stability window.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StandaloneReconstitutionCalculator({
  initialPresetId,
}: {
  initialPresetId?: string
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Loading universal stoichiometric console...
        </div>
      }
    >
      <StandaloneCalculatorInner initialPresetId={initialPresetId} />
    </Suspense>
  )
}
