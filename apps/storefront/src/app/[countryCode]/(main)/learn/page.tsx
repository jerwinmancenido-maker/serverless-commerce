/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/learn/page.tsx
 * @module  LearnPage (Storefront)
 * @purpose Laboratory SOPs, standard operating procedures, and clean-bench learning hub.
 */

import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight, ArrowRightMini } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Laboratory SOPs & Standard Operating Procedures | Clean-Bench Learning Hub | PepStack Labs",
  description:
    "Authoritative peer-reviewed clean-bench standard operating procedures (SOPs), aseptic reconstitution protocols, storage degradation matrix, and U-100 syringe volumetric anatomy.",
  openGraph: {
    title: "Laboratory SOPs & Standard Operating Procedures | PepStack Labs",
    description:
      "Peer-reviewed clean-bench standard operating procedures for peptide research and reconstitution.",
    type: "website",
  },
}

interface GuideCard {
  title: string
  subtitle: string
  description: string
  href: string
  badge: string
  badgeColor: string
  icon: string
  topics: string[]
}

const GUIDES: GuideCard[] = [
  {
    title: "Beginner's Clean-Bench SOP",
    subtitle: "Aseptic Workstation Preparation & Sterile Handling",
    description:
      "Step-by-step laboratory workflow for preparing an aseptic clean-bench area, sanitizing vial septums with 70% IPA, and inspecting lyophilized cakes for optical clarity.",
    href: "/learn/beginners-guide",
    badge: "Aseptic Prep",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "🔬",
    topics: [
      "70% Isopropyl Septum Disinfection",
      "Airflow & Workstation Sanitation",
      "Lyophilized Cake Visual Inspection",
      "Sterile PPE & Glove Technique",
    ],
  },
  {
    title: "Aseptic Reconstitution & Solvent Guide",
    subtitle: "Bacteriostatic Water USP vs. 0.6% Acetic Acid",
    description:
      "Precision solvent selection matrix, gentle vial wall hydration techniques, vacuum equalization mechanics, and dissolution rules for sensitive amino acid chains.",
    href: "/learn/reconstitution-guide",
    badge: "Solvent SOP",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    icon: "💧",
    topics: [
      "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "0.6% Sterile Acetic Acid for Alkaline Peptides",
      "Gentle Vacuum Release & Wall Hydration",
      "Non-Agitation Rolling Protocols",
    ],
  },
  {
    title: "Storage & Degradation Matrix",
    subtitle: "Aqueous Stability & Temperature Quarantine Matrix",
    description:
      "Thermal sensitivity protocols for lyophilized and reconstituted peptides. Covers -20°C deep-freeze desiccation, 2°C–8°C refrigerated storage, and freeze-thaw degradation prevention.",
    href: "/learn/storage-guide",
    badge: "Stability",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "❄️",
    topics: [
      "-20°C Long-Term Lyophilized Desiccation",
      "2°C–8°C 28-Day Stability Window",
      "Protection from UV & Optical Degradation",
      "Freeze-Thaw Shearing Mitigation",
    ],
  },
  {
    title: "U-100 Syringe Anatomy & Volumetric Guide",
    subtitle: "Barrel Selection, 31G Needle Physics & LDS Waste Minimization",
    description:
      "Comprehensive volumetric breakdown of U-100 insulin syringes (0.3 mL, 0.5 mL, 1.0 mL), tick mark resolution, parallax error prevention, and Low Dead Space (LDS) physics.",
    href: "/learn/syringe-guide",
    badge: "U-100 Standard",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "💉",
    topics: [
      "100 Units = 1.0 mL Volumetric Axiom",
      "0.3 mL Micro vs 0.5 mL Workhorse Barrels",
      "Low Dead Space (LDS) Plunger Physics",
      "Parallax & Reading Error Prevention",
    ],
  },
  {
    title: "A–Z Scientific Glossary",
    subtitle: "40+ Peer-Reviewed Analytical & Chemical Definitions",
    description:
      "Standardized scientific glossary covering pharmacokinetics, incretin pharmacology, HPLC chromatography, peptide bond stabilization, and stoichiometric mathematics.",
    href: "/learn/glossary",
    badge: "Terminology",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "📖",
    topics: [
      "Pharmacokinetics (Cmax, Tmax, Half-Life)",
      "HPLC Purity & Mass Spectrometry",
      "Stoichiometry & Molar Concentration",
      "Endotoxin & Aseptic Laboratory Standards",
    ],
  },
]

export default function LearnIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PepStack Labs Clean-Bench SOPs & Learning Hub",
    description:
      "Collection of laboratory standard operating procedures, aseptic reconstitution guides, and volumetric measurement documentation.",
    publisher: {
      "@type": "Organization",
      name: "PepStack Labs",
    },
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-slate-50/80 pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="content-container">
          {/* Breadcrumbs */}
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
            <span className="font-semibold text-emerald-800">Laboratory SOPs</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Standard Operating Procedures (SOPs) · Clean-Bench Reference
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Laboratory SOPs &amp; Clean-Bench Learning Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Peer-reviewed standard operating procedures for sterile handling, solvent chemistry, temperature maintenance, and high-precision U-100 micro-titration.
            </p>
          </div>
        </div>
      </div>

      {/* Main Directory Grid */}
      <div className="content-container py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDES.map((guide) => (
            <LocalizedClientLink
              key={guide.href}
              href={guide.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${guide.badgeColor}`}
                    >
                      {guide.badge}
                    </span>
                  </div>
                  <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {guide.title}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {guide.subtitle}
                </p>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {guide.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Key Laboratory Focus Areas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium bg-slate-50 border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center text-xs font-bold text-emerald-700 gap-1.5 pt-2">
                <span>Read Full SOP &rarr;</span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        {/* Cross-Link Callout Banner */}
        <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Interactive Stoichiometry Instruments
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Need Live Diluent Calculations or Syringe Calibration?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Use our live micro-plunger syringe visualizer and reconstitution console to compute exact fluid draws for 88 analytical compounds.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <LocalizedClientLink
              href="/research-library#calculator"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Reconstitution Console &rarr;
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/dosage-chart"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
            >
              Dosage Chart
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
