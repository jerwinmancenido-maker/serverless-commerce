"use client"

/**
 * @file    apps/storefront/src/modules/layout/components/tools-menu/index.tsx
 * @module  ToolsMenuComponent (Storefront Layout)
 * @purpose Laboratory tools mega menu with 50% compressed, high-density clinical layout.
 */

import { Fragment } from "react"
import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  CheckCircleSolid,
  SquaresPlus,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getNavMetrics } from "@lib/data/navigation-data"

type ToolsMenuProps = {
  isOpen: boolean
  onClose: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function ToolsMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ToolsMenuProps) {
  const metrics = getNavMetrics()

  const allTools = [
    {
      name: "Reconstitution Calculator",
      desc: "Interactive Stoichiometry",
      href: "/calculator",
      icon: "📐",
    },
    {
      name: "Master Dosage Matrix",
      desc: `${metrics.totalCompounds} Peptides · 88 Protocols`,
      href: "/dosage-chart",
      icon: "📊",
    },
    {
      name: "Stacks & Synergy Studio",
      desc: "Synergy & Safety Engine",
      href: "/research-stacks",
      icon: "⚡",
    },
    {
      name: "Custom Multi-Vial Kit Builder",
      desc: "Multi-Vial Configurator",
      href: "/custom-kit-builder",
      icon: "🧰",
    },
    {
      name: "U-100 Syringe Visualizer",
      desc: "Volumetric Calibration Guide",
      href: "/learn/syringe-guide",
      icon: "💉",
    },
    {
      name: "Storage & Stability Matrix",
      desc: "Refrigerated Stability (2°C–8°C)",
      href: "/learn/storage-guide",
      icon: "❄️",
    },
    {
      name: "Solvent Chemistry & SOP",
      desc: "BAC Water, Diluent Matching",
      href: "/learn/reconstitution-guide",
      icon: "💧",
    },
    {
      name: "Clean-Bench SOP Hub",
      desc: "All 5 Laboratory SOP Guides",
      href: "/learn",
      icon: "🔬",
    },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 top-[92px] z-30 bg-slate-950/60 backdrop-blur-xs transition-opacity"
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
          data-testid="tools-mega-menu"
          className="absolute top-full inset-x-0 z-40 bg-white border-b border-slate-200/90 shadow-2xl text-slate-900"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="content-container py-3.5 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header Title (Compact 24px) */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white shadow-2xs">
                  <SquaresPlus className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Calculators &amp; Laboratory Standards
                </span>
              </div>
              <LocalizedClientLink
                href="/research-library"
                onClick={onClose}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group"
              >
                <span>Browse Research Library Hub</span>
                <ArrowRightMini className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </LocalizedClientLink>
            </div>

            {/* High-Density 4-Column x 2-Row Matrix (~80px content height) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {allTools.map((tool) => (
                <LocalizedClientLink
                  key={tool.name}
                  href={tool.href}
                  onClick={onClose}
                  className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-sm shrink-0 border border-slate-200/60 group-hover:bg-emerald-50 group-hover:border-emerald-200/60 transition-colors">
                      {tool.icon}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate leading-tight">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors truncate leading-tight mt-0.5">
                        {tool.desc}
                      </span>
                    </div>
                  </div>
                  <ArrowRightMini className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </LocalizedClientLink>
              ))}
            </div>

            {/* Bottom Strip (Compact 24px) */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                  Analytical Reference Rigor
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                  Aseptic Clean-Bench Standards
                </span>
              </div>
              <LocalizedClientLink
                href="/dosage-chart"
                onClick={onClose}
                className="font-semibold text-slate-700 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                <span>View Full Titration Chart</span>
                <span>→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </Transition>
    </>
  )
}
