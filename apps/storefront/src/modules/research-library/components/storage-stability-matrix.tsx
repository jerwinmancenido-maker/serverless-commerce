"use client"

import React, { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Sparkles,
  ExclamationCircle,
  InformationCircle,
  CheckCircleSolid,
  ArrowRightMini,
  Beaker,
} from "@medusajs/icons"

interface StorageTier {
  tempRange: string
  label: string
  state: string
  stabilityWindow: string
  riskLevel: "safe" | "standard" | "critical"
  physics: string
  protocol: string
}

const STORAGE_TIERS: StorageTier[] = [
  {
    tempRange: "-20°C to -80°C",
    label: "Deep Cryogenic Freezer",
    state: "Lyophilized Cake (Dry Powder)",
    stabilityWindow: "24 to 36 Months",
    riskLevel: "safe",
    physics: "Thermal kinetic molecular motion is virtually halted. Moisture crystallization is prevented if stored in sealed desiccated vacuum vials.",
    protocol: "Store in airtight secondary containers with silica desiccant pouches. Minimize temperature cycling; avoid frost-free self-defrosting freezers.",
  },
  {
    tempRange: "2°C to 8°C",
    label: "Laboratory Refrigeration",
    state: "Lyophilized Cake (Dry Powder)",
    stabilityWindow: "12 to 18 Months",
    riskLevel: "safe",
    physics: "Low thermal energy limits spontaneous deamidation and peptide bond hydrolysis. Safe for medium-term storage prior to study initiation.",
    protocol: "Keep vials upright in opaque dark containers or wrap with aluminum foil to prevent ambient laboratory fluorescent/UV photolysis.",
  },
  {
    tempRange: "2°C to 8°C",
    label: "Laboratory Refrigeration",
    state: "Reconstituted Aqueous Solution (BAC Water USP)",
    stabilityWindow: "21 to 28 Days",
    riskLevel: "standard",
    physics: "0.9% Benzyl Alcohol maintains antimicrobial sterility. However, water molecules initiate slow hydrolytic cleavage of peptide bonds over time.",
    protocol: "Keep strictly refrigerated at 2°C–8°C. Store upright so solution touches inert glass, not the synthetic rubber stopper. NEVER freeze once liquid.",
  },
  {
    tempRange: "15°C to 25°C",
    label: "Ambient Courier Transit",
    state: "Insulated Lyophilized Cake",
    stabilityWindow: "72 to 96 Hours",
    riskLevel: "standard",
    physics: "Solid lyophilized cake tolerates short-term ambient thermal buffers during transit without measurable degradation or loss of biological affinity.",
    protocol: "Dispatched in thermal-insulated foam mailers from Metro Manila via express dispatch. Transfer to cold storage immediately upon bench arrival.",
  },
  {
    tempRange: ">30°C / Direct Sunlight",
    label: "Extreme Thermal & Photolytic Hazard",
    state: "Any Physical State (Dry or Liquid)",
    stabilityWindow: "<6 Hours to Denaturation",
    riskLevel: "critical",
    physics: "Accelerated thermal denaturation, covalent disulfide scrambling, tyrosine/tryptophan oxidation, and rapid irreversible precipitation.",
    protocol: "Discard immediately if exposed to prolonged tropical ambient heat (>35°C) or direct sunlight. Do not use in precision assays.",
  },
]

interface PeptideStabilityProfile {
  name: string
  fullName: string
  refrigeratedAqueousDays: number
  sensitivity: "High" | "Moderate" | "Resilient"
  notes: string
}

const PEPTIDE_STABILITY_CATALOG: PeptideStabilityProfile[] = [
  {
    name: "BPC-157",
    fullName: "Body Protection Compound-157 (Gastric Pentadecapeptide)",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "High intrinsic structural stability due to 15-amino acid sequence. Maintains 95%+ potency for 28 days in BAC water.",
  },
  {
    name: "TB-500",
    fullName: "Thymosin Beta-4 (Active Oligopeptide)",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "Stable at neutral pH. Avoid repeated needle punctures to prevent premature oxidation of methionine residues.",
  },
  {
    name: "Semaglutide",
    fullName: "Glucagon-Like Peptide-1 (GLP-1) Receptor Agonist",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "Acylated 31-amino acid structure is highly stable in refrigerated BAC water. Protect from ambient warm temperatures.",
  },
  {
    name: "Tirzepatide",
    fullName: "Dual GIP / GLP-1 Receptor Co-Agonist",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "Robust synthetic backbone. Keep refrigerated at 2°C–8°C; do not shake or vortex during reconstitution.",
  },
  {
    name: "Retatrutide",
    fullName: "Triple GIP / GLP-1 / Glucagon Receptor Agonist",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "Advanced 39-amino acid triple incretin. Sensitive to thermal stress; maintain strict refrigerated preservation (2°C–8°C).",
  },
  {
    name: "CJC-1295 No DAC",
    fullName: "Modified GRF 1-29 (Tetrasubstituted GHRH)",
    refrigeratedAqueousDays: 14,
    sensitivity: "High",
    notes: "Lacks the Drug Affinity Complex (DAC). Highly prone to rapid aqueous deamidation. Best utilized within 14–21 days.",
  },
  {
    name: "CJC-1295 with DAC",
    fullName: "Tetrasubstituted GHRH with Maleimidopropionic Acid",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "DAC bioconjugate enhances structural longevity. Stable for full 28-day window.",
  },
  {
    name: "Ipamorelin",
    fullName: "Selective Growth Hormone Secretagogue Pentapeptide",
    refrigeratedAqueousDays: 28,
    sensitivity: "Moderate",
    notes: "Clean pentapeptide structure. Exhibits high aqueous stability when stored at 2°C–8°C.",
  },
  {
    name: "GHK-Cu",
    fullName: "Copper Tripeptide Complex (Gly-His-Lys:Cu2+)",
    refrigeratedAqueousDays: 21,
    sensitivity: "High",
    notes: "Photolabile copper coordination complex. Must be stored in amber glass or foil-shielded vial to avoid UV reduction.",
  },
  {
    name: "Epithalon",
    fullName: "Epithalamin Synthetic Pineal Tetrapeptide (Ala-Glu-Asp-Gly)",
    refrigeratedAqueousDays: 21,
    sensitivity: "High",
    notes: "Short tetrapeptide sequence. Maintain refrigerated at 2°C–8°C and use within 21 days for optimal telomerase research assays.",
  },
  {
    name: "MOTS-c",
    fullName: "Mitochondrial-Derived Peptide (16-Amino Acid)",
    refrigeratedAqueousDays: 28,
    sensitivity: "Resilient",
    notes: "Relatively resilient mitochondrial sequence. Store dry lyophilized powder at -20°C for multi-year preservation.",
  },
  {
    name: "PT-141",
    fullName: "Bremelanotide (Cyclic Melanocortin Receptor Agonist)",
    refrigeratedAqueousDays: 28,
    sensitivity: "Resilient",
    notes: "Cyclic peptide lactam ring architecture confers high resistance to ambient temperature degradation and proteolysis.",
  },
  {
    name: "Melanotan II",
    fullName: "Synthetic Cyclic Heptapeptide Melanocortin Agonist",
    refrigeratedAqueousDays: 28,
    sensitivity: "Resilient",
    notes: "Cyclic structure confers exceptional chemical stability. Safe for 28+ days refrigerated once reconstituted.",
  },
  {
    name: "Semax",
    fullName: "Heptapeptide ACTH(4-7) Pro-Gly-Pro Analogue",
    refrigeratedAqueousDays: 21,
    sensitivity: "High",
    notes: "Heptapeptide neurotrophic sequence. In aqueous solution, store strictly at 2°C–8°C; use within 3 weeks.",
  },
  {
    name: "Selank",
    fullName: "Synthetic Tuftsin Analogue Heptapeptide",
    refrigeratedAqueousDays: 21,
    sensitivity: "High",
    notes: "Susceptible to enzymatic degradation. Must be protected from air exposure and maintained under sterile refrigeration (2°C–8°C).",
  },
  {
    name: "NAD+",
    fullName: "Nicotinamide Adenine Dinucleotide (Coenzyme)",
    refrigeratedAqueousDays: 14,
    sensitivity: "High",
    notes: "Dinucleotide coenzyme prone to spontaneous hydrolytic breakdown into nicotinamide. Keep refrigerated and use within 14 days.",
  },
]

export function StorageStabilityMatrix() {
  // Interactive Reconstitution Shelf-Life Calculator State
  const [selectedCompoundName, setSelectedCompoundName] = useState<string>("BPC-157")
  const [reconstitutionDate, setReconstitutionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  const activeCompound = useMemo(() => {
    return (
      PEPTIDE_STABILITY_CATALOG.find((p) => p.name === selectedCompoundName) ||
      PEPTIDE_STABILITY_CATALOG[0]
    )
  }, [selectedCompoundName])

  const shelfLifeInfo = useMemo(() => {
    if (!reconstitutionDate) return null
    const recon = new Date(reconstitutionDate)
    const now = new Date()
    // Reset time components for accurate day counting
    recon.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffMs = now.getTime() - recon.getTime()
    const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    const maxDays = activeCompound.refrigeratedAqueousDays
    const daysRemaining = Math.max(0, maxDays - daysElapsed)
    const percentRemaining = Math.round((daysRemaining / maxDays) * 100)

    let status: "optimal" | "usable" | "caution" | "expired" = "optimal"
    if (daysRemaining === 0) status = "expired"
    else if (daysRemaining <= 5) status = "caution"
    else if (daysElapsed > 14) status = "usable"

    return { daysElapsed, daysRemaining, percentRemaining, maxDays, status }
  }, [reconstitutionDate, activeCompound])

  return (
    <div className="w-full space-y-12">
      {/* Quick Action Reference Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold">
            ❄️
          </span>
          <span>Laboratory Storage Companion Tools:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <LocalizedClientLink
            href="/learn/beginners-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <span>Beginner&apos;s Reconstitution SOP</span>
            <ArrowRightMini className="h-4 w-4" />
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/reconstitution-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Beaker className="h-3.5 w-3.5 text-emerald-600" />
            <span>Solvent Chemistry Guide</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/dosage-chart"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Master Dosage Chart (88 Compounds)</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Critical Storage Safety Alert */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-xs text-rose-900 shadow-sm">
        <ExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="space-y-1">
          <strong className="text-sm font-bold text-rose-950 block">
            CRITICAL BENCH RULE: NEVER FREEZE RECONSTITUTED PEPTIDES
          </strong>
          <p className="leading-relaxed text-rose-800 text-xs">
            While dry lyophilized powder thrives under sub-zero cryo storage (-20°C to -80°C), <strong>freezing an aqueous reconstituted peptide solution is fatal to bioactivity</strong>. As water transitions to ice, expanding crystallization lattices generate microscopic mechanical shear forces that tear fragile tertiary folds and cleave disulfide peptide bridges. Once mixed with diluent, store exclusively in laboratory refrigeration at 2°C–8°C.
          </p>
        </div>
      </div>

      {/* Section 1: Interactive Reconstitution Shelf-Life & Viability Tracker */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Interactive Analytical Tool
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Reconstituted Vial Viability &amp; Shelf-Life Tracker
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">GLP Laboratory In Vitro Standards</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Investigated Compound:
              </label>
              <select
                value={selectedCompoundName}
                onChange={(e) => setSelectedCompoundName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {PEPTIDE_STABILITY_CATALOG.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} · {p.fullName.split("(")[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reconstitution Date (Diluent Added):
              </label>
              <input
                type="date"
                value={reconstitutionDate}
                onChange={(e) => setReconstitutionDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">{activeCompound.fullName}</span>
              <p className="text-[11px] leading-relaxed">{activeCompound.notes}</p>
            </div>
          </div>

          {/* Dynamic Dashboard Display */}
          <div className="lg:col-span-2 space-y-4">
            {shelfLifeInfo && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Days In Solution
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                      {shelfLifeInfo.daysElapsed}
                      <span className="text-xs font-normal text-slate-500 ml-1">days</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Days Remaining
                    </span>
                    <span
                      className={`text-2xl font-black font-mono mt-0.5 block ${
                        shelfLifeInfo.status === "expired"
                          ? "text-rose-600"
                          : shelfLifeInfo.status === "caution"
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {shelfLifeInfo.daysRemaining}
                      <span className="text-xs font-normal text-slate-500 ml-1">days</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Aqueous Maximum
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                      {shelfLifeInfo.maxDays}
                      <span className="text-xs font-normal text-slate-500 ml-1">days</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Viability Status
                    </span>
                    <span
                      className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide ${
                        shelfLifeInfo.status === "optimal"
                          ? "bg-emerald-100 text-emerald-800"
                          : shelfLifeInfo.status === "usable"
                          ? "bg-sky-100 text-sky-800"
                          : shelfLifeInfo.status === "caution"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {shelfLifeInfo.status === "optimal" && "Optimal Potency"}
                      {shelfLifeInfo.status === "usable" && "Stable Research"}
                      {shelfLifeInfo.status === "caution" && "Impending Expiry"}
                      {shelfLifeInfo.status === "expired" && "Aqueous Expired"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Refrigerated Viability Progress:</span>
                    <span className="font-mono">{shelfLifeInfo.percentRemaining}% remaining</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        shelfLifeInfo.percentRemaining > 50
                          ? "bg-emerald-600"
                          : shelfLifeInfo.percentRemaining > 20
                          ? "bg-amber-500"
                          : "bg-rose-600"
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, shelfLifeInfo.percentRemaining))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Day 0 (Fresh Reconstitution)</span>
                    <span>Day 14 (Midpoint)</span>
                    <span>Day {shelfLifeInfo.maxDays} (Expiry Threshold)</span>
                  </div>
                </div>

                {/* Status-Specific Guidance */}
                <div
                  className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                    shelfLifeInfo.status === "optimal"
                      ? "border border-emerald-200 bg-emerald-50/80 text-emerald-950"
                      : shelfLifeInfo.status === "usable"
                      ? "border border-sky-200 bg-sky-50/80 text-sky-950"
                      : shelfLifeInfo.status === "caution"
                      ? "border border-amber-200 bg-amber-50/80 text-amber-950"
                      : "border border-rose-200 bg-rose-50/80 text-rose-950"
                  }`}
                >
                  {shelfLifeInfo.status === "optimal" && (
                    <div className="flex items-start gap-2">
                      <CheckCircleSolid className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>
                        <strong>Peak Analytical Viability (Days 0–14):</strong> Peptide folding and secondary structures remain intact. Ideal for sensitive binding affinity and receptor assays.
                      </span>
                    </div>
                  )}
                  {shelfLifeInfo.status === "usable" && (
                    <div className="flex items-start gap-2">
                      <InformationCircle className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                      <span>
                        <strong>Stable Research Window (Days 15–21):</strong> Peptide remains biologically active. Minimal hydrolytic cleavage observed when preserved between 2°C–8°C.
                      </span>
                    </div>
                  )}
                  {shelfLifeInfo.status === "caution" && (
                    <div className="flex items-start gap-2">
                      <ExclamationCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        <strong>Impending Hydrolytic Expiry (&lt;5 Days Left):</strong> Minor loss of active peptide concentration due to background deamidation. Complete active trials promptly.
                      </span>
                    </div>
                  )}
                  {shelfLifeInfo.status === "expired" && (
                    <div className="flex items-start gap-2">
                      <ExclamationCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <span>
                        <strong>Aqueous Viability Expired (&gt;{shelfLifeInfo.maxDays} Days):</strong> Antimicrobial efficacy of benzyl alcohol and peptide bond stability can no longer be guaranteed under GLP laboratory standards. Dispose in sharps/biohazard container.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: 5-Tier Thermodynamic Stability Envelope Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Thermodynamic Physics
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              5-Tier Temperature Degradation Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Thermal Kinetic Bounds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STORAGE_TIERS.map((tier) => (
            <div
              key={tier.label + tier.state}
              className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                tier.riskLevel === "safe"
                  ? "border-emerald-200 bg-emerald-50/30"
                  : tier.riskLevel === "standard"
                  ? "border-sky-200 bg-sky-50/30"
                  : "border-rose-200 bg-rose-50/30"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                      tier.riskLevel === "safe"
                        ? "bg-emerald-100 text-emerald-800"
                        : tier.riskLevel === "standard"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {tier.tempRange}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {tier.stabilityWindow}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{tier.label}</h3>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {tier.state}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <p className="leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Biophysical Mechanism:</strong>{" "}
                    {tier.physics}
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    <strong className="text-slate-900 font-semibold">Bench Protocol:</strong>{" "}
                    {tier.protocol}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Peptide Fragility & Sensitivity Taxonomy */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Molecular Sensitivity Taxonomy
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Peptide Chemical Fragility &amp; Degradation Rankings
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Different polypeptide chains possess divergent degradation rates based on amino acid length, disulfide bridging, cyclic architecture, and presence of oxidation-prone residues (Methionine, Tryptophan, Asparagine).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* High Fragility */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <h3 className="font-extrabold text-sm text-rose-950">High Fragility (14–21 Days)</h3>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Prone to rapid spontaneous deamidation, aggregation, or photolytic oxidation. Requires meticulous temperature maintenance (2°C–8°C) and prompt assay completion.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["CJC-1295 No DAC", "GHRP-2", "GHRP-6", "GHK-Cu", "Epithalon", "NAD+", "Semax", "Selank"].map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-rose-800"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Moderate Stability */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <h3 className="font-extrabold text-sm text-sky-950">Moderate Stability (28 Days)</h3>
            </div>
            <p className="text-xs text-sky-900 leading-relaxed">
              Standard laboratory workhorses with balanced secondary structures. Maintain 95%+ potency throughout standard 28-day refrigerated storage in BAC water.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["BPC-157", "TB-500", "Semaglutide", "Tirzepatide", "Retatrutide", "Ipamorelin", "CJC-1295 DAC"].map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-sky-800"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* High Thermal Resilience */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-extrabold text-sm text-emerald-950">High Resilience (28+ Days)</h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Cyclic lactam ring structures or mitochondrial-derived peptides with enhanced resistance to enzymatic cleavage and ambient temperature spikes.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["PT-141 (Bremelanotide)", "Melanotan II", "MOTS-c", "AOD-9604"].map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Forensic Breakdown: The Freeze-Thaw Trap */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-bold">
            🔬
          </span>
          <span>Biophysical Laboratory Science</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900">
          Forensic Analysis: Why Freezing Reconstituted Peptides Causes Inactivation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Ice Crystal Lattice Shearing</h3>
            <p>
              When water freezes at 0°C, it expands by approximately 9% as it arranges into a rigid hexagonal crystalline lattice. For large or flexible polypeptide chains in solution, this physical crystal formation creates intense localized mechanical shear stress. The ice front pushes against delicate peptide folds, breaking tertiary hydrogen bonds and denaturing the molecular conformation required for receptor binding.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Cryo-Concentration &amp; pH Shifts</h3>
            <p>
              As pure water freezes out into ice crystals first, remaining dissolved solutes (buffers, salts, benzyl alcohol, and peptide molecules) become hyper-concentrated in the shrinking residual liquid micro-channels. This &ldquo;cryo-concentration&rdquo; effect can cause massive localized pH shifts (up to 2 full pH units) and force peptide molecules into close proximity, accelerating covalent aggregation and precipitation upon thawing.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Standard Operating Storage Checklist */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Bench SOP
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Essential Laboratory Storage &amp; Refrigeration Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Upright Storage Position</strong>
              <span>Always store reconstituted vials standing upright in laboratory vial racks. Continuous contact with the synthetic rubber stopper can lead to micro-leaching of plasticizers or binding of hydrophobic peptides to the rubber.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Light Shielding Protection</strong>
              <span>Photolysis rapidly degrades tryptophan, tyrosine, and cysteine residues. Store reconstituted vials inside light-protective cardboard boxes, amber containers, or wrap with standard laboratory aluminum foil.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Secondary Moisture Barrier</strong>
              <span>Place dry lyophilized vials inside airtight zip-lock polyethylene pouches containing silica gel desiccant beads before placing in deep-freeze to prevent humidity ingress.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Thermal Equilibration Before Puncture</strong>
              <span>When retrieving a lyophilized vial from sub-zero storage, allow it to reach ambient room temperature (15–20 minutes) BEFORE puncturing. Puncturing a frozen vial sucks humid air inside, causing immediate condensation and hydrolytic degradation.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
