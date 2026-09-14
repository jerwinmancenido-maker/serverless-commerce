"use client"

/**
 * @file    apps/storefront/src/modules/home/components/hero/index.tsx
 * @module  HeroComponent (Storefront Home)
 * @purpose Flagship hero banner with dynamic peptide reconstitution preview and sovereign trust badges.
 */

import Image from "next/image"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightMini,
  Sparkles,
  DocumentText,
  ShieldCheck,
} from "@medusajs/icons"

export default function Hero() {
  const [activeMg, setActiveMg] = useState<number>(15)
  const diluentMl = 2.0
  const concentrationMgMl = (activeMg / diluentMl).toFixed(2)
  const standardDoseMg = activeMg === 15 ? 2.5 : activeMg === 10 ? 2.0 : 4.0
  const syringeUnits = Math.round((standardDoseMg / (activeMg / diluentMl)) * 100)

  return (
    <section className="relative w-full bg-gradient-to-b from-slate-900 via-[#0B1120] to-slate-950 text-white overflow-hidden border-b border-slate-800/80">
      {/* Dynamic Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="content-container py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & High-Conversion CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Reference Materials &middot; Manila Laboratory</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              High-Purity Peptides &amp;{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Analytical Compounds
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Reference standard peptides lyophilized under inert gas for in-vitro research. Dispatched nationwide from Metro Manila in protective cushioning with analytical documentation.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore 154 Formulations</span>
                <ArrowRightMini className="h-4 w-4" />
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/research-library#calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-bold text-sm transition-all hover:border-slate-600"
              >
                <DocumentText className="h-4 w-4 text-emerald-400" />
                <span>Reconstitution Calculator</span>
              </LocalizedClientLink>
            </div>

            {/* Scientific Trust Badges */}
            <div className="mt-10 pt-6 border-t border-slate-800/80 w-full grid grid-cols-3 gap-3 text-left">
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                  RUO
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Laboratory Grade
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                  Same-Day
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Metro Manila Dispatch
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                  Instant QR
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  GCash &middot; Maya &middot; QR Ph
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Glassmorphism Monograph Card */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl overflow-hidden">
              {/* Radial card glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Featured Monograph
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Reference Grade
                </span>
              </div>

              {/* Main Product Showcase with 3D Vial Image */}
              <div className="flex items-center gap-4 py-4">
                <div className="relative size-24 sm:size-28 rounded-2xl bg-white/5 border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                  <Image
                    src="http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp"
                    alt="Retatrutide Lyophilized Vial"
                    fill
                    className="object-contain p-1 drop-shadow-xl"
                    sizes="112px"
                    priority
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    GLP-1 / GIP / Glucagon Tri-Agonist
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
                    Retatrutide (LY3437943)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Lyophilized pure trifunctional peptide standard with tamper-evident seal.
                  </p>
                </div>
              </div>

              {/* Interactive In-Hero Reconstitution Simulator */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Select Formulation:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[10, 15, 20].map((mg) => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => setActiveMg(mg)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          activeMg === mg
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {mg}MG
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Outputs */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Concentration (2.0mL)
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {concentrationMgMl} mg/mL
                    </span>
                  </div>
                  <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">
                      Protocol Dose ({standardDoseMg}mg)
                    </span>
                    <span className="text-sm font-bold text-emerald-300 font-mono">
                      {syringeUnits} Units (U-100)
                    </span>
                  </div>
                </div>
              </div>

              {/* Monograph Action */}
              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Protective Cushioning Included</span>
                </div>

                <LocalizedClientLink
                  href="/products/retatrutide"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Configure Compound</span>
                  <ArrowRightMini className="h-4 w-4" />
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
