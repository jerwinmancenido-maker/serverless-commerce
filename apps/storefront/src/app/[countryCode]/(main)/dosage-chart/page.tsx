import { Metadata } from "next"
import { MasterPeptideDosageChart } from "@modules/research-protocols/components/master-peptide-dosage-chart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Peptide Dosage & Reconstitution Chart | Analytical Reference Matrix | PepStack Labs",
  description:
    "Comprehensive pharmacodynamic dosage, diluent reconstitution volumes, concentration ratios, and U-100 syringe units for 88 verified analytical research peptides and synergistic formulations.",
  openGraph: {
    title: "Peptide Dosage & Reconstitution Chart | Analytical Reference Matrix",
    description:
      "High-density reference standards for 88 verified analytical peptides with live U-100 syringe unit graduations and reconstitution volumes.",
    type: "website",
  },
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function DosageChartPage({ params }: Props) {
  const { countryCode } = await params

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "PepStack Labs Pharmacodynamic Peptide Dosage & Reconstitution Matrix",
    description:
      "Comprehensive analytical dataset containing reconstitution volumes, concentration ratios, and U-100 syringe conversions for 88 verified research peptides.",
    keywords: [
      "peptide dosage chart",
      "reconstitution calculator",
      "bacteriostatic water",
      "U-100 syringe units",
      "BPC-157 dosage",
      "Semaglutide dosage",
      "Tirzepatide dosage",
    ],
    creator: {
      "@type": "Organization",
      name: "PepStack Labs",
    },
    isAccessibleForFree: true,
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Google Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Clinical Header Banner */}
      <div className="border-b border-slate-200 bg-slate-50/80 pt-8 pb-8 sm:pt-12 sm:pb-10 print:hidden">
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
            <span className="font-semibold text-emerald-800">Master Dosage Chart</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Dataset Reference Standard · In Vitro Titration Matrix
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Master Peptide Dosage &amp; Reconstitution Matrix
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              High-density reference standards for 88 verified analytical peptides and synergistic formulations.
              Live U-100 syringe unit calibrations, reconstitution concentrations, and pharmacodynamic half-lives sourced directly from published monographs.
            </p>
          </div>
        </div>
      </div>

      {/* Master Table Container */}
      <div className="content-container py-10">
        <MasterPeptideDosageChart countryCode={countryCode} />
      </div>
    </div>
  )
}
