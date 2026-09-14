import { Metadata } from "next"
import { StorageStabilityMatrix } from "@modules/research-library/components/storage-stability-matrix"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Peptide Storage & Thermostability Guide | Viability Matrix | PepStack Labs",
  description:
    "Temperature threshold kinetics for lyophilized and reconstituted peptides. Sub-zero cryo storage, 2°C–8°C refrigerated shelf-life, and ambient courier transit safety envelopes.",
}

export default async function StorageGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Peptide Storage & Thermostability Degradation Matrix",
    description:
      "Scientific guidelines on thermal kinetics, sub-zero storage, and aqueous degradation for lyophilized and reconstituted research peptides.",
    author: {
      "@type": "Organization",
      name: "PepStack Labs Scientific Governance",
    },
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Google TechArticle JSON-LD Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Clinical Header Banner */}
      <div className="border-b border-slate-200 bg-slate-50/80 pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="content-container">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
            <LocalizedClientLink href="/" className="hover:text-emerald-700 transition-colors">
              Home
            </LocalizedClientLink>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <LocalizedClientLink
              href="/research-library"
              className="hover:text-emerald-700 transition-colors"
            >
              Research Library
            </LocalizedClientLink>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-emerald-800">Storage &amp; Stability</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Standard Operating Procedure (SOP) · Laboratory Preservation Standard
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Peptide Storage &amp; Thermostability Degradation Matrix
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Lyophilized peptides maintain near-infinite structural integrity under sub-zero dry storage.
              Once reconstituted with Bacteriostatic Water USP, hydrolytic degradation begins.
              Master temperature thresholds to prevent peptide bond cleavage and loss of biological potency.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <StorageStabilityMatrix />
      </div>
    </div>
  )
}
