import { Metadata } from "next"
import { EditorialPolicyView } from "@modules/research-library/components/editorial-policy-view"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Editorial Policy & Scientific Standards | PepStack Labs",
  description:
    "Analytical quality standards, PubMed literature grounding, RP-HPLC ≥99.0% purity benchmarks, and in vitro laboratory governance for PepStack Labs research monographs.",
  openGraph: {
    title: "Editorial Policy & Scientific Standards | PepStack Labs",
    description:
      "Peer-reviewed literature standards, CAS/PubChem verification, and third-party analytical testing governance.",
    type: "website",
  },
}

export default async function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
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
            <span className="font-semibold text-emerald-800">Editorial Policy</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Scientific Governance &amp; Publishing Standards
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Editorial Policy &amp; Analytical Quality Standards
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              PepStack Labs operates under uncompromising analytical standards. Every monograph, dosage
              ratio, and stability threshold published on this platform is verified through primary
              peer-reviewed scientific literature and independent laboratory testing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container py-10">
        <EditorialPolicyView />
      </div>
    </div>
  )
}
