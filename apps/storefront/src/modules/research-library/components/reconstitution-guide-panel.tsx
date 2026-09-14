"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  InformationCircle,
  DocumentText,
  ArrowRight,
} from "@medusajs/icons"

import InteractiveSyringeStoichiometry from "@modules/research-protocols/components/interactive-syringe-stoichiometry"

interface SolventSpec {
  name: string
  composition: string
  stability: string
  idealFor: string
  cautions: string
  color: string
}

const SOLVENT_MATRIX: SolventSpec[] = [
  {
    name: "Bacteriostatic Water USP",
    composition: "Sterile non-pyrogenic water with 0.9% (9 mg/mL) Benzyl Alcohol",
    stability: "21–28 Days (Refrigerated at 2°C – 8°C)",
    idealFor: "90% of neutral & hydrophilic peptides (BPC-157, TB-500, GLP-1 agonists, CJC-1295, Ipamorelin)",
    cautions: "Do not use if recipient system is sensitive to benzyl alcohol. Discard after 28 days.",
    color: "emerald",
  },
  {
    name: "0.6% Acetic Acid Solution",
    composition: "Sterile diluted acetic acid (pH ~3.0 – 3.5)",
    stability: "14–21 Days (Refrigerated at 2°C – 8°C)",
    idealFor: "Basic or highly hydrophobic peptides that precipitate in neutral pH (Semax, Selank, Mechano Growth Factor)",
    cautions: "Never use for neutral peptides. Required to prevent cloudy precipitate and aggregate formation.",
    color: "amber",
  },
  {
    name: "Bacteriostatic 0.9% Sodium Chloride",
    composition: "Sterile 0.9% NaCl with 0.9% Benzyl Alcohol preservative",
    stability: "21–28 Days (Refrigerated at 2°C – 8°C)",
    idealFor: "High-mass compounds (e.g. GHK-Cu 50mg) where isotonic balance reduces localized injection sting",
    cautions: "Avoid with peptides prone to salt-induced precipitation (salting-out effect).",
    color: "sky",
  },
  {
    name: "Sterile Water for Injection (Preservative-Free)",
    composition: "Pure sterile USP water (Single Dose Vial)",
    stability: "<24 Hours Maximum",
    idealFor: "Immediate single-assay in vitro analytical testing where benzyl alcohol interferes with Mass Spectrometry",
    cautions: "Zero preservative. Bacterial contamination occurs within 24 hours of puncture. Never store multi-day.",
    color: "rose",
  },
]

export function ReconstitutionGuidePanel() {
  return (
    <div className="w-full space-y-10">
      {/* Critical Rule Alert */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs text-amber-900 shadow-sm">
        <InformationCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-sm font-bold text-amber-950 block">
            THE ZERO-TURBIDITY RULE (CLEAR AQUEOUS SOLUTION):
          </strong>
          <p className="leading-relaxed text-amber-800 text-xs">
            A properly reconstituted peptide solution must be 100% transparent and clear with zero visible
            cloudiness, flakes, or floaters. If a solution remains cloudy after 10 minutes of gentle rolling,
            do NOT proceed. Cloudiness indicates incorrect diluent pH, peptide denaturation, or precipitation.
          </p>
        </div>
      </div>

      {/* Section 1: Solvent Compatibility Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Solvent Selection
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Solvent &amp; Diluent Chemistry Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">GLP Aseptic Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SOLVENT_MATRIX.map((solvent) => (
            <div
              key={solvent.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{solvent.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      solvent.color === "emerald"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : solvent.color === "amber"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : solvent.color === "sky"
                        ? "bg-sky-100 text-sky-800 border border-sky-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {solvent.stability}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{solvent.composition}</p>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <strong className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                      Indicated Peptides:
                    </strong>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{solvent.idealFor}</p>
                  </div>
                  <div>
                    <strong className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                      Precautions:
                    </strong>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{solvent.cautions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Negative Vacuum Physics & Injection Technique */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Hydrodynamic Flow Physics
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Negative Vacuum Mechanics &amp; Wall-Stream Technique
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          High-grade lyophilized peptide vials are packaged under partial negative vacuum pressure. If you
          puncture the septum without controlling the syringe plunger, the vacuum will violently suck the
          diluent liquid into the vial, smashing directly onto the lyophilized powder cake and causing
          irreversible tertiary protein shearing (denaturation).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-800 font-mono">Step A: Thumb Resistance</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain firm thumb pressure on the syringe plunger as the needle enters the rubber stopper to
              resist the inward vacuum pull.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-800 font-mono">Step B: 45° Angle Wall Stream</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Angle the needle tip toward the inner glass vial wall. Allow the diluent to trickle down the
              glass rather than squirting directly onto the dry cake.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-800 font-mono">Step C: Gentle Palm Rolling</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never shake or vigorously agitate the vial. Gently roll the vial between your palms for 60–90
              seconds or let it rest until fully dissolved.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Interactive Reconstitution Stoichiometry & Volumetric Calibration Engine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Interactive Analytical Instrument
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Universal Reconstitution Stoichiometry &amp; Syringe Simulator
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-bold">C = Mass / Volume</span>
        </div>
        <InteractiveSyringeStoichiometry
          enableCatalogPicker={true}
          initialCompoundId="bpc-157"
        />
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <LocalizedClientLink
          href="/dosage-chart"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <span>Explore Master Dosage &amp; Reconstitution Matrix</span>
          <ArrowRight className="h-4 w-4" />
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/learn/beginners-guide"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-sm"
        >
          <DocumentText className="h-4 w-4" />
          <span>Beginner&apos;s Aseptic SOP</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
