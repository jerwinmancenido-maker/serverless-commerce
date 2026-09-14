import { Metadata } from "next"
import { BeginnersGuidePanel } from "@modules/research-library/components/beginners-guide-panel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"
import { EDUCATIONAL_CONTENT } from "@lib/data/educational-content"

export const metadata: Metadata = {
  title: "Peptide Beginner's Guide: Sterile Reconstitution & Handling SOP | PepStack Labs",
  description:
    "Standardized laboratory operating procedure for sterile peptide reconstitution. Master vacuum management, glass wall inflow, and gentle rolling dissolution.",
}

export default async function BeginnersGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Standard Aseptic Peptide Reconstitution Procedure",
    description:
      "4-step sterile laboratory operating procedure for reconstituting lyophilized research peptides with Bacteriostatic Water USP.",
    step: EDUCATIONAL_CONTENT.beginnerSopSteps.map((step) => ({
      "@type": "HowToStep",
      position: step.step,
      name: step.title,
      text: step.instruction,
    })),
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Google HowTo JSON-LD Structured SEO Schema */}
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
            <span className="font-semibold text-emerald-800">Beginner&apos;s Guide</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Standard Operating Procedure (SOP) · In Vitro Protocol
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Peptide Research 101: Sterile Reconstitution &amp; Handling Guide
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Lyophilized peptide chains are stabilized by delicate secondary bonds. Master this
              standardized 4-step laboratory protocol to prevent mechanical shearing, foaming
              denaturation, and microbial contamination.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <BeginnersGuidePanel />
      </div>
    </div>
  )
}
