import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CatalogCTA() {
  return (
    <section className="w-full py-16 small:py-20 bg-slate-50/70 border-t border-slate-200">
      <div className="content-container">
        <div className="relative rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white text-slate-900 p-8 sm:p-12 md:p-16 overflow-hidden shadow-xs text-center flex flex-col items-center">
          {/* Subtle ambient lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 block">
              Philippine Research Supply
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Ready to Initiate Your Research Protocol?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore our complete inventory of reference peptides, bacteriostatic reconstitution solutions, and precision supplies dispatched nationwide.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <LocalizedClientLink
                href="/store"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-xs"
              >
                Browse Full Catalog &rarr;
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/research-protocols"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-colors shadow-xs"
              >
                Reconstitution Math &rarr;
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
