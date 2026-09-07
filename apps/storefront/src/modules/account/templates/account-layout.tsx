"use client"

import React from "react"
import { usePathname } from "next/navigation"

import UnderlineLink from "@modules/common/components/interactive-link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  researchTrackingAvailable: boolean
  setupRequired: boolean
  unreadNotificationsCount?: number
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  researchTrackingAvailable,
  setupRequired,
  unreadNotificationsCount = 0,
  children,
}) => {
  const pathname = usePathname()
  const isResearchHub = pathname?.includes("/account/research-hub")

  return (
    <div className="flex-1 py-6 small:py-10" data-testid="account-page">
      <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-[calc(100vh-220px)]">
        {customer && !isResearchHub && (
          <div className="mb-6">
            <AccountNav
              customer={customer}
              researchTrackingAvailable={researchTrackingAvailable}
              unreadNotificationsCount={unreadNotificationsCount}
            />
          </div>
        )}

        {setupRequired && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-small-regular text-amber-900">
            Finish the one-time account update to use all Research Hub
            features.{" "}
            <UnderlineLink href="/account/complete-setup">
              Continue setup
            </UnderlineLink>
          </div>
        )}

        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Laboratory Support Desk Bar */}
        <div className="flex flex-col small:flex-row items-start small:items-center justify-between border-t border-slate-200/80 pt-8 mt-12 gap-6 print:hidden">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Need Research or Logistics Assistance?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our dedicated client support desk assists with verified order tracking, cold-chain logistics, and compound monographs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LocalizedClientLink
              href="/account/support"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Client Support Desk</span>
              <span aria-hidden="true">&rarr;</span>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout

