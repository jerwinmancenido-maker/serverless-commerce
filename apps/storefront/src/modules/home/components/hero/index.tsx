import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative w-full bg-slate-50/70 border-b border-slate-200 text-slate-900 overflow-hidden">
      {/* Subtle background glow and geometric grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.06),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      <div className="relative content-container py-16 small:py-24 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-500/30 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Clinical-Grade Reference Materials
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl">
          Precision Peptides &amp; Research Compounds
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          Lyophilized reference compounds formulated for laboratory investigation. Dispatched across the Philippines with insulated cold-chain packaging and verified batch consistency.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <LocalizedClientLink
            href="/store"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors text-center shadow-xs"
          >
            Explore Full Catalog &rarr;
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/research-library#calculator"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-colors text-center shadow-xs"
          >
            Reconstitution Calculator &rarr;
          </LocalizedClientLink>
        </div>

        {/* Quick trust strip */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-600 font-bold">&bull;</span>
            <span>Dispatched from Metro Manila</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-600 font-bold">&bull;</span>
            <span>Insulated Cold-Chain Packaging</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-600 font-bold">&bull;</span>
            <span>Instant GCash, Maya &amp; Bank QR</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
