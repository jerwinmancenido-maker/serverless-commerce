import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightMini,
  DocumentText,
  ShieldCheck,
  Sparkles,
  SquaresPlus,
} from "@medusajs/icons"

export default function ResearchSuiteFeatures() {
  return (
    <section className="w-full py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200">
      <div className="content-container">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Digital Laboratory Utilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            The PepStack Research Suite
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Every compound reference standard unlocks full access to our digital research tools, batch chromatography database, and precision dilution engines.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Bento Tile 1: Precision Reconstitution Math Engine (Span 2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-sm">
                  mL
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Interactive Engine
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Stoichiometric Reconstitution Engine
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Eliminate dilution errors. Calculate precise bacteriostatic water ratios, volume curves, and microgram concentrations per 0.01 mL tick mark on U-100 syringes.
              </p>

              {/* Visual Mini Syringe Scale Preview */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-emerald-700">10mg Vial</span>
                  <span className="text-slate-400">&bull;</span>
                  <span>2.0mL BAC</span>
                </div>
                <div className="font-bold text-slate-900">
                  = 50 mcg per Unit (U-100)
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <LocalizedClientLink
                href="/calculator"
                className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Launch Dilution Calculator</span>
                <ArrowRightMini className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </LocalizedClientLink>
            </div>
          </div>

          {/* Bento Tile 2: Private Vial Inventory (Span 1 col) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <SquaresPlus className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Researcher Hub
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Private Vial Inventory
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Log opened vials, monitor milligram depletion, and track reconstitution stability timestamps securely.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <LocalizedClientLink
                href="/account/research-hub"
                className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Access Portal</span>
                <ArrowRightMini className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </LocalizedClientLink>
            </div>
          </div>

          {/* Bento Tile 3: Thermal Packaging & Logistics (Span 1 col) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Transit Safe
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Insulation Foam Buffer
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Dispatched from Metro Manila in thermal high-density foam shields against ambient temperature spikes.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <LocalizedClientLink
                href="/account/support"
                className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Shipping Standards</span>
                <ArrowRightMini className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </LocalizedClientLink>
            </div>
          </div>

          {/* Bento Tile 4: Analytical Protocol Monographs (Span 2 cols on md, 2 on lg) */}
          <div className="md:col-span-3 lg:col-span-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xs text-white flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <DocumentText className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Analytical Protocol Monographs &amp; Research Library
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Every reference standard includes amino acid sequencing data, handling documentation, and verified storage guidelines.
                </p>
              </div>
            </div>

            <LocalizedClientLink
              href="/research-library"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
            >
              Browse Research Library &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
