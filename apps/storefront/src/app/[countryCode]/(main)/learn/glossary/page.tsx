import { Metadata } from "next"
import { GlossaryDirectory } from "@modules/research-library/components/glossary-directory"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "A–Z Scientific Pharmacodynamics & Peptide Glossary | PepStack Labs",
  description:
    "Authoritative biomedical definitions of peptide terms, receptor mechanisms (GLP-1, GIP, GHRH), kinetics, and laboratory reconstitution standards.",
}

export default async function GlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "PepStack Labs Biomedical & Peptide Research Glossary",
    description:
      "Comprehensive scientific glossary containing biomedical definitions of peptide receptor mechanisms, pharmacokinetics, and reconstitution chemistry.",
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Google DefinedTermSet JSON-LD Structured SEO Schema */}
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
            <span className="font-semibold text-emerald-800">Glossary</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Scientific Reference Lexicon · Peer-Reviewed Standards
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              A–Z Scientific Pharmacodynamics &amp; Peptide Glossary
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Authoritative definitions of receptor families, pharmacokinetic kinetics, and analytical
              reconstitution chemistry. Grounded in peer-reviewed scientific literature and international pharmacopeias.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <GlossaryDirectory />
      </div>
    </div>
  )
}
