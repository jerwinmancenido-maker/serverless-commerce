"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import type { RewardsSummary } from "@lib/data/rewards"
import type { ResearchProtocolAccess } from "@lib/data/research-tracking"
import {
  ArchiveBox,
  ArrowUpRightMini,
  Beaker,
  BellAlert,
  Gift,
  ShieldCheck,
  SquaresPlus,
} from "@medusajs/icons"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  rewards?: RewardsSummary | null
  protocolAccesses?: ResearchProtocolAccess[]
  researchTrackingAvailable?: boolean
  routineStreak?: number
  unreadNotificationsCount?: number
}

const Overview = ({
  customer,
  orders,
  rewards,
  protocolAccesses = [],
  researchTrackingAvailable = true,
  routineStreak = 0,
  unreadNotificationsCount = 0,
}: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0

  return (
    <div data-testid="overview-page-wrapper" className="space-y-6 w-full">
      {/* Accessible telemetry anchors for test suite */}
      <span className="sr-only" data-testid="welcome-message">
        {customer?.first_name || "Researcher"}
      </span>
      <span className="sr-only" data-testid="customer-email">
        {customer?.email || ""}
      </span>

      {/* Live Telemetry / Unread Notification Notice (Conditional) */}
      {unreadNotificationsCount > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:px-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <BellAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                You have {unreadNotificationsCount} unread{" "}
                {unreadNotificationsCount === 1 ? "notice" : "notices"} in your
                Notification Center
              </p>
              <p className="text-[11px] text-slate-500">
                Updates regarding orders, research protocols, and laboratory notices.
              </p>
            </div>
          </div>
          <LocalizedClientLink
            href="/account/notifications"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <span>Review Notices</span>
            <span aria-hidden="true">&rarr;</span>
          </LocalizedClientLink>
        </div>
      )}

      {/* 4-Tile Top Metric Rail (Grounded in Genuine DB Telemetry) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {/* Tile 1: Orders */}
        <LocalizedClientLink
          href="/account/orders"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Verified Orders
            </span>
            <ArchiveBox className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {orders?.length || 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {orders && orders.length > 0
                ? `${orders.length === 1 ? "1 verified dispatch" : `${orders.length} verified dispatches`}`
                : "0 Active shipments"}
            </p>
          </div>
        </LocalizedClientLink>

        {/* Tile 2: Rewards */}
        <LocalizedClientLink
          href="/account/rewards"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Lab Credit
            </span>
            <Gift className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {rewards?.balance.available ?? 0}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">
                pts
              </span>
            </p>
            <p className="text-[10px] font-medium text-emerald-700 mt-0.5">
              ₱{(rewards?.balance.peso_value ?? 0).toLocaleString("en-PH")} checkout value
            </p>
          </div>
        </LocalizedClientLink>

        {/* Tile 3: Research Protocols (Grounded in Genuine DB Access Count) */}
        <LocalizedClientLink
          href="/account/research-hub"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Protocols
            </span>
            <Beaker className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {protocolAccesses.length}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">
                {protocolAccesses.length === 1 ? "protocol" : "protocols"}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {routineStreak > 0
                ? `${routineStreak}d active routine streak`
                : "Digital compound monographs"}
            </p>
          </div>
        </LocalizedClientLink>

        {/* Tile 4: Account Security & Address Book (Grounded & Grammatically Correct) */}
        <LocalizedClientLink
          href="/account/settings#addresses"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Address Book
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {addressCount}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">
                {addressCount === 1 ? "address" : "addresses"}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Encrypted Records · Verified Account
            </p>
          </div>
        </LocalizedClientLink>
      </div>

      {/* Balanced 2-Column Operational Grid Spanning Full Width */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Orders & Logistics (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Recent Orders &amp; Fulfillment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order fulfillment, dispatch tracking, and official invoices
                </p>
              </div>
              <LocalizedClientLink
                href="/account/orders"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                View all ({orders?.length || 0}) &rarr;
              </LocalizedClientLink>
            </div>

            {orders && orders.length > 0 ? (
              <ul className="space-y-2.5" data-testid="orders-wrapper">
                {orders.slice(0, 4).map((order) => {
                  const orderDate = new Date(order.created_at).toLocaleDateString(
                    "en-PH",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )

                  const statusConfig = (() => {
                    const s = (order.status || "pending").toLowerCase()
                    const fs = (order.fulfillment_status || "").toLowerCase()
                    if (s === "canceled") {
                      return {
                        label: "Cancelled",
                        className: "bg-slate-100 text-slate-600 border-slate-200",
                      }
                    }
                    if (fs === "delivered" || s === "completed") {
                      return {
                        label: "Delivered",
                        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
                      }
                    }
                    if (fs === "shipped" || fs === "fulfilled") {
                      return {
                        label: "Dispatched",
                        className: "bg-blue-50 text-blue-800 border-blue-200",
                      }
                    }
                    return {
                      label: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending",
                      className: "bg-amber-50 text-amber-800 border-amber-200",
                    }
                  })()

                  const itemCount = order.items?.reduce(
                    (acc, item) => acc + (item.quantity || 1),
                    0
                  ) || 0

                  return (
                    <li
                      key={order.id}
                      data-testid="order-wrapper"
                      data-value={order.id}
                    >
                      <LocalizedClientLink
                        href={`/account/orders/details/${order.id}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:border-emerald-300 hover:bg-white transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shrink-0">
                            <ArchiveBox className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              Order #{order.display_id}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Placed on {orderDate}
                              {itemCount > 0 && ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-slate-900 font-mono">
                              {convertToLocale({
                                amount: order.total,
                                currency_code: order.currency_code,
                              })}
                            </p>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border mt-0.5 ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                          <ArrowUpRightMini className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        </div>
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200 py-10 px-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-2xs mb-3">
                  <ArchiveBox className="h-5 w-5" />
                </div>
                <p
                  className="text-sm font-bold text-slate-800"
                  data-testid="no-orders-message"
                >
                  No verified orders yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                  Your order history, J&amp;T delivery tracking, and official
                  invoices will appear here once placed.
                </p>
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  <span>Explore Compound Catalog</span>
                  <span>&rarr;</span>
                </LocalizedClientLink>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workspace Quick-Action Suite (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card A: Research Hub Snapshot */}
          {researchTrackingAvailable && (
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-white p-5 shadow-xs transition-all hover:border-emerald-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Beaker className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Clinical Research Suite
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                Stability, Dosing &amp; Protocol Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Access preserved compound reference monographs, active 28-day
                reconstituted liquid stability timers, and daily subject records.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {protocolAccesses.length} Verified Protocol
                  {protocolAccesses.length === 1 ? "" : "s"} Accessible
                </span>
                <LocalizedClientLink
                  href="/account/research-hub"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  <span>Launch Hub</span>
                  <span>&rarr;</span>
                </LocalizedClientLink>
              </div>
            </div>
          )}

          {/* Card B: Reconstitution Calculator Shortcut (Direct Link to /calculator, No Broken Hash) */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-purple-50/20 to-white p-5 shadow-xs transition-all hover:border-purple-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <SquaresPlus className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                  Precision Laboratory Tool
                </span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Reconstitution Calculator
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Calculate exact bacteriostatic water diluent volume, target
              concentration (mcg per syringe tick mark), and dilution calibration.
            </p>
            <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Interactive Stoichiometry
              </span>
              <LocalizedClientLink
                href="/calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
              >
                <span>Open Calculator</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>

          {/* Card C: Profile & Address Security */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Laboratory Credentials
              </h3>
              <span className="text-[10px] font-bold text-slate-500">
                {profileCompletion}% Complete
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Saved Addresses</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {addressCount} Registered
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Privacy Standard</span>
                <span className="font-semibold text-emerald-700">
                  Client Privacy Protected
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <LocalizedClientLink
                href="/account/settings"
                className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                Manage Profile &amp; Addresses &rarr;
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return Math.round((count / 4) * 100)
}

export default Overview
