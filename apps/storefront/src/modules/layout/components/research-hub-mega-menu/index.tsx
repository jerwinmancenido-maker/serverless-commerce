"use client"

import { Transition } from "@headlessui/react"
import {
  ArrowRightMini,
  Beaker,
  ArchiveBox,
  CheckCircleSolid,
  ShieldCheck,
  LockClosedSolid,
  SquaresPlus,
  Calendar,
  ChartBar,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

type ResearchHubMegaMenuProps = {
  isOpen: boolean
  onClose: () => void
  signedIn?: boolean
  customer?: HttpTypes.StoreCustomer | null
}

const PROTOCOL_ITEMS = [
  {
    name: "My Protocols",
    desc: "Reconstitution ratios, vial concentrations & saved compound workflows",
    href: "/account/research-hub?section=protocols",
    tag: "Regimens",
  },
  {
    name: "Daily Dosing Schedule",
    desc: "Daily routine schedule, subject administration timestamps & completion logs",
    href: "/account/research-hub?section=schedule",
    tag: "Compliance",
  },
  {
    name: "Hub Overview & Subjects",
    desc: "Active vials in rotation, subject roster & reconstitution alerts",
    href: "/account/research-hub",
    tag: "Dashboard",
  },
]

const INVENTORY_ITEMS = [
  {
    name: "Vials & Stability Tracker",
    desc: "30-day post-reconstitution degradation countdown & refrigeration storage",
    href: "/account/research-hub?section=supplies",
    tag: "Cold Chain",
  },
  {
    name: "Subject Measurements & Biometrics",
    desc: "Continuous subject progress tracking, biomarker metrics & data curves",
    href: "/account/research-hub?section=progress",
    tag: "Sparklines",
  },
  {
    name: "Experimental Journal",
    desc: "Field observations, reaction notes & timestamped research entries",
    href: "/account/research-hub?section=progress#journal",
    tag: "Telemetry",
  },
]

export default function ResearchHubMegaMenu({
  isOpen,
  onClose,
  signedIn = false,
  customer = null,
}: ResearchHubMegaMenuProps) {
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
              {/* Column 1: Protocols & Dosing Management */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Protocol &amp; Regimen Suite
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 px-1">
                    Custom experimental dosing regimens, step-by-step preparation, and scheduled subject administrations.
                  </p>

                  <ul className="space-y-1">
                    {PROTOCOL_ITEMS.map((item) => (
                      <li key={item.href}>
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
                              {item.tag}
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

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/account/research-hub?section=protocols"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Manage experimental protocols &amp; routines</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 2: Inventory & Telemetry */}
              <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ArchiveBox className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Inventory &amp; Telemetry
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                      Cold Chain
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 px-1">
                    Reconstituted compound vial stability, subject biomarker progression, and laboratory observation logs.
                  </p>

                  <ul className="space-y-1">
                    {INVENTORY_ITEMS.map((item) => (
                      <li key={item.href}>
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
                              {item.tag}
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

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <LocalizedClientLink
                    href="/account/research-hub?section=supplies"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>View cold storage inventory &amp; stability data</span>
                    <ArrowRightMini className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Column 3: Client Portal Access & Security Banner */}
              <div className="md:col-span-4 flex flex-col justify-between">
                {signedIn ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Authenticated Workspace
                      </h3>
                    </div>

                    {/* Active Session Portal Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-50/90 via-slate-50/60 to-white border border-emerald-200 p-5 shadow-xs mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300/60">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active Session</span>
                        </span>
                        {customer?.first_name ? (
                          <span className="text-xs font-semibold text-slate-700">
                            {customer.first_name.toLowerCase().startsWith("dr")
                              ? `${customer.first_name} ${customer.last_name || ""}`.trim()
                              : `Dr. ${customer.first_name}`}
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        Private Research Suite
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Access real-time vial stability timers, active subject dosing schedules, and biometric progress curves.
                      </p>

                      <LocalizedClientLink
                        href="/account/research-hub"
                        onClick={onClose}
                        className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                      >
                        <span>Launch Full Research Hub</span>
                        <ArrowRightMini className="h-4 w-4" />
                      </LocalizedClientLink>
                    </div>

                    {/* Quick Tools Links */}
                    <div className="space-y-1.5">
                      <LocalizedClientLink
                        href="/research-library#calculator"
                        onClick={onClose}
                        className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <SquaresPlus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                          <span>Reconstitution &amp; Syringe Calculator</span>
                        </div>
                        <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </LocalizedClientLink>

                      <LocalizedClientLink
                        href="/account/orders"
                        onClick={onClose}
                        className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ArchiveBox className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                          <span>Compound Order History &amp; Tracking</span>
                        </div>
                        <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </LocalizedClientLink>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <LockClosedSolid className="h-4 w-4 text-slate-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Client Laboratory Portal
                      </h3>
                    </div>

                    {/* Sign-In Required Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 shadow-xl border border-slate-800 mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                          <LockClosedSolid className="h-3 w-3" />
                          <span>Sign-In Required</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">
                        Authenticated Research Suite
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Sign in to access your private reconstituted vial inventory, saved dosing regimens, and subject observation telemetry.
                      </p>

                      <LocalizedClientLink
                        href="/account"
                        onClick={onClose}
                        className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs font-bold transition-colors"
                      >
                        <span>Sign In to Access Hub</span>
                        <ArrowRightMini className="h-4 w-4" />
                      </LocalizedClientLink>
                    </div>

                    <div className="px-1">
                      <LocalizedClientLink
                        href="/store"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
                      >
                        <span>New researcher? Browse compound catalog</span>
                        <ArrowRightMini className="h-3.5 w-3.5" />
                      </LocalizedClientLink>
                    </div>
                  </div>
                )}

                {/* Analytical Quality & Security Box */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Encrypted Client Vault · Zero Data Leakage</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Philippine DPA 2012 &amp; RUO Standard Compliant</span>
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
