"use client"

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  Beaker,
  DocumentText,
  CheckCircleSolid,
  SquaresPlus,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

type MegaMenuProps = {
  isOpen: boolean
  onClose: () => void
}

const RESEARCH_SECTIONS = [
  {
    name: "Scientific Monographs & Articles",
    desc: "Peer-reviewed literature, pharmacology & mechanisms of action",
    href: "/research-library#articles",
    tag: "Literature",
  },
  {
    name: "Head-to-Head Peptide Comparisons",
    desc: "Receptor affinity, efficacy metrics & clinical endpoint comparisons",
    href: "/research-library#comparisons",
    tag: "Comparative",
  },
  {
    name: "Preparation & Research Protocols",
    desc: "Step-by-step reconstitution, temperature & vial preservation rules",
    href: "/research-library#protocols",
    tag: "Protocols",
  },
]

const FEATURED_COA_RECORDS = [
  {
    title: "GHK-Cu Copper Tripeptide-1",
    lot: "Lot #PH8-GHK-2026B",
    purity: "≥99.34% HPLC",
    desc: "BioAnalytical Reference Standards · ESI Mass Verified",
    href: "/research-library#coa",
  },
  {
    title: "BPC-157 Gastric Pentadecapeptide",
    lot: "Lot #BPC-2026-03",
    purity: "≥99.42% HPLC",
    desc: "Reverse-Phase HPLC C18 · Endotoxin <0.02 EU/mg",
    href: "/research-library#coa",
  },
  {
    title: "Tirzepatide Dual Incretin Co-Agonist",
    lot: "Lot #TZP-2026-01",
    purity: "≥99.51% HPLC",
    desc: "High-Resolution HPLC 220nm · USP <71> Sterility Pass",
    href: "/research-library#coa",
  },
]

export default function ResearchMegaMenu({ isOpen, onClose }: MegaMenuProps) {
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
          onMouseLeave={onClose}
        >
          <div className="content-container py-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Column 1: Scientific Knowledge & Monographs */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <DocumentText className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Scientific Knowledge Base
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {RESEARCH_SECTIONS.map((sec) => (
                      <li key={sec.href}>
                        <LocalizedClientLink
                          href={sec.href}
                          onClick={onClose}
                          className="group flex flex-col rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {sec.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                              {sec.tag}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {sec.desc}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/research-library"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Browse complete open research repository</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 2: Certificates of Analysis (CoA) */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
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
                    Independent third-party analytical testing reports with HPLC chromatograms, mass spectrometry, and endotoxin verification.
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {rec.title}
                              </span>
                            </div>
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

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/research-library#coa"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Search all uploaded CoA document reports</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 3: Interactive Stoichiometry & Analytical Standards */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Interactive Research Utilities
                    </h3>
                  </div>

                  {/* Reconstitution Calculator Card */}
                  <LocalizedClientLink
                    href="/research-library#calculator"
                    onClick={onClose}
                    className="group block rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200 p-4 hover:border-emerald-300 transition-all mb-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
                          calc
                        </span>
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Reconstitution Calculator
                        </span>
                      </div>
                      <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instant BAC water dilution stoichiometry, exact mass-to-volume concentration, and U-100 insulin syringe tick reference.
                    </p>
                  </LocalizedClientLink>

                  {/* Protocols Quick Link */}
                  <LocalizedClientLink
                    href="/research-library#protocols"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <SquaresPlus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Preparation Protocols Directory
                        </span>
                        <span className="text-xs text-slate-500">
                          Solubility, temperature &amp; multi-day stability
                        </span>
                      </div>
                    </div>
                    <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-all" />
                  </LocalizedClientLink>
                </div>

                {/* Analytical Quality Assurance Box */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>ISO/IEC 17025:2017 Analytical Testing Standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Open Access Scientific Reference · No Paywalls</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  )
}
