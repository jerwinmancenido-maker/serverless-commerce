"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/research-supply-cycle-planner.tsx
 * @module  ResearchSupplyCyclePlanner (Research Protocols Module)
 * @purpose Clinically-grounded multi-week research supply forecasting planner and itemized consumables BOM.
 * @contracts
 *   Component: ResearchSupplyCyclePlanner
 *   Consumer:  FullProtocol (@modules/research-protocols/full-protocol)
 *   Registry:  getClinicalTrialSchedulesForProtocol (@lib/data/clinical-trials-registry)
 */

import React, { useState, useMemo } from "react"
import {
  ArrowDownTray,
  Beaker,
  DocumentText,
  InformationCircle,
} from "@medusajs/icons"
import {
  getClinicalTrialSchedulesForProtocol,
  getAvailableVialStrengthsForProtocol,
  type ClinicalTitrationRow,
} from "@lib/data/clinical-trials-registry"
import {
  getCompoundProtocol,
  type CompoundAnalyticalProtocol,
} from "@lib/data/compound-protocols"

export interface ResearchSupplyCyclePlannerProps {
  compoundName: string
  protocolHandle?: string
  isIncretin?: boolean
  vialStrengthOptions?: Array<{
    vialMg: number
    diluentMl: number
    concMgMl: number
    badge?: string
  }>
  protocolLevels?: unknown[]
  activeVialMg?: number
  activeConcMgMl?: number
  className?: string
}

interface WeekScheduleItem {
  week: number
  phaseName: string
  doseMg: number
  doseUnits: number
  cumulativeMg: number
  vialIndex: number
  remainingInVialMg: number
  injectionsThisWeek: number
}

export default function ResearchSupplyCyclePlanner({
  compoundName,
  protocolHandle = "",
  isIncretin = false,
  vialStrengthOptions = [],
  protocolLevels: _protocolLevels = [],
  activeVialMg = 10,
  activeConcMgMl = 5.0,
  className = "",
}: ResearchSupplyCyclePlannerProps) {
  // Cycle Duration: 4, 8, 12, 16, or 24 Weeks
  const [cycleWeeks, setCycleWeeks] = useState<4 | 8 | 12 | 16 | 24>(12)

  // Resolve authentic protocol metadata if handle is provided
  const protocol = useMemo<CompoundAnalyticalProtocol | null>(() => {
    if (protocolHandle) {
      return getCompoundProtocol(protocolHandle)
    }
    return null
  }, [protocolHandle])

  // Resolve clinical titration matrix from registry
  const clinicalSchedules = useMemo(() => {
    const handleOrName = protocolHandle || compoundName
    const doseMcg = protocol?.dosing?.standardDoseMcg || 250
    const doseMg = doseMcg / 1000
    return getClinicalTrialSchedulesForProtocol(
      handleOrName,
      protocol?.dosing?.titrationSteps as Parameters<typeof getClinicalTrialSchedulesForProtocol>[1],
      doseMg,
      doseMcg,
      protocol?.dosing?.cadence || "Daily SubQ",
      protocol?.dosing?.washoutPeriod || "4 Weeks Off"
    )
  }, [protocolHandle, compoundName, protocol])

  // Titration ladder selector (Phase 3 primary vs Phase 2 lower-start vs Standard)
  const [scheduleType, setScheduleType] = useState<"phase3" | "phase2" | "standard">(() => {
    if (clinicalSchedules.hasPhase3) return "phase3"
    if (clinicalSchedules.hasPhase2) return "phase2"
    return "standard"
  })

  // Selected schedule rows
  const activeTitrationRows = useMemo<ClinicalTitrationRow[]>(() => {
    if (scheduleType === "phase3" && clinicalSchedules.hasPhase3) {
      return clinicalSchedules.phase3
    }
    if (scheduleType === "phase2" && clinicalSchedules.hasPhase2) {
      return clinicalSchedules.phase2
    }
    return clinicalSchedules.standard
  }, [scheduleType, clinicalSchedules])

  // Available vial choices
  const availableVials = useMemo(() => {
    if (vialStrengthOptions && vialStrengthOptions.length > 0) {
      const seen = new Set<string>()
      return vialStrengthOptions.filter((v) => {
        const key = `${v.vialMg}-${v.diluentMl}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
    const dynamicStrengths = getAvailableVialStrengthsForProtocol(
      protocolHandle || compoundName,
      undefined,
      activeVialMg
    )
    return dynamicStrengths.map((vialMg) => {
      const diluentMl = vialMg <= 10 ? 2.0 : vialMg <= 30 ? 3.0 : 5.0
      const concMgMl = Number((vialMg / diluentMl).toFixed(2))
      return {
        vialMg,
        diluentMl,
        concMgMl,
        badge: `${vialMg}mg Lab Standard`,
      }
    })
  }, [vialStrengthOptions, protocolHandle, compoundName, activeVialMg])

  const [selectedVialMg, setSelectedVialMg] = useState<number>(() => {
    const found = availableVials.find((v) => v.vialMg === activeVialMg)
    return found ? found.vialMg : availableVials[0]?.vialMg || 10
  })

  const currentVialConfig = useMemo(() => {
    return availableVials.find((v) => v.vialMg === selectedVialMg) || availableVials[0]
  }, [availableVials, selectedVialMg])

  // Calculate concentration
  const effectiveConcMgMl = useMemo(() => {
    if (currentVialConfig && currentVialConfig.concMgMl > 0) {
      return currentVialConfig.concMgMl
    }
    if (activeConcMgMl > 0) return activeConcMgMl
    return currentVialConfig.vialMg / currentVialConfig.diluentMl
  }, [currentVialConfig, activeConcMgMl])

  // Generate week-by-week schedule based on clinical registry and duration
  const weeklySchedule = useMemo<WeekScheduleItem[]>(() => {
    const list: WeekScheduleItem[] = []
    const conc = effectiveConcMgMl > 0 ? effectiveConcMgMl : 5.0
    const vialSize = currentVialConfig.vialMg || 10

    let currentVialIdx = 1
    let remainingInVial = vialSize
    let runningTotalMg = 0

    for (let w = 1; w <= cycleWeeks; w++) {
      let targetRow: ClinicalTitrationRow | undefined

      // Match phase range from clinical trial rows (e.g. "Weeks 1 to 4")
      targetRow = activeTitrationRows.find((r) => {
        const match = r.phase.match(/weeks?\s*(\d+)\s*[-–to]+\s*(\d+)/i)
        if (match) {
          const start = parseInt(match[1], 10)
          const end = parseInt(match[2], 10)
          return w >= start && w <= end
        }
        return false
      })

      if (!targetRow && activeTitrationRows.length > 0) {
        targetRow = activeTitrationRows[activeTitrationRows.length - 1]
      }

      const cadenceLower = (targetRow?.cadence || protocol?.dosing?.cadence || "").toLowerCase()
      const isWeekly =
        cadenceLower.includes("week") ||
        cadenceLower.includes("q7d") ||
        cadenceLower.includes("7 days") ||
        isIncretin

      const injectionsThisWeek = isWeekly
        ? 1
        : cadenceLower.includes("daily") || cadenceLower.includes("q24h")
        ? 7
        : cadenceLower.includes("2x") || cadenceLower.includes("twice")
        ? 2
        : 7

      const doseMg = targetRow?.doseMg || 1.0
      const weeklyMassMg = isWeekly ? doseMg : doseMg * injectionsThisWeek
      const phaseName = targetRow?.phase || `Week ${w} Research`

      runningTotalMg += weeklyMassMg

      // Deduct from current vial, roll over if insufficient
      if (remainingInVial < weeklyMassMg) {
        currentVialIdx += 1
        remainingInVial = vialSize - weeklyMassMg
      } else {
        remainingInVial -= weeklyMassMg
      }

      const singleDoseUnits = Number(((doseMg / conc) * 100).toFixed(1))

      list.push({
        week: w,
        phaseName,
        doseMg,
        doseUnits: singleDoseUnits,
        cumulativeMg: Number(runningTotalMg.toFixed(2)),
        vialIndex: currentVialIdx,
        remainingInVialMg: Number(Math.max(0, remainingInVial).toFixed(2)),
        injectionsThisWeek,
      })
    }

    return list
  }, [cycleWeeks, activeTitrationRows, effectiveConcMgMl, currentVialConfig, protocol, isIncretin])

  // Summary Metrics
  const totalActiveMgNeeded = useMemo(() => {
    return weeklySchedule[weeklySchedule.length - 1]?.cumulativeMg || 0
  }, [weeklySchedule])

  const totalInjectionsPlanned = useMemo(() => {
    return weeklySchedule.reduce((acc, row) => acc + row.injectionsThisWeek, 0)
  }, [weeklySchedule])

  // 8% pipetting & needle dead-space safety margin
  const nominalVialsCount = useMemo(() => {
    const withBuffer = totalActiveMgNeeded * 1.08
    return Math.max(1, Math.ceil(withBuffer / currentVialConfig.vialMg))
  }, [totalActiveMgNeeded, currentVialConfig.vialMg])

  // Bacteriostatic water volume required
  const totalDiluentMlNeeded = useMemo(() => {
    return Number((nominalVialsCount * currentVialConfig.diluentMl).toFixed(1))
  }, [nominalVialsCount, currentVialConfig.diluentMl])

  // Number of 10 mL or 30 mL BAC water bottles needed
  const bacWaterBottlesCount = useMemo(() => {
    if (totalDiluentMlNeeded <= 10) return "1 × 10 mL Bottle"
    if (totalDiluentMlNeeded <= 20) return "2 × 10 mL Bottles"
    if (totalDiluentMlNeeded <= 30) return "1 × 30 mL Multi-Dose Bottle"
    return `${Math.ceil(totalDiluentMlNeeded / 30)} × 30 mL Bottles`
  }, [totalDiluentMlNeeded])

  // Consumables counts: total planned injections + reconstitution needles + calibration buffer
  const totalSyringesNeeded = useMemo(() => {
    return totalInjectionsPlanned + nominalVialsCount + 4
  }, [totalInjectionsPlanned, nominalVialsCount])

  const totalAlcoholSwabsNeeded = useMemo(() => {
    return totalInjectionsPlanned * 2 + nominalVialsCount * 2 + 8
  }, [totalInjectionsPlanned, nominalVialsCount])

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      "Week",
      "Research Phase",
      "Target Dose (mg)",
      "U-100 Syringe Draw (Units)",
      "Liquid Volume (mL)",
      "Injections This Week",
      "Active Vial Index",
      "Cumulative Active Mass (mg)",
      "Remaining in Vial (mg)",
    ]

    const rows = weeklySchedule.map((item) => [
      item.week,
      `"${item.phaseName.replace(/"/g, '""')}"`,
      item.doseMg.toFixed(2),
      item.doseUnits,
      (item.doseUnits / 100).toFixed(3),
      item.injectionsThisWeek,
      `Vial #${item.vialIndex}`,
      item.cumulativeMg.toFixed(2),
      item.remainingInVialMg.toFixed(2),
    ])

    const summarySection = [
      "",
      `"--- CLINICAL RESEARCH SUPPLY FORECAST SUMMARY ---"`,
      `"Target Compound","${compoundName}"`,
      `"Protocol Cycle Horizon","${cycleWeeks} Weeks"`,
      `"Lyophilized Vial Configuration","${currentVialConfig.vialMg} mg (${currentVialConfig.diluentMl} mL BAC / ${currentVialConfig.concMgMl} mg/mL)"`,
      `"Total Active Mass Required (Nominal)","${totalActiveMgNeeded.toFixed(2)} mg"`,
      `"Lyophilized Vials Required (8% buffer)","${nominalVialsCount} vials"`,
      `"Bacteriostatic Water Total Diluent","${totalDiluentMlNeeded} mL (${bacWaterBottlesCount})"`,
      `"Sterile U-100 Syringes","${totalSyringesNeeded} units"`,
      `"70% Isopropyl Alcohol Prep Pads","${totalAlcoholSwabsNeeded} pads"`,
      `"Aseptic Standard","GLP Clean-Bench Reconstitution Standards"`,
    ].join("\n")

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(",")), summarySection].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const cleanHandle = protocolHandle || compoundName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    link.setAttribute("download", `pepstack-supply-forecast-${cleanHandle}-${cycleWeeks}w.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-3 print:pb-2 print:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Beaker className="h-4 w-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900">
              {cycleWeeks}-Week Clinical Research Supply &amp; Protocol Forecast
            </h3>
          </div>
          <p className="text-xs print:text-[9px] text-slate-500 mt-1">
            Stoichiometric supply planning, sequential reconstitution cadence, and itemized consumables BOM for{" "}
            <span className="font-bold text-slate-700">{compoundName}</span>.
          </p>
        </div>

        {/* Action Tools: Cycle Selector, CSV Export & Print */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs">
            {([4, 8, 12, 16, 24] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setCycleWeeks(w)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  cycleWeeks === w
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {w}W
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowDownTray className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
          >
            <DocumentText className="h-3.5 w-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Titration Track & Vial Size Selectors (Screen-Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 print:hidden">
        {/* Titration Track (for Incretins / Multi-Schedule Compounds) */}
        {(clinicalSchedules.hasPhase3 || clinicalSchedules.hasPhase2) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Clinical Trial Escalation Arm:
            </label>
            <div className="flex gap-2">
              {clinicalSchedules.hasPhase3 && (
                <button
                  type="button"
                  onClick={() => setScheduleType("phase3")}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    scheduleType === "phase3"
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Phase 3 Trial Ladder (Full Target)
                </button>
              )}
              {clinicalSchedules.hasPhase2 && (
                <button
                  type="button"
                  onClick={() => setScheduleType("phase2")}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    scheduleType === "phase2"
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Phase 2 Lower-Start Arm
                </button>
              )}
            </div>
          </div>
        )}

        {/* Vial Size Selector */}
        <div
          className={`rounded-xl border border-slate-200 bg-slate-50 p-3.5 ${
            !clinicalSchedules.hasPhase3 && !clinicalSchedules.hasPhase2 ? "md:col-span-2" : ""
          }`}
        >
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Planned Lyophilized Vial Mass:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableVials.map((v, idx) => {
              const isSelected = selectedVialMg === v.vialMg
              return (
                <button
                  key={`vial-${v.vialMg}-${v.diluentMl}-${idx}`}
                  type="button"
                  onClick={() => setSelectedVialMg(v.vialMg)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {v.vialMg} mg ({v.diluentMl} mL BAC / {v.concMgMl} mg/mL)
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5 Laboratory Supply Output Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5 print:gap-1.5">
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 text-center">
          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Active Compound</div>
          <div className="text-lg print:text-xs font-mono font-extrabold text-teal-950 mt-1">
            {totalActiveMgNeeded.toFixed(2)} mg
          </div>
          <div className="text-[10px] text-teal-700 mt-0.5">Across {cycleWeeks} weeks ({totalInjectionsPlanned} doses)</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-center">
          <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Vials Required</div>
          <div className="text-lg print:text-xs font-mono font-extrabold text-indigo-950 mt-1">
            {nominalVialsCount} × {currentVialConfig.vialMg}mg
          </div>
          <div className="text-[10px] text-indigo-700 mt-0.5">Includes 8% dead-space buffer</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-center">
          <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Bacteriostatic Water</div>
          <div className="text-lg print:text-xs font-mono font-extrabold text-blue-950 mt-1">
            {bacWaterBottlesCount}
          </div>
          <div className="text-[10px] text-blue-700 mt-0.5">{totalDiluentMlNeeded.toFixed(1)} mL total diluent</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-center">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Sterile Syringes</div>
          <div className="text-lg print:text-xs font-mono font-extrabold text-amber-950 mt-1">
            {totalSyringesNeeded} Units
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">U-100 LDS with fixed needle</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Alcohol Prep Pads</div>
          <div className="text-lg print:text-xs font-mono font-extrabold text-slate-900 mt-1">
            {totalAlcoholSwabsNeeded} Pads
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">70% Isopropyl Aseptic</div>
        </div>
      </div>

      {/* Strict Sequential Reconstitution SOP Warning */}
      <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-950 print:p-2 print:text-[9.5px]">
        <div className="font-bold flex items-center gap-1.5 text-rose-900 mb-1">
          <InformationCircle className="h-4 w-4 shrink-0 text-rose-700" />
          <span>CRITICAL SOP: Sequential Reconstitution Protocol (GLP 28-Day Stability Window)</span>
        </div>
        <p className="leading-relaxed text-rose-900/90 text-[11px]">
          Do <strong>NOT</strong> reconstitute all {nominalVialsCount} vials simultaneously. Reconstitute <strong>one vial at a time</strong> as the active protocol requires. Once reconstituted with Bacteriostatic Water USP, a vial maintains stability for <strong>28 days at +2°C to +8°C</strong>. Remaining unopened vials should be preserved in solid lyophilized cake form at <strong>-20°C</strong> to prevent hydrolysis and oxidation.
        </p>
      </div>

      {/* Week-by-Week Titration & Inventory Cadence Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs print:text-[8.5px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 print:py-1">Week</th>
              <th className="py-2.5 px-3 print:py-1">Study / Assay Phase</th>
              <th className="py-2.5 px-3 print:py-1">Weekly Target Dose</th>
              <th className="py-2.5 px-3 print:py-1">Syringe Draw (U-100)</th>
              <th className="py-2.5 px-3 print:py-1">Active Vial #</th>
              <th className="py-2.5 px-3 print:py-1">Cumulative Active Mass</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
            {weeklySchedule.map((item) => {
              const isPhaseBoundary = item.week % 4 === 1
              return (
                <tr
                  key={item.week}
                  className={`${
                    isPhaseBoundary ? "border-t-2 border-slate-300 bg-slate-50/40" : ""
                  } hover:bg-slate-50/70 transition-colors`}
                >
                  <td className="py-2 px-3 print:py-1 font-bold text-slate-900">Week {item.week}</td>
                  <td className="py-2 px-3 print:py-1 font-sans text-slate-700 font-medium">
                    {item.phaseName}
                  </td>
                  <td className="py-2 px-3 print:py-1 font-bold text-teal-800">
                    {item.doseMg >= 1 ? `${item.doseMg.toFixed(1)} mg` : `${Math.round(item.doseMg * 1000)} mcg`}
                    {item.injectionsThisWeek > 1 && (
                      <span className="text-[10px] font-normal text-slate-500 ml-1">
                        ({item.injectionsThisWeek}x/wk)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 print:py-1">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-bold border border-slate-300">
                      {item.doseUnits} Units
                    </span>
                    <span className="ml-1 text-[10px] text-slate-500 font-sans">
                      ({(item.doseUnits / 100).toFixed(2)} mL)
                    </span>
                  </td>
                  <td className="py-2 px-3 print:py-1 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Vial #{item.vialIndex}
                    </span>
                    <span className="ml-1 text-[10px] text-slate-500 font-mono">
                      ({item.remainingInVialMg}mg rem)
                    </span>
                  </td>
                  <td className="py-2 px-3 print:py-1 text-slate-900 font-bold">
                    {item.cumulativeMg.toFixed(1)} mg / {totalActiveMgNeeded.toFixed(1)} mg
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Biohazard Sharps Protocol Footer */}
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs print:text-[9px] text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">☣️</span>
          <span>
            <strong className="text-slate-900">Biohazard Disposal Requirement: </strong>
            Dispose of all used U-100 insulin syringes, transfer drawing needles, and empty glass vials in an OSHA-compliant puncture-resistant sharps container ({cycleWeeks <= 12 ? "1-Quart" : "2-Quart"}).
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
          OSHA 1910.1030
        </span>
      </div>
    </div>
  )
}
