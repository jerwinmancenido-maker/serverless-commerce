import { Metadata } from "next"
import { ReconstitutionGuidePanel } from "@modules/research-library/components/reconstitution-guide-panel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Peptide Reconstitution Guide & Solvent Chemistry Matrix | PepStack Labs",
  description:
    "Solvent compatibility specifications for Bacteriostatic Water USP, 0.6% Acetic Acid, and BAC Saline. Learn negative vacuum physics and zero-turbidity reconstitution protocols.",
  openGraph: {
    title: "Peptide Reconstitution Guide & Solvent Chemistry Matrix",
    description:
      "Aseptic reconstitution protocols, solvent compatibility matrices, and U-100 syringe micro-unit math for laboratory peptides.",
    type: "website",
  },
}

export default async function ReconstitutionGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Standard Peptide Reconstitution Protocol with Solvent Matching",
    description:
      "Laboratory procedure for reconstituting lyophilized research peptides while controlling for solvent compatibility and negative vacuum pressure.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Solvent Selection",
        text: "Select appropriate diluent: Bacteriostatic Water USP for 90% of neutral peptides, or 0.6% Acetic Acid for basic/hydrophobic peptides.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Septum Disinfection",
        text: "Swab both peptide vial and diluent vial rubber stoppers with sterile 70% isopropyl alcohol and allow to air dry.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Controlled Vacuum Insertion",
        text: "Maintain thumb pressure on syringe plunger to resist negative vacuum pull. Direct needle stream at 45° angle against the glass vial wall.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Gentle Dissolution",
        text: "Never shake vigorously. Gently roll vial between palms for 60–90 seconds until solution is 100% transparent and clear.",
      },
    ],
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
            <span className="font-semibold text-emerald-800">Reconstitution Guide</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Solvent Science &amp; Chemical Compatibility
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Peptide Reconstitution &amp; Solvent Diluent Guide
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Standardized laboratory reconstitution protocols for lyophilized research peptides. Understanding
              isoelectric points, solvent compatibility (BAC Water vs 0.6% Acetic Acid), and negative vacuum mechanics.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <ReconstitutionGuidePanel />
      </div>
    </div>
  )
}
