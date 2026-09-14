import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders().catch(() => null)

  if (!orders) {
    return null
  }

  return (
    <div className="w-full space-y-6" data-testid="orders-page-wrapper">
      {/* Clinical Section Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Dispatches &amp; Orders
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Research Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Nationwide express courier dispatches, automated payment verifications, and protocol access tokens.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-colors"
            >
              Order New Compounds &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      <OrderOverview orders={orders} />
      <TransferRequestForm />
    </div>
  )
}
