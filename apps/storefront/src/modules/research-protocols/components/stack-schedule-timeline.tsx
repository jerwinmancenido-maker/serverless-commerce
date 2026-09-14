"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/stack-schedule-timeline.tsx
 * @module  StackScheduleTimeline (Research Protocols Module)
 * @purpose 7-day Monday–Sunday synchronized multi-vial administration timeline and cycle phase manager.
 * @contracts
 *   Component: StackScheduleTimeline
 *   Consumer:  StackCompatibilityChecker
 */

import React, { useState } from "react"
import type { ResearchBundleVial } from "../types"

interface StackScheduleTimelineProps {
  bundleVials: ResearchBundleVial[]
  compoundName?: string
  className?: string
}

interface TimeSlotSchedule {
  timeLabel: string
  period: "am" | "midday" | "pm"
  notes?: string
  doses: Array<{
    compoundName: string
    dose: string
    syringeUnits: string
    route: string
    days: number[] // 0 = Mon, 1 = Tue, ..., 6 = Sun
  }>
}

export default function StackScheduleTimeline({
  bundleVials,
  compoundName: _compoundName = "Research Stack",
  className = "",
}: StackScheduleTimelineProps) {
  const [selectedPhase, setSelectedPhase] = useState<"loading" | "maintenance" | "washout">("loading")

  const daysOfWeek = [
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
    { short: "Sat", full: "Saturday" },
    { short: "Sun", full: "Sunday" },
  ]

  // Infer schedules from compound names
  const schedulesByPhase: Record<"loading" | "maintenance" | "washout", TimeSlotSchedule[]> = React.useMemo(() => {
    const isGhAxis = bundleVials.some((v) => v.compoundName.toLowerCase().includes("cjc") || v.compoundName.toLowerCase().includes("ipam"))
    const isTissueRepair = bundleVials.some((v) => v.compoundName.toLowerCase().includes("bpc") || v.compoundName.toLowerCase().includes("tb-500"))
    const isMetabolic = bundleVials.some((v) => v.compoundName.toLowerCase().includes("tirzepatide") || v.compoundName.toLowerCase().includes("aod"))
    const _isNeuro = bundleVials.some((v) => v.compoundName.toLowerCase().includes("semax") || v.compoundName.toLowerCase().includes("selank"))

    if (isGhAxis) {
      return {
        loading: [
          {
            timeLabel: "Pre-Bed Fasted (30 min before sleep)",
            period: "pm",
            notes: "Strict empty stomach (≥2 hours after last meal) to prevent somatostatin release from carbohydrate/insulin spikes.",
            doses: [
              {
                compoundName: "CJC-1295 No DAC",
                dose: "100 mcg",
                syringeUnits: "4 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4], // 5 days on (Mon-Fri)
              },
              {
                compoundName: "Ipamorelin",
                dose: "200 mcg",
                syringeUnits: "8 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4], // 5 days on (Mon-Fri)
              },
            ],
          },
        ],
        maintenance: [
          {
            timeLabel: "Pre-Bed Fasted (30 min before sleep)",
            period: "pm",
            notes: "Maintain 5 on / 2 off pulse schedule for 8–12 weeks continuous assay.",
            doses: [
              {
                compoundName: "CJC-1295 No DAC",
                dose: "100 mcg",
                syringeUnits: "4 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4],
              },
              {
                compoundName: "Ipamorelin",
                dose: "250 mcg",
                syringeUnits: "10 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4],
              },
            ],
          },
        ],
        washout: [],
      }
    }

    if (isTissueRepair) {
      return {
        loading: [
          {
            timeLabel: "Morning Fasted (08:00 AM)",
            period: "am",
            notes: "Titrate BPC-157 daily into cell culture medium or in-vitro assay chamber.",
            doses: [
              {
                compoundName: "BPC-157",
                dose: "250 mcg",
                syringeUnits: "10 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4, 5, 6], // Daily
              },
            ],
          },
          {
            timeLabel: "Loading Mid-Day / Post-Workout (12:00 PM)",
            period: "midday",
            notes: "TB-500 loading dose: twice weekly on Mondays and Thursdays for systemic actin sequestration.",
            doses: [
              {
                compoundName: "TB-500",
                dose: "1,250 mcg",
                syringeUnits: "50 units",
                route: "Analytical Assay Aliquot",
                days: [0, 3], // Mon & Thu
              },
            ],
          },
        ],
        maintenance: [
          {
            timeLabel: "Morning Fasted (08:00 AM)",
            period: "am",
            notes: "BPC-157 maintained daily or increased to 500 mcg for dense tissue assay evaluation.",
            doses: [
              {
                compoundName: "BPC-157",
                dose: "500 mcg",
                syringeUnits: "20 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4, 5, 6],
              },
            ],
          },
          {
            timeLabel: "Maintenance Weekly (12:00 PM)",
            period: "midday",
            notes: "TB-500 stepped down to once weekly (Monday) for maintenance.",
            doses: [
              {
                compoundName: "TB-500",
                dose: "1,250 mcg",
                syringeUnits: "50 units",
                route: "Analytical Assay Aliquot",
                days: [0], // Monday only
              },
            ],
          },
        ],
        washout: [],
      }
    }

    if (isMetabolic) {
      return {
        loading: [
          {
            timeLabel: "Morning Fasted (07:30 AM)",
            period: "am",
            notes: "AOD-9604 stimulates adipocyte lipolysis in cellular matrix models.",
            doses: [
              {
                compoundName: "AOD-9604",
                dose: "300 mcg",
                syringeUnits: "12 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4, 5, 6],
              },
            ],
          },
          {
            timeLabel: "Weekly Incretin Day (Monday Morning)",
            period: "am",
            notes: "Tirzepatide long-acting GLP-1/GIP co-agonist added once weekly on consistent day.",
            doses: [
              {
                compoundName: "Tirzepatide",
                dose: "2.5 mg",
                syringeUnits: "50 units",
                route: "Analytical Assay Aliquot",
                days: [0], // Mon
              },
            ],
          },
        ],
        maintenance: [
          {
            timeLabel: "Morning Fasted (07:30 AM)",
            period: "am",
            notes: "AOD-9604 daily fasted lipolytic assay stimulation.",
            doses: [
              {
                compoundName: "AOD-9604",
                dose: "500 mcg",
                syringeUnits: "20 units",
                route: "Analytical Assay Aliquot",
                days: [0, 1, 2, 3, 4, 5, 6],
              },
            ],
          },
          {
            timeLabel: "Weekly Incretin Day (Monday Morning)",
            period: "am",
            notes: "Tirzepatide titrated up to 5.0 mg weekly for sustained receptor saturation evaluation.",
            doses: [
              {
                compoundName: "Tirzepatide",
                dose: "5.0 mg",
                syringeUnits: "100 units",
                route: "Analytical Assay Aliquot",
                days: [0],
              },
            ],
          },
        ],
        washout: [],
      }
    }

    // Default dynamic fallback for generic or other bundles
    return {
      loading: [
        {
          timeLabel: "Morning Slot (08:00 AM Fasted)",
          period: "am",
          notes: "Dispense constituent compounds according to baseline analytical titration.",
          doses: bundleVials.map((v, i) => ({
            compoundName: v.compoundName,
            dose: v.targetDose,
            syringeUnits: v.syringeUnits,
            route: "Laboratory Standard Titration",
            days: i === 0 ? [0, 1, 2, 3, 4, 5, 6] : [0, 2, 4],
          })),
        },
      ],
      maintenance: [
        {
          timeLabel: "Maintenance Slot",
          period: "am",
          notes: "Steady state protocol maintenance.",
          doses: bundleVials.map((v) => ({
            compoundName: v.compoundName,
            dose: v.targetDose,
            syringeUnits: v.syringeUnits,
            route: "Laboratory Standard Titration",
            days: [0, 2, 4],
          })),
        },
      ],
      washout: [],
    }
  }, [bundleVials])

  const activeSchedules = schedulesByPhase[selectedPhase]

  return (
    <section className={`rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-indigo-100 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">
            <span>📅</span> Dynamic 7-Day Protocol Synchronizer
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Weekly Administration Timetable &amp; Chronobiology
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Synchronize daily administration windows, circadian timing, and off-cycle receptor resensitization.
          </p>
        </div>

        {/* Phase Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedPhase("loading")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedPhase === "loading"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Phase 1: Loading (Wks 1–4)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhase("maintenance")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedPhase === "maintenance"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Phase 2: Maintenance (Wks 5–12)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPhase("washout")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedPhase === "washout"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Receptor Washout (Wks 13–16)
          </button>
        </div>
      </div>

      {/* Washout View */}
      {selectedPhase === "washout" ? (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/70 p-6 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-2xl font-bold">
            ⏸️
          </div>
          <h3 className="text-base font-bold text-amber-950">
            Receptor Washout &amp; Pituitary Rest Window (Weeks 13–16)
          </h3>
          <p className="text-xs text-amber-900 max-w-xl mx-auto leading-relaxed">
            During the 4-week washout period, all active peptide dosing is ceased (<strong>0 mcg/day</strong>).
            This clears accumulated cellular tolerances, restores endogenous pituitary receptor sensitivity (GHRH-R &amp; GHSR-1a), and resets homeostatic baseline before beginning a subsequent research cohort.
          </p>
          <div className="pt-2">
            <span className="inline-block text-[11px] font-mono font-bold text-amber-800 bg-white border border-amber-300 px-3 py-1 rounded-full">
              Recommended Washout Duration: 28 to 30 Days
            </span>
          </div>
        </div>
      ) : (
        /* 7-Day Timetable Matrix */
        <div className="mt-6 space-y-6">
          {activeSchedules.map((slot, sIdx) => (
            <div
              key={sIdx}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4 shadow-2xs"
            >
              {/* Slot Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs">
                    {slot.period === "am" ? "🌅" : slot.period === "midday" ? "☀️" : "🌙"}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">
                    {slot.timeLabel}
                  </h3>
                </div>
                {slot.notes && (
                  <span className="text-[11px] text-slate-500 italic max-w-md sm:text-right">
                    {slot.notes}
                  </span>
                )}
              </div>

              {/* Weekly Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {daysOfWeek.map((day, dIdx) => {
                  const activeDosesForDay = slot.doses.filter((d) => d.days.includes(dIdx))
                  const hasDose = activeDosesForDay.length > 0

                  return (
                    <div
                      key={day.short}
                      className={`rounded-xl border p-2 flex flex-col justify-between min-h-[110px] transition-all ${
                        hasDose
                          ? "bg-white border-indigo-300 shadow-2xs"
                          : "bg-slate-100/70 border-slate-200/80 opacity-60"
                      }`}
                    >
                      <div className="border-b border-slate-100 pb-1 mb-1">
                        <span className="text-[11px] font-black uppercase text-slate-700 block">
                          {day.short}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
                        {hasDose ? (
                          activeDosesForDay.map((d, doseIdx) => (
                            <div
                              key={doseIdx}
                              className="rounded-md bg-indigo-50 border border-indigo-200/90 p-1 text-left"
                            >
                              <div className="text-[10px] font-bold text-indigo-950 truncate">
                                {d.compoundName.split("(")[0].trim()}
                              </div>
                              <div className="text-[9px] font-mono text-indigo-700 font-bold">
                                {d.dose}
                              </div>
                              <div className="text-[8px] font-mono text-slate-500">
                                {d.syringeUnits}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium my-auto">
                            Off Day
                          </span>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 mt-auto">
                        <span className={`text-[8px] font-bold uppercase ${hasDose ? "text-emerald-700" : "text-slate-400"}`}>
                          {hasDose ? "Dosing Day" : "Rest"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Constituent Administration Guide Footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Analytical Guidance:</span>
                  <span>Rotate analytical sampling vessels systematically across sequential experimental runs.</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Cadence: {selectedPhase === "loading" ? "Phase 1 Saturation" : "Phase 2 Steady State"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
