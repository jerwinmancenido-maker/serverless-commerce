import { Metadata } from "next"
import { ResearchFaqAccordion } from "@modules/research-library/components/research-faq-accordion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"
import { EDUCATIONAL_CONTENT } from "@lib/data/educational-content"

export const metadata: Metadata = {
  title: "Peptide FAQ: Reconstitution, Express Delivery & RUO Standards | PepStack Labs",
  description:
    "Frequently asked questions regarding peptide reconstitution, Bacteriostatic Water mixing, nationwide express logistics, and QR Ph payments.",
}

export default async function FaqPage() {
  const allFaqs = EDUCATIONAL_CONTENT.faq.flatMap((cat) => cat.questions)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Google FAQPage JSON-LD Structured SEO Schema */}
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
            <span className="font-semibold text-emerald-800">Support FAQ</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Frequently Asked Questions · Scientific Support Hub
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Laboratory Research &amp; Operations FAQ Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Authoritative answers regarding peptide reconstitution protocols, Bacteriostatic Water sterility,
              nationwide express courier logistics, and Philippine instant QR Ph settlements.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <ResearchFaqAccordion />
      </div>
    </div>
  )
}
