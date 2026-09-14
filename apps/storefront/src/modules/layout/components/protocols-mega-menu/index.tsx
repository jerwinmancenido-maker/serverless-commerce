"use client"

import { Transition } from "@headlessui/react"
import {
  ArrowDownTray,
  ArrowRightMini,
  Beaker,
  CheckCircleSolid,
  DocumentText,
  Sparkles,
  SquaresPlus,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

import { getNavMetrics } from "@lib/data/navigation-data"

type ProtocolsMegaMenuProps = {
  isOpen: boolean
  onClose: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const STOICHIOMETRY_TOOLS = [
  {
    name: "Reconstitution & Dilution Calculator",
    desc: "Bacteriostatic diluent stoichiometry, exact mass-to-volume math & target concentration",
    href: "/research-library#calculator",
    badge: "Stoichiometry",
  },
  {
    name: "U-100 Syringe Visualizer & Calibration",
    desc: "31G Low Dead Space (LDS) physics, barrel selection & graduation unit tick conversion",
    href: "/learn/syringe-guide",
    badge: "U-100 Units",
  },
  {
    name: "Peptide Stacks & Synergy Studio",
    desc: "Multi-compound compatibility matrix, receptor cross-talk analysis & 7-day dosing schedule",
    href: "/research-stacks",
    badge: "Stacks Studio",
  },
]

export default function ProtocolsMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProtocolsMegaMenuProps) {
  const metrics = getNavMetrics()

  const dosingAndProtocols = [
    {
      name: "Master Peptide Dosage Matrix",
      desc: `${metrics.totalCompounds} verified analytical compounds with microgram/milligram ranges, titration & half-lives`,
      href: "/dosage-chart",
      badge: `${metrics.totalCompounds} Compounds`,
    },
    {
      name: "Analytical Protocols Directory",
      desc: `${metrics.totalCompounds} monograph-backed reconstitution protocols with solvent volumes & preservation rules`,
      href: "/research-protocols",
      badge: `${metrics.totalCompounds} Protocols`,
    },
    {
      name: "Clinical Trial Titration Benchmarks",
      desc: "Verified titration schedules from SURPASS-2, STEP-1, and TRIUMPH Phase 3 trials",
      href: "/dosage-chart#clinical-trials",
      badge: "Phase 3 Trials",
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
              {/* Column 1: Stoichiometry & Interactive Engines */}
              <div className="md:col-span-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  {/* High-Visibility Quick-Action Card: All Calculators */}
                  <LocalizedClientLink
                    href="/research-library#calculator"
                    onClick={onClose}
                    className="group mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 p-3 hover:border-emerald-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                        <Beaker className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          All Research Calculators
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Stoichiometry &amp; dosing engines (3 tools)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View All</span>
                      <ArrowRightMini className="h-4 w-4" />
                    </div>
                  </LocalizedClientLink>

                  <div className="flex items-center gap-2 mb-3">
                    <Beaker className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Stoichiometry &amp; Calculators
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {STOICHIOMETRY_TOOLS.map((tool) => (
                      <li key={tool.name}>
                        <LocalizedClientLink
                          href={tool.href}
                          onClick={onClose}
                          className="group flex flex-col rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {tool.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                              {tool.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {tool.desc}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 2: Clinical Dosing & Protocols */}
              <div className="md:col-span-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  {/* High-Visibility Quick-Action Card: Full Dosage Matrix */}
                  <LocalizedClientLink
                    href="/dosage-chart"
                    onClick={onClose}
                    className="group mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 p-3 hover:border-emerald-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                        <DocumentText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Full Dosage Matrix
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Complete reference ({metrics.totalCompounds} compounds)
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
                      Dosing &amp; Clinical Protocols
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {dosingAndProtocols.map((item) => (
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

              {/* Column 3: Document Control & High-Fidelity SOP Export */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <SquaresPlus className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Document Control &amp; Export
                    </h3>
                  </div>

                  {/* Printable SOP Dossier Card */}
                  <LocalizedClientLink
                    href="/research-protocols"
                    onClick={onClose}
                    className="group block rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200 p-4 hover:border-emerald-300 transition-all mb-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                          <ArrowDownTray className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          High-Fidelity PDF SOP Dossiers
                        </span>
                      </div>
                      <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instant vector %PDF-1.4 binary downloads with analytical laboratory headers, U-100 syringe conversions, and QA sign-off blocks.
                    </p>
                  </LocalizedClientLink>

                  {/* Multi-Compound Stack SOP Quick Link */}
                  <LocalizedClientLink
                    href="/research-stacks"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors mb-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Multi-Compound Stack Dossiers
                        </span>
                        <span className="text-xs text-slate-500">
                          Synergy matrices &amp; synchronized 7-day calendars
                        </span>
                      </div>
                    </div>
                    <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-all" />
                  </LocalizedClientLink>

                  {/* Beyond Use Date Stability Link */}
                  <LocalizedClientLink
                    href="/learn/storage-guide"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm text-emerald-600 font-bold">⏱️</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Aqueous Stability &amp; Storage Matrix
                        </span>
                        <span className="text-xs text-slate-500">
                          Reconstituted refrigerated stability quarantine windows
                        </span>
                      </div>
                    </div>
                    <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-all" />
                  </LocalizedClientLink>
                </div>

                {/* Analytical QA Standards Box */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Analytical Laboratory &amp; GLP Document Control Standard</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Pure TypeScript Vector %PDF-1.4 · Zero Dependencies</span>
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
