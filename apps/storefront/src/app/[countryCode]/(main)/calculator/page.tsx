/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/calculator/page.tsx
 * @module  ReconstitutionCalculatorPage (Storefront)
 * @purpose Flagship standalone reconstitution console, diluent stoichiometry station,
 *          and calibrated micro-syringe unit visualizer.
 */

import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"
import StandaloneReconstitutionCalculator from "@modules/research-protocols/standalone-calculator"

export const metadata: Metadata = {
  title: "Peptide Reconstitution & Dilution Calculator | Analytical Precision Stoichiometry | PepStack Labs",
  description:
    "Universal peptide reconstitution calculator. Calculate exact bacteriostatic water volume, vial concentration, dose-to-syringe units, and micro-liter draw for 88+ analytical research compounds.",
  openGraph: {
    title: "Peptide Reconstitution & Dilution Calculator | Analytical Stoichiometry",
    description:
      "Interactive reconstitution console and U-100 syringe unit visualizer for research peptide reconstitution and precision dosing math.",
    type: "website",
  },
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ReconstitutionCalculatorPage({ params }: Props) {
  const { countryCode: _countryCode } = await params

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PepStack Labs Peptide Reconstitution & Dilution Calculator",
    applicationCategory: "HealthApplication",
    description:
      "Precision stoichiometric calculation engine for lyophilized peptide reconstitution, diluent volume determination, and syringe unit conversion.",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    creator: {
      "@type": "Organization",
      name: "PepStack Labs",
    },
    isAccessibleForFree: true,
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20">
      {/* Google Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-white pt-8 pb-8 sm:pt-10 sm:pb-10 print:hidden shadow-2xs">
        <div className="content-container">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
            <LocalizedClientLink href="/" className="hover:text-emerald-700 transition-colors">
              Home
            </LocalizedClientLink>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <LocalizedClientLink href="/research-library" className="hover:text-emerald-700 transition-colors">
              Research Library
            </LocalizedClientLink>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900">Reconstitution Calculator</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <span>📐 Precision Benchtop Utility</span>
                <span>·</span>
                <span>88+ Presets</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Peptide Reconstitution &amp; Syringe Calculator
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Determine exact bacteriostatic water (BAC) diluent requirements, target concentration per milliliter, and micro-syringe tick mark calibrations for subcutaneous, intranasal, and oral research formulations.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <LocalizedClientLink
                href="/dosage-chart"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <span>📊 Dosage Matrix</span>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/learn/syringe-guide"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <span>💉 Syringe Guide</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator Engine Container */}
      <div className="content-container py-8 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
          <StandaloneReconstitutionCalculator />
        </div>
      </div>
    </div>
  )
}
