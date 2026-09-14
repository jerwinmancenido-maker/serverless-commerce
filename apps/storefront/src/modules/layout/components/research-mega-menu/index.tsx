"use client"

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  CheckCircleSolid,
  DocumentText,
  Sparkles,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

import { getNavMetrics } from "@lib/data/navigation-data"

type MegaMenuProps = {
  isOpen: boolean
  onClose: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const FEATURED_COA_RECORDS = [
  {
    title: "GHK-Cu Copper Tripeptide-1",
    lot: "Lot #PH8-GHK-2026B",
    purity: "Reference Standard",
    desc: "In-Vitro Reference Standard · Lyophilized Formulation",
    href: "/research-library#coa",
  },
  {
    title: "BPC-157 Gastric Pentadecapeptide",
    lot: "Lot #BPC-2026-03",
    purity: "Reference Standard",
    desc: "In-Vitro Reagent · Protective Nitrogen Purge",
    href: "/research-library#coa",
  },
  {
    title: "Tirzepatide Dual Incretin Co-Agonist",
    lot: "Lot #TZP-2026-01",
    purity: "Reference Standard",
    desc: "Laboratory Grade · Sealed Borosilicate Glass",
    href: "/research-library#coa",
  },
]

export default function ResearchMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const metrics = getNavMetrics()

  const laboratorySOPs = [
    {
      name: "Syringe & Volumetric Measurement Guide",
      desc: "U-100 insulin syringe capacities (0.3mL, 0.5mL, 1.0mL), 31G needle physics & Low Dead Space waste minimization",
      href: "/learn/syringe-guide",
      badge: "U-100 Standard",
    },
    {
      name: "Aseptic Reconstitution & Solvent Guide",
      desc: "4-step clean-bench technique, bacteriostatic water USP vs 0.6% acetic acid & vacuum equalization",
      href: "/learn/reconstitution-guide",
      badge: "Solvent SOP",
    },
    {
      name: "Storage & Degradation Matrix",
      desc: "Aqueous stability quarantine, 2°C–8°C refrigerated & -20°C cryo peptide preservation",
      href: "/learn/storage-guide",
      badge: "Stability",
    },
    {
      name: "Beginner's Clean-Bench SOP",
      desc: "Aseptic workstation preparation, sterile handling protocols & particulate visual inspection",
      href: "/learn/beginners-guide",
      badge: "Aseptic Prep",
    },
    {
      name: "A–Z Scientific Glossary",
      desc: "Comprehensive reference of peptide chemistry, receptor pharmacology & formulation terms",
      href: "/learn/glossary",
      badge: `${metrics.totalGlossaryTerms} Terms`,
    },
  ]

  const scientificMonographs = [
    {
      name: `Scientific Monographs (${metrics.totalArticles} Articles)`,
      desc: "Peer-reviewed pharmacology, mechanism of action, receptor affinities & biochemical pathways",
      href: "/monographs",
      badge: `${metrics.totalArticles} Monographs`,
    },
    {
      name: "Head-to-Head Peptide Comparisons",
      desc: `${metrics.totalComparisons} empirical comparisons: Tirzepatide vs Retatrutide, BPC-157 vs TB-500, Tesamorelin vs CJC`,
      href: "/comparisons",
      badge: `${metrics.totalComparisons} Studies`,
    },
    {
      name: "Scientific Editorial & Evidence Policy",
      desc: "Tri-Shield anti-hallucination standards, PubMed verification & deterministic literature locks",
      href: "/editorial-policy",
      badge: "Peer Reviewed",
    },
    {
      name: "Frequently Asked Questions (FAQ)",
      desc: "Answers to scientific protocols, delivery mechanisms, vial storage & handling",
      href: "/faq",
      badge: "FAQ",
    },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 top-[96px] z-30 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div
          className="absolute top-full inset-x-0 z-40 bg-white border-b border-slate-200 shadow-2xl text-slate-900"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="content-container py-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Column 1: Laboratory SOPs & Clean-Bench Guides */}
              <div className="md:col-span-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  {/* High-Visibility Quick-Action Card: All SOPs & Guides */}
                  <LocalizedClientLink
                    href="/learn"
                    onClick={onClose}
                    className="group mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 p-3 hover:border-emerald-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                        <DocumentText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          All SOPs &amp; Guides
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Complete clean-bench reference library (5 guides)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View All</span>
                      <ArrowRightMini className="h-4 w-4" />
                    </div>
                  </LocalizedClientLink>

                  <div className="flex items-center gap-2 mb-3">
                    <DocumentText className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Laboratory SOPs &amp; Guides
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {laboratorySOPs.map((sop) => (
                      <li key={sop.name}>
                        <LocalizedClientLink
                          href={sop.href}
                          onClick={onClose}
                          className="group flex flex-col rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {sop.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                              {sop.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {sop.desc}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 2: Scientific Monographs & Comparisons */}
              <div className="md:col-span-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  {/* High-Visibility Quick-Action Card: Full Research Library */}
                  <LocalizedClientLink
                    href="/research-library"
                    onClick={onClose}
                    className="group mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 p-3 hover:border-emerald-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Full Research Library
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {metrics.totalArticles} monographs &amp; {metrics.totalComparisons} comparisons
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View All</span>
                      <ArrowRightMini className="h-4 w-4" />
                    </div>
                  </LocalizedClientLink>

                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Scientific Monographs &amp; Studies
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {scientificMonographs.map((item) => (
                      <li key={item.name}>
                        <LocalizedClientLink
                          href={item.href}
                          onClick={onClose}
                          className="group flex flex-col rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {item.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {item.desc}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 3: Certificates of Analysis (CoA) Vault */}
              <div className="md:col-span-4 flex flex-col">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Certificates of Analysis (CoA)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                      Batch Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 px-1">
                    Analytical laboratory documentation with compound monographs, molecular details, and preparation guidelines.
                  </p>

                  <ul className="space-y-1">
                    {FEATURED_COA_RECORDS.map((rec) => (
                      <li key={rec.title}>
                        <LocalizedClientLink
                          href={rec.href}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col pr-2">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {rec.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-600">
                                {rec.lot}
                              </span>
                              <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-semibold">
                                {rec.purity}
                              </span>
                            </div>
                          </div>
                          <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  )
}
