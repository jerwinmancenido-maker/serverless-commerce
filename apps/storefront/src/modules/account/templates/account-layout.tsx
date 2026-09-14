"use client"

import React from "react"
import { usePathname } from "next/navigation"

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
    <div className="flex-1 py-8 sm:py-10 bg-slate-50/40 min-h-screen" data-testid="account-page">
      <div className="content-container flex flex-col min-h-[calc(100vh-220px)]">
        {customer && !isResearchHub && (
          <div className="mb-8">
            <AccountNav
              customer={customer}
              researchTrackingAvailable={researchTrackingAvailable}
              unreadNotificationsCount={unreadNotificationsCount}
            />
          </div>
        )}

        {setupRequired && (
          <div className="mb-8 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 sm:p-5 text-xs text-amber-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse mt-1 sm:mt-0 shrink-0" />
              <div>
                <p className="font-bold text-amber-950 text-sm">One-Time Clinical Research Agreement Required</p>
                <p className="text-amber-800/90 mt-0.5">Finish the one-time account update to activate all private Research Hub features and protocol tracking.</p>
              </div>
            </div>
            <LocalizedClientLink
              href="/account/complete-setup"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-900 text-white px-4 py-2 text-xs font-bold hover:bg-amber-950 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <span>Continue setup</span>
              <span aria-hidden="true">&rarr;</span>
            </LocalizedClientLink>
          </div>
        )}

        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Laboratory Support Desk Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-200/90 rounded-2xl bg-white p-5 sm:p-6 shadow-2xs mt-16 gap-6 print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Verified Laboratory Support
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Need Research or Logistics Assistance?
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Our dedicated client support desk assists with verified order tracking, nationwide dispatch updates, and analytical compound monographs.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LocalizedClientLink
              href="/account/support"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
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

