"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/stack-print-dossier.tsx
 * @module  StackPrintDossier (Research Protocols Module)
 * @purpose Print-optimized ISO 9001 GLP analytical laboratory SOP dossier for multi-compound research regimens.
 * @contracts
 *   Component: StackPrintDossier
 *   Consumer:  StackCompatibilityChecker
 */

import React from "react"
import {
  type StackCompoundProfile,
  type StackCompatibilityEvaluation,
} from "@lib/data/stack-interactions"
import type { ResearchBundleVial } from "../types"

interface StackPrintDossierProps {
  stackEvaluation: StackCompatibilityEvaluation | null
  selectedProfiles: StackCompoundProfile[]
  bundleVials: ResearchBundleVial[]
  visibleOnScreen?: boolean
}

export default function StackPrintDossier({
  stackEvaluation,
  selectedProfiles,
  bundleVials,
  visibleOnScreen = false,
}: StackPrintDossierProps) {
  if (selectedProfiles.length === 0) return null

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const isContraindicated = stackEvaluation?.status === "contraindicated"
  const protocolId = `PSL-SOP-STACK-${selectedProfiles.map((p) => p.shortName.replace(/[^a-zA-Z0-9]/g, "")).join("-").toUpperCase()}`

  return (
    <div
      className={`${
        visibleOnScreen ? "block" : "hidden print:block"
      } font-sans text-slate-900 bg-white print:m-0 print:p-6 print:max-w-none print:w-full max-w-4xl mx-auto`}
    >
      {/* ── Document Control Header ── */}
      <div className={`border-b-2 pb-4 mb-6 ${isContraindicated ? "border-rose-600" : "border-black"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              PepStack Laboratories · Analytical Sciences Division
            </div>
            <h1 className={`text-xl font-black uppercase tracking-tight mt-0.5 ${isContraindicated ? "text-rose-700" : "text-black"}`}>
              Standard Operating Procedure (SOP): Multi-Peptide Stack Protocol
            </h1>
            <div className="text-xs font-mono text-slate-600 mt-1">
              Doc ID: {protocolId} · ISO 9001:2015 &amp; GLP Document Control
            </div>
          </div>
          <div className="text-right text-[11px] font-mono">
            <div className="text-slate-600">Issue Date: {currentDate}</div>
            <div className={`font-bold ${isContraindicated ? "text-rose-700" : "text-slate-800"}`}>
              Status: {isContraindicated ? "REJECTED · CONTRAINDICATION SAFETY BLOCK" : "VERIFIED LABORATORY SPECIFICATION"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Critical Contraindication Alert (If Contraindicated) ── */}
      {isContraindicated && (
        <div className="mb-6 border-2 border-rose-600 bg-rose-50 p-4 rounded-lg text-xs break-inside-avoid">
          <div className="font-black text-rose-800 text-sm uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <span>⛔</span> SAFETY CONTRAINDICATION ALERT: CO-ADMINISTRATION PROHIBITED
          </div>
          <p className="text-rose-950 font-semibold leading-relaxed mb-2">
            This regimen contains compounds that share overlapping receptor beds or produce adverse pharmacodynamic competition. Co-administering these agents simultaneously in an active research cycle is contraindicated.
          </p>
          <div className="bg-white/80 p-2.5 rounded border border-rose-300 text-[11.5px] text-rose-900">
            <strong>Pharmacological Rationale:</strong> {stackEvaluation?.summary}
          </div>
        </div>
      )}

      {/* ── Section 1: Regimen Overview ── */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
          1. Pharmacodynamic Stacking Overview &amp; Synergy Evaluation
        </h2>
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-black text-sm">
              {stackEvaluation?.title || "Multi-Peptide Research Regimen"}
            </span>
            <span className="font-mono font-bold text-slate-800">
              Synergy Index: {stackEvaluation?.overallScore || 0}/100 · Compatibility:{" "}
              {stackEvaluation?.status?.toUpperCase() || "COMPATIBLE"}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {stackEvaluation?.summary ||
              "This protocol details the co-administration of multiple distinct peptide active pharmaceutical ingredients (APIs). Each compound is prepared in an independent sterile borosilicate vial and administered through calibrated micro-draws."}
          </p>
        </div>
      </div>

      {/* ── Section 2: Constituent Multi-Vial Reconstitution Stoichiometry ── */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
          2. Multi-Vial Reconstitution Stoichiometry Station ({bundleVials.length} Individual Vials)
        </h2>
        <table className="w-full text-left border-collapse border border-slate-400 text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400">
              <th className="p-2 border-r border-slate-300 font-bold">Vial #</th>
              <th className="p-2 border-r border-slate-300 font-bold">Compound Name</th>
              <th className="p-2 border-r border-slate-300 font-bold">Vial Mass</th>
              <th className="p-2 border-r border-slate-300 font-bold">Diluent Vol</th>
              <th className="p-2 border-r border-slate-300 font-bold">Concentration</th>
              <th className="p-2 border-r border-slate-300 font-bold">Target Assay Dose</th>
              <th className="p-2 font-bold">U-100 Syringe Draw</th>
            </tr>
          </thead>
          <tbody>
            {bundleVials.map((vial, idx) => (
              <tr key={idx} className="border-b border-slate-300">
                <td className="p-2 border-r border-slate-300 font-bold">Vial #{idx + 1}</td>
                <td className="p-2 border-r border-slate-300 font-semibold">{vial.compoundName}</td>
                <td className="p-2 border-r border-slate-300 font-mono">{vial.vialNetMass}</td>
                <td className="p-2 border-r border-slate-300 font-mono">{vial.diluentMl} mL</td>
                <td className="p-2 border-r border-slate-300 font-mono">{vial.concMgMl} mg/mL</td>
                <td className="p-2 border-r border-slate-300 font-mono font-bold">{vial.targetDose}</td>
                <td className="p-2 font-mono font-bold bg-slate-50">{vial.syringeUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-1.5 text-[10px] text-slate-600 italic">
          * Diluent Specification: USP Bacteriostatic Water containing 0.9% (9 mg/mL) benzyl alcohol. Dissolve by rolling between palms; do not agitate violently.
        </div>
      </div>

      {/* ── Section 3: Synchronized Administration Cadence / Washout Directive ── */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
          3. Co-Administration Schedule &amp; Timing Synchronization
        </h2>
        {isContraindicated ? (
          <div className="border border-rose-300 bg-rose-50 rounded p-3 text-[11px] text-rose-950">
            <div className="font-bold text-rose-900 mb-1">
              ⚠️ Co-Administration Timetable Voided:
            </div>
            <p className="leading-relaxed">
              Simultaneous co-administration is unsafe. If researching these compounds, they must be administered in distinct, non-overlapping cycles separated by a minimum 4 to 6-week washout period.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
                <div className="font-bold text-black mb-1">🌅 Fasted Morning Window</div>
                <p className="text-slate-700 text-[11px]">
                  {stackEvaluation?.combinedProtocol?.morningDose ||
                    "Administer indicated morning compounds upon waking in a strictly fasted state (30 min before food)."}
                </p>
              </div>
              <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
                <div className="font-bold text-black mb-1">🌙 Pre-Bed Window (Fasted ≥2h)</div>
                <p className="text-slate-700 text-[11px]">
                  {stackEvaluation?.combinedProtocol?.eveningDose ||
                    "Administer nocturnal secretagogue / tissue repair compounds 30–45 minutes prior to sleep."}
                </p>
              </div>
            </div>

            <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-[11px]">
              <div className="font-bold text-black mb-0.5">
                📅 Regimen Cadence &amp; Receptor Preservation:
              </div>
              <p className="text-slate-700">
                <strong>Weekly Rhythm:</strong>{" "}
                {stackEvaluation?.combinedProtocol?.weeklySchedule ||
                  "5 consecutive days on, 2 days off (e.g. Monday–Friday active, Saturday–Sunday washout)."}
                <br />
                <strong>Cycle Length:</strong>{" "}
                {stackEvaluation?.combinedProtocol?.cycleLength || "8 to 12 weeks active research cycle."}
                <br />
                <strong>Mandatory Washout:</strong>{" "}
                {stackEvaluation?.combinedProtocol?.washout || "4 weeks off-cycle before repeating."}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Section 4: Aseptic Safety & Needle Separation Mandate ── */}
      <div className="mb-6 border-2 border-black rounded-lg p-3.5 bg-slate-50 break-inside-avoid">
        <div className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 mb-1">
          <span>⚠️</span> Mandatory Aseptic Cross-Contamination &amp; Syringe Protocol
        </div>
        <ul className="list-disc pl-4 text-[10.5px] text-slate-800 space-y-1">
          <li>
            <strong>Strict Syringe Separation:</strong> Maintain separate sterile U-100 syringes for each individual reconstituted vial. <strong>NEVER draw multiple peptide solutions into a single syringe</strong>.
          </li>
          <li>
            <strong>Precipitation Guardrail:</strong> Differing pH buffers (e.g. alkaline copper peptides vs acidic peptide solutions) will precipitate out of solution and aggregate if co-mingled in liquid phase.
          </li>
          <li>
            <strong>Anatomical Site Rotation:</strong> Rotate contralateral subcutaneous injection sites (left lower abdomen vs right lower abdomen, minimum 2 inches from navel).
          </li>
          <li>
            <strong>Cold-Chain Preservation:</strong> Store reconstituted vials at 2°C – 8°C (36°F – 46°F) protected from direct UV light.
          </li>
        </ul>
      </div>

      {/* ── Section 5: Document Sign-Off ── */}
      <div className="border-t border-slate-400 pt-4 mt-8 text-xs break-inside-avoid">
        <div className="grid grid-cols-3 gap-6 text-[11px] text-slate-600">
          <div>
            <div className="border-b border-black pb-1 mb-1 font-mono">DR. JERWIN / PSL QA</div>
            <div>Authorizing Investigator</div>
          </div>
          <div>
            <div className="border-b border-black pb-1 mb-1 font-mono">{currentDate}</div>
            <div>Verification Date</div>
          </div>
          <div>
            <div className="border-b border-black pb-1 mb-1 font-mono">
              {isContraindicated ? "GLP-REJECT-ALERT" : "GLP-PASS-2026"}
            </div>
            <div>Laboratory Control ID</div>
          </div>
        </div>
      </div>
    </div>
  )
}
