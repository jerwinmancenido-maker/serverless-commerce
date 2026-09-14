"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Beaker,
  CheckCircleSolid,
  ExclamationCircle,
  Sparkles,
  ArrowRightMini,
  Clock,
} from "@medusajs/icons"
import InteractiveSyringeStoichiometry from "@modules/research-protocols/components/interactive-syringe-stoichiometry"

interface EquipmentItem {
  name: string
  spec: string
  role: string
  icon: string
}

const REQUIRED_EQUIPMENT: EquipmentItem[] = [
  {
    name: "Lyophilized Peptide Vial",
    spec: "5 mg, 10 mg, or 15 mg net mass",
    role: "Vacuum-sealed lyophilized polypeptide cake requiring reconstitution.",
    icon: "🧪",
  },
  {
    name: "Bacteriostatic Water USP",
    spec: "10 mL / 0.9% Benzyl Alcohol",
    role: "Sterile non-pyrogenic solvent that maintains antimicrobial sterility for 21–28 days.",
    icon: "💧",
  },
  {
    name: "Mixing Draw Syringe",
    spec: "2 mL – 3 mL with 20G–22G needle",
    role: "Dedicated reconstitution syringe used exclusively to draw diluent and inject into vial.",
    icon: "💉",
  },
  {
    name: "U-100 Micro-Syringes",
    spec: "31G Ultra-Fine, 0.3mL / 0.5mL / 1.0mL",
    role: "Fixed Low Dead Space (LDS) insulin syringes for high-precision microgram dosing.",
    icon: "📏",
  },
  {
    name: "70% Isopropyl Alcohol Pads",
    spec: "Sterile 2-ply medical wipes",
    role: "Disinfection of rubber septums and benchtop surfaces to eliminate airborne microbes.",
    icon: "🧼",
  },
  {
    name: "Puncture-Proof Sharps Bin",
    spec: "OSHA / Biohazard approved container",
    role: "Safe, immediate disposal of all spent reconstitution and administration needles.",
    icon: "🗑️",
  },
]

interface DeepSopStep {
  step: number
  phaseName: string
  title: string
  objective: string
  duration: string
  standard: string
  instructions: string[]
  proTip: string
  caution: string
}

const DEEP_SOP_STEPS: DeepSopStep[] = [
  {
    step: 1,
    phaseName: "Phase 1: Aseptic Preparation",
    title: "Sterile Workstation Setup & Septum Disinfection",
    objective: "Establish an uncontaminated micro-environment and disinfect vial entry points.",
    duration: "2 Minutes",
    standard: "GLP Aseptic Reconstitution Standard",
    instructions: [
      "Wipe down your laboratory surface with 70% Isopropyl Alcohol (IPA) and allow it to air-dry completely.",
      "Wash hands thoroughly with antibacterial soap, then don non-sterile nitrile laboratory gloves.",
      "Pop the protective plastic flip-off caps from both the peptide vial and the Bacteriostatic Water vial.",
      "Vigorously wipe the exposed synthetic rubber septums of both vials using fresh, sterile 70% alcohol pads.",
      "Allow the rubber stoppers to air-dry for exactly 30 seconds. Never blow on or fan the stoppers.",
    ],
    proTip: "Allowing alcohol to fully evaporate is critical: evaporation is the chemical action that lyses microbial cell walls.",
    caution: "Never touch the rubber septum with fingers or gloves after swabbing. If contact occurs, re-swab and wait 30 seconds.",
  },
  {
    step: 2,
    phaseName: "Phase 2: Stoichiometric Diluent Transfer",
    title: "Diluent Draw & Internal Pressure Equalization",
    objective: "Accurately measure diluent volume while preventing negative pressure recoil.",
    duration: "3 Minutes",
    standard: "GLP Analytical Assay Prep",
    instructions: [
      "Select a sterile 2mL or 3mL mixing syringe fitted with a 21G–22G draw needle.",
      "Draw ambient air into the syringe matching your intended diluent volume (e.g., 2.0 mL of air for 2.0 mL of BAC water).",
      "Puncture the Bacteriostatic Water septum at a 90° angle, inject the air to pressurize the vial, then invert the vial.",
      "Slowly retract the syringe plunger to withdraw the exact target volume of diluent (e.g., 2.0 mL).",
      "Tap the syringe barrel to dislodge micro-bubbles, expelling any trapped air back into the diluent vial.",
    ],
    proTip: "Equalizing pressure by pre-injecting air prevents the syringe plunger from fighting vacuum resistance during the draw.",
    caution: "Inspect diluent for optical clarity before drawing. If BAC water is expired (>28 days open) or cloudy, discard immediately.",
  },
  {
    step: 3,
    phaseName: "Phase 3: The 45° Glass Wall Injection",
    title: "Controlled Wall Injection & Vacuum Shock Resistance",
    objective: "Introduce diluent into the lyophilized cake without causing polypeptide shear damage.",
    duration: "2 Minutes",
    standard: "Protective Hydrodynamic Flow SOP",
    instructions: [
      "Lyophilized peptide vials are packaged under partial negative vacuum pressure. Firmly anchor your thumb on the syringe plunger before needle puncture.",
      "Insert the needle through the center of the peptide vial's rubber stopper at a 45-degree angle, pointing the needle tip against the inner glass wall.",
      "Resist the inward vacuum pull with your thumb; do NOT allow the plunger to violently snap down.",
      "Depress the plunger very slowly (over 20–30 seconds), allowing the diluent to trickle smoothly down the glass wall onto the powder.",
      "Once all liquid has entered, remove the needle. Allow any residual pressure to normalize.",
    ],
    proTip: "The 45° glass wall technique dissipates kinetic force, preventing turbulent impact onto delicate tertiary peptide structures.",
    caution: "NEVER squirt diluent directly onto the dry lyophilized cake. Direct high-velocity impact causes irreversible protein shearing.",
  },
  {
    step: 4,
    phaseName: "Phase 4: Gentle Dissolution & Refrigerated Storage",
    title: "Circular Palm Dissolution & 2°C–8°C Refrigeration",
    objective: "Achieve complete aqueous clarity and transition reconstituted peptide to refrigerated preservation.",
    duration: "2 Minutes",
    standard: "Refrigeration Integrity Standard",
    instructions: [
      "Keep the vial upright or slightly angled. Gently roll the vial horizontally between the palms of your hands for 60 to 90 seconds.",
      "Alternatively, place the vial on a clean benchtop and swirl in slow, gentle circular motions.",
      "Inspect the reconstituted solution under direct light. The liquid must be 100% transparent and clear with zero visible flakes.",
      "Affix a laboratory label indicating the Reconstitution Date, Concentration (mg/mL), and Expiration Date (28 days).",
      "Immediately transfer the vial to laboratory refrigeration between 2°C – 8°C (36°F – 46°F). Protect from direct light.",
    ],
    proTip: "If small particulate remains, let the vial rest undisturbed in the refrigerator for 10 minutes. Most peptides dissolve fully via passive diffusion.",
    caution: "NEVER shake, vortex, or aggressively agitate the vial. Shaking induces interfacial foaming denaturation, rendering the peptide biologically inert.",
  },
]

interface TroubleshootingScenario {
  observation: string
  rootCause: string
  solution: string
  severity: "low" | "medium" | "critical"
}

const TROUBLESHOOTING_DATA: TroubleshootingScenario[] = [
  {
    observation: "Solution appears cloudy, hazy, or milky after 5 minutes of gentle rolling.",
    rootCause: "Peptide is hydrophobic or basic, requiring an acidic solvent (e.g. 0.6% Acetic Acid), or has precipitated due to neutral pH mismatch.",
    solution: "Let rest at room temperature for 15 minutes. If cloudiness persists, review the Solvent Guide. NEVER inject cloudy solutions into analytical assays.",
    severity: "critical",
  },
  {
    observation: "Plunger was violently sucked down immediately upon stopper puncture.",
    rootCause: "Strong factory-sealed negative vacuum pressure overcame manual thumb resistance, slamming diluent onto the cake.",
    solution: "Inspect solution for white foam or micro-bubbles. If foam formed, let rest upright in refrigerator for 2 hours for bubbles to settle. Roll gently before assay.",
    severity: "medium",
  },
  {
    observation: "Diluent resists entering the vial; plunger pushes back outward.",
    rootCause: "Internal positive air pressure in the peptide vial preventing inflow.",
    solution: "Carefully detach syringe barrel or insert a sterile empty needle into the rubber stopper for 2 seconds to vent internal pressure to ambient equilibrium.",
    severity: "low",
  },
  {
    observation: "Tiny dark or gray speck floating in the liquid.",
    rootCause: "Stopper coring: needle entered at an improper angle or with a dull bevel, slicing off a fragment of rubber stopper.",
    solution: "The vial is physically contaminated. The solution cannot be used for precision analytical or in vitro research.",
    severity: "critical",
  },
]

export function BeginnersGuidePanel() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    )
  }

  const markAllDone = () => {
    setCompletedSteps([1, 2, 3, 4])
  }

  const resetAll = () => {
    setCompletedSteps([])
  }

  const progressPercent = Math.round((completedSteps.length / DEEP_SOP_STEPS.length) * 100)

  return (
    <div className="w-full space-y-12">
      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
            i
          </span>
          <span>Quick Laboratory References:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <LocalizedClientLink
            href="/dosage-chart"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <span>Master Dosage Chart (88 Compounds)</span>
            <ArrowRightMini className="h-4 w-4" />
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/reconstitution-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <Beaker className="h-3.5 w-3.5 text-emerald-700" />
            <span>Solvent Chemistry Guide</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/research-library#calculator"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Syringe Calculator</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Critical Safety Notice Callout */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-xs text-rose-900 shadow-sm">
        <ExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="space-y-1">
          <strong className="text-sm font-bold text-rose-950 block">
            CRITICAL BENCH RULE: ZERO VIGOROUS AGITATION
          </strong>
          <p className="leading-relaxed text-rose-800 text-xs">
            Polypeptide secondary and tertiary molecular bridges are fragile. <strong>NEVER shake, vortex, drop, or violently agitate a peptide vial.</strong> Mechanical shaking induces hydrodynamic shear stress and foaming denaturation, rendering the solution biologically inert. Always dissolve by slow, gentle palm rolling.
          </p>
        </div>
      </div>

      {/* Section 1: Required Laboratory Equipment Manifest */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Prerequisites &amp; Materials
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Required Laboratory Equipment Manifest
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">GLP Aseptic Handling Checklist</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REQUIRED_EQUIPMENT.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl" role="img" aria-label={item.name}>
                    {item.icon}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                    {item.spec}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Phase-by-Phase Deep-Dive Protocol (Phases 1 to 4) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Standard Operating Procedure
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              4-Phase Sterile Reconstitution SOP
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Readiness:</span>
            <span className="font-mono text-xs font-bold text-emerald-700">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Interactive Readiness Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="space-y-6">
          {DEEP_SOP_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.step)

            return (
              <div
                key={step.step}
                className={`rounded-2xl border p-6 sm:p-8 transition-all ${
                  isDone
                    ? "border-emerald-500/60 bg-emerald-50/30 shadow-md shadow-emerald-500/5"
                    : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-mono font-bold text-emerald-800 border border-emerald-200">
                      0{step.step}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        <span>{step.phaseName}</span>
                        <span className="text-slate-300">&middot;</span>
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Clock className="h-3 w-3" />
                          {step.duration}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{step.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{step.objective}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStep(step.step)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
                    }`}
                  >
                    <CheckCircleSolid className={`h-4 w-4 ${isDone ? "text-white" : "text-slate-400"}`} />
                    <span>{isDone ? "Phase Verified" : "Mark Phase Done"}</span>
                  </button>
                </div>

                {/* Instructions List */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Step-by-Step Laboratory Execution:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {step.instructions.map((inst, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro-Tip & Caution Grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
                    <strong className="font-bold text-emerald-950 block mb-0.5">Laboratory Pro-Tip:</strong>
                    <span className="text-emerald-800 leading-relaxed">{step.proTip}</span>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
                    <strong className="font-bold text-amber-950 block mb-0.5">Critical Precaution:</strong>
                    <span className="text-amber-800 leading-relaxed">{step.caution}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 text-[11px] text-slate-400 font-mono">
                  <span>Standard: {step.standard}</span>
                  <span>Phase {step.step} of 4</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Readiness Checklist Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900">
              Laboratory Readiness Checklist ({completedSteps.length}/4 Steps Verified)
            </span>
            <p className="text-xs text-slate-500">
              Ensure all 4 sterile preparation stages are completed before starting your in vitro assay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllDone}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer shadow-sm"
            >
              Verify All 4
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset
            </button>
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

      {/* Section 4: Forensic Laboratory "What If..." Troubleshooting Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Forensic Quality Assurance
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Laboratory &ldquo;What If...&rdquo; Troubleshooting Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Zero-Defect Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TROUBLESHOOTING_DATA.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      t.severity === "critical"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : t.severity === "medium"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {t.severity === "critical" ? "Critical Risk" : t.severity === "medium" ? "Caution" : "Advisory"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Diagnostic #{idx + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.observation}</h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <strong className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                      Underlying Root Cause:
                    </strong>
                    <p className="text-slate-700 mt-0.5">{t.rootCause}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-800 block text-[11px] uppercase tracking-wider font-semibold">
                      Laboratory Resolution SOP:
                    </strong>
                    <p className="text-slate-800 font-medium mt-0.5">{t.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Explore Related Educational Guides */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Continue Your Scientific Protocol Mastery:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LocalizedClientLink
            href="/learn/reconstitution-guide"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
              <Beaker className="h-4 w-4 text-emerald-600" />
              <span>Solvent Guide</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Solvent Chemistry &amp; Acetic Acid SOP
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              When to use BAC Water vs 0.6% Acetic Acid vs Saline.
            </p>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/storage-guide"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 mb-1">
              <span>❄️</span>
              <span>Storage Matrix</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Temperature Kinetics &amp; Viability
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              -20°C deep freeze vs 2°C–8°C degradation curves.
            </p>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/syringe-guide"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-1">
              <span>💉</span>
              <span>Syringe Guide</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              U-100 Syringe Anatomy &amp; Dead Space
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              0.3mL vs 0.5mL vs 1.0mL barrel accuracy comparison.
            </p>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
