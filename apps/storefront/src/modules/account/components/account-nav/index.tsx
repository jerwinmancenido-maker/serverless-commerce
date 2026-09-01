"use client"

import { ArchiveBox, ArrowRightOnRectangle, Beaker, Gift, User } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AccountNav = ({
  customer,
  researchTrackingAvailable,
}: {
  customer: HttpTypes.StoreCustomer | null
  researchTrackingAvailable: boolean
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const items = [
    { href: "/account", label: "Home", icon: User, exact: true },
    ...(researchTrackingAvailable
      ? [{ href: "/account/research-hub", label: "Research Hub", icon: Beaker }]
      : []),
    { href: "/account/orders", label: "Orders", icon: ArchiveBox },
    { href: "/account/rewards", label: "Rewards", icon: Gift },
    { href: "/account/settings", label: "Profile & Settings", icon: User },
  ]

  return (
    <nav aria-label="Customer account" className="mb-8 small:mb-0 small:pr-8">
      <p className="mb-4 text-base-semi">Hello {customer?.first_name}</p>
      <ul className="flex gap-2 overflow-x-auto pb-2 small:flex-col small:overflow-visible">
        {items.map((item) => {
          const localizedHref = `/${countryCode}${item.href}`
          const active = item.exact ? route === localizedHref : route.startsWith(localizedHref)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <LocalizedClientLink
                href={item.href}
                className={clx(
                  "flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base",
                  { "bg-ui-bg-subtle font-semibold text-ui-fg-base": active },
                )}
              >
                <Icon />
                {item.label}
              </LocalizedClientLink>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => signout(countryCode)}
            className="flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
          >
            <ArrowRightOnRectangle />
            Log out
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default AccountNav
