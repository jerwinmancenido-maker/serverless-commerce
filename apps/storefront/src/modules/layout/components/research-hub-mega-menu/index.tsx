"use client"

/**
 * @file    apps/storefront/src/modules/layout/components/research-hub-mega-menu/index.tsx
 * @module  ResearchHubMegaMenuComponent (Storefront Layout)
 * @purpose Researcher portal mega menu with 50% compressed, high-density clinical layout.
 */

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  Beaker,
  ArchiveBox,
  CheckCircleSolid,
  ShieldCheck,
  LockClosedSolid,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

type ResearchHubMegaMenuProps = {
  isOpen: boolean
  onClose: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  signedIn?: boolean
  customer?: HttpTypes.StoreCustomer | null
}

const PROTOCOL_ITEMS = [
  {
    name: "My Protocols",
    href: "/account/research-hub?section=protocols",
    tag: "Regimens",
  },
  {
    name: "Daily Dosing Schedule",
    href: "/account/research-hub?section=schedule",
    tag: "Compliance",
  },
  {
    name: "Researcher Community",
    href: "/account/community",
    tag: "Peer Review",
  },
]

const INVENTORY_ITEMS = [
  {
    name: "Vials & Stability Tracker",
    href: "/account/research-hub?section=supplies",
    tag: "Stability",
  },
  {
    name: "Subject Biometrics",
    href: "/account/research-hub?section=progress",
    tag: "Curves",
  },
  {
    name: "Privacy & Agreements",
    href: "/account/settings/privacy",
    tag: "Privacy",
  },
]

export default function ResearchHubMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  signedIn = false,
  customer = null,
}: ResearchHubMegaMenuProps) {
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
          data-testid="researcher-portal-mega-menu"
          className="absolute top-full inset-x-0 z-40 bg-white border-b border-slate-200/90 shadow-2xl text-slate-900"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="content-container py-3.5 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header Title Bar (Compact 24px) */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white shadow-2xs">
                  <ShieldCheck className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Researcher Workspace &amp; Subject Telemetry
                </span>
              </div>
              <LocalizedClientLink
                href="/account/research-hub"
                onClick={onClose}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group"
              >
                <span>Enter Workspace Dashboard</span>
                <ArrowRightMini className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </LocalizedClientLink>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Protocols & Dosing (4 cols) */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-3 lg:pb-0 lg:pr-6">
                <div className="flex items-center gap-1.5 mb-2">
                  <Beaker className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Protocols &amp; Regimens
                  </span>
                </div>

                <div className="space-y-1.5">
                  {PROTOCOL_ITEMS.map((item) => (
                    <LocalizedClientLink
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-xs"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                          {item.tag}
                        </span>
                        <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* Column 2: Inventory & Telemetry (4 cols) */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-3 lg:pb-0 lg:pr-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ArchiveBox className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Inventory &amp; Telemetry
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                    Stability
                  </span>
                </div>

                <div className="space-y-1.5">
                  {INVENTORY_ITEMS.map((item) => (
                    <LocalizedClientLink
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all text-xs"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                          {item.tag}
                        </span>
                        <ArrowRightMini className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* Column 3: Authenticated Workspace Drawer (4 cols) */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                {signedIn ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Authenticated Workspace
                      </span>
                      {customer?.first_name ? (
                        <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">
                          {customer.first_name.toLowerCase().startsWith("dr")
                            ? `${customer.first_name} ${customer.last_name || ""}`.trim()
                            : `Dr. ${customer.first_name}`}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <LocalizedClientLink
                        href="/account/research-hub"
                        onClick={onClose}
                        className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Launch Full Research Hub</span>
                        </div>
                        <ArrowRightMini className="h-3.5 w-3.5" />
                      </LocalizedClientLink>

                      <div className="grid grid-cols-2 gap-1.5">
                        <LocalizedClientLink
                          href="/calculator"
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          <span className="truncate">Calculator</span>
                          <ArrowRightMini className="h-3 w-3 text-slate-400 group-hover:text-emerald-600" />
                        </LocalizedClientLink>

                        <LocalizedClientLink
                          href="/account/orders"
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          <span className="truncate">Orders &amp; Rec</span>
                          <ArrowRightMini className="h-3 w-3 text-slate-400 group-hover:text-emerald-600" />
                        </LocalizedClientLink>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <LockClosedSolid className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Client Laboratory Portal
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xs border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Private Research Suite</span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-400 border border-emerald-500/30">
                          Sign-In
                        </span>
                      </div>
                      <LocalizedClientLink
                        href="/account"
                        onClick={onClose}
                        className="mt-2 flex items-center justify-between rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        <span>Sign In to Access Hub</span>
                        <ArrowRightMini className="h-3.5 w-3.5" />
                      </LocalizedClientLink>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Strip (Compact 24px) */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Client Privacy &amp; Encrypted Research Records
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                  Laboratory Stability &amp; Aseptic Guidelines
                </span>
              </div>
              <LocalizedClientLink
                href="/account/settings/privacy"
                onClick={onClose}
                className="font-semibold text-slate-700 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                <span>Privacy &amp; Data Controls</span>
                <span>→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </Transition>
    </>
  )
}
