"use client"

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  BuildingStorefront,
  SquaresPlus,
  Beaker,
  DocumentText,
  CheckCircleSolid,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

type MegaMenuProps = {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = [
  {
    name: "Metabolic & GLP-1",
    desc: "Tirzepatide, Semaglutide & incretin mimetics",
    href: "/categories/metabolic-weight-management-peptides",
  },
  {
    name: "Healing & Tissue Repair",
    desc: "BPC-157, TB-500 & regenerative peptides",
    href: "/categories/healing-tissue-repair-peptides",
  },
  {
    name: "Growth Hormone Axis",
    desc: "Tesamorelin, CJC-1295 & secretagogues",
    href: "/categories/growth-hormone-recovery-peptides",
  },
  {
    name: "Longevity & Cellular Health",
    desc: "GHK-Cu, Epithalon & cellular rejuvenation",
    href: "/categories/longevity-cellular-health-peptides",
  },
  {
    name: "Supplies & Accessories",
    desc: "Bacteriostatic (BAC) water, syringes & vials",
    href: "/categories/research-supplies-accessories",
  },
]

const FEATURED_COMPOUNDS = [
  {
    title: "Tirzepatide (10mg)",
    tag: "Dual Incretin",
    desc: "GIP / GLP-1 receptor dual agonist reference vial",
    href: "/products/tirzepatide",
  },
  {
    title: "BPC-157 (5mg)",
    tag: "Tissue Repair",
    desc: "Pentadecapeptide for tissue repair & gut research",
    href: "/products/bpc-157",
  },
  {
    title: "Tesamorelin (10mg)",
    tag: "GH Secretagogue",
    desc: "Synthetic GHRH analog for lipodystrophy research",
    href: "/categories/growth-hormone-recovery-peptides",
  },
  {
    title: "GHK-Cu (50mg SubQ Set)",
    tag: "Copper Peptide",
    desc: "Complete peptide vial & reconstitution set",
    href: "/products/ghk-cu",
  },
]

export default function CategoryMegaMenu({ isOpen, onClose }: MegaMenuProps) {
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
              {/* Column 1: Research Categories */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <SquaresPlus className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Research Categories
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <li key={cat.href}>
                        <LocalizedClientLink
                          href={cat.href}
                          onClick={onClose}
                          className="group flex flex-col rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {cat.name}
                          </span>
                          <span className="text-xs text-slate-500 line-clamp-1">
                            {cat.desc}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/categories"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Browse all compound categories</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 2: Featured Reference Compounds */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BuildingStorefront className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Featured Compounds
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {FEATURED_COMPOUNDS.map((comp) => (
                      <li key={comp.href}>
                        <LocalizedClientLink
                          href={comp.href}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {comp.title}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                                {comp.tag}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 line-clamp-1">
                              {comp.desc}
                            </span>
                          </div>
                          <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/store"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>View full peptide catalog</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 3: Research Utilities & Trust Card */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Research Utilities
                    </h3>
                  </div>

                  {/* Calculator Highlight Box */}
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
                      Instant BAC water dilution math, concentration per unit, and insulin syringe tick unit reference.
                    </p>
                  </LocalizedClientLink>

                  {/* Protocol Guides Link */}
                  <LocalizedClientLink
                    href="/research-library#protocols"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <DocumentText className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Research Protocol Guides
                        </span>
                        <span className="text-xs text-slate-500">
                          Dosage schedules, reconstitution &amp; storage data
                        </span>
                      </div>
                    </div>
                    <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-all" />
                  </LocalizedClientLink>
                </div>

                {/* Trust & Dispatch Signals */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Reference Grade Lyophilized Compounds</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Dispatched from Metro Manila &middot; J&amp;T Express</span>
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
