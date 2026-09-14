/**
 * @file    apps/backend/src/admin/components/editor/reconstitution-stoichiometry-card.tsx
 * @module  ReconstitutionStoichiometryCard
 * @purpose Interactive laboratory stoichiometry simulator for reconstitution parameters, dilution math, and syringe calibration.
 * @contracts
 *   Component: ReconstitutionStoichiometryCard
 *   Design:    Sovereign Admin Design System 2.0
 */

import React, { useMemo } from "react"
import { Badge, Button, Input, Label, Text, Textarea } from "@medusajs/ui"
import { Beaker, Sparkles, CheckCircle, ExclamationCircle } from "@medusajs/icons"

export interface ReconstitutionDetailsState {
  default_vial_net_mg: number | null
  default_diluent_ml: number | null
  resulting_concentration_mg_per_ml: number | null
  solvent: string | null
  dissolution_method: string | null
  handling_rule: string | null
}

interface ReconstitutionStoichiometryCardProps {
  value?: ReconstitutionDetailsState | null
  onChange: (value: ReconstitutionDetailsState) => void
  disabled?: boolean
}

const DILUENT_PRESETS = [1.0, 2.0, 2.5, 3.0, 5.0]
const SOLVENT_PRESETS = [
  "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
  "Sterile Saline 0.9% (Sodium Chloride Injection USP)",
  "Sterile Water for Injection USP",
]

export const ReconstitutionStoichiometryCard: React.FC<ReconstitutionStoichiometryCardProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const current: ReconstitutionDetailsState = {
    default_vial_net_mg: value?.default_vial_net_mg ?? null,
    default_diluent_ml: value?.default_diluent_ml ?? null,
    resulting_concentration_mg_per_ml: value?.resulting_concentration_mg_per_ml ?? null,
    solvent: value?.solvent ?? null,
    dissolution_method: value?.dissolution_method ?? null,
    handling_rule: value?.handling_rule ?? null,
  }

  const updateField = (patch: Partial<ReconstitutionDetailsState>) => {
    const updated = { ...current, ...patch }

    // Auto-calculate concentration if mass and volume are available and positive
    if (patch.default_vial_net_mg !== undefined || patch.default_diluent_ml !== undefined) {
      const mass = patch.default_vial_net_mg !== undefined ? patch.default_vial_net_mg : updated.default_vial_net_mg
      const volume = patch.default_diluent_ml !== undefined ? patch.default_diluent_ml : updated.default_diluent_ml

      if (mass && volume && volume > 0 && mass > 0) {
        const calculated = Number((mass / volume).toFixed(2))
        updated.resulting_concentration_mg_per_ml = calculated
      } else if (!mass || !volume) {
        updated.resulting_concentration_mg_per_ml = null
      }
    }

    onChange(updated)
  }

  const handleDiluentPreset = (volume: number) => {
    updateField({ default_diluent_ml: volume })
  }

  const handleSolventPreset = (solventName: string) => {
    updateField({ solvent: solventName })
  }

  // Calculated Syringe Stoichiometry
  const concentration = current.resulting_concentration_mg_per_ml || 0
  const concentrationMcgPerMl = concentration * 1000

  // U-100 insulin syringe calibrations (100 units = 1.0 mL, 1 unit = 0.01 mL)
  const mcgPerUnit = concentrationMcgPerMl > 0 ? concentrationMcgPerMl * 0.01 : 0
  const unitsFor250mcg = mcgPerUnit > 0 ? (250 / mcgPerUnit).toFixed(1) : "—"
  const unitsFor500mcg = mcgPerUnit > 0 ? (500 / mcgPerUnit).toFixed(1) : "—"
  const unitsFor1000mcg = mcgPerUnit > 0 ? (1000 / mcgPerUnit).toFixed(1) : "—"

  const concentrationStatus = useMemo(() => {
    if (!concentration) return null
    if (concentration < 0.5) {
      return {
        label: "Low Concentration (High Injection Volume)",
        color: "orange" as const,
        note: "Requires larger volumetric injections for standard microgram payloads.",
      }
    }
    if (concentration > 10.0) {
      return {
        label: "High Concentration (Precipitation Caution)",
        color: "orange" as const,
        note: "Ensure complete thermodynamic solubility at room temperature prior to refrigeration.",
      }
    }
    return {
      label: "Optimal Analytical Concentration",
      color: "green" as const,
      note: "Standard analytical titration range for U-100 precision syringe calibration.",
    }
  }, [concentration])

  return (
    <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs shadow-2xs">
            <Beaker className="size-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Reconstitution &amp; Stoichiometry Simulator
            </h4>
            <p className="text-[11px] text-slate-500">
              Vial net mass, diluent volume, real-time concentration, and U-100 syringe graduation translation.
            </p>
          </div>
        </div>

        {concentrationStatus && (
          <Badge size="small" color={concentrationStatus.color} className="text-[11px] font-mono">
            {concentrationStatus.label}
          </Badge>
        )}
      </div>

      {/* Primary Mathematical Inputs Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Vial Net Mass */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-slate-700">Vial Net Mass</Label>
            <span className="text-[11px] font-mono text-slate-400">Milligrams (mg)</span>
          </div>
          <Input
            type="number"
            min={0}
            step="0.1"
            value={current.default_vial_net_mg ?? ""}
            disabled={disabled}
            placeholder="e.g. 5, 10, 15"
            onChange={(e) =>
              updateField({
                default_vial_net_mg: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="h-8 text-xs font-mono font-semibold"
          />
        </div>

        {/* Diluent Volume with Quick Presets */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-slate-700">Diluent Volume</Label>
            <span className="text-[11px] font-mono text-slate-400">Milliliters (mL)</span>
          </div>
          <Input
            type="number"
            min={0}
            step="0.1"
            value={current.default_diluent_ml ?? ""}
            disabled={disabled}
            placeholder="e.g. 2.0"
            onChange={(e) =>
              updateField({
                default_diluent_ml: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="h-8 text-xs font-mono font-semibold"
          />
          {/* Quick Volume Selection Pills */}
          {!disabled && (
            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
              {DILUENT_PRESETS.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => handleDiluentPreset(vol)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                    current.default_diluent_ml === vol
                      ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {vol}mL
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resulting Concentration */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-slate-700">Resulting Concentration</Label>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">C = M / V</span>
          </div>
          <Input
            type="number"
            step="0.01"
            value={current.resulting_concentration_mg_per_ml ?? ""}
            disabled={disabled}
            placeholder="Auto-calculated"
            onChange={(e) =>
              updateField({
                resulting_concentration_mg_per_ml:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="h-8 text-xs font-mono font-bold bg-blue-50/40 text-blue-900 border-blue-200"
          />
          <div className="text-[11px] font-mono text-slate-500">
            {concentration > 0 ? (
              <span>
                = <strong>{concentration.toFixed(2)} mg/mL</strong> ({concentrationMcgPerMl.toLocaleString()} mcg/mL)
              </span>
            ) : (
              <span className="italic text-slate-400">Enter mass and volume to simulate</span>
            )}
          </div>
        </div>
      </div>

      {/* Syringe Calibration Translation Studio */}
      {concentration > 0 && (
        <div className="p-3.5 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                U-100 Precision Syringe Calibration (100 Units = 1.0 mL)
              </span>
            </div>
            <span className="text-[11px] font-mono text-blue-700 font-semibold">
              1 Tick (1 Unit) = {mcgPerUnit.toFixed(1)} mcg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">1 Unit (0.01 mL)</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{mcgPerUnit.toFixed(1)} mcg</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">For 250 mcg Dose</div>
              <div className="font-bold text-blue-700 font-mono mt-0.5">{unitsFor250mcg} Units</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">For 500 mcg Dose</div>
              <div className="font-bold text-blue-700 font-mono mt-0.5">{unitsFor500mcg} Units</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">For 1.0 mg Dose</div>
              <div className="font-bold text-indigo-700 font-mono mt-0.5">{unitsFor1000mcg} Units</div>
            </div>
          </div>
        </div>
      )}

      {/* Solvent Specifications with 1-Click Suggestions */}
      <div className="flex flex-col gap-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">Reconstitution Solvent</Label>
          <span className="text-[10px] font-mono text-slate-400">USP Grade Diluent</span>
        </div>
        <Input
          value={current.solvent || ""}
          disabled={disabled}
          placeholder="e.g. Bacteriostatic Water USP (0.9% Benzyl Alcohol)"
          onChange={(e) => updateField({ solvent: e.target.value || null })}
          className="h-8 text-xs font-sans"
        />
        {!disabled && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 font-mono">Quick Pick:</span>
            {SOLVENT_PRESETS.map((solv) => (
              <button
                key={solv}
                type="button"
                onClick={() => handleSolventPreset(solv)}
                className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                  current.solvent === solv
                    ? "bg-slate-900 text-white border-slate-900 font-medium"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {solv.split(" ")[0]} {solv.includes("Saline") ? "Saline" : "Water"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dissolution Technique & Handling Rule Textareas */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Dissolution Technique</Label>
          <Textarea
            rows={3}
            value={current.dissolution_method || ""}
            disabled={disabled}
            placeholder="e.g. Aim stream against glass wall. Swirl gently horizontally in circular motion. Do not agitate or vortex."
            onChange={(e) => updateField({ dissolution_method: e.target.value || null })}
            className="text-xs leading-relaxed font-sans"
          />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Handling Rule &amp; Solution Clarity</Label>
          <Textarea
            rows={3}
            value={current.handling_rule || ""}
            disabled={disabled}
            placeholder="e.g. Clear, colorless solution. Inspect visually for particulates or cloudiness prior to laboratory assay."
            onChange={(e) => updateField({ handling_rule: e.target.value || null })}
            className="text-xs leading-relaxed font-sans"
          />
        </div>
      </div>
    </div>
  )
}

export default ReconstitutionStoichiometryCard
