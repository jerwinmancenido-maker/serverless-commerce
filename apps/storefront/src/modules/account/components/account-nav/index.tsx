"use client"

import {
  ArchiveBox,
  ArrowRightOnRectangle,
  Beaker,
  BellAlert,
  ChatBubble,
  ChatBubbleLeftRight,
  CogSixTooth,
  Gift,
  User,
} from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type AccountNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  badge?: number
}

type AccountNavGroup = {
  title: string
  items: AccountNavItem[]
}

const AccountNav = ({
  customer,
  researchTrackingAvailable,
  unreadNotificationsCount = 0,
}: {
  customer: HttpTypes.StoreCustomer | null
  researchTrackingAvailable: boolean
  unreadNotificationsCount?: number
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const navGroups: AccountNavGroup[] = [
    {
      title: "Commerce & Orders",
      items: [
        { href: "/account", label: "Home", icon: User, exact: true },
        { href: "/account/orders", label: "Orders", icon: ArchiveBox },
        { href: "/account/rewards", label: "Rewards", icon: Gift },
        {
          href: "/account/notifications",
          label: "Notifications",
          icon: BellAlert,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
      ],
    },
    {
      title: "Research & Protocols",
      items: [
        ...(researchTrackingAvailable
          ? [
              { href: "/account/research-hub", label: "Research Hub", icon: Beaker },
            ]
          : []),
        { href: "/account/community", label: "Community", icon: ChatBubbleLeftRight },
      ],
    },
    {
      title: "Account & Settings",
      items: [
        { href: "/account/settings", label: "Profile & Settings", icon: CogSixTooth },
        { href: "/account/support", label: "Support", icon: ChatBubble },
      ],
    },
  ]

  const researcherGreeting = (() => {
    if (!customer?.first_name) return "Researcher"
    const first = customer.first_name.trim()
    if (first.toLowerCase().startsWith("dr")) {
      return `${first} ${customer.last_name || ""}`.trim()
    }
    return first
  })()

  return (
    <nav aria-label="Customer account" className="mb-8 small:mb-0 small:pr-6">
      <div className="mb-4 pb-3 border-b border-slate-200/80">
        <p className="text-xs text-slate-400 font-medium">Researcher Portal</p>
        <p className="text-sm font-extrabold text-slate-900 truncate">
          Hello {researcherGreeting}
        </p>
      </div>

      {/* Desktop Grouped Navigation */}
      <div className="hidden small:flex flex-col space-y-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const localizedHref = `/${countryCode}${item.href}`
                const active = item.exact
                  ? route === localizedHref
                  : route.startsWith(localizedHref)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <LocalizedClientLink
                      href={item.href}
                      className={clx(
                        "flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                        {
                          "bg-slate-900 font-bold text-white shadow-xs": active,
                          "text-slate-600 hover:bg-slate-100 hover:text-slate-900":
                            !active,
                        }
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={clx(
                            "h-4 w-4 shrink-0",
                            active ? "text-emerald-400" : "text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
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
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Scrolling Navigation */}
      <div className="small:hidden">
        <ul className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {navGroups
            .flatMap((g) => g.items)
            .map((item) => {
              const localizedHref = `/${countryCode}${item.href}`
              const active = item.exact
                ? route === localizedHref
                : route.startsWith(localizedHref)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <LocalizedClientLink
                    href={item.href}
                    className={clx(
                      "flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                      {
                        "bg-slate-900 font-bold text-white shadow-xs": active,
                        "text-slate-600 hover:bg-slate-100 hover:text-slate-900":
                          !active,
                      }
                    )}
                  >
                    <Icon
                      className={clx(
                        "h-4 w-4",
                        active ? "text-emerald-400" : "text-slate-400"
                      )}
                    />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </LocalizedClientLink>
                </li>
              )
            })}
        </ul>
      </div>

      {/* Secondary Account Session Divider & Safe Sign Out */}
      <div className="mt-4 pt-3 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => signout(countryCode)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <ArrowRightOnRectangle className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default AccountNav
