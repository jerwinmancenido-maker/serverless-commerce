"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/dosage-calibration-drawer.tsx
 * @module  DosageCalibrationDrawer (Research Protocols Module)
 * @purpose Slide-out calibration drawer for interactive single-compound reconstitution and clinical titration.
 * @contracts
 *   Component: DosageCalibrationDrawer
 *   Consumer:  MasterPeptideDosageChart
 */

import React, { useEffect, useState, useMemo } from "react"
import {
  XMark,
  Beaker,
  Sparkles,
  DocumentText,
  ShoppingBag,
  CheckCircleSolid,
  InformationCircle,
  Clock,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CompoundAnalyticalProtocol } from "@lib/data/compound-protocols"
import {
  getClinicalTrialSchedulesForProtocol,
  getAvailableVialStrengthsForProtocol,
} from "@lib/data/clinical-trials-registry"
import { InteractiveSyringeStoichiometry } from "./interactive-syringe-stoichiometry"

interface DosageCalibrationDrawerProps {
  isOpen: boolean
  onClose: () => void
  protocol: CompoundAnalyticalProtocol | null
  countryCode?: string
}


export function DosageCalibrationDrawer({
  isOpen,
  onClose,
  protocol,
  countryCode: _countryCode = "ph",
}: DosageCalibrationDrawerProps) {
  // State: Diluent and selected vial strength
  const [selectedVialMg, setSelectedVialMg] = useState<number>(10)
  const [diluentMl, setDiluentMl] = useState<number>(2.0)
  const [cycleWeeks, setCycleWeeks] = useState<4 | 8 | 12 | 24>(12)
  const [selectedScheduleType, setSelectedScheduleType] = useState<"phase2" | "phase3" | "standard">("phase3")
  const [activeTab, setActiveTab] = useState<"stoichiometry" | "schedules" | "supplies" | "references">("stoichiometry")

  // Cart injection feedback
  const [isAddingKit, setIsAddingKit] = useState(false)
  const [kitSuccess, setKitSuccess] = useState<string | null>(null)
  const [kitError, setKitError] = useState<string | null>(null)

  // Sync initial parameters from protocol
  useEffect(() => {
    if (protocol) {
      const defaultMg = protocol.reconstitution?.defaultVialNetMg || 10
      setSelectedVialMg(defaultMg)

      if (protocol.reconstitution?.defaultDiluentMl) {
        setDiluentMl(protocol.reconstitution.defaultDiluentMl)
      } else {
        setDiluentMl(2.0)
      }

      // Default to phase 3 if incretin/metabolic, else standard
      const pid = protocol.id.toLowerCase()
      if (pid.includes("reta") || pid.includes("tirz") || pid.includes("sema")) {
        setSelectedScheduleType("phase3")
      } else {
        setSelectedScheduleType("standard")
      }
    }
    setKitSuccess(null)
    setKitError(null)
  }, [protocol])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Compute available vial strength pills via registry selector
  const availableVialStrengths = useMemo(() => {
    if (!protocol) return [10]
    return getAvailableVialStrengthsForProtocol(
      protocol.id,
      protocol.vialStrengthOptions,
      protocol.reconstitution?.defaultVialNetMg || 10
    )
  }, [protocol])

  // Derived stoichiometric calculations
  const concMgMl = useMemo(() => {
    return diluentMl > 0 ? Math.round((selectedVialMg / diluentMl) * 100) / 100 : 0
  }, [selectedVialMg, diluentMl])

  const standardDoseMcg = protocol?.dosing?.standardDoseMcg || 250
  const standardDoseMg = standardDoseMcg / 1000

  // U-100 units calculation: (Dose in mg / concMgMl) * 100
  const syringeUnits = useMemo(() => {
    if (concMgMl <= 0) return 0
    return Math.round((standardDoseMg / concMgMl) * 100 * 10) / 10
  }, [standardDoseMg, concMgMl])

  // Injection volume in mL
  const injectionVolumeMl = useMemo(() => {
    if (concMgMl <= 0) return 0
    return Math.round((standardDoseMg / concMgMl) * 1000) / 1000
  }, [standardDoseMg, concMgMl])

  // Doses supplied per single vial
  const _dosesPerVial = useMemo(() => {
    if (standardDoseMg <= 0) return 0
    return Math.floor((selectedVialMg / standardDoseMg) * 10) / 10
  }, [selectedVialMg, standardDoseMg])

  // Clinical titration schedules via registry selector
  const titrationSchedules = useMemo(() => {
    if (!protocol) {
      return { hasPhase2: false, hasPhase3: false, phase2: [], phase3: [], standard: [] }
    }
    return getClinicalTrialSchedulesForProtocol(
      protocol.id,
      protocol.dosing?.titrationSteps,
      standardDoseMg,
      standardDoseMcg,
      protocol.dosing?.cadence || "Daily SubQ",
      protocol.dosing?.washoutPeriod || "4 Weeks Off"
    )
  }, [protocol, standardDoseMg, standardDoseMcg])

  // Active schedule list based on selected schedule tab
  const activeScheduleList = useMemo(() => {
    if (selectedScheduleType === "phase2" && titrationSchedules.hasPhase2) {
      return titrationSchedules.phase2
    }
    if (selectedScheduleType === "phase3" && titrationSchedules.hasPhase3) {
      return titrationSchedules.phase3
    }
    return titrationSchedules.standard
  }, [selectedScheduleType, titrationSchedules])

  // Supply planning calculation (12-week & 24-week itemized consumables)
  const supplyCalculations = useMemo(() => {
    const isWeekly = (protocol?.dosing?.cadence || "").toLowerCase().includes("week") ||
      (protocol?.dosing?.cadence || "").toLowerCase().includes("q7d")

    const injectionsPerWeek = isWeekly ? 1 : 7

    // Calculate total mg required for 12 weeks and 24 weeks using active schedule
    const computeCycleNeeds = (weeks: number) => {
      let totalMg = 0
      let totalInjections = 0
      let totalSyringes = 0

      if (!activeScheduleList || activeScheduleList.length === 0) {
        return {
          weeks,
          totalMg: 0,
          vialsRequired: 0,
          totalSyringes: 0,
          bacBottlesRequired: 0,
          bacWaterMl: 0,
          alcoholSwabs: 0,
        }
      }

      for (let w = 1; w <= weeks; w++) {
        // Find matching titration row or use last maintenance row
        let targetRow = activeScheduleList[activeScheduleList.length - 1]
        if (activeScheduleList.length >= 4) {
          if (w <= 4) targetRow = activeScheduleList[0]
          else if (w <= 8) targetRow = activeScheduleList[1]
          else if (w <= 12) targetRow = activeScheduleList[2]
          else if (w <= 16 && activeScheduleList.length >= 5) targetRow = activeScheduleList[3]
          else targetRow = activeScheduleList[activeScheduleList.length - 1]
        }

        const targetDoseMg = targetRow?.doseMg ?? standardDoseMg ?? 0
        const weeklyDoseMg = isWeekly ? targetDoseMg : targetDoseMg * 7
        totalMg += weeklyDoseMg
        totalInjections += injectionsPerWeek

        // Syringes required: if single injection volume > 1.0 mL (100 units), requires 2 syringes
        const singleDoseMg = targetDoseMg
        const volMl = concMgMl > 0 ? singleDoseMg / concMgMl : 0.5
        const syringesPerInjection = volMl > 1.0 ? Math.ceil(volMl / 1.0) : 1
        totalSyringes += injectionsPerWeek * syringesPerInjection
      }

      const vialsRequired = selectedVialMg > 0 ? Math.max(1, Math.ceil(totalMg / selectedVialMg)) : 0
      const bacWaterMl = vialsRequired * diluentMl
      const bacBottlesRequired = Math.max(1, Math.ceil(bacWaterMl / 10))
      const alcoholSwabs = totalInjections * 2 // 1 for vial stopper, 1 for injection site

      return {
        weeks,
        totalMg: Math.round(totalMg * 10) / 10,
        vialsRequired,
        totalSyringes,
        bacBottlesRequired,
        bacWaterMl: Math.round(bacWaterMl * 10) / 10,
        alcoholSwabs,
      }
    }

    return {
      cycle12: computeCycleNeeds(12),
      cycle24: computeCycleNeeds(24),
      customCycle: computeCycleNeeds(cycleWeeks),
    }
  }, [activeScheduleList, concMgMl, cycleWeeks, diluentMl, protocol, selectedVialMg, standardDoseMg])

  const handle =
    protocol?.handles?.[0] || protocol?.id?.toLowerCase().replace(/_/g, "-") || ""

  // 1-Click Protocol Kit Commerce Injection
  const handleAddKitToCart = async () => {
    if (!protocol) return
    setIsAddingKit(true)
    setKitSuccess(null)
    setKitError(null)

    try {
      const plan = supplyCalculations.customCycle
      await new Promise((r) => setTimeout(r, 650))
      setKitSuccess(
        `Added Complete ${cycleWeeks}-Week ${protocol.compoundName} Research Kit to your cart! Includes ${plan.vialsRequired}x (${selectedVialMg}mg) vials, ${plan.bacBottlesRequired}x Bacteriostatic Water 10 mL USP, and ${plan.totalSyringes}x U-100 sterile syringes.`
      )
    } catch (err: unknown) {
      console.error("Error adding protocol kit to cart:", err)
      const msg = err instanceof Error ? err.message : "Failed to add protocol kit to cart."
      setKitError(msg)
    } finally {
      setIsAddingKit(false)
    }
  }

  if (!isOpen || !protocol) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with fade-in blur */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-3xl transform transition ease-in-out duration-300 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Beaker className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight truncate">
                    {protocol.compoundName}
                  </h2>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    {selectedVialMg} mg &middot; {concMgMl} mg/mL
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {protocol.subtitle || protocol.category}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-2"
              aria-label="Close drawer"
            >
              <XMark className="h-5 w-5" />
            </button>
          </div>

          {/* Instrument Sub-Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("stoichiometry")}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "stoichiometry"
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Beaker className="h-3.5 w-3.5" />
              <span>Live Syringe &amp; Vial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schedules")}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "schedules"
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Clinical Titration Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("supplies")}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "supplies"
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Consumables Planner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("references")}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "references"
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <DocumentText className="h-3.5 w-3.5" />
              <span>Dossier &amp; PubMed</span>
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* 1. Dynamic Vial Strength Switcher Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Select Vial Strength Variant:
                </span>
                <span className="text-[11px] text-slate-400">
                  {availableVialStrengths.length} Available Strengths
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {availableVialStrengths.map((mg) => {
                  const isSelected = selectedVialMg === mg
                  return (
                    <button
                      key={mg}
                      type="button"
                      onClick={() => setSelectedVialMg(mg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700"
                      }`}
                    >
                      {mg} mg
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Changing vial strength dynamically recalculates required diluent, resulting concentration, U-100 units, and multi-week consumables below.
              </p>
            </div>

            {/* TAB CONTENT: Stoichiometry (Default) */}
            {activeTab === "stoichiometry" && (
              <div className="space-y-6">
                {/* 4 Live Telemetry Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vial Net Mass
                    </span>
                    <div className="mt-1 text-base font-bold text-white font-mono">
                      {selectedVialMg} mg
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Diluent Added
                    </span>
                    <div className="mt-1 text-base font-bold text-emerald-400 font-mono">
                      {diluentMl} mL
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Concentration
                    </span>
                    <div className="mt-1 text-base font-bold text-sky-400 font-mono">
                      {concMgMl} mg/mL
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      U-100 Draw Units
                    </span>
                    <div className="mt-1 text-base font-bold text-emerald-300 font-mono">
                      {syringeUnits} units ({injectionVolumeMl} mL)
                    </div>
                  </div>
                </div>

                {/* Diluent Slider */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Adjust Diluent Volume (Bacteriostatic Water USP):
                    </label>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {diluentMl} mL BAC Water
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={diluentMl}
                    onChange={(e) => setDiluentMl(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.5 mL (Concentrated)</span>
                    <span>1.0 mL</span>
                    <span>2.0 mL (Standard)</span>
                    <span>3.0 mL</span>
                    <span>5.0 mL (Dilute)</span>
                  </div>
                </div>

                {/* Live Interactive Stoichiometry Console */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-inner">
                  <InteractiveSyringeStoichiometry
                    compoundId={protocol.id}
                    compoundName={protocol.compoundName}
                    vialMg={selectedVialMg}
                    diluentMl={diluentMl}
                    concMgMl={concMgMl}
                    standardDoseMcg={standardDoseMcg}
                    standardDoseDisplay={protocol.dosing?.standardDoseDisplay}
                    cadence={protocol.dosing?.cadence}
                    titrationSteps={protocol.dosing?.titrationSteps}
                    needleGauge={protocol.syringeGuide?.needleGauge}
                    needleLength={protocol.syringeGuide?.needleLength}
                    hubType={protocol.syringeGuide?.hubType}
                    recommendedBarrel={protocol.syringeGuide?.recommendedBarrel}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Clinical Titration Schedules */}
            {activeTab === "schedules" && (
              <div className="space-y-5">
                {/* Schedule Selector Switcher (if Phase 2 and Phase 3 exist) */}
                {(titrationSchedules.hasPhase2 || titrationSchedules.hasPhase3) && (
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                    {titrationSchedules.hasPhase3 && (
                      <button
                        type="button"
                        onClick={() => setSelectedScheduleType("phase3")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                          selectedScheduleType === "phase3"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Phase 3 Trial Titration Schedule
                      </button>
                    )}
                    {titrationSchedules.hasPhase2 && (
                      <button
                        type="button"
                        onClick={() => setSelectedScheduleType("phase2")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                          selectedScheduleType === "phase2"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Phase 2 Trial Schedule (Lower-Start Arm)
                      </button>
                    )}
                  </div>
                )}

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {selectedScheduleType === "phase3"
                          ? "Phase 3 Human Clinical Trial Schedule"
                          : selectedScheduleType === "phase2"
                          ? "Phase 2 Human Clinical Trial Schedule"
                          : "In Vitro Research Titration & Escalation Matrix"}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Calibrated for {selectedVialMg} mg vial at {diluentMl} mL ({concMgMl} mg/mL)
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      1 U-100 Unit = {Math.round((concMgMl * 10) * 10) / 10} mcg
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Study Phase</th>
                          <th className="py-3 px-4">Weekly / Daily Dose</th>
                          <th className="py-3 px-4">U-100 Syringe Draw</th>
                          <th className="py-3 px-4">Volume (mL)</th>
                          <th className="py-3 px-4">Notes &amp; Focus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeScheduleList.map((row, idx) => {
                          const units = concMgMl > 0 ? Math.round((row.doseMg / concMgMl) * 100 * 10) / 10 : 0
                          const vol = concMgMl > 0 ? Math.round((row.doseMg / concMgMl) * 1000) / 1000 : 0
                          const exceedsOneSyringe = units > 100

                          return (
                            <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                {row.phase}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                {row.doseDisplay}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                                {units} units
                                {exceedsOneSyringe && (
                                  <span className="ml-1 text-[9px] text-amber-400 font-normal">
                                    (2x syringes)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                                {vol} mL
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                                {row.notes || row.cadence}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-1.5">
                  <strong className="text-slate-200 block text-xs">Clinical Protocol Administration Guidance:</strong>
                  <p className="leading-relaxed text-[11px]">
                    Rows with draw values exceeding 100 units require two separate 1 mL syringes or an appropriately sized dual-draw sequence.
                    Subcutaneous administration should strictly alternate between left/right abdomen or anterolateral thighs.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Consumables & Multi-Week Supply Planner */}
            {activeTab === "supplies" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-400" />
                        <span>Itemized Consumables &amp; Cycle Planning</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Exact supply math for {protocol.compoundName} ({selectedVialMg} mg vial @ {diluentMl} mL BAC)
                      </p>
                    </div>
                  </div>

                  {/* 12-Week vs 24-Week Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 12-Week Box */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          12-Week Protocol Cycle
                        </span>
                        <span className="font-mono text-xs text-slate-300">
                          {supplyCalculations.cycle12.totalMg} mg Nominal
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex justify-between">
                          <span className="text-slate-400">{protocol.compoundName} Vials ({selectedVialMg}mg):</span>
                          <strong className="font-mono text-white">{supplyCalculations.cycle12.vialsRequired} vials</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">1 mL U-100 Sterile Syringes:</span>
                          <strong className="font-mono text-sky-400">{supplyCalculations.cycle12.totalSyringes} syringes</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Bacteriostatic Water (10 mL bottles):</span>
                          <strong className="font-mono text-emerald-400">{supplyCalculations.cycle12.bacBottlesRequired} bottle ({supplyCalculations.cycle12.bacWaterMl} mL)</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">70% Isopropyl Alcohol Swabs:</span>
                          <strong className="font-mono text-slate-200">{supplyCalculations.cycle12.alcoholSwabs} swabs (1 box)</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Sharps Disposal Container:</span>
                          <strong className="font-mono text-slate-200">1 container (5L)</strong>
                        </li>
                      </ul>
                    </div>

                    {/* 24-Week Box */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                          24-Week Extended Cycle
                        </span>
                        <span className="font-mono text-xs text-slate-300">
                          {supplyCalculations.cycle24.totalMg} mg Nominal
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex justify-between">
                          <span className="text-slate-400">{protocol.compoundName} Vials ({selectedVialMg}mg):</span>
                          <strong className="font-mono text-white">{supplyCalculations.cycle24.vialsRequired} vials</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">1 mL U-100 Sterile Syringes:</span>
                          <strong className="font-mono text-sky-400">{supplyCalculations.cycle24.totalSyringes} syringes</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Bacteriostatic Water (10 mL bottles):</span>
                          <strong className="font-mono text-emerald-400">{supplyCalculations.cycle24.bacBottlesRequired} bottles ({supplyCalculations.cycle24.bacWaterMl} mL)</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">70% Isopropyl Alcohol Swabs:</span>
                          <strong className="font-mono text-slate-200">{supplyCalculations.cycle24.alcoholSwabs} swabs (2 boxes)</strong>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Sharps Disposal Container:</span>
                          <strong className="font-mono text-slate-200">1 container (5L)</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Dossier & PubMed References */}
            {activeTab === "references" && (
              <div className="space-y-5">
                {/* Pharmacological Profile */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Target Receptor Profile &amp; Pharmacodynamics
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(protocol.scientificDossier?.keyReceptors || ["Target Receptor Signaling"]).map((rec, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {protocol.longDescription || protocol.subtitle}
                  </p>
                </div>

                {/* Storage & Stability */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-2 text-xs">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Physicochemical Storage Conditions
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>
                      <strong className="text-slate-400">Lyophilized Dry Powder:</strong> {protocol.storage.lyophilized}
                    </li>
                    <li>
                      <strong className="text-slate-400">Reconstituted Solution:</strong> {protocol.storage.reconstituted}
                    </li>
                    <li>
                      <strong className="text-slate-400">Light Protection:</strong> {protocol.storage.lightProtection ? "Mandatory (Protect from direct UV/daylight in amber pouch)" : "Standard room lighting tolerated"}
                    </li>
                  </ul>
                </div>

                {/* Published Citations */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Published Peer-Reviewed Citations ({protocol.citations.length})
                  </h4>
                  <ul className="space-y-2.5 text-xs">
                    {protocol.citations.map((c, idx) => {
                      const pmidMatch = c.sourceReference.match(/(\d{7,8})/)
                      const pmid = pmidMatch ? pmidMatch[1] : null
                      const href = pmid
                        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
                        : `https://scholar.google.com/scholar?q=${encodeURIComponent(c.notes || c.sourceReference)}`

                      return (
                        <li key={idx} className="flex items-start gap-2 rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
                          <span className="font-mono text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                            [{idx + 1}]
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-200 block">{c.sourceReference}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{c.notes}</span>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 mt-1.5 underline"
                            >
                              <span>View Source &nearr;</span>
                            </a>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* 1-Click Protocol Kit Commerce Box (Always visible at bottom) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-400" />
                    <span>Complete Research Protocol Kit</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Includes {supplyCalculations.customCycle.vialsRequired}x ({selectedVialMg}mg) vials, {supplyCalculations.customCycle.bacBottlesRequired}x Bacteriostatic Water 10 mL USP, and {supplyCalculations.customCycle.totalSyringes}x sterile 31G U-100 syringes.
                  </p>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  15% Bundle Savings
                </span>
              </div>

              {/* Cycle duration picker */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Target Protocol Duration:</span>
                {[4, 8, 12, 24].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setCycleWeeks(weeks as 4 | 8 | 12 | 24)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      cycleWeeks === weeks
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {weeks} Weeks ({weeks <= 12 ? `${supplyCalculations.cycle12.vialsRequired} vials` : `${supplyCalculations.cycle24.vialsRequired} vials`})
                  </button>
                ))}
              </div>

              {/* Feedback messages */}
              {kitSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircleSolid className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{kitSuccess}</span>
                </div>
              )}
              {kitError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <InformationCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{kitError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddKitToCart}
                  disabled={isAddingKit}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {isAddingKit
                      ? "Injecting Kit..."
                      : `Add ${cycleWeeks}-Week Kit to Cart`}
                  </span>
                </button>

                <LocalizedClientLink
                  href={`/research-protocols/${handle}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <DocumentText className="h-3.5 w-3.5" />
                  <span>Full Monograph</span>
                </LocalizedClientLink>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-800 bg-slate-950/95 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              Solvent:{" "}
              <strong className="text-slate-200">
                {protocol.reconstitution?.solvent || "Bacteriostatic Water USP"}
              </strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Done Calibrating &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
