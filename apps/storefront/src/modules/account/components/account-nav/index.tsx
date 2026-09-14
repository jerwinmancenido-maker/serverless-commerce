"use client"

import {
  ArchiveBox,
  BellAlert,
  ChatBubble,
  CogSixTooth,
  Gift,
  User,
} from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type AccountNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  badge?: number
}

const AccountNav = ({
  customer,
  unreadNotificationsCount = 0,
}: {
  customer: HttpTypes.StoreCustomer | null
  researchTrackingAvailable?: boolean
  unreadNotificationsCount?: number
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const navItems: AccountNavItem[] = [
    { href: "/account", label: "Home", icon: User, exact: true },
    { href: "/account/orders", label: "Orders", icon: ArchiveBox },
    { href: "/account/rewards", label: "Rewards", icon: Gift },
    {
      href: "/account/notifications",
      label: "Notifications",
      icon: BellAlert,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { href: "/account/settings", label: "Profile & Settings", icon: CogSixTooth },
    { href: "/account/support", label: "Support", icon: ChatBubble },
  ]

  const clientGreeting = (() => {
    if (!customer?.first_name) return "Client"
    const first = customer.first_name.trim()
    if (first.toLowerCase().startsWith("dr")) {
      return `${first} ${customer.last_name || ""}`.trim()
    }
    return first
  })()

  const initials = (() => {
    const first = customer?.first_name?.replace(/^dr\.?\s*/i, "").trim() || ""
    const last = customer?.last_name?.trim() || ""
    const firstChar = first.charAt(0).toUpperCase()
    const lastChar = last.charAt(0).toUpperCase()
    return `${firstChar}${lastChar}` || "RC"
  })()

  return (
    <nav aria-label="Order and Account Navigation" className="w-full">
      {/* Authoritative Clinical Identity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-200/80 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs shrink-0 border border-slate-700/50">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Laboratory Client Portal
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Lab Researcher
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
                RUO Standard
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {clientGreeting}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed in as{" "}
              <span className="font-semibold text-slate-700 font-mono">
                {customer?.email}
              </span>
              <span className="hidden md:inline"> · Region: PH (₱) · Encrypted Privacy</span>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs">
          <LocalizedClientLink
            href="/account/support"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ChatBubble className="h-3.5 w-3.5 text-slate-400" />
            <span>Support Desk</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Horizontal Tabs Navigation */}
      <ul className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar w-full">
        {navItems.map((item) => {
          const localizedHref = `/${countryCode}${item.href}`
          const active = item.exact
            ? route === localizedHref
            : route.startsWith(localizedHref)
          const Icon = item.icon

          return (
            <li key={item.href} className="shrink-0">
              <LocalizedClientLink
                href={item.href}
                className={clx(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-all duration-150 cursor-pointer",
                  {
                    "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold":
                      active,
                    "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent font-medium":
                      !active,
                  }
                )}
              >
                <Icon
                  className={clx(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-emerald-600" : "text-slate-400"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <span
                    className={clx(
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default AccountNav


