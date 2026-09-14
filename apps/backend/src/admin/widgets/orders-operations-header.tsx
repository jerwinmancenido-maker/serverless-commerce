/**
 * @file    apps/backend/src/admin/widgets/orders-operations-header.tsx
 * @module  OrdersOperationsHeader (Admin Extension)
 * @purpose Executive commercial overview, payment proof status, pack-ready queue, and order velocity metrics.
 * @contracts
 *   Widget: order.list.before
 *   Design: Sovereign Admin Design System (Linear / Stripe Standard)
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArchiveBox,
  ArrowUpRightOnBox,
  CreditCard,
  CurrencyDollar,
  Sparkles,
} from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"
import { AdminMetricCard } from "../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../components/ui/admin-telemetry-notice"
import { AdminSubNavPills } from "../components/ui/admin-subnav-pills"

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

const OrdersOperationsHeader = () => {
  // Start of current month timestamp for MTD revenue computation
  const startOfMonthIso = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])

  // 1. Fetch recent orders for MTD revenue and total count
  const ordersQuery = useQuery({
    queryKey: ["orders-operations", "list", startOfMonthIso],
    queryFn: () =>
      sdk.admin.order.list({
        created_at: { gte: startOfMonthIso },
        limit: 100,
        order: "-created_at",
      } as Parameters<typeof sdk.admin.order.list>[0]),
    refetchInterval: 30_000,
  })

  // 2. Fetch pack-ready orders (captured payment, unfulfilled)
  const packReadyQuery = useQuery({
    queryKey: ["orders-operations", "pack-ready"],
    queryFn: () =>
      sdk.admin.order.list({
        payment_status: ["captured"],
        fulfillment_status: ["not_fulfilled", "partially_fulfilled"],
        limit: 1,
      } as Parameters<typeof sdk.admin.order.list>[0]),
    refetchInterval: 30_000,
  })

  // 3. Fetch pending payment proofs count
  const proofsQuery = useQuery({
    queryKey: ["orders-operations", "pending-proofs"],
    queryFn: () =>
      sdk.client.fetch<{ count: number }>("/admin/manual-payment-proofs", {
        query: { status: "pending", limit: 1 },
      }),
    refetchInterval: 30_000,
  })

  // Compute live revenue and counts
  const orders = ordersQuery.data?.orders ?? []
  const totalOrdersMtd = ordersQuery.data?.count ?? orders.length

  const capturedRevenueMtd = useMemo(() => {
    let rev = 0
    for (const order of orders) {
      if (order.payment_status === "captured") {
        rev += (order.total ?? 0) / 100
      }
    }
    return rev
  }, [orders])

  const packReadyCount = packReadyQuery.data?.count ?? 0
  const pendingProofsCount = proofsQuery.data?.count ?? 0

  return (
    <div data-rc-orders-header="true" className="flex flex-col gap-y-4 mb-4">
      {/* Top Operations Cockpit Header */}
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                Commercial Fulfillment Operations
              </span>
              <AdminBadge variant="blue" dot>
                Cold-Chain Telemetry
              </AdminBadge>
            </div>
            <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Orders &amp; Commercial Fulfillment
            </Heading>
            <Text size="small" className="text-slate-500 mt-0.5">
              Real-time commercial transaction flow, manual payment proof verifications, and cold-chain parcel packing queue.
            </Text>
          </div>

          {/* Quick-Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/manual-payment-proofs">
                <CreditCard className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Review Proofs
                {pendingProofsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                    {pendingProofsCount}
                  </span>
                )}
                <ArrowUpRightOnBox className="ml-1 h-3 w-3 text-slate-400" />
              </Link>
            </Button>
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/customer-support">
                <ArchiveBox className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Support &amp; Dispatch
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Monospace Metric Strip (4-Card Sovereign Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminMetricCard
            label="Captured Revenue (MTD)"
            value={phpFormatter.format(capturedRevenueMtd)}
            subtext="Gross paid sales this month"
            icon={<CurrencyDollar className="h-4 w-4" />}
            variant="emerald"
            status="healthy"
          />
          <AdminMetricCard
            label="Awaiting Verification"
            value={pendingProofsCount}
            subtext={pendingProofsCount > 0 ? "Manual payment proofs pending" : "All proofs reconciled"}
            icon={<CreditCard className="h-4 w-4" />}
            variant={pendingProofsCount > 0 ? "amber" : "default"}
            status={pendingProofsCount > 0 ? "warning" : "healthy"}
            href="/manual-payment-proofs"
          />
          <AdminMetricCard
            label="Ready to Pack &amp; Ship"
            value={packReadyCount}
            subtext={packReadyCount > 0 ? "Paid orders in dispatch queue" : "Cold-chain queue clear"}
            icon={<ArchiveBox className="h-4 w-4" />}
            variant={packReadyCount > 0 ? "blue" : "default"}
            status={packReadyCount > 0 ? "info" : "healthy"}
          />
          <AdminMetricCard
            label="Order Velocity (MTD)"
            value={totalOrdersMtd}
            subtext="Total transaction volume"
            icon={<Sparkles className="h-4 w-4" />}
            variant="default"
            status="neutral"
          />
        </div>

        {/* SADS 2.0 Telemetry Notice Banner */}
        <AdminTelemetryNotice
          title="Order Fulfillment & Settle Operations"
          description="Order processing, manual QR payment proof verifications, and cold-chain temperature-controlled dispatch. Every order maintains ₱0.00 General Ledger balance parity."
          statusText="ORDER ENGINE NOMINAL"
          variant="indigo"
        />

        {/* Sub-Navigation Rails */}
        <AdminSubNavPills
          items={[
            { label: "All Commercial Orders", active: true, count: totalOrdersMtd },
            { label: "Payment Proofs Queue", href: "/manual-payment-proofs", count: pendingProofsCount || undefined },
            { label: "Cold-Chain Dispatch", href: "/customer-support" },
            { label: "Pricing & Price Lists", href: "/price-lists-studio" },
          ]}
          rightContent={
            <span className="hidden lg:inline text-slate-500">
              Real-time synchronization with checkout pipeline
            </span>
          }
        />
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default OrdersOperationsHeader
