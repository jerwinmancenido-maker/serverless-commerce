"use client"

/**
 * @file    apps/storefront/src/modules/layout/components/category-mega-menu/index.tsx
 * @module  CategoryMegaMenuComponent (Storefront Layout)
 * @purpose Product categories mega menu dropdown with 50% compressed, high-density clinical layout.
 */

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  Beaker,
  BuildingStorefront,
  CheckCircleSolid,
  Sparkles,
  SquaresPlus,
  ArchiveBox,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useRef, useEffect } from "react"

import {
  getFeaturedNavCompounds,
  getNavCategories,
  getNavMetrics,
} from "@lib/data/navigation-data"

type MegaMenuProps = {
  isOpen: boolean
  onClose: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function CategoryMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const metrics = getNavMetrics()
  const categories = getNavCategories()
  const featuredCompounds = getFeaturedNavCompounds()
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

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
          ref={menuContainerRef}
          data-testid="category-mega-menu"
          className="absolute top-full inset-x-0 z-40 bg-white border-b border-slate-200/90 shadow-2xl text-slate-900"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="content-container py-3.5 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header bar / Eyebrow (Compact 24px) */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white shadow-2xs">
                  <SquaresPlus className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Classifications &amp; Reference Standards
                </span>
              </div>
              <LocalizedClientLink
                href="/store"
                onClick={onClose}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group"
              >
                <span>Explore Full Catalog ({metrics.totalCompounds})</span>
                <ArrowRightMini className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </LocalizedClientLink>
            </div>

            {/* 3-Column High-Density Matrix (~136px content height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: 8 Pharmacological Classes in 2x4 single-line grid (5 cols) */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:pr-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pharmacological Classes ({categories.length})
                  </span>
                  <LocalizedClientLink
                    href="/categories"
                    onClick={onClose}
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ArrowRightMini className="h-3 w-3" />
                  </LocalizedClientLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <LocalizedClientLink
                      key={cat.href}
                      href={cat.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all text-xs"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-emerald-700 truncate pr-1">
                        {cat.shortName || cat.name}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 group-hover:text-emerald-700 bg-slate-100 group-hover:bg-emerald-50 border border-slate-200/60 rounded px-1.5 py-0.2 shrink-0">
                        {cat.count}
                      </span>
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* Column 2: 4 Core Flagship Standards (4 cols single-line) */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:pr-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BuildingStorefront className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Flagship Standards
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    RUO Reference
                  </span>
                </div>

                <div className="space-y-1.5">
                  {featuredCompounds.map((comp) => (
                    <LocalizedClientLink
                      key={comp.href}
                      href={comp.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-xs"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate pr-2">
                        {comp.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded px-1.5 py-0.2">
                          {comp.tag}
                        </span>
                        <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* Column 3: Reagent Tools & Support (3 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Reagent Tools &amp; Desk
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <LocalizedClientLink
                      href="/calculator"
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-emerald-50/80 border border-emerald-200/70 transition-all text-xs font-semibold text-emerald-900 bg-emerald-50/40"
                    >
                      <div className="flex items-center gap-2">
                        <span>📐</span>
                        <span>Reconstitution Calculator</span>
                      </div>
                      <ArrowRightMini className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                    </LocalizedClientLink>

                    <LocalizedClientLink
                      href="/research-library"
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-xs font-medium text-slate-700 hover:text-emerald-700"
                    >
                      <div className="flex items-center gap-2">
                        <Beaker className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Research Library &amp; Guides</span>
                      </div>
                      <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </LocalizedClientLink>

                    <LocalizedClientLink
                      href="/categories/research-supplies-accessories"
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-xs font-medium text-slate-700 hover:text-emerald-700"
                    >
                      <div className="flex items-center gap-2">
                        <ArchiveBox className="h-3.5 w-3.5 text-slate-500" />
                        <span>Sterile Consumables &amp; Labware</span>
                      </div>
                      <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </LocalizedClientLink>

                    <LocalizedClientLink
                      href="/account/support"
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-xs font-medium text-slate-700 hover:text-emerald-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>Custom Formulation Desk</span>
                      </div>
                      <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Logistics Strip (Compact 24px) */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                  Dispatched in protective cushioning &middot; J&amp;T Express Nationwide
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                  Metro Manila Logistics Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span>Instant Payment:</span>
                <span className="text-emerald-700 font-semibold">GCash &bull; Maya &bull; QR Ph</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  )
}
