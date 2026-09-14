"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  CheckCircleSolid,
  DocumentText,
  Sparkles,
  ShieldCheck,
  Beaker,
  ArrowRightMini,
  Clock,
} from "@medusajs/icons"

type TestingTab = "hplc" | "ms" | "karl_fischer" | "endotoxin" | "sterility"

export function EditorialPolicyView() {
  const [activeTestingTab, setActiveTestingTab] = useState<TestingTab>("hplc")

  return (
    <div className="w-full space-y-16">
      {/* ── Executive Charter Banner ── */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>ISO/IEC 17025 Analytical Benchmark · Scientific Sovereignty</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            The PepStack Labs Scientific Governance Charter
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            PepStack Labs operates as an uncompromising analytical repository and laboratory reference standard.
            Every peptide monograph, volumetric calibration, receptor binding parameter, and stability threshold
            cataloged across our platform is strictly grounded in peer-reviewed scientific literature and verified
            through third-party High-Performance Liquid Chromatography (RP-HPLC) and Mass Spectrometry (ESI-MS).
            We do not publish ungrounded marketing claims, speculative dosage extrapolations, or non-deterministic data.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
                Purity Benchmark
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                &ge;99.0%
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">RP-HPLC Peak Area</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block font-mono">
                Mass Tolerance
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                &plusmn;1.0 Da
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">ESI-MS Molecular Weight</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block font-mono">
                Moisture Limit
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                &le;5.0%
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Karl Fischer Titration</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
                Endotoxin Floor
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                &lt;0.1 EU/mg
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">LAL Kinetic Assay</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── The 4 Fundamental Pillars of Analytical Rigor ── */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Core Methodological Tenets
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            The 4 Fundamental Pillars of Scientific Rigor
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Our editorial and laboratory workflows are governed by four non-negotiable principles designed to
            protect scientific integrity, eliminate cognitive hallucinations, and empower researchers with reliable metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Literature Grounding */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-mono font-bold text-sm border border-emerald-200 text-emerald-900">
                01
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Primary Literature Grounding</h3>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Tri-Shield Anti-Hallucination Framework
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every pharmacodynamic claim, half-life parameter, and receptor affinity cataloged on PepStack Labs
              is anchored to indexed PubMed literature (e.g., <em>The New England Journal of Medicine</em>,{" "}
              <em>The Lancet</em>, <em>Nature Medicine</em>, <em>Cell Metabolism</em>). Each assertion references
              a unique PubMed Identifier (PMID) or Digital Object Identifier (DOI).
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                <span>Zero Generative Extrapolation</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                We strictly prohibit AI-generated dosage recommendations or unverified anecdotal claims.
                If clinical or preclinical data does not exist in peer-reviewed literature, the compound profile
                explicitly notes: &ldquo;Investigational preclinical standard; limited published receptor kinetics.&rdquo;
              </p>
            </div>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-semibold font-mono">
              <span>PubMed Cross-Referencing Standard &middot; National Library of Medicine</span>
            </div>
          </div>

          {/* Pillar 2: HPLC Purity Mandate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-mono font-bold text-sm border border-emerald-200 text-emerald-900">
                02
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">RP-HPLC &ge;99.0% Testing Mandate</h3>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Chromatographic &amp; Mass Spectrometry Validation
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Analytical reference compounds must demonstrate minimum chromatographic purity of &ge;99.0%
              evaluated via Reverse-Phase High-Performance Liquid Chromatography (RP-HPLC) utilizing a C18
              stationary phase column with acetonitrile/water/0.1% TFA gradient elution at UV 214nm/220nm detection.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                <span>Electrospray Ionization Mass Spectrometry (ESI-MS)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                Sequence identity is confirmed through mass-to-charge ($m/z$) spectral envelope analysis,
                verifying the monoisotopic and average molecular weight within &plusmn;1.0 Dalton of the theoretical
                structure before batch release.
              </p>
            </div>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-semibold font-mono">
              <span>Analytical Reference Monograph Verification Protocol</span>
            </div>
          </div>

          {/* Pillar 3: Deterministic Stoichiometry */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-mono font-bold text-sm border border-emerald-200 text-emerald-900">
                03
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deterministic Titration Metrics</h3>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Zero Rounding Error Volumetrics ($C = M / V$)
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              All dilution calculations, diluent solvent requirements, concentration ratios, and syringe graduation
              mappings are governed by deterministic stoichiometric physics. No rounding approximations or
              heuristic shortcuts are used in our laboratory formulas.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                <span>The U-100 Volumetric Constant</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                Under the international pharmacopeial U-100 standard, 100 units = exactly 1.0 mL (1,000 &mu;L).
                Therefore, 1 unit equals exactly 0.01 mL (10 &mu;L). Every protocol graduation table provides
                the exact mathematical payload per unit down to 0.1 &mu;g resolution.
              </p>
            </div>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-semibold font-mono">
              <span>Analytical Micro-Unit Stoichiometry &middot; Exact Volumetric Equivalence</span>
            </div>
          </div>

          {/* Pillar 4: In Vitro RUO Governance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-mono font-bold text-sm border border-emerald-200 text-emerald-900">
                04
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">In Vitro RUO Research Standards</h3>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Research Use Only (RUO) Standard
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              PepStack Labs maintains an uncompromising institutional boundary regarding research quality.
              All compounds, analytical monographs, titration schedules, and compatibility tools are published
              exclusively for in vitro scientific research, receptor kinetics, and laboratory chemical investigation.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                <span>Non-Clinical Research Boundary</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                We do not dispense prescription medication, provide medical advice, diagnosis, or clinical therapy.
                All products are labeled &ldquo;For Research Use Only (RUO)&rdquo; with tamper-evident seals and
                batch lot traceability in accordance with international chemical safety standards.
              </p>
            </div>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-semibold font-mono">
              <span>In Vitro Research Standard &middot; Laboratory RUO Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Analytical Testing Inspector ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Beaker className="h-4 w-4 text-emerald-600" />
              <span>Laboratory Methodology Deep-Dive</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Analytical Verification &amp; Quality Control Protocols
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            ISO/IEC 17025 Accreditations
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "hplc", label: "RP-HPLC Purity (≥99.0%)", icon: "📊" },
            { key: "ms", label: "ESI-MS Mass Confirmation", icon: "🔬" },
            { key: "karl_fischer", label: "Karl Fischer Moisture (≤5%)", icon: "💧" },
            { key: "endotoxin", label: "Endotoxin LAL (<0.1 EU/mg)", icon: "🛡️" },
            { key: "sterility", label: "0.22μm Sterile Lyophilization", icon: "❄️" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTestingTab(tab.key as TestingTab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTestingTab === tab.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 space-y-4">
          {activeTestingTab === "hplc" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Reverse-Phase High-Performance Liquid Chromatography (RP-HPLC)</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  Purity &ge;99.0% Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                RP-HPLC is the primary analytical gold standard for determining chemical purity and separating
                synthetic diastereomers, truncation sequences, and residual deprotection fragments. Samples are dissolved
                in high-purity chromatographic grade solvent and injected onto a reverse-phase column.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Stationary Phase Column</span>
                  <span className="text-slate-600">C18 Octadecylsilane, 4.6 &times; 250 mm, 5 &mu;m particle size, 300 &Aring; pore size.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Mobile Phase &amp; Gradient</span>
                  <span className="text-slate-600">Eluent A: 0.1% Trifluoroacetic acid (TFA) in H2O. Eluent B: 0.1% TFA in Acetonitrile (ACN). Linear gradient 5%–95% over 30 min.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">UV Spectrophotometry</span>
                  <span className="text-slate-600">Dual wavelength monitoring at 214 nm (peptide backbone amide absorption) and 220 nm / 280 nm (aromatic residues).</span>
                </div>
              </div>
            </div>
          )}

          {activeTestingTab === "ms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Electrospray Ionization Mass Spectrometry (ESI-MS / MALDI-TOF)</span>
                </h4>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100 border border-teal-200 px-2.5 py-0.5 rounded-md">
                  Mass Tolerance &plusmn;1.0 Da
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mass spectrometry confirms that the synthesized molecular structure exactly corresponds to the nominal
                primary amino acid sequence. ESI-MS measures the mass-to-charge ratio ($m/z$) of intact peptide ions,
                deconvoluting multiple protonated states ([M+H]+, [M+2H]2+, [M+3H]3+) into a precise molecular weight.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Ionization Technique</span>
                  <span className="text-slate-600">Positive-mode Electrospray Ionization (ESI+) with quadrupole or time-of-flight (TOF) high-resolution mass analyzer.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Spectral Deconvolution</span>
                  <span className="text-slate-600">Observed isotopic peak envelope compared directly against theoretical monoisotopic and average formula weight.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Rejection Threshold</span>
                  <span className="text-slate-600">Any variance greater than &plusmn;1.0 Dalton results in immediate batch quarantine and synthesis rejection.</span>
                </div>
              </div>
            </div>
          )}

          {activeTestingTab === "karl_fischer" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Karl Fischer Coulometric Moisture Titration</span>
                </h4>
                <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                  Moisture &le;5.0% Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Residual water inside a lyophilized peptide vial accelerates spontaneous chemical hydrolysis of peptide
                bonds, deamidation of asparagine/glutamine residues, and beta-elimination during long-term storage.
                Coulometric Karl Fischer titration precisely quantifies residual water content in parts-per-million (ppm).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Electrochemical Reaction</span>
                  <span className="text-slate-600">Iodine generated quantitatively by electrolytic oxidation reacts stoichiometrically with water molecules (1 mol I2 : 1 mol H2O).</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Vacuum Sublimation Standard</span>
                  <span className="text-slate-600">Lyophilization cycles target residual moisture between 1.5% and 3.8%, well beneath the 5.0% maximum pharmacopeial ceiling.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Stability Consequence</span>
                  <span className="text-slate-600">Low water activity ($a_w &lt; 0.2$) ensures the solid cake maintains &gt;95% potency for 24–36 months when stored at -20°C.</span>
                </div>
              </div>
            </div>
          )}

          {activeTestingTab === "endotoxin" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Limulus Amebocyte Lysate (LAL) Endotoxin Assay</span>
                </h4>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  Endotoxin &lt;0.1 EU/mg
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bacterial endotoxins (lipopolysaccharides from Gram-negative bacterial outer cell walls) can trigger
                severe inflammatory cascades in cellular assays and distort in vitro receptor binding affinity data.
                We enforce a strict threshold of &lt;0.1 Endotoxin Units per milligram (EU/mg) via kinetic chromogenic LAL assays.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Kinetic Chromogenic Method</span>
                  <span className="text-slate-600">Amebocyte lysate enzyme activation cleaves a synthetic chromogenic substrate (p-nitroaniline), measured spectrophotometrically at 405 nm.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Aseptic Processing</span>
                  <span className="text-slate-600">All synthesis reagents, resin cleavage tools, and glassware undergo depyrogenation dry heat cycles at &ge;250°C for 60 minutes.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Assay Invariance</span>
                  <span className="text-slate-600">Ensures cellular culture experiments and receptor binding assays remain completely free of pyrogenic interference.</span>
                </div>
              </div>
            </div>
          )}

          {activeTestingTab === "sterility" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>0.22 &mu;m Membrane Filtration &amp; Sterile Lyophilization</span>
                </h4>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-md">
                  Aseptic Laminar Flow Processing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Prior to freeze-drying, bulk peptide solution undergoes 0.22-micron sterile membrane filtration
                utilizing low-protein-binding polyethersulfone (PES) or polyvinylidene fluoride (PVDF) filters.
                Filling and stopper crimping are executed under laminar flow clean-bench hoods with aseptic handling.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Low Protein-Binding Filter</span>
                  <span className="text-slate-600">0.22 &mu;m PES membrane retains microbial contaminants without adsorbing active peptide molecules from the solution.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Cryogenic Sublimation</span>
                  <span className="text-slate-600">Controlled multi-stage freezing (-45°C) followed by primary sublimation under deep vacuum (&lt;0.05 mbar) yields a uniform, porous cake.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Tamper-Evident Crimping</span>
                  <span className="text-slate-600">Automated pneumatic stopper seating under pure dry nitrogen gas, sealed with aluminum-plastic flip-off caps to preserve vacuum integrity.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5-Stage Scientific Peer Review Pipeline ── */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10 space-y-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Editorial Integrity Protocol</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            How Every Monograph and Protocol Is Audited Prior to Publication
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            A monograph is never published based on vendor promotional material or automated scrapers.
            Each entry must pass our rigorous 5-stage sovereign verification protocol:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 font-mono font-bold text-xs text-emerald-900 border border-emerald-200">
              S1
            </span>
            <h4 className="text-xs font-bold text-slate-900 font-mono">Structure &amp; CAS</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mapping to CAS registry, PubChem CID, IUPAC molecular formula, and primary amino acid sequence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 font-mono font-bold text-xs text-emerald-900 border border-emerald-200">
              S2
            </span>
            <h4 className="text-xs font-bold text-slate-900 font-mono">Literature Synthesis</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Extraction of published pharmacokinetic parameters (t1/2 half-life), receptor binding affinity (Ki), and clinical trial phases.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 font-mono font-bold text-xs text-emerald-900 border border-emerald-200">
              S3
            </span>
            <h4 className="text-xs font-bold text-slate-900 font-mono">Stoichiometric Model</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mathematical modeling of reconstitution volumes, concentration in mg/mL, and micro-unit U-100 graduation ticks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 font-mono font-bold text-xs text-emerald-900 border border-emerald-200">
              S4
            </span>
            <h4 className="text-xs font-bold text-slate-900 font-mono">Batch Lot CoA Audit</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Verification of physical lot HPLC chromatograms, peak area AUC integration, and mass spectrometry confirmation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 font-mono font-bold text-xs text-emerald-900 border border-emerald-200">
              S5
            </span>
            <h4 className="text-xs font-bold text-slate-900 font-mono">Continuous Errata</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Quarterly literature reviews to update monographs as new phase 3 clinical trials, safety advisories, and papers publish.
            </p>
          </div>
        </div>
      </div>

      {/* ── Anatomy of a Certificate of Analysis (CoA) ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Quality Transparency
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Anatomy of an Analytical Certificate of Analysis (CoA)
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              How researchers can inspect and verify every data element on a laboratory CoA:
            </p>
          </div>
          <LocalizedClientLink
            href="/research-library#coa"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700 self-start sm:self-auto"
          >
            <DocumentText className="h-4 w-4 text-emerald-600" />
            <span>Search Live CoA Repository</span>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
              <span>Unique Batch &amp; Lot Number</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every production batch is assigned an immutable lot identifier (e.g. <code>LOT-RET-2026-08A</code>)
              allowing complete backward traceability to the specific synthesis run, chromatography column, and filtration timestamp.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">2</span>
              <span>CAS Registry &amp; Sequence</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifies the international Chemical Abstracts Service (CAS) registration number and canonical primary
              amino acid sequence matching official IUPAC / PubChem compound directories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">3</span>
              <span>Theoretical vs. Observed Mass</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reports theoretical monoisotopic mass side-by-side with experimental ESI-MS observed mass.
              Discrepancies &gt;&plusmn;1.0 Da indicate sequence truncations or counterion anomalies.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">4</span>
              <span>Chromatographic Peak AUC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Displays the integrated Area Under the Curve (AUC) percentage for the main compound peak.
              Our minimum threshold is &ge;99.0%, with zero unidentified secondary impurities above 0.5%.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">5</span>
              <span>Retention Time ($t_R$) &amp; Column</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Documents column temperature, flow rate (mL/min), elution gradient, and exact retention time ($t_R$)
              to ensure identical reproducibility across independent analytical laboratories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">6</span>
              <span>Chemist Sign-off &amp; Date</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Includes formal signature and accreditation seal of the certifying analytical chemist, testing facility
              ISO 17025 certificate number, and exact date of spectral analysis.
            </p>
          </div>
        </div>
      </div>

      {/* ── Thermostability & Storage Governance Standards ── */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10 space-y-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Environmental Governance
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Physicochemical Thermostability &amp; Storage Standards
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Peptide secondary and tertiary folding structures are vulnerable to thermal degradation and hydrolytic cleavage.
            We mandate strict temperature protocols across three physical phases:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Phase 1: Deep Freeze */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase">Long-Term Storage</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded">
                -20°C to -80°C
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">Lyophilized Solid Powder</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unreconstituted lyophilized cakes stored in vacuum-sealed glass vials in a desiccator maintain
              &gt;98% potency for <strong>24 to 36 months</strong>. Frost-free freezers must be avoided due to thermal cycling.
            </p>
          </div>

          {/* Phase 2: Refrigerated Liquid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Aqueous Solution</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                2°C to 8°C
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">Reconstituted in BAC Water USP</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once reconstituted with Bacteriostatic Water USP (0.9% Benzyl Alcohol), solutions must remain strictly refrigerated
              and utilized within <strong>28 days</strong>. <em>Never freeze liquid peptide solutions</em>; ice crystals shear peptide bonds.
            </p>
          </div>

          {/* Phase 3: Courier Transit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-700 uppercase">Courier Transit</span>
              <span className="text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded">
                Ambient Buffer
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">Insulated Transit Mailers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solid lyophilized peptide cakes tolerate ambient transit up to <strong>96 hours</strong> without measurable
              purity loss. All parcels dispatch from Metro Manila via insulated protective mailers with silica desiccant.
            </p>
          </div>
        </div>
      </div>

      {/* ── Evidence Hierarchy & Grading Scale ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Scientific Taxonomy
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Scholarly Evidence Hierarchy &amp; Grading Criteria
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            To provide researchers with complete transparency, every claim in our scientific monographs
            is assigned an evidence grade corresponding to its publication rigor:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Evidence Tier</th>
                <th className="py-3 px-4 w-48">Publication Benchmark</th>
                <th className="py-3 px-4">Acceptable Sources &amp; Verification Protocol</th>
                <th className="py-3 px-4 w-32 text-right">Grounding Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold font-mono text-emerald-800">Tier 1: Clinical</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Phase 2 / Phase 3 Randomized Controlled Trials</td>
                <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                  Published in primary journals (<em>NEJM</em>, <em>The Lancet</em>, <em>JAMA</em>). Explicit endpoints, patient sample sizes,
                  and statistical significance ($p &lt; 0.001$). Assigned direct PubMed PMIDs.
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px]">
                    Grade A Evidence
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold font-mono text-teal-800">Tier 2: Preclinical</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">In Vivo Rodent / Primate Pharmacodynamics</td>
                <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                  Published in physiological journals (<em>Endocrinology</em>, <em>Cell Metabolism</em>, <em>Diabetes</em>).
                  Receptor activation kinetics, organ-specific uptake, and systemic metabolic clearance.
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-mono font-bold text-[10px]">
                    Grade B Evidence
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold font-mono text-indigo-800">Tier 3: In Vitro</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Cell Culture, Binding Affinity &amp; Crystallography</td>
                <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                  HEK-293 / CHO cell receptor assays, Ki / EC50 binding curves, surface plasmon resonance (SPR),
                  and AlphaFold / PDB 3D structural coordinate files.
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono font-bold text-[10px]">
                    Grade C Evidence
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Frequently Asked Questions & Compliance Governance ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Compliance Clarifications
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions on Quality &amp; Governance
          </h3>
        </div>

        <div className="space-y-4">
          <details className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-slate-900 text-sm">
              <span>Why is RP-HPLC purity specified as &ge;99.0% rather than 100%?</span>
              <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180">▼</span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              In chemical synthesis, a true 100.0% purity is scientifically impossible due to ambient atmospheric
              moisture absorption, trace TFA counterions, and instrument baseline noise. A certified &ge;99.0% chromatographic
              purity represents the analytical gold standard, ensuring that less than 1.0% consists of minor synthesis deletion fragments
              with zero toxic heavy metals or pyrogens.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-slate-900 text-sm">
              <span>What is the difference between Bacteriostatic Water USP and Sterile Water for Injection?</span>
              <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180">▼</span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Sterile Water for Injection contains no antimicrobial preservative; once punctured, it must be used immediately
              and discarded within 4 hours. Bacteriostatic Water USP contains 0.9% (9 mg/mL) benzyl alcohol, which inhibits
              bacterial proliferation and allows multi-entry research use for up to 28 days when maintained under strict refrigeration (2°C–8°C).
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-slate-900 text-sm">
              <span>Can reconstituted peptide solutions be refrozen to extend shelf life?</span>
              <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180">▼</span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              <strong>Strictly prohibited.</strong> Ice crystal formation during the freezing of liquid peptide solutions
              induces intense shear stress that cleaves secondary hydrogen bonds, leading to irreversible peptide denaturation
              and precipitation. Reconstituted peptides must remain liquid at 2°C–8°C.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-slate-900 text-sm">
              <span>How does PepStack Labs handle errata and new clinical trial publications?</span>
              <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180">▼</span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Our scientific advisory panel monitors the National Institutes of Health (NIH), ClinicalTrials.gov, and major
              biochemical databases on a weekly basis. When new phase 3 clinical readouts, receptor binding revisions, or FDA
              safety communications publish, corresponding monographs are updated with an incremented revision number and documented changelog.
            </p>
          </details>
        </div>
      </div>

      {/* ── Authoritative Navigation Footer ── */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
        <LocalizedClientLink
          href="/dosage-chart"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Beaker className="h-4 w-4" />
          <span>Explore 88-Compound Master Dosage Matrix</span>
          <ArrowRightMini className="h-4 w-4" />
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/research-library#coa"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xs font-bold text-slate-800 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-sm"
        >
          <DocumentText className="h-4 w-4 text-emerald-600" />
          <span>Review Certificates of Analysis (CoA)</span>
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/research-library#calculator"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xs font-bold text-slate-800 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Interactive Syringe Calibrator</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
