import { Metadata } from "next"
import { SyringeGuidePanel } from "@modules/research-library/components/syringe-guide-panel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Peptide Syringe & Measurement Anatomy Guide | U-100 Standard | PepStack Labs",
  description:
    "Anatomical comparison of 0.3 mL, 0.5 mL, and 1.0 mL U-100 insulin syringes, 31G needle physics, tick mark resolution, and Low Dead Space (LDS) waste minimization.",
}

export default async function SyringeGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Peptide Syringe & Volumetric Measurement Anatomy Guide",
    description:
      "Precision guidelines on U-100 insulin syringe capacities (0.3mL, 0.5mL, 1.0mL), needle gauges, Low Dead Space physics, and tick-mark volumetric calculations.",
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
            <span className="font-semibold text-emerald-800">Syringe Guide</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Standard Operating Procedure (SOP) · Micro-Volumetric Titration Standard
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              U-100 Syringe Anatomy &amp; Volumetric Measurement Guide
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Precision microgram titration begins with syringe barrel physics. Under the international
              U-100 standard, 100 units equals exactly 1.0 mL (1 unit = 0.01 mL = 10 &mu;L).
              Master barrel selection, tick mark resolution, and Low Dead Space (LDS) dynamics to prevent research dosing discrepancies.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <SyringeGuidePanel />
      </div>
    </div>
  )
}
