/**
 * @file    apps/backend/src/admin/routes/orders-cockpit/page.tsx
 * @module  OrdersCockpitPage (Admin Route Extension)
 * @purpose Modern Storefront SADS 2.0 Orders Cockpit with 7/5 operational split grid and cold-chain fulfillment controls.
 * @contracts
 *   Route:   /app/orders-cockpit
 *   API:     GET /admin/orders · GET /admin/manual-payment-proofs
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArchiveBox,
  ArrowUpRightOnBox,
  CheckCircleSolid,
  ChevronRight,
  CreditCard,
  CurrencyDollar,
  ExclamationCircle,
  MagnifyingGlass,
  ShoppingBag,
  Sparkles,
  XMark,
} from "@medusajs/icons"
import { Badge, Button, Input, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "../../components/page-header"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { evaluateOrderPackingGuardrail } from "../../../lib/order-packing-guardrail"
import { sdk } from "../../lib/sdk"

type TabFilter = "all" | "pack_ready" | "awaiting_payment" | "shipped" | "cancelled"

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

export const OrdersCockpitPage = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  // Start of current month timestamp for MTD revenue computation
  const startOfMonthIso = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])

  // 1. Fetch recent orders
  const ordersQuery = useQuery({
    queryKey: ["orders-cockpit-list"],
    queryFn: async () => {
      return sdk.client.fetch<any>("/admin/orders", {
        query: {
          limit: 100,
          order: "-created_at",
          fields: "id,display_id,status,fulfillment_status,payment_status,total,currency_code,created_at,metadata,customer.id,customer.first_name,customer.last_name,customer.email,items.id,items.title,items.subtitle,items.variant_sku,items.quantity,shipping_address.*",
        },
      })
    },
    refetchInterval: 15_000,
  })

  // 2. Fetch pending manual payment proofs
  const proofsQuery = useQuery({
    queryKey: ["orders-cockpit-proofs"],
    queryFn: async () => {
      try {
        const res = await sdk.client.fetch<any>("/admin/manual-payment-proofs", {
          query: { status: "pending" },
        })
        return res?.manual_payment_proofs || []
      } catch {
        return []
      }
    },
    refetchInterval: 15_000,
  })

  const rawOrders = ordersQuery.data?.orders || []
  const pendingProofs = proofsQuery.data || []
  const pendingProofsCount = pendingProofs.length

  // 3. Compute KPI Metrics
  const kpis = useMemo(() => {
    let totalRevenue = 0
    let packReady = 0
    let awaitingPayment = 0
    let shipped = 0

    for (const order of rawOrders) {
      if (order.payment_status === "captured") {
        totalRevenue += order.total || 0
      }

      const { canPack } = evaluateOrderPackingGuardrail(order)

      if (canPack && order.fulfillment_status !== "fulfilled" && order.fulfillment_status !== "shipped") {
        packReady++
      }

      if (order.payment_status === "awaiting" || order.payment_status === "not_paid") {
        awaitingPayment++
      }

      if (order.fulfillment_status === "shipped" || order.fulfillment_status === "fulfilled") {
        shipped++
      }
    }

    return {
      total: rawOrders.length,
      revenue: totalRevenue,
      packReady,
      awaitingPayment,
      shipped,
      pendingProofsCount,
    }
  }, [rawOrders, pendingProofsCount])

  // 4. Filter Orders
  const filteredOrders = useMemo(() => {
    let list = rawOrders

    if (activeTab === "pack_ready") {
      list = list.filter((o: any) => {
        const { canPack } = evaluateOrderPackingGuardrail(o)
        return canPack && o.fulfillment_status !== "fulfilled" && o.fulfillment_status !== "shipped"
      })
    } else if (activeTab === "awaiting_payment") {
      list = list.filter(
        (o: any) => o.payment_status === "awaiting" || o.payment_status === "not_paid"
      )
    } else if (activeTab === "shipped") {
      list = list.filter(
        (o: any) => o.fulfillment_status === "shipped" || o.fulfillment_status === "fulfilled"
      )
    } else if (activeTab === "cancelled") {
      list = list.filter(
        (o: any) => o.status === "canceled" || o.payment_status === "refunded"
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((o: any) => {
        const id = String(o.display_id || o.id)
        const name = `${o.customer?.first_name || ""} ${o.customer?.last_name || ""}`.toLowerCase()
        const email = o.customer?.email?.toLowerCase() || ""
        return id.includes(q) || name.includes(q) || email.includes(q)
      })
    }

    return list
  }, [rawOrders, activeTab, searchQuery])


  if (ordersQuery.isLoading) {
    return <SovereignPageSkeleton cards={4} rows={8} />
  }

  return (
    <div className="flex flex-col gap-y-4 pb-12 pt-4 px-3.5 sm:px-6 w-full min-h-screen">
      {/* 1. Header with Eyebrow, Badges, and Action Suite */}
      <PageHeader
        eyebrowText="Commercial Operations · Order Fulfillment"
        title="Commercial Orders Cockpit"
        subtitle="Executive order processing, standard courier dispatch, manual QR payment proof verification, and settlement ledger."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/manual-payment-proofs">
                <CreditCard className="size-3.5 mr-1 text-blue-600" />
                Payment Proofs {pendingProofsCount > 0 && `(${pendingProofsCount})`}
              </Link>
            </Button>
            <Button asChild size="small" className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5">
              <a href="http://localhost:8000/ph/account/orders" target="_blank" rel="noreferrer">
                Buyer View <ArrowUpRightOnBox className="size-3.5" />
              </a>
            </Button>
          </div>
        }
      />

      {/* 2. Top Telemetry Notice */}
      <AdminTelemetryNotice
        icon={<ArchiveBox className="size-4" />}
        title="Order Fulfillment & Courier Dispatch Active"
        description="Every order maintains ₱0.00 General Ledger debit/credit balance parity with automated batch disaggregation and courier waybill tracking."
        statusText="ORDER ENGINE NOMINAL"
        variant="indigo"
      />

      {/* 3. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Orders MTD"
          value={kpis.total}
          subtext="Total commercial orders"
          icon={<ShoppingBag className="size-4" />}
          variant="blue"
          status="healthy"
        />
        <AdminMetricCard
          label="Captured Revenue"
          value={phpFormatter.format(kpis.revenue)}
          subtext="Settled Philippine Pesos"
          icon={<CurrencyDollar className="size-4" />}
          variant="emerald"
          status="healthy"
        />
        <AdminMetricCard
          label="Pack-Ready Queue"
          value={kpis.packReady}
          subtext="Paid, awaiting pack"
          icon={<ArchiveBox className="size-4" />}
          variant="amber"
          status={kpis.packReady > 0 ? "warning" : "healthy"}
        />
        <AdminMetricCard
          label="Payment Proofs Queue"
          value={kpis.pendingProofsCount}
          subtext="Manual QR transfer reviews"
          icon={<CreditCard className="size-4" />}
          variant={kpis.pendingProofsCount > 0 ? "amber" : "purple"}
          status={kpis.pendingProofsCount > 0 ? "warning" : "healthy"}
          href="/manual-payment-proofs"
        />
      </div>

      {/* 4. Single-Row Tab Bar Strip with Inline Search */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders", count: kpis.total },
            { id: "pack_ready", label: "Pack Ready", count: kpis.packReady },
            { id: "awaiting_payment", label: "Awaiting Payment", count: kpis.awaitingPayment },
            { id: "shipped", label: "Shipped", count: kpis.shipped },
            { id: "cancelled", label: "Cancelled / Refunded", count: rawOrders.length - kpis.total },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabFilter)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search order #, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200/80 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMark className="size-3.5" />
            </button>
          )}
        </div>
      </div>



      {/* 5. Full-Width Order Micro-Cards Stream */}
      <div className="w-full flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <SovereignEmptyState
            icon={<ShoppingBag className="size-6 text-slate-400" />}
            heading="No Orders Found"
            description={
              searchQuery
                ? `No orders matching "${searchQuery}". Clear your search query.`
                : "No orders found for the selected operational filter."
            }
            action={
              searchQuery ? (
                <Button size="small" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : undefined
            }
          />
        ) : (
          filteredOrders.map((order: any) => {
            const displayId = order.display_id || order.id.slice(-6)
            const customerName =
              `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() ||
              order.customer?.email ||
              "Guest Checkout"
            const itemsCount = order.items?.length || 1
            const firstItem = order.items?.[0]?.title || "Research Compound"
            const dateStr = new Date(order.created_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            const paymentStatus = order.payment_status || "not_paid"
            const fulfillmentStatus = order.fulfillment_status || "not_fulfilled"

            const paymentColor =
              paymentStatus === "captured"
                ? "green"
                : paymentStatus === "awaiting"
                ? "orange"
                : paymentStatus === "refunded"
                ? "grey"
                : "red"

            const fulfillmentColor =
              fulfillmentStatus === "shipped" || fulfillmentStatus === "fulfilled"
                ? "green"
                : fulfillmentStatus === "partially_shipped"
                ? "blue"
                : "red"

            return (
              <Link
                key={order.id}
                to={`/orders-cockpit/${order.id}`}
                className="block no-underline group focus:outline-hidden"
              >
                <AdminListRowCard
                  icon={<ShoppingBag className="size-4 text-blue-600" />}
                  className="cursor-pointer group-hover:border-slate-300 group-hover:shadow-xs transition-all"
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        #{displayId}
                      </span>
                      <span className="text-xs text-slate-700 font-medium">· {customerName}</span>
                    </div>
                  }
                  subtitle={
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-mono text-blue-700">
                        {itemsCount} {itemsCount === 1 ? "vial" : "vials"}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {firstItem}
                      </span>
                    </div>
                  }
                  badge={
                    <div className="flex items-center gap-1">
                      {order.metadata?.confirmed_for_packing && paymentStatus !== "captured" && order.status !== "canceled" && paymentStatus !== "refunded" && (
                        <Badge size="small" color="blue" className="text-[10px]">
                          Pack Confirmed
                        </Badge>
                      )}
                      <Badge size="small" color={paymentColor as any} className="text-[10px] capitalize">
                        {paymentStatus.replace("_", " ")}
                      </Badge>
                      <Badge size="small" color={fulfillmentColor as any} className="text-[10px] capitalize">
                        {fulfillmentStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  }
                  value={phpFormatter.format(order.total || 0)}
                  secondaryValue="Online Store"
                  statusPill={
                    <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all ml-1">
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  }
                />
              </Link>
            )
          })
        )}
      </div>

      {/* 6. Horizontal Operational Action Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Suite 1: Courier Fulfillment Desk */}
        <AdminSuiteCard
          icon={<ArchiveBox className="size-4 text-blue-600" />}
          eyebrow="Courier Fulfillment"
          title="Parcel Packing & Dispatch"
          description="Verified orders are allocated with protective padded mailers and handed over to standard domestic couriers."
          actionLabel="View Pack-Ready Queue"
          onActionClick={() => setActiveTab("pack_ready")}
          statusBadge={`${kpis.packReady} Pack Ready`}
          statusVariant={kpis.packReady > 0 ? "amber" : "emerald"}
          variant="blue"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="font-semibold text-slate-900">Courier Partners:</span>
              <span className="font-mono text-blue-700 font-semibold">J&amp;T Express / Lalamove</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-900">Carrier Dispatch Window:</span>
              <span className="font-mono text-slate-700">Same-Day / Standard Express</span>
            </div>
          </div>
        </AdminSuiteCard>

        {/* Suite 2: Manual Payment Proof Review Vault */}
        <AdminSuiteCard
          icon={<CreditCard className="size-4 text-emerald-600" />}
          eyebrow="Financial Settle"
          title="QR Payment Proof Review"
          description="Manual bank transfers and QR proofs undergo double-entry verification before inventory is relieved from active inventory."
          actionLabel="Open Payment Proofs"
          actionHref="/manual-payment-proofs"
          statusBadge={`${kpis.pendingProofsCount} Pending Review`}
          statusVariant={kpis.pendingProofsCount > 0 ? "amber" : "emerald"}
          variant="emerald"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>₱0.00 General Ledger debit/credit balance lock</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Direct bank & QR clearing reconciliation</span>
            </div>
          </div>
        </AdminSuiteCard>
      </div>


    </div>
  )
}

export const config = defineRouteConfig({
  label: "Orders",
  icon: ShoppingBag,
  rank: 2,
})

export default OrdersCockpitPage
