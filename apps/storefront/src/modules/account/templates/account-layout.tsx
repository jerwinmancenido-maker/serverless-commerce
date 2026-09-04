import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  researchTrackingAvailable: boolean
  setupRequired: boolean
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  researchTrackingAvailable,
  setupRequired,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 account-container h-full mx-auto bg-white flex flex-col">
        <div className="grid grid-cols-1 gap-x-8 small:grid-cols-[240px_1fr] lg:gap-x-12 xl:gap-x-16 py-12">
          <div>
            {customer && (
              <AccountNav
                customer={customer}
                researchTrackingAvailable={researchTrackingAvailable}
              />
            )}
          </div>
          <div className="flex-1">
            {setupRequired && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-small-regular text-amber-900">
                Finish the one-time account update to use all Research Hub
                features. <UnderlineLink href="/account/complete-setup">Continue setup</UnderlineLink>
              </div>
            )}
            {children}
          </div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
