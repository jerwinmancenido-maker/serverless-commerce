/**
 * @file    apps/backend/src/admin/components/editor/dosage-schedule-matrix.tsx
 * @module  DosageScheduleMatrix
 * @purpose Structured dosage schedule matrix builder with 1-click clinical titration presets, level phases, and routine triggers.
 * @contracts
 *   Component: DosageScheduleMatrix
 *   Design:    Sovereign Admin Design System 2.0
 */

import React from "react"
import { Badge, Button, Input, Label, Select, Text, Textarea } from "@medusajs/ui"
import { Calendar, DocumentText, Plus, Sparkles, Trash, EllipsisHorizontal } from "@medusajs/icons"
import type {
  ResearchProtocolLevel,
  ResearchProtocolUnit,
} from "../../routes/compounded-products/research-protocol-types"

export type ResearchProtocolScheduleRow = ResearchProtocolLevel["rows"][number]

interface DosageScheduleMatrixProps {
  value: ResearchProtocolLevel[]
  onChange: (levels: ResearchProtocolLevel[]) => void
  disabled?: boolean
}

const UNITS: ResearchProtocolUnit[] = ["mcg", "mg", "g", "µL", "mL", "L", "IU", "piece"]

const keyFrom = (val: string, fallback: string) =>
  val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback

export const DosageScheduleMatrix: React.FC<DosageScheduleMatrixProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  // 1-Click Clinical Presets
  const applyPreset = (type: "incretin" | "acute_repair" | "longevity_pulse") => {
    if (disabled) return

    if (type === "incretin") {
      const preset: ResearchProtocolLevel[] = [
        {
          key: "level-titration",
          title: "Phase 1: Stepwise Titration & Plateau",
          summary: "Sequential 4-week dose escalation curve to maintain GLP-1/GIP receptor sensitivity while assessing GI tolerance.",
          duration: "16+ weeks",
          interval: "7 days",
          applicability: "Metabolic, glycemic, and body mass composition research protocols.",
          evidence_label: "Clinical Titration Benchmark (SURPASS/STEP Standard)",
          reference_keys: [],
          routine_enabled: true,
          rows: [
            {
              row_key: "phase-initiation",
              period: "Weeks 1–4",
              start_offset_days: 0,
              end_offset_days: 27,
              amount: "2.5",
              unit: "mg",
              recurrence_type: "weekly",
              times_per_day: 1,
              weekdays: [1],
              suggested_local_times: ["09:00"],
              frequency: "Once weekly",
              notes: "Initiation tier to assess baseline metabolic tolerability.",
              reference_keys: [],
            },
            {
              row_key: "phase-escalation-1",
              period: "Weeks 5–8",
              start_offset_days: 28,
              end_offset_days: 55,
              amount: "5.0",
              unit: "mg",
              recurrence_type: "weekly",
              times_per_day: 1,
              weekdays: [1],
              suggested_local_times: ["09:00"],
              frequency: "Once weekly",
              notes: "First active metabolic escalation step.",
              reference_keys: [],
            },
            {
              row_key: "phase-escalation-2",
              period: "Weeks 9–12",
              start_offset_days: 56,
              end_offset_days: 83,
              amount: "7.5",
              unit: "mg",
              recurrence_type: "weekly",
              times_per_day: 1,
              weekdays: [1],
              suggested_local_times: ["09:00"],
              frequency: "Once weekly",
              notes: "Intermediate glycemic and lipolytic optimization tier.",
              reference_keys: [],
            },
            {
              row_key: "phase-maintenance",
              period: "Weeks 13+",
              start_offset_days: 84,
              end_offset_days: 111,
              amount: "10.0",
              unit: "mg",
              recurrence_type: "weekly",
              times_per_day: 1,
              weekdays: [1],
              suggested_local_times: ["09:00"],
              frequency: "Once weekly",
              notes: "Target plateau maintenance dosage.",
              reference_keys: [],
            },
          ],
        },
      ]
      onChange(preset)
    } else if (type === "acute_repair") {
      const preset: ResearchProtocolLevel[] = [
        {
          key: "level-acute-healing",
          title: "Phase 1: Accelerated Angiogenic Healing",
          summary: "Intense cytoprotective and microvascular remodeling cycle via twice-daily targeted administration.",
          duration: "6 weeks",
          interval: "14-day washout",
          applicability: "Tendon, ligament, gastric, and muscular recovery models.",
          evidence_label: "Preclinical Angiogenesis & Fibroblast Model",
          reference_keys: [],
          routine_enabled: true,
          rows: [
            {
              row_key: "phase-acute-induction",
              period: "Weeks 1–2 (Acute)",
              start_offset_days: 0,
              end_offset_days: 13,
              amount: "250",
              unit: "mcg",
              recurrence_type: "daily",
              times_per_day: 2,
              weekdays: [],
              suggested_local_times: ["08:00", "20:00"],
              frequency: "Twice daily",
              notes: "Administered morning and evening adjacent to research site.",
              reference_keys: [],
            },
            {
              row_key: "phase-consolidation",
              period: "Weeks 3–6 (Consolidation)",
              start_offset_days: 14,
              end_offset_days: 41,
              amount: "500",
              unit: "mcg",
              recurrence_type: "daily",
              times_per_day: 1,
              weekdays: [],
              suggested_local_times: ["08:00"],
              frequency: "Once daily",
              notes: "Single daily dose for sustained collagen synthesis.",
              reference_keys: [],
            },
          ],
        },
        {
          key: "level-washout",
          title: "Phase 2: Post-Cycle Washout Assessment",
          summary: "Observation window to confirm structural integrity and receptor de-escalation.",
          duration: "2 weeks",
          interval: "Complete cessation",
          applicability: "Analytical recovery verification.",
          evidence_label: "Washout Benchmark",
          reference_keys: [],
          routine_enabled: false,
          rows: [],
        },
      ]
      onChange(preset)
    } else if (type === "longevity_pulse") {
      const preset: ResearchProtocolLevel[] = [
        {
          key: "level-biopulse",
          title: "Phase 1: Periodic Longevity Biopulse",
          summary: "Short-duration high-potency telomeric or mitochondrial pulse protocol.",
          duration: "10 to 20 days",
          interval: "90-day seasonal washout",
          applicability: "Cellular rejuvenation and biomolecular senescence research.",
          evidence_label: "Biogerontological Pulsing Model",
          reference_keys: [],
          routine_enabled: true,
          rows: [
            {
              row_key: "phase-pulse",
              period: "Days 1–10",
              start_offset_days: 0,
              end_offset_days: 9,
              amount: "5.0",
              unit: "mg",
              recurrence_type: "daily",
              times_per_day: 1,
              weekdays: [],
              suggested_local_times: ["09:00"],
              frequency: "Once daily",
              notes: "Morning administration before analytical activity window.",
              reference_keys: [],
            },
          ],
        },
      ]
      onChange(preset)
    }
  }

  const addLevel = () => {
    const nextIndex = value.length + 1
    const newLevel: ResearchProtocolLevel = {
      key: `level-${nextIndex}`,
      title: `Phase ${nextIndex}: Operational Level`,
      summary: null,
      duration: "4 weeks",
      interval: null,
      applicability: null,
      evidence_label: null,
      reference_keys: [],
      routine_enabled: false,
      rows: [],
    }
    onChange([...value, newLevel])
  }

  const updateLevel = (levelIndex: number, patch: Partial<ResearchProtocolLevel>) => {
    const next = [...value]
    next[levelIndex] = { ...next[levelIndex], ...patch }
    onChange(next)
  }

  const removeLevel = (levelIndex: number) => {
    onChange(value.filter((_, i) => i !== levelIndex))
  }

  const addRow = (levelIndex: number) => {
    const level = value[levelIndex]
    const rowIdx = level.rows.length + 1
    const newRow: ResearchProtocolScheduleRow = {
      row_key: `phase-${rowIdx}`,
      period: `Weeks ${rowIdx}`,
      start_offset_days: (rowIdx - 1) * 7,
      end_offset_days: rowIdx * 7 - 1,
      amount: "250",
      unit: "mcg",
      recurrence_type: "daily",
      times_per_day: 1,
      weekdays: [],
      suggested_local_times: ["08:00"],
      frequency: "Once daily",
      notes: null,
      reference_keys: [],
    }
    updateLevel(levelIndex, { rows: [...level.rows, newRow] })
  }

  const updateRow = (
    levelIndex: number,
    rowIndex: number,
    patch: Partial<ResearchProtocolScheduleRow>
  ) => {
    const level = value[levelIndex]
    const nextRows = [...level.rows]
    nextRows[rowIndex] = { ...nextRows[rowIndex], ...patch }
    updateLevel(levelIndex, { rows: nextRows })
  }

  const duplicateRow = (levelIndex: number, rowIndex: number) => {
    const level = value[levelIndex]
    const source = level.rows[rowIndex]
    const copy: ResearchProtocolScheduleRow = {
      ...source,
      row_key: `phase-${level.rows.length + 1}`,
      period: `${source.period} (Copy)`,
    }
    const nextRows = [...level.rows]
    nextRows.splice(rowIndex + 1, 0, copy)
    updateLevel(levelIndex, { rows: nextRows })
  }

  const removeRow = (levelIndex: number, rowIndex: number) => {
    const level = value[levelIndex]
    updateLevel(levelIndex, { rows: level.rows.filter((_, i) => i !== rowIndex) })
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header & Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs shadow-2xs">
            <Calendar className="size-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Dosage Schedule Matrix &amp; Titration Engine
            </h4>
            <p className="text-[11px] text-slate-500">
              Multi-phase clinical schedule, titration curve steps, and Personal Routine triggers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            disabled={disabled}
            onClick={addLevel}
            className="h-8 text-xs font-semibold"
          >
            <Plus className="size-3.5 mr-1" />
            Add Phase Level
          </Button>
        </div>
      </div>

      {/* 1-Click Clinical Titration Presets Bar */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <Sparkles className="size-3.5 text-purple-600" />
            <span>1-Click Titration Presets:</span>
          </div>
          <button
            type="button"
            onClick={() => applyPreset("incretin")}
            className="px-2 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-2xs"
          >
            Incretin Ramp (2.5mg &rarr; 10mg)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("acute_repair")}
            className="px-2 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs"
          >
            Acute Healing (250mcg &rarr; 500mcg)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("longevity_pulse")}
            className="px-2 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-2xs"
          >
            Longevity Biopulse (10-Day Cycle)
          </button>
        </div>
      )}

      {/* Level Phases List */}
      {value.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-slate-400 text-xs italic">
          No dosage phases configured. Click a 1-click preset above or &quot;Add Phase Level&quot; to begin.
        </div>
      ) : (
        <div className="space-y-4">
          {value.map((level, levelIndex) => (
            <div
              key={`${level.key}-${levelIndex}`}
              className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
            >
              {/* Level Phase Top Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge size="small" color="purple" className="font-mono text-[10px] uppercase">
                    Phase {levelIndex + 1}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900">{level.title || "Untitled Phase"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    variant={level.routine_enabled ? "primary" : "secondary"}
                    disabled={disabled}
                    onClick={() => updateLevel(levelIndex, { routine_enabled: !level.routine_enabled })}
                    className={`h-7 text-xs ${level.routine_enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                  >
                    {level.routine_enabled ? "✓ Routine Enabled" : "Enable in Customer Hub"}
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    disabled={disabled}
                    onClick={() => removeLevel(levelIndex)}
                    className="h-7 px-2 text-xs"
                    title="Remove Phase Level"
                  >
                    <Trash className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Level Parameters Form */}
              <div className="p-4 space-y-3.5">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700">Level Title</Label>
                    <Input
                      value={level.title}
                      disabled={disabled}
                      placeholder="e.g. Phase 1: Initiation & Tolerance"
                      onChange={(e) =>
                        updateLevel(levelIndex, {
                          title: e.target.value,
                          key: keyFrom(e.target.value, level.key),
                        })
                      }
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700">Duration</Label>
                    <Input
                      value={level.duration || ""}
                      disabled={disabled}
                      placeholder="e.g. 4 weeks or 30 days"
                      onChange={(e) => updateLevel(levelIndex, { duration: e.target.value || null })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700">Washout / Interval</Label>
                    <Input
                      value={level.interval || ""}
                      disabled={disabled}
                      placeholder="e.g. 7 days or 14-day washout"
                      onChange={(e) => updateLevel(levelIndex, { interval: e.target.value || null })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700">Phase Summary</Label>
                    <Textarea
                      rows={2}
                      value={level.summary || ""}
                      disabled={disabled}
                      placeholder="Summary of physiological objectives and receptor saturation for this phase..."
                      onChange={(e) => updateLevel(levelIndex, { summary: e.target.value || null })}
                      className="text-xs leading-relaxed"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700">Applicability &amp; Notes</Label>
                    <Textarea
                      rows={2}
                      value={level.applicability || ""}
                      disabled={disabled}
                      placeholder="Eligibility criteria or laboratory notes..."
                      onChange={(e) => updateLevel(levelIndex, { applicability: e.target.value || null })}
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Structured Schedule Rows Table */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-1.5">
                      <DocumentText className="size-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Schedule Steps &amp; Titration Tiers ({level.rows.length})
                      </span>
                    </div>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={disabled}
                      onClick={() => addRow(levelIndex)}
                      className="h-7 text-xs"
                    >
                      <Plus className="size-3 mr-1" />
                      Add Step Row
                    </Button>
                  </div>

                  {level.rows.length === 0 ? (
                    <div className="p-4 text-center rounded-lg bg-slate-50 text-slate-400 text-xs italic">
                      No schedule rows in this phase. Click &quot;Add Step Row&quot; above.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200/90">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold font-mono text-[11px]">
                            <th className="px-3 py-2">Period</th>
                            <th className="px-2 py-2 w-20">Days</th>
                            <th className="px-2 py-2 w-32">Amount</th>
                            <th className="px-2 py-2 w-28">Recurrence</th>
                            <th className="px-2 py-2">Frequency / Time</th>
                            <th className="px-2 py-2">Notes</th>
                            <th className="px-2 py-2 text-right w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {level.rows.map((row, rowIdx) => (
                            <tr key={`row-${rowIdx}`} className="hover:bg-slate-50/50 transition-colors">
                              {/* Period */}
                              <td className="px-3 py-2 align-top">
                                <Input
                                  value={row.period}
                                  disabled={disabled}
                                  placeholder="Weeks 1–2"
                                  onChange={(e) =>
                                    updateRow(levelIndex, rowIdx, {
                                      period: e.target.value,
                                      row_key: keyFrom(e.target.value, row.row_key || `phase-${rowIdx + 1}`),
                                    })
                                  }
                                  className="h-7 text-xs font-medium min-w-[100px]"
                                />
                              </td>

                              {/* Start/End Days */}
                              <td className="px-2 py-2 align-top">
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={row.start_offset_days ?? ""}
                                    disabled={disabled}
                                    placeholder="0"
                                    onChange={(e) =>
                                      updateRow(levelIndex, rowIdx, {
                                        start_offset_days:
                                          e.target.value === "" ? null : Number(e.target.value),
                                      })
                                    }
                                    className="h-7 text-xs font-mono w-12 text-center"
                                  />
                                  <span className="text-slate-400 font-mono">–</span>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={row.end_offset_days ?? ""}
                                    disabled={disabled}
                                    placeholder="13"
                                    onChange={(e) =>
                                      updateRow(levelIndex, rowIdx, {
                                        end_offset_days:
                                          e.target.value === "" ? null : Number(e.target.value),
                                      })
                                    }
                                    className="h-7 text-xs font-mono w-12 text-center"
                                  />
                                </div>
                              </td>

                              {/* Amount & Unit */}
                              <td className="px-2 py-2 align-top">
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={row.amount}
                                    disabled={disabled}
                                    placeholder="250"
                                    onChange={(e) =>
                                      updateRow(levelIndex, rowIdx, { amount: e.target.value })
                                    }
                                    className="h-7 text-xs font-mono font-bold w-16"
                                  />
                                  <Select
                                    value={row.unit}
                                    disabled={disabled}
                                    onValueChange={(unit) =>
                                      updateRow(levelIndex, rowIdx, { unit: unit as ResearchProtocolUnit })
                                    }
                                  >
                                    <Select.Trigger className="h-7 text-xs min-w-[65px]">
                                      <Select.Value />
                                    </Select.Trigger>
                                    <Select.Content>
                                      {UNITS.map((unit) => (
                                        <Select.Item key={unit} value={unit}>
                                          {unit}
                                        </Select.Item>
                                      ))}
                                    </Select.Content>
                                  </Select>
                                </div>
                              </td>

                              {/* Recurrence */}
                              <td className="px-2 py-2 align-top">
                                <Select
                                  value={row.recurrence_type || "daily"}
                                  disabled={disabled}
                                  onValueChange={(rec) =>
                                    updateRow(levelIndex, rowIdx, {
                                      recurrence_type: rec as any,
                                    })
                                  }
                                >
                                  <Select.Trigger className="h-7 text-xs min-w-[90px]">
                                    <Select.Value />
                                  </Select.Trigger>
                                  <Select.Content>
                                    <Select.Item value="daily">Daily</Select.Item>
                                    <Select.Item value="weekly">Weekly</Select.Item>
                                    <Select.Item value="custom">Custom</Select.Item>
                                    <Select.Item value="once">Once</Select.Item>
                                  </Select.Content>
                                </Select>
                              </td>

                              {/* Frequency & Times */}
                              <td className="px-2 py-2 align-top space-y-1">
                                <Input
                                  value={row.frequency}
                                  disabled={disabled}
                                  placeholder="Once daily"
                                  onChange={(e) =>
                                    updateRow(levelIndex, rowIdx, { frequency: e.target.value })
                                  }
                                  className="h-7 text-xs min-w-[110px]"
                                />
                                <Input
                                  value={(row.suggested_local_times || []).join(", ")}
                                  disabled={disabled}
                                  placeholder="08:00, 20:00"
                                  onChange={(e) =>
                                    updateRow(levelIndex, rowIdx, {
                                      suggested_local_times: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  className="h-6 text-[11px] font-mono placeholder:text-slate-300"
                                />
                              </td>

                              {/* Notes */}
                              <td className="px-2 py-2 align-top">
                                <Input
                                  value={row.notes || ""}
                                  disabled={disabled}
                                  placeholder="Analytical instructions..."
                                  onChange={(e) =>
                                    updateRow(levelIndex, rowIdx, { notes: e.target.value || null })
                                  }
                                  className="h-7 text-xs min-w-[140px]"
                                />
                              </td>

                              {/* Row Actions */}
                              <td className="px-2 py-2 align-top text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => duplicateRow(levelIndex, rowIdx)}
                                    disabled={disabled}
                                    title="Duplicate Row"
                                    className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                                  >
                                    <Plus className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeRow(levelIndex, rowIdx)}
                                    disabled={disabled}
                                    title="Remove Row"
                                    className="p-1 rounded text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DosageScheduleMatrix
