import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquaresPlus } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Container, DatePicker, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AdminCard } from "../../components/admin-card"
import { KpiCard } from "../../components/kpi-card"
import type { KpiStatus } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import type {
  BuildableProductRow,
  BuildableProductsResponse,
} from "../bom/types"

// ── Local response types ────────────────────────────────────────────────────

type ManualPaymentProofListResponse = {
  manual_payment_proofs: unknown[]
  count: number
}

type SupportConversation = {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  assigned_to_actor_id: string | null
  last_activity_at: string
  latest_message_preview: string
  unread_count: number
  waiting_since: string | null
  customer: { id: string; name: string; email: string } | null
}

type SupportConversationsResponse = {
  conversations: SupportConversation[]
  count: number
}

type ProtocolListResponse = {
  protocols: unknown[]
  count: number
}

type ReorderAlertItem = {
  inventory_item_id: string
  inventory_item_title: string
  category: string
  base_unit: string
  display_unit: string
  available_base_units: number
  reorder_threshold_base_units: number
  deficit_base_units: number
}

type ReorderAlertsResponse = {
  location: { id: string; name: string }
  below_threshold: ReorderAlertItem[]
  out_of_stock: ReorderAlertItem[]
  below_threshold_count: number
  out_of_stock_count: number
}

export type SalesTimeframe = "today" | "yesterday" | "7d" | "this_month" | "custom"

export type ChartDataPoint = {
  key: string
  label: string
  fullLabel: string
  revenuePesos: number
  orderCount: number
}

export type SalesSummaryMetrics = {
  totalRevenue: number
  totalOrders: number
  aov: number
  averagePace: number
  paceUnit: "day" | "hour"
  peakPoint: {
    label: string
    revenue: number
  } | null
}

// ── Status threshold helpers (pure, no side-effects) ───────────────────────

function ordersStatus(n: number): KpiStatus {
  return n > 10 ? "critical" : n > 5 ? "warning" : "healthy"
}

function proofsStatus(n: number): KpiStatus {
  return n > 5 ? "critical" : n > 2 ? "warning" : "healthy"
}

function supportStatus(n: number): KpiStatus {
  return n > 10 ? "critical" : n > 3 ? "warning" : "healthy"
}

function zeroStockStatus(n: number): KpiStatus {
  return n > 5 ? "critical" : n > 0 ? "warning" : "healthy"
}

function packReadyStatus(n: number): KpiStatus {
  return n > 10 ? "critical" : n > 3 ? "warning" : n > 0 ? "info" : "healthy"
}

function reorderStatus(below: number, outOf: number): KpiStatus {
  return outOf > 0 ? "critical" : below > 0 ? "warning" : "healthy"
}

// ── Formatters ──────────────────────────────────────────────────────────────

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

// NOTE: Medusa stores monetary amounts in the smallest currency unit (centavos
// for PHP). All order.total values are divided by 100 before formatting.
// If your store region is configured with 0 decimal places, remove the ÷ 100.
function formatPhp(amountInCentavos: number): string {
  return phpFormatter.format(amountInCentavos / 100)
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diffMs / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  })
}

// Duplicated from customer-support/page.tsx (~10 lines) to avoid a cross-route
// import that the eslint-plugin may flag. Extract to admin/lib/support-utils.ts
// if this pattern is needed in a third place.
function formatWaitingSince(waitingSince: string | null) {
  if (!waitingSince) return null
  const m = Math.floor(
    (Date.now() - new Date(waitingSince).getTime()) / 60_000,
  )
  if (m < 0) return null
  if (m < 60) {
    return { text: `${m}m`, color: m > 30 ? ("orange" as const) : ("grey" as const) }
  }
  const h = Math.floor(m / 60)
  return {
    text: `${h}h ${m % 60}m`,
    color: h >= 2 ? ("red" as const) : ("orange" as const),
  }
}

function paymentColor(status: string) {
  if (status === "captured") return "green" as const
  if (status === "awaiting" || status === "not_paid") return "orange" as const
  return "grey" as const
}

function fulfillmentColor(status: string) {
  if (["fulfilled", "shipped", "delivered"].includes(status)) {
    return "green" as const
  }
  if (status === "partially_fulfilled") return "orange" as const
  if (status === "canceled") return "red" as const
  return "grey" as const
}

function priorityColor(priority: string) {
  if (priority === "urgent") return "red" as const
  if (priority === "high") return "orange" as const
  return "grey" as const
}

// ── Chart timeline generation & aggregation (pure function) ─────────────────

function buildSalesTimeline(
  orders: HttpTypes.AdminOrder[],
  timeframe: SalesTimeframe,
  customRange?: { from: Date | null; to: Date | null },
): { data: ChartDataPoint[]; summary: SalesSummaryMetrics } {
  const now = new Date()
  let startDate = new Date(now)
  let endDate = new Date(now)
  let isHourly = false

  if (timeframe === "today") {
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    isHourly = true
  } else if (timeframe === "yesterday") {
    startDate.setDate(now.getDate() - 1)
    startDate.setHours(0, 0, 0, 0)
    endDate.setDate(now.getDate() - 1)
    endDate.setHours(23, 59, 59, 999)
    isHourly = true
  } else if (timeframe === "7d") {
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (timeframe === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (timeframe === "custom" && customRange?.from && customRange?.to) {
    startDate = new Date(customRange.from)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(customRange.to)
    endDate.setHours(23, 59, 59, 999)
    if (startDate.toDateString() === endDate.toDateString()) {
      isHourly = true
    }
  }

  const bucketMap = new Map<string, ChartDataPoint>()

  if (isHourly) {
    for (let h = 0; h < 24; h++) {
      const d = new Date(startDate)
      d.setHours(h, 0, 0, 0)
      const key = `${h}`
      const ampm = h >= 12 ? "PM" : "AM"
      const hour12 = h % 12 === 0 ? 12 : h % 12
      const label = `${hour12} ${ampm}`
      const fullLabel = `${d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} at ${label}`

      bucketMap.set(key, { key, label, fullLabel, revenuePesos: 0, orderCount: 0 })
    }
  } else {
    const cursor = new Date(startDate)
    while (cursor <= endDate) {
      const year = cursor.getFullYear()
      const month = String(cursor.getMonth() + 1).padStart(2, "0")
      const day = String(cursor.getDate()).padStart(2, "0")
      const key = `${year}-${month}-${day}`
      const label = cursor.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
      const fullLabel = cursor.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      bucketMap.set(key, { key, label, fullLabel, revenuePesos: 0, orderCount: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  let totalRevenue = 0
  let totalOrders = 0

  for (const order of orders) {
    if (order.payment_status !== "captured") continue

    const orderDate = new Date(order.created_at)
    if (orderDate < startDate || orderDate > endDate) continue

    let bucketKey: string
    if (isHourly) {
      bucketKey = `${orderDate.getHours()}`
    } else {
      const y = orderDate.getFullYear()
      const m = String(orderDate.getMonth() + 1).padStart(2, "0")
      const d = String(orderDate.getDate()).padStart(2, "0")
      bucketKey = `${y}-${m}-${d}`
    }

    const bucket = bucketMap.get(bucketKey)
    if (bucket) {
      const amountPesos = (order.total ?? 0) / 100
      bucket.revenuePesos += amountPesos
      bucket.orderCount += 1
      totalRevenue += amountPesos
      totalOrders += 1
    }
  }

  const data = Array.from(bucketMap.values())

  let maxRevenue = -1
  let peakPoint: { label: string; revenue: number } | null = null

  for (const pt of data) {
    if (pt.revenuePesos > maxRevenue && pt.revenuePesos > 0) {
      maxRevenue = pt.revenuePesos
      peakPoint = { label: pt.label, revenue: pt.revenuePesos }
    }
  }

  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const count = data.length || 1
  const averagePace = Math.round(totalRevenue / count)

  return {
    data,
    summary: {
      totalRevenue,
      totalOrders,
      aov,
      averagePace,
      paceUnit: isHourly ? "hour" : "day",
      peakPoint,
    },
  }
}

// ── Custom Tooltip for Recharts ─────────────────────────────────────────────

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: ChartDataPoint }>
}

const CustomSalesTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base/95 p-3 shadow-xl backdrop-blur-sm">
      <Text size="xsmall" className="font-medium text-ui-fg-muted">{data.fullLabel}</Text>
      <div className="mt-1 flex items-baseline gap-2">
        <Text size="base" weight="plus" className="text-ui-fg-base">
          {formatPhp(data.revenuePesos * 100)}
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">captured</Text>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-ui-fg-subtle">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>{data.orderCount} {data.orderCount === 1 ? "order" : "orders"}</span>
      </div>
    </div>
  )
}

// Returns an error or loading subtext when a query is not healthy,
// otherwise returns the normal subtext string.
function cardSubtext(
  query: { isError: boolean; isLoading: boolean },
  normalText: string,
): string {
  if (query.isError) return "⚠ Failed to load — check permissions"
  if (query.isLoading) return "Loading…"
  return normalText
}

// ── Quick actions (constant — defined outside component) ────────────────────

const QUICK_ACTIONS = [
  { label: "Review Proofs", to: "/manual-payment-proofs" },
  { label: "Support Queue", to: "/customer-support" },
  { label: "New Compound", to: "/compounded-products" },
  { label: "Rewards Program", to: "/rewards" },
  { label: "Research Agreements", to: "/research-agreements" },
  { label: "Hub Settings", to: "/research-hub-settings" },
  { label: "Notifications", to: "/notification-center" },
] as const

// ── Component ───────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const navigate = useNavigate()

  // ── Sales Timeframe State & DatePickers ─────────────────────────────────
  const [salesTimeframe, setSalesTimeframe] = useState<SalesTimeframe>("this_month")
  const [customFrom, setCustomFrom] = useState<Date | null>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d
  })
  const [customTo, setCustomTo] = useState<Date | null>(() => new Date())

  // startOfMonth is memoized so it is computed once on mount
  const startOfMonth = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])

  const monthLabel = useMemo(() => currentMonthLabel(), [])

  // 30 days back query boundary ensuring 7D, 30D, and MTD are always populated
  const ordersQueryStartDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 31)
    d.setHours(0, 0, 0, 0)

    if (salesTimeframe === "custom" && customFrom && customFrom < d) {
      return customFrom.toISOString()
    }
    return d.toISOString()
  }, [salesTimeframe, customFrom])

  // ── 1. Orders Query — drives Sales Chart & Top KPI Cards ─────────────────
  const ordersQuery = useQuery({
    queryKey: ["dashboard-orders", ordersQueryStartDate],
    queryFn: () =>
      sdk.admin.order.list({
        created_at: { gte: ordersQueryStartDate },
        limit: 200,
        order: "-created_at",
      } as Parameters<typeof sdk.admin.order.list>[0]),
    refetchInterval: 30_000,
  })

  // Top KPI Month-to-Date metrics
  const monthStartTimestamp = useMemo(() => new Date(startOfMonth).getTime(), [startOfMonth])

  const { ordersCount, revenueThisMonth } = useMemo(() => {
    const orders = ordersQuery.data?.orders ?? []
    let count = 0
    let rev = 0

    for (const o of orders) {
      const createdAt = new Date(o.created_at).getTime()
      if (createdAt >= monthStartTimestamp) {
        count += 1
        if (o.payment_status === "captured") {
          rev += o.total ?? 0
        }
      }
    }

    return {
      ordersCount: ordersQuery.data ? count : null,
      revenueThisMonth: ordersQuery.data ? rev : null,
    }
  }, [ordersQuery.data, monthStartTimestamp])

  // ── Chart aggregation memoized ──────────────────────────────────────────
  const { chartData, chartSummary } = useMemo(() => {
    const orders = ordersQuery.data?.orders ?? []
    const res = buildSalesTimeline(
      orders,
      salesTimeframe,
      salesTimeframe === "custom" ? { from: customFrom, to: customTo } : undefined,
    )
    return { chartData: res.data, chartSummary: res.summary }
  }, [ordersQuery.data?.orders, salesTimeframe, customFrom, customTo])

  // ── 2. Pack Ready — paid but not yet fulfilled ───────────────────────────
  const packReadyQuery = useQuery({
    queryKey: ["dashboard-pack-ready"],
    queryFn: () =>
      sdk.admin.order.list({
        payment_status: ["captured"],
        fulfillment_status: ["not_fulfilled", "partially_fulfilled"],
        limit: 1,
      } as Parameters<typeof sdk.admin.order.list>[0]),
    refetchInterval: 30_000,
  })
  const packReadyCount = packReadyQuery.data?.count ?? null

  // ── 3. Stock location (prerequisite for buildable + reorder queries) ─────
  const locationsQuery = useQuery({
    queryKey: ["dashboard-stock-locations"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 1 }),
    staleTime: 5 * 60_000,
  })
  const locationId = locationsQuery.data?.stock_locations[0]?.id ?? ""

  // ── 4. Zero-stock sellable SKUs ──────────────────────────────────────────
  const buildableQuery = useQuery({
    queryKey: ["dashboard-buildable", locationId],
    queryFn: () =>
      sdk.client.fetch<BuildableProductsResponse>(
        "/admin/bom/buildable-products",
        { query: { location_id: locationId, limit: 100 } },
      ),
    enabled: Boolean(locationId),
    refetchInterval: 30_000,
  })
  const zeroStockCount = buildableQuery.data
    ? buildableQuery.data.buildable_products.filter(
        (r: BuildableProductRow) =>
          r.recipe_status === "configured" && r.calculated_stock === 0,
      ).length
    : null

  // ── 5. Pending payment proofs ────────────────────────────────────────────
  const proofsQuery = useQuery({
    queryKey: ["dashboard-proofs"],
    queryFn: () =>
      sdk.client.fetch<ManualPaymentProofListResponse>(
        "/admin/manual-payment-proofs",
        { query: { status: "pending", limit: 1 } },
      ),
    refetchInterval: 30_000,
  })
  const proofsCount = proofsQuery.data?.count ?? null

  // ── 6. Unread support count ──────────────────────────────────────────────
  const supportCountQuery = useQuery({
    queryKey: ["dashboard-support-count"],
    queryFn: () =>
      sdk.client.fetch<SupportConversationsResponse>(
        "/admin/customer-support",
        { query: { queue: "unread", limit: 1 } },
      ),
    refetchInterval: 15_000,
  })
  const supportCount = supportCountQuery.data?.count ?? null

  // ── 7. Published protocols ───────────────────────────────────────────────
  const protocolsQuery = useQuery({
    queryKey: ["dashboard-protocols"],
    queryFn: () =>
      sdk.client.fetch<ProtocolListResponse>("/admin/research-protocols", {
        query: { status: "published", limit: 1 },
      }),
    refetchInterval: 30_000,
  })
  const protocolsCount = protocolsQuery.data?.count ?? null

  // ── 8. Reorder alerts (Tier 2 endpoint) ─────────────────────────────────
  const reorderQuery = useQuery({
    queryKey: ["dashboard-reorder-alerts", locationId],
    queryFn: () =>
      sdk.client.fetch<ReorderAlertsResponse>("/admin/bom/reorder-alerts", {
        query: { location_id: locationId },
      }),
    enabled: Boolean(locationId),
    refetchInterval: 30_000,
  })
  const belowThresholdCount = reorderQuery.data?.below_threshold_count ?? null
  const outOfStockCount = reorderQuery.data?.out_of_stock_count ?? null

  // ── 9. Recent orders feed ────────────────────────────────────────────────
  const recentOrdersQuery = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () =>
      sdk.admin.order.list({ limit: 10, order: "-created_at" }),
    refetchInterval: 30_000,
  })

  // ── 10. Support conversation feed ────────────────────────────────────────
  const supportFeedQuery = useQuery({
    queryKey: ["dashboard-support-feed"],
    queryFn: () =>
      sdk.client.fetch<SupportConversationsResponse>(
        "/admin/customer-support",
        { query: { queue: "unread", limit: 5 } },
      ),
    refetchInterval: 15_000,
  })

  // ── document.title — live alert counts in browser tab ───────────────────
  useEffect(() => {
    const pending = proofsCount ?? 0
    const unread = supportCount ?? 0
    const packing = packReadyCount ?? 0
    const parts = [
      pending > 0 ? `${pending} proofs` : null,
      unread > 0 ? `${unread} unread` : null,
      packing > 0 ? `${packing} to pack` : null,
    ].filter(Boolean)

    document.title =
      parts.length > 0
        ? `(${parts.join(" · ")}) Dashboard · PepStack Admin`
        : "Dashboard · PepStack Admin"

    return () => {
      document.title = "Dashboard · PepStack Admin"
    }
  }, [proofsCount, supportCount, packReadyCount])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-y-3 pb-8">

      {/* 1. Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Founder Operations" },
        ]}
        title="Operations Dashboard"
        subtitle="Real-time revenue telemetry, fulfillment dispatch readiness, and inventory bottleneck alerts."
        actions={
          <div className="flex items-center gap-2">
            <Badge size="small" color="grey" className="font-mono text-[11px]">
              Auto-refreshes 30s
            </Badge>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                ordersQuery.refetch()
                packReadyQuery.refetch()
                proofsQuery.refetch()
                supportCountQuery.refetch()
                protocolsQuery.refetch()
                reorderQuery.refetch()
                recentOrdersQuery.refetch()
                supportFeedQuery.refetch()
              }}
              className="h-7 text-xs inline-flex items-center gap-1.5"
            >
              ↻ Refresh
            </Button>
          </div>
        }
      />

      {/* 2. Unified 8-Metric Operational Telemetry Grid (4x2 on desktop, 2x4 on tablet) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon="💰"
          title={`Revenue · ${monthLabel}`}
          value={
            ordersQuery.isError
              ? "!"
              : revenueThisMonth != null
              ? formatPhp(revenueThisMonth)
              : "—"
          }
          status={ordersQuery.isError ? "critical" : "healthy"}
          subtext={cardSubtext(
            ordersQuery,
            "captured payments · MTD",
          )}
          onClick={() => navigate("/orders")}
        />
        <KpiCard
          icon="🛒"
          title={`Orders · ${monthLabel}`}
          value={ordersQuery.isError ? "!" : (ordersCount ?? "—")}
          status={
            ordersQuery.isError
              ? "critical"
              : ordersCount != null
              ? ordersStatus(ordersCount)
              : "neutral"
          }
          subtext={cardSubtext(ordersQuery, "all orders · MTD")}
          onClick={() => navigate("/orders")}
        />
        <KpiCard
          icon="📦"
          title="Pack Ready"
          value={packReadyQuery.isError ? "!" : (packReadyCount ?? "—")}
          status={
            packReadyQuery.isError
              ? "critical"
              : packReadyCount != null
              ? packReadyStatus(packReadyCount)
              : "neutral"
          }
          subtext={cardSubtext(packReadyQuery, "paid · not yet fulfilled")}
          onClick={() => navigate("/orders")}
        />
        <KpiCard
          icon="📱"
          title="Pending Proofs"
          value={proofsQuery.isError ? "!" : (proofsCount ?? "—")}
          status={
            proofsQuery.isError
              ? "critical"
              : proofsCount != null
              ? proofsStatus(proofsCount)
              : "neutral"
          }
          subtext={cardSubtext(proofsQuery, "awaiting manual QR review")}
          onClick={() => navigate("/manual-payment-proofs")}
        />
        <KpiCard
          icon="💬"
          title="Unread Support"
          value={
            supportCountQuery.isError ? "!" : (supportCount ?? "—")
          }
          status={
            supportCountQuery.isError
              ? "critical"
              : supportCount != null
              ? supportStatus(supportCount)
              : "neutral"
          }
          subtext={cardSubtext(
            supportCountQuery,
            "conversations with unread messages",
          )}
          onClick={() => navigate("/customer-support")}
        />
        <KpiCard
          icon="⚠️"
          title="Components Low"
          value={
            reorderQuery.isError ? "!" : (belowThresholdCount ?? "—")
          }
          status={
            reorderQuery.isError
              ? "critical"
              : belowThresholdCount != null && outOfStockCount != null
              ? reorderStatus(belowThresholdCount, outOfStockCount)
              : "neutral"
          }
          subtext={
            reorderQuery.isError
              ? "⚠ Failed to load — check permissions"
              : reorderQuery.isLoading
              ? "Loading…"
              : outOfStockCount != null && outOfStockCount > 0
              ? `${belowThresholdCount} low · ${outOfStockCount} completely out`
              : "below reorder threshold"
          }
          onClick={() => navigate("/buildable-products")}
        />
        <KpiCard
          icon="🚫"
          title="Zero-Stock SKUs"
          value={buildableQuery.isError ? "!" : (zeroStockCount ?? "—")}
          status={
            buildableQuery.isError
              ? "critical"
              : zeroStockCount != null
              ? zeroStockStatus(zeroStockCount)
              : "neutral"
          }
          subtext={cardSubtext(
            buildableQuery,
            "configured recipes with 0 buildable units",
          )}
          onClick={() => navigate("/buildable-products")}
        />
        <KpiCard
          icon="🔬"
          title="Published Protocols"
          value={protocolsQuery.isError ? "!" : (protocolsCount ?? "—")}
          status={protocolsQuery.isError ? "critical" : "info"}
          subtext={cardSubtext(
            protocolsQuery,
            "active research protocols",
          )}
          onClick={() => navigate("/research-protocols")}
        />
      </div>

      {/* 3. Revenue & Sales Velocity Chart Card */}
      <AdminCard
        title="Revenue & Sales Velocity"
        subtitle="Captured income telemetry · Reflects confirmed customer payments."
        headerAction={
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-0.5">
            <Button
              size="small"
              variant={salesTimeframe === "today" ? "primary" : "transparent"}
              onClick={() => setSalesTimeframe("today")}
              className="h-6 text-xs px-2"
            >
              Today
            </Button>
            <Button
              size="small"
              variant={salesTimeframe === "yesterday" ? "primary" : "transparent"}
              onClick={() => setSalesTimeframe("yesterday")}
              className="h-6 text-xs px-2"
            >
              Yesterday
            </Button>
            <Button
              size="small"
              variant={salesTimeframe === "7d" ? "primary" : "transparent"}
              onClick={() => setSalesTimeframe("7d")}
              className="h-6 text-xs px-2"
            >
              7 Days
            </Button>
            <Button
              size="small"
              variant={salesTimeframe === "this_month" ? "primary" : "transparent"}
              onClick={() => setSalesTimeframe("this_month")}
              className="h-6 text-xs px-2"
            >
              This Month
            </Button>
            <Button
              size="small"
              variant={salesTimeframe === "custom" ? "primary" : "transparent"}
              onClick={() => setSalesTimeframe("custom")}
              className="h-6 text-xs px-2"
            >
              Custom
            </Button>
          </div>
        }
        contentClassName="p-0 divide-y divide-ui-border-base"
      >
        {/* Custom Date Pickers (visible when Custom is active) */}
        {salesTimeframe === "custom" && (
          <div className="flex flex-wrap items-center gap-3 bg-ui-bg-subtle/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Text size="xsmall" className="text-ui-fg-subtle">From:</Text>
              <DatePicker
                value={customFrom}
                onChange={(date) => setCustomFrom(date)}
                size="small"
              />
            </div>
            <div className="flex items-center gap-2">
              <Text size="xsmall" className="text-ui-fg-subtle">To:</Text>
              <DatePicker
                value={customTo}
                onChange={(date) => setCustomTo(date)}
                size="small"
              />
            </div>
          </div>
        )}

        {/* Founder Metric Strip */}
        <div className="grid grid-cols-2 gap-4 bg-ui-bg-subtle/20 px-6 py-3.5 sm:grid-cols-4">
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle">Total Income</Text>
            <Text size="large" weight="plus" className="mt-0.5 text-ui-fg-base font-mono">
              {formatPhp(chartSummary.totalRevenue * 100)}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Average / {chartSummary.paceUnit === "hour" ? "Hour" : "Day"}
            </Text>
            <Text size="large" weight="plus" className="mt-0.5 text-ui-fg-base font-mono">
              {formatPhp(chartSummary.averagePace * 100)}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle">Average Order Value (AOV)</Text>
            <Text size="large" weight="plus" className="mt-0.5 text-ui-fg-base font-mono">
              {chartSummary.aov > 0 ? formatPhp(chartSummary.aov * 100) : "₱0"}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {chartSummary.paceUnit === "hour" ? "Peak Hour" : "Peak Day"}
            </Text>
            <Text size="large" weight="plus" className="mt-0.5 text-ui-fg-base font-mono">
              {chartSummary.peakPoint
                ? `${chartSummary.peakPoint.label} (${formatPhp(chartSummary.peakPoint.revenue * 100)})`
                : "—"}
            </Text>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="px-6 py-4">
          {ordersQuery.isLoading ? (
            <div className="flex h-[240px] items-center justify-center">
              <Text size="small" className="text-ui-fg-subtle">Loading sales velocity…</Text>
            </div>
          ) : ordersQuery.isError ? (
            <div className="flex h-[240px] items-center justify-center">
              <Text size="small" className="text-ui-fg-error">⚠ Sales telemetry could not be loaded.</Text>
            </div>
          ) : (
            <div className="h-[240px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#3f3f46"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    minTickGap={18}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₱${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    width={50}
                  />
                  <Tooltip content={<CustomSalesTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenuePesos"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#salesVelocityGradient)"
                    activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </AdminCard>

      {/* 4. Quick Actions */}
      <AdminCard
        title="Quick Operational Actions"
        subtitle="Fast shortcuts to frequent founder workflows and customer queues."
        contentClassName="p-3.5"
      >
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ label, to }) => (
            <Button
              key={to}
              size="small"
              variant="secondary"
              onClick={() => navigate(to)}
              className="h-7 text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </AdminCard>

      {/* 5. Feed panels — side by side on wide screens */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Recent Orders Card */}
        <AdminCard
          title="Recent Orders"
          subtitle="Last 10 customer orders · click any row to inspect details."
          headerAction={
            <Button
              size="small"
              variant="transparent"
              onClick={() => navigate("/orders")}
              className="h-7 text-xs text-ui-fg-muted hover:text-ui-fg-base"
            >
              View all orders →
            </Button>
          }
          contentClassName="p-0 divide-y divide-ui-border-base"
        >
          {recentOrdersQuery.isError ? (
            <Text size="small" className="px-4 py-4 text-ui-fg-error">
              ⚠ Orders could not be loaded. Check your admin permissions.
            </Text>
          ) : recentOrdersQuery.isLoading ? (
            <Text size="small" className="px-4 py-4 text-ui-fg-subtle">
              Loading…
            </Text>
          ) : !recentOrdersQuery.data?.orders?.length ? (
            <Text size="small" className="px-4 py-8 text-center text-ui-fg-muted">
              No orders placed yet.
            </Text>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ui-border-base bg-ui-bg-subtle/50 text-left">
                    <th className="px-3.5 py-2 text-xs font-medium text-ui-fg-subtle">Order</th>
                    <th className="px-3.5 py-2 text-xs font-medium text-ui-fg-subtle">Customer</th>
                    <th className="px-3.5 py-2 text-right text-xs font-medium text-ui-fg-subtle">Total</th>
                    <th className="px-3.5 py-2 text-xs font-medium text-ui-fg-subtle">Payment</th>
                    <th className="px-3.5 py-2 text-xs font-medium text-ui-fg-subtle">Fulfillment</th>
                    <th className="px-3.5 py-2 text-right text-xs font-medium text-ui-fg-subtle">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border-base">
                  {recentOrdersQuery.data.orders.map((order: HttpTypes.AdminOrder) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="cursor-pointer transition-colors hover:bg-ui-bg-subtle/60"
                    >
                      <td className="px-3.5 py-2 font-mono text-xs text-ui-fg-base font-medium">
                        #{order.display_id}
                      </td>
                      <td className="max-w-[120px] truncate px-3.5 py-2 text-xs text-ui-fg-subtle">
                        {order.customer
                          ? `${order.customer.first_name ?? ""} ${order.customer.last_name ?? ""}`.trim() ||
                            order.customer.email
                          : "—"}
                      </td>
                      <td className="px-3.5 py-2 text-right font-mono text-xs font-medium text-ui-fg-base">
                        {formatPhp(order.total ?? 0)}
                      </td>
                      <td className="px-3.5 py-2">
                        <Badge size="small" color={paymentColor(order.payment_status ?? "")}>
                          {order.payment_status ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-3.5 py-2">
                        <Badge size="small" color={fulfillmentColor(order.fulfillment_status ?? "")}>
                          {order.fulfillment_status ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-3.5 py-2 text-right text-xs text-ui-fg-muted font-mono">
                        {relativeTime(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        {/* Unread Support Feed Card */}
        <AdminCard
          title="Unread Support Queue"
          subtitle="Recent customer conversations awaiting response."
          headerAction={
            <Button
              size="small"
              variant="transparent"
              onClick={() => navigate("/customer-support")}
              className="h-7 text-xs text-ui-fg-muted hover:text-ui-fg-base"
            >
              Open full queue →
            </Button>
          }
          contentClassName="p-0 divide-y divide-ui-border-base"
        >
          {supportFeedQuery.isError ? (
            <Text size="small" className="px-4 py-4 text-ui-fg-error">
              ⚠ Support queue could not be loaded. Check your Support role.
            </Text>
          ) : supportFeedQuery.isLoading ? (
            <Text size="small" className="px-4 py-4 text-ui-fg-subtle">
              Loading…
            </Text>
          ) : !supportFeedQuery.data?.conversations.length ? (
            <Text size="small" className="px-4 py-8 text-center text-ui-fg-muted">
              No unread conversations. All caught up!
            </Text>
          ) : (
            <div className="divide-y divide-ui-border-base">
              {supportFeedQuery.data.conversations.map((conv) => {
                const waiting = formatWaitingSince(conv.waiting_since)
                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/customer-support/${conv.id}`)}
                    className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-ui-bg-subtle/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Text size="small" weight="plus" className="text-ui-fg-base">
                          {conv.subject}
                        </Text>
                        {conv.unread_count > 0 && (
                          <Badge size="small" color="red">
                            {conv.unread_count} unread
                          </Badge>
                        )}
                        {waiting && (
                          <Badge size="small" color={waiting.color}>
                            ⏱ {waiting.text}
                          </Badge>
                        )}
                      </div>
                      <Text size="xsmall" className="mt-0.5 text-ui-fg-subtle">
                        {conv.customer ? `${conv.customer.name} · ` : ""}
                        {conv.category.replaceAll("_", " ")}
                      </Text>
                      <Text size="xsmall" className="mt-0.5 line-clamp-1 text-ui-fg-muted">
                        {conv.latest_message_preview || "No preview"}
                      </Text>
                    </div>
                    <Badge size="small" color={priorityColor(conv.priority)}>
                      {conv.priority}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Dashboard",
  icon: SquaresPlus,
  rank: 1,
})

export default DashboardPage
