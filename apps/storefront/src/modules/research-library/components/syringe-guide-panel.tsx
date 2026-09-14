"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Sparkles,
  InformationCircle,
  CheckCircleSolid,
  ArrowRightMini,
  Beaker,
} from "@medusajs/icons"

interface BarrelSpec {
  capacity: string
  units: number
  volumeMl: number
  tickInterval: string
  needle: string
  gaugeDetail: string
  recommendedDoseRange: string
  readingErrorTolerance: string
  bestFor: string
  proTip: string
}

const BARREL_SPECS: BarrelSpec[] = [
  {
    capacity: "0.3 mL",
    units: 30,
    volumeMl: 0.3,
    tickInterval: "0.5 Unit (0.005 mL / 5 μL)",
    needle: "31G × 5/16\" (8mm)",
    gaugeDetail: "0.26 mm outer diameter / Ultra-Fine bevel",
    recommendedDoseRange: "20 mcg – 300 mcg",
    readingErrorTolerance: "±0.25 Units (Lowest Parallax Error)",
    bestFor: "Micro-dosing protocols, daily GHRH/GHRP secretagogues (CJC-1295, Ipamorelin), and low-volume titration steps.",
    proTip: "The narrow bore barrel produces the highest linear travel per unit, making 1 unit measure ~1.8 mm apart on the scale.",
  },
  {
    capacity: "0.5 mL",
    units: 50,
    volumeMl: 0.5,
    tickInterval: "1.0 Unit (0.01 mL / 10 μL)",
    needle: "31G × 5/16\" (8mm)",
    gaugeDetail: "0.26 mm outer diameter / Ultra-Fine bevel",
    recommendedDoseRange: "250 mcg – 1,000 mcg",
    readingErrorTolerance: "±0.5 Units (Standard Laboratory Precision)",
    bestFor: "Laboratory workhorse standard. Ideal for BPC-157, TB-500, and weekly metabolic incretin titrations (Semaglutide, Tirzepatide).",
    proTip: "Optimal balance of volume capacity and tick mark clarity. Suitable for 85% of standard peptide research regimens.",
  },
  {
    capacity: "1.0 mL",
    units: 100,
    volumeMl: 1.0,
    tickInterval: "2.0 Units (0.02 mL / 20 μL)",
    needle: "30G × 1/2\" (12.7mm)",
    gaugeDetail: "0.31 mm outer diameter / Standard micro-bevel",
    recommendedDoseRange: "1,000 mcg – 5,000 mcg",
    readingErrorTolerance: "±1.0 Unit (Wider Tolerance)",
    bestFor: "High-volume diluent transfers, large-dose tissue matrix protocols (GHK-Cu 50mg, NAD+ 500mg), and dilute solutions.",
    proTip: "Never use 1.0 mL barrels for micro-dosing under 10 units; the tight tick spacing increases visual reading error significantly.",
  },
]

export function SyringeGuidePanel() {
  const [selectedBarrel, setSelectedBarrel] = useState<string>("0.5 mL")
  const [calcUnits, setCalcUnits] = useState<number>(10)
  const [calcConcentration, setCalcConcentration] = useState<number>(5.0) // 5 mg/mL default

  const currentSpec = BARREL_SPECS.find((s) => s.capacity === selectedBarrel) || BARREL_SPECS[1]

  // Calculated Volumetrics
  const volumeMl = Math.round(calcUnits * 0.01 * 1000) / 1000
  const volumeMcl = Math.round(calcUnits * 10)
  const doseMcg = Math.round(volumeMl * calcConcentration * 1000)
  const barrelFillPercent = Math.min(100, Math.round((calcUnits / currentSpec.units) * 100))

  return (
    <div className="w-full space-y-12">
      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
            📏
          </span>
          <span>Laboratory Volumetric Tools:</span>
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
            href="/dosage-chart"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Beaker className="h-3.5 w-3.5 text-emerald-600" />
            <span>Master Dosage Chart (88 Compounds)</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/research-library#calculator"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Interactive Syringe Calculator</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Fundamental Stoichiometric Axiom Callout */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-xs text-emerald-900 shadow-sm">
        <InformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div className="space-y-1">
          <strong className="text-sm font-bold text-emerald-950 block">
            THE U-100 VOLUMETRIC AXIOM (GOLD STANDARD)
          </strong>
          <p className="leading-relaxed text-emerald-800 text-xs">
            Under the international pharmacopeia U-100 standard: <strong>100 Units = Exactly 1.0 mL (1,000 &mu;L)</strong>. Therefore, each single tick unit represents exactly <strong>0.01 mL (10 microliters)</strong> of liquid, regardless of syringe brand. The active microgram (&mu;g) payload drawn depends exclusively on your solution concentration: Dose (&mu;g) = Units &times; 0.01 &times; Concentration (mg/mL) &times; 1,000.
          </p>
        </div>
      </div>

      {/* Section 1: Barrel Comparison Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Anatomical Selection
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              U-100 Syringe Barrel Capacities Compared
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">ISO 8537 Sterile Standard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BARREL_SPECS.map((spec) => {
            const isSelected = selectedBarrel === spec.capacity

            return (
              <div
                key={spec.capacity}
                onClick={() => {
                  setSelectedBarrel(spec.capacity)
                  if (calcUnits > spec.units) setCalcUnits(spec.units)
                }}
                className={`cursor-pointer rounded-2xl border p-6 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-2xl font-black text-slate-900">
                      {spec.capacity}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                        isSelected
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {spec.units} Units Max
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Tick Resolution:</span>
                      <strong className="font-mono text-slate-900">{spec.tickInterval}</strong>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Needle Gauge:</span>
                      <span className="font-mono font-semibold text-slate-800">{spec.needle}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Target Dosing:</span>
                      <span className="font-semibold text-slate-900">{spec.recommendedDoseRange}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Best Utilized For:
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{spec.bestFor}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80">
                  <div className="rounded-lg bg-emerald-50/70 p-2 text-[11px] text-emerald-900 leading-snug">
                    <strong className="font-bold block text-emerald-950">Laboratory Pro-Tip:</strong>
                    {spec.proTip}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2: Interactive Volumetric & Titration Visualizer */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Calibration Tool
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Live Barrel Volumetric &amp; Microgram Calculator
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-Time Fluid Simulation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Active Syringe Barrel:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BARREL_SPECS.map((b) => (
                  <button
                    key={b.capacity}
                    type="button"
                    onClick={() => {
                      setSelectedBarrel(b.capacity)
                      if (calcUnits > b.units) setCalcUnits(b.units)
                    }}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition-colors ${
                      selectedBarrel === b.capacity
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {b.capacity}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Syringe Units:
                </label>
                <span className="font-mono text-sm font-black text-emerald-800">
                  {calcUnits} Units
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={currentSpec.units}
                value={calcUnits}
                onChange={(e) => setCalcUnits(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>1 Unit</span>
                <span>{currentSpec.units / 2} Units</span>
                <span>{currentSpec.units} Units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vial Concentration (mg/mL):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1.0, 2.5, 5.0, 10.0].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCalcConcentration(c)}
                    className={`rounded-xl py-1.5 px-2 text-xs font-bold font-mono transition-colors ${
                      calcConcentration === c
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {c} mg/mL
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Liquid Barrel Visualization */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Simulated Liquid Barrel Fill ({barrelFillPercent}%)
            </span>
            <div className="relative w-full max-w-[200px] h-14 rounded-xl border-2 border-slate-400 bg-white overflow-hidden shadow-inner flex items-center">
              {/* Liquid fill */}
              <div
                className="h-full bg-emerald-500/30 border-r-2 border-emerald-600 transition-all duration-300"
                style={{ width: `${barrelFillPercent}%` }}
              />
              {/* Tick marks */}
              <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-40">
                <span className="h-6 w-0.5 bg-slate-900" />
                <span className="h-3 w-0.5 bg-slate-600" />
                <span className="h-6 w-0.5 bg-slate-900" />
                <span className="h-3 w-0.5 bg-slate-600" />
                <span className="h-6 w-0.5 bg-slate-900" />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 mt-2">
              Plunger drawn to: {calcUnits} / {currentSpec.units} Units
            </span>
          </div>

          {/* Results Summary Box */}
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Calculated Payload Metrics
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Liquid Volume</span>
                <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                  {volumeMl} <span className="text-xs font-normal text-slate-500">mL</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-mono">({volumeMcl} &mu;L)</span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Dose</span>
                <span className="text-lg font-black font-mono text-emerald-800 block mt-0.5">
                  {doseMcg} <span className="text-xs font-normal text-slate-500">&mu;g</span>
                </span>
                <span className="text-[11px] text-slate-600 font-mono">({doseMcg / 1000} mg)</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-950 leading-relaxed pt-1">
              At a concentration of <strong>{calcConcentration} mg/mL</strong>, drawing to tick mark <strong>{calcUnits}</strong> yields exactly <strong>{doseMcg} &mu;g</strong> of active research peptide.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Low Dead Space (LDS) vs High Dead Space (HDS) Physics & Economics */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Fluid Mechanics &amp; Wastage Prevention
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Low Dead Space (LDS) Needle Physics &amp; Cost Analysis
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Understanding why fixed-needle U-100 insulin syringes are the mandated gold standard over standard detachable Luer-Lock syringes for peptide research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LDS Syringes */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-emerald-950">Fixed LDS Syringe (U-100)</h3>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Recommended
              </span>
            </div>
            <div className="text-xs text-emerald-900 space-y-2 leading-relaxed">
              <p>
                <strong>Dead Space Volume: &lt;0.002 mL (2 &mu;L)</strong>. In a fixed-needle U-100 syringe, the needle is permanently bonded into the barrel nose, and the rubber plunger tip is conical, seating directly against the needle orifice.
              </p>
              <p>
                <strong>Zero Waste:</strong> Virtually 100% of the drawn peptide solution is expelled during depression. Compound residual loss is negligible (&lt;10 &mu;g per vial).
              </p>
            </div>
          </div>

          {/* HDS Syringes */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-rose-950">Detachable Luer-Lock (HDS)</h3>
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                Forbidden for Dosing
              </span>
            </div>
            <div className="text-xs text-rose-900 space-y-2 leading-relaxed">
              <p>
                <strong>Dead Space Volume: 0.05 mL to 0.08 mL (50–80 &mu;L)</strong>. The hollow plastic hub connecting the detachable needle to the syringe barrel retains liquid that cannot be pushed out by the plunger.
              </p>
              <p>
                <strong>Severe Compound Wastage:</strong> At 5 mg/mL, 0.08 mL of retained fluid equals <strong>400 &mu;g wasted per injection</strong>. Over 10 draws, an entire 4 mg of valuable peptide is trapped and discarded.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Needle Gauge & Penetration Anatomy */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-bold">
            💉
          </span>
          <span>Laboratory Hardware Standards</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900">
          Needle Gauge Comparison &amp; Septum Integrity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="font-mono text-lg font-black text-slate-900 block">31 Gauge (0.26mm)</span>
            <span className="text-[11px] font-semibold text-emerald-700 block">Ultra-Fine Micro-Needle</span>
            <p className="leading-relaxed text-slate-600">
              The preferred standard for daily microgram administration. The ultra-small puncture diameter prevents synthetic rubber stopper coring across 20+ repeated punctures into the peptide vial.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="font-mono text-lg font-black text-slate-900 block">30 Gauge (0.31mm)</span>
            <span className="text-[11px] font-semibold text-slate-700 block">Standard Micro-Needle</span>
            <p className="leading-relaxed text-slate-600">
              Commonly fitted to 1.0 mL U-100 syringes. Provides slightly faster fluid draw when handling higher viscosity peptide solutions while maintaining high septum safety.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <span className="font-mono text-lg font-black text-slate-900 block">21G–22G (0.82mm)</span>
            <span className="text-[11px] font-semibold text-amber-700 block">Reconstitution Mixing Only</span>
            <p className="leading-relaxed text-slate-600">
              Wide-bore needle used exclusively to transfer 2.0 mL – 3.0 mL of Bacteriostatic Water into the vial during initial reconstitution. Never used for dosing due to large bore size.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Parallax & Plunger Alignment SOP */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Bench SOP
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            How to Read a U-100 Syringe (Eliminating Parallax Error)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Read the Leading Plunger Ring</strong>
              <span>Always align the <strong>top leading edge</strong> of the black rubber plunger seal with the target graduation line. Do not read the center of the cone or the trailing bottom edge of the seal ring.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircleSolid className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Eye-Level Horizontal Orientation</strong>
              <span>Hold the syringe vertically at exact eye level. Viewing from an angle above or below creates optical refraction distortion (parallax), causing up to a 2-unit over- or under-draw.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
