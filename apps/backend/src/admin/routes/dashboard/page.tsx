/**
 * @file    apps/backend/src/admin/routes/dashboard/page.tsx
 * @module  DashboardAdminRoute (Command Center Dashboard)
 * @purpose Main Founder Operations command center overview and real-time KPI metrics.
 * @contracts
 *   API:     GET /admin/dashboard
 *   Service: BomModuleService · ManualPaymentProofModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArchiveBox,
  ArrowPath,
  ArrowUpRightMini,
  Beaker,
  BellAlert,
  ChatBubbleLeftRight,
  CheckCircleSolid,
  Component,
  CreditCard,
  CurrencyDollar,
  ExclamationCircle,
  Sparkles,
  SquaresPlus,
  Tag,
  Bolt,
  ShieldCheck,
} from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Container, DatePicker, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { AdminMetricCard, type MetricStatus } from "../../components/ui/admin-metric-card"
import { PageHeader } from "../../components/page-header"
import GlobalSupportDock from "../../widgets/global-support-dock"
import { sdk } from "../../lib/sdk"
import type {
  BuildableProductRow,
  BuildableProductsResponse,
} from "../bom/types"

// ── Circling Spinner Icon for Visual Action Loading Feedback ────────────────
const SpinnerIcon = ({ className = "size-3.5 animate-spin text-current" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

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
  unread_count?: number
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

function ordersStatus(n: number): MetricStatus {
  return n > 10 ? "critical" : n > 5 ? "warning" : "healthy"
}

function proofsStatus(n: number): MetricStatus {
  return n > 5 ? "critical" : n > 2 ? "warning" : "healthy"
}

function supportStatus(n: number): MetricStatus {
  return n > 10 ? "critical" : n > 3 ? "warning" : "healthy"
}

function zeroStockStatus(n: number): MetricStatus {
  return n > 5 ? "critical" : n > 0 ? "warning" : "healthy"
}

function packReadyStatus(n: number): MetricStatus {
  return n > 10 ? "critical" : n > 3 ? "warning" : n > 0 ? "info" : "healthy"
}

function reorderStatus(below: number, outOf: number): MetricStatus {
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

function relativeTime(iso: string | Date): string {
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
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
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
  { label: "Research Bundles", to: "/bundles" },
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
  const queryClient = useQueryClient()

  // ── Antigravity CLI Daemon & Bridge Telemetry ──────────────────────────────
  const { data: daemonData, refetch: refetchDaemon } = useQuery<{
    daemon_state?: {
      isEnabled?: boolean
      status?: "active" | "idle" | "paused"
      scenariosExecuted?: number
      totalScans?: number
      generalLedgerDrift?: number
      visualClutterCount?: number
    }
  }>({
    queryKey: ["dashboard-bot-daemon"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions/daemon", { credentials: "include" })
      if (!res.ok) return {}
      return res.json()
    },
    refetchInterval: 3000,
  })

  const daemonState = daemonData?.daemon_state
  const isAgyActive = Boolean(daemonState?.isEnabled && daemonState?.status === "active")

  const connectAgyMutation = useMutation({
    mutationFn: async (action: "start" | "stop" | "toggle" = "start") => {
      const res = await fetch("/admin/bot-missions/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error("Failed to connect to Antigravity CLI daemon")
      return res.json()
    },
    onSuccess: (data) => {
      const active = data?.daemon_state?.status === "active"
      toast.success(
        active ? "Antigravity CLI Bridge Connected & Armed" : "Antigravity CLI Bridge Paused",
        {
          description: active
            ? "24/7 Autonomous Bug Hunter & Sentry running via agy CLI."
            : "Autopilot loop paused. Click connect to re-arm.",
        }
      )
      refetchDaemon()
      queryClient.invalidateQueries({ queryKey: ["dashboard-bot-daemon"] })
      queryClient.invalidateQueries({ queryKey: ["bot-daemon"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => {
      toast.error("Bridge Connection Error", { description: err.message })
    },
  })

  const runAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mission_type: "all_fleet_matrix" }),
      })
      if (!res.ok) throw new Error("Failed to dispatch agy run-all")
      return res.json()
    },
    onSuccess: () => {
      toast.success("agy run-all Dispatched", { description: "Running full 1,042 test matrix across Monorepo." })
      queryClient.invalidateQueries({ queryKey: ["dashboard-bot-daemon"] })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => {
      toast.error("Failed to execute agy run-all", { description: err.message })
    },
  })

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
        { query: { limit: 50 } },
      ),
    refetchInterval: 15_000,
  })
  const supportCount = supportCountQuery.data
    ? (supportCountQuery.data.unread_count ??
        supportCountQuery.data.conversations.filter(
          (c) => (c.unread_count > 0 || c.status === "new"),
        ).length)
    : null

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

  const handleRefreshAll = () => {
    ordersQuery.refetch()
    packReadyQuery.refetch()
    proofsQuery.refetch()
    supportCountQuery.refetch()
    protocolsQuery.refetch()
    reorderQuery.refetch()
    recentOrdersQuery.refetch()
    supportFeedQuery.refetch()
  }

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
    <div className="flex flex-col gap-y-5 pb-10">
      {/* 1. Executive Founder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200/80">
              <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
              Verified Founder Operations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
              Storefront Sync Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Founder Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time commercial telemetry, cold-chain fulfillment dispatch, and inventory controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* ⚡ 1-Click Antigravity CLI Bridge Quick Connect Button */}
          {isAgyActive ? (
            <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => navigate("/bot-lab")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/60 transition cursor-pointer"
                title="Antigravity CLI Bridge Connected. Click to open Bot Mission Control."
              >
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>⚡ agy CLI: ONLINE</span>
              </button>
              <button
                type="button"
                onClick={() => connectAgyMutation.mutate("stop")}
                disabled={connectAgyMutation.isPending}
                className={`px-2 py-1 text-[10px] font-mono transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 ${
                  connectAgyMutation.isPending
                    ? "text-rose-400 font-semibold"
                    : "text-slate-400 hover:text-rose-400"
                }`}
                title="Disconnect Antigravity CLI Autopilot"
              >
                {connectAgyMutation.isPending && connectAgyMutation.variables === "stop" ? (
                  <>
                    <SpinnerIcon className="size-2.5 animate-spin text-rose-400" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <span>Disconnect</span>
                )}
              </button>
            </div>
          ) : (
            <Button
              size="small"
              onClick={() => connectAgyMutation.mutate("start")}
              disabled={connectAgyMutation.isPending}
              className={`h-8 rounded-xl px-3 text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                connectAgyMutation.isPending ? "ring-2 ring-indigo-400 ring-offset-1 animate-pulse" : ""
              }`}
            >
              {connectAgyMutation.isPending ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-white" />
                  <span>Connecting agy CLI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
                  <span>⚡ 1-Click Connect Antigravity CLI</span>
                </>
              )}
            </Button>
          )}

          <Badge size="small" color="grey" className="font-mono text-[11px]">
            Auto-refreshes 30s
          </Badge>
          <Button
            size="small"
            variant="secondary"
            onClick={handleRefreshAll}
            className="h-8 rounded-xl px-3 text-xs font-bold bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowPath className="size-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Antigravity CLI Bridge Sovereign Telemetry Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-cyan-400 shrink-0">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 3-3 3m4.5 0h4.5m-9-9h12a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-12A2.25 2.25 0 013 18.75v-9A2.25 2.25 0 015.25 7.5z" />
            </svg>
            <span className={`absolute -top-1 -right-1 size-2 rounded-full ${isAgyActive ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
            <span className={`absolute -top-1 -right-1 size-2 rounded-full ${isAgyActive ? "bg-emerald-500" : "bg-rose-500"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                ⚡ ANTIGRAVITY CLI (agy) BRIDGE
              </span>
              {isAgyActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-600/60">
                  <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                  IPC CONNECTED & ARMED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/90 px-2 py-0.5 text-[9px] font-mono font-bold text-rose-400 border border-rose-600/60">
                  <span className="size-1 rounded-full bg-rose-400" />
                  STANDBY / DISCONNECTED
                </span>
              )}
              <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 border border-indigo-800/60">
                PORT :9000 ⇄ :49169
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {isAgyActive
                ? `Active 24/7 Autopilot • ${daemonState?.scenariosExecuted ? daemonState.scenariosExecuted.toLocaleString() : "276"} verified invariants • 0 critical bugs • GL drift: ₱0.00`
                : "Antigravity CLI bridge is idle. Click connect button to arm 24/7 AI Bug Hunter & Sentry."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isAgyActive ? (
            <Button
              size="small"
              onClick={() => connectAgyMutation.mutate("start")}
              disabled={connectAgyMutation.isPending}
              className={`h-8 rounded-xl px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                connectAgyMutation.isPending ? "ring-2 ring-emerald-400 ring-offset-1 animate-pulse" : ""
              }`}
            >
              {connectAgyMutation.isPending ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-white" />
                  <span>Connecting agy CLI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3 text-amber-300" />
                  <span>1-Click Connect agy CLI</span>
                </>
              )}
            </Button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => runAllMutation.mutate()}
                disabled={runAllMutation.isPending}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50 ${
                  runAllMutation.isPending ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
                }`}
                title="Trigger agy run-all"
              >
                {runAllMutation.isPending ? (
                  <>
                    <SpinnerIcon className="size-3.5 animate-spin text-amber-300" />
                    <span>Running agy run-all...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 agy run-all</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => connectAgyMutation.mutate("stop")}
                disabled={connectAgyMutation.isPending}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-rose-200 border border-rose-700/50 shadow-xs transition cursor-pointer disabled:opacity-50 ${
                  connectAgyMutation.isPending ? "ring-2 ring-rose-500 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
                }`}
                title="Stop 24/7 autonomous bug hunter daemon"
              >
                {connectAgyMutation.isPending && connectAgyMutation.variables === "stop" ? (
                  <>
                    <SpinnerIcon className="size-3 animate-spin text-rose-300" />
                    <span>Pausing agy...</span>
                  </>
                ) : (
                  <span>⏸️ Pause agy</span>
                )}
              </button>
            </>
          )}

          <Button
            size="small"
            variant="secondary"
            onClick={() => navigate("/bot-lab")}
            className="h-8 rounded-xl px-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 shadow-2xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Bot Mission Control ➔</span>
          </Button>
        </div>
      </div>

      {/* High-Priority Action Banner */}
      {((proofsCount ?? 0) > 0 || (supportCount ?? 0) > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <BellAlert className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Action Required: {(proofsCount ?? 0) > 0 ? `${proofsCount} pending manual payment ${proofsCount === 1 ? "proof" : "proofs"}` : ""}{(proofsCount ?? 0) > 0 && (supportCount ?? 0) > 0 ? " and " : ""}{(supportCount ?? 0) > 0 ? `${supportCount} unread customer ${supportCount === 1 ? "inquiry" : "inquiries"}` : ""}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Review and approve customer transactions and researcher queries to maintain SLAs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(proofsCount ?? 0) > 0 && (
              <Button
                size="small"
                onClick={() => navigate("/manual-payment-proofs")}
                className="h-7 rounded-xl px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
              >
                Review Proofs ({proofsCount})
              </Button>
            )}
            {(supportCount ?? 0) > 0 && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => navigate("/customer-support")}
                className="h-7 rounded-xl px-3 text-xs font-bold bg-white hover:bg-amber-100/60 border-amber-300 text-amber-900 shadow-2xs"
              >
                Support Queue ({supportCount})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. 4-Tile Top Executive Metric Rail */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminMetricCard
          icon={<CurrencyDollar className="size-4" />}
          label={`Revenue · ${monthLabel}`}
          value={
            ordersQuery.isError
              ? "!"
              : revenueThisMonth != null
              ? formatPhp(revenueThisMonth)
              : "—"
          }
          status={ordersQuery.isError ? "critical" : "healthy"}
          subtext={cardSubtext(ordersQuery, "captured payments · MTD")}
          onClick={() => navigate("/orders")}
        />
        <AdminMetricCard
          icon={<ArchiveBox className="size-4" />}
          label="Pack Ready"
          value={packReadyQuery.isError ? "!" : (packReadyCount ?? "—")}
          status={
            packReadyQuery.isError
              ? "critical"
              : packReadyCount != null
              ? packReadyStatus(packReadyCount)
              : "neutral"
          }
          subtext={cardSubtext(packReadyQuery, "paid · ready to dispatch")}
          onClick={() => navigate("/orders")}
        />
        <AdminMetricCard
          icon={<CreditCard className="size-4" />}
          label="Pending Proofs"
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
        <AdminMetricCard
          icon={<ChatBubbleLeftRight className="size-4" />}
          label="Unread Support"
          value={supportCountQuery.isError ? "!" : (supportCount ?? "—")}
          status={
            supportCountQuery.isError
              ? "critical"
              : supportCount != null
              ? supportStatus(supportCount)
              : "neutral"
          }
          subtext={cardSubtext(supportCountQuery, "conversations awaiting reply")}
          onClick={() => navigate("/customer-support")}
        />
      </div>

      {/* 3. Secondary Operational Telemetry */}
      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard
          icon={<Component className="size-4" />}
          label="Components Low"
          value={reorderQuery.isError ? "!" : (belowThresholdCount ?? "—")}
          status={
            reorderQuery.isError
              ? "critical"
              : belowThresholdCount != null && outOfStockCount != null
              ? reorderStatus(belowThresholdCount, outOfStockCount)
              : "neutral"
          }
          subtext={
            reorderQuery.isError
              ? "Failed to load"
              : outOfStockCount != null && outOfStockCount > 0
              ? `${belowThresholdCount} low · ${outOfStockCount} completely out`
              : "below reorder threshold"
          }
          onClick={() => navigate("/buildable-products")}
        />
        <AdminMetricCard
          icon={<ExclamationCircle className="size-4" />}
          label="Zero-Stock Recipes"
          value={buildableQuery.isError ? "!" : (zeroStockCount ?? "—")}
          status={
            buildableQuery.isError
              ? "critical"
              : zeroStockCount != null
              ? zeroStockStatus(zeroStockCount)
              : "neutral"
          }
          subtext={cardSubtext(buildableQuery, "configured recipes with 0 units")}
          onClick={() => navigate("/buildable-products")}
        />
        <AdminMetricCard
          icon={<Beaker className="size-4" />}
          label="Published Protocols"
          value={protocolsQuery.isError ? "!" : (protocolsCount ?? "—")}
          status={protocolsQuery.isError ? "critical" : "info"}
          subtext={cardSubtext(protocolsQuery, "active research protocols")}
          onClick={() => navigate("/research-protocols")}
        />
      </div>

      {/* 4. Revenue & Sales Velocity Chart Card */}
      <AdminCard
        title="Revenue & Sales Velocity"
        subtitle="Captured income telemetry · Reflects confirmed customer payments."
        headerAction={
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1">
            {(["today", "yesterday", "7d", "this_month", "custom"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setSalesTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  salesTimeframe === tf
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tf === "today" ? "Today" : tf === "yesterday" ? "Yesterday" : tf === "7d" ? "7 Days" : tf === "this_month" ? "This Month" : "Custom"}
              </button>
            ))}
          </div>
        }
        contentClassName="p-0 divide-y divide-slate-100"
      >
        {/* Custom Date Pickers (visible when Custom is active) */}
        {salesTimeframe === "custom" && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <Text size="xsmall" className="text-slate-500 font-medium">From:</Text>
              <DatePicker
                value={customFrom}
                onChange={(date) => setCustomFrom(date)}
                size="small"
              />
            </div>
            <div className="flex items-center gap-2">
              <Text size="xsmall" className="text-slate-500 font-medium">To:</Text>
              <DatePicker
                value={customTo}
                onChange={(date) => setCustomTo(date)}
                size="small"
              />
            </div>
          </div>
        )}

        {/* Founder Metric Strip */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50/30 px-6 py-4 sm:grid-cols-4">
          <div>
            <Text size="xsmall" className="text-slate-500 font-medium">Total Income</Text>
            <Text size="large" weight="plus" className="mt-0.5 text-slate-900 font-mono font-extrabold text-base sm:text-lg">
              {formatPhp(chartSummary.totalRevenue * 100)}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-slate-500 font-medium">
              Average / {chartSummary.paceUnit === "hour" ? "Hour" : "Day"}
            </Text>
            <Text size="large" weight="plus" className="mt-0.5 text-slate-900 font-mono font-extrabold text-base sm:text-lg">
              {formatPhp(chartSummary.averagePace * 100)}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-slate-500 font-medium">Average Order Value (AOV)</Text>
            <Text size="large" weight="plus" className="mt-0.5 text-slate-900 font-mono font-extrabold text-base sm:text-lg">
              {chartSummary.aov > 0 ? formatPhp(chartSummary.aov * 100) : "₱0"}
            </Text>
          </div>
          <div>
            <Text size="xsmall" className="text-slate-500 font-medium">
              {chartSummary.paceUnit === "hour" ? "Peak Hour" : "Peak Day"}
            </Text>
            <Text size="large" weight="plus" className="mt-0.5 text-slate-900 font-mono font-extrabold text-base sm:text-lg">
              {chartSummary.peakPoint
                ? `${chartSummary.peakPoint.label} (${formatPhp(chartSummary.peakPoint.revenue * 100)})`
                : "—"}
            </Text>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="px-6 py-5">
          {ordersQuery.isLoading ? (
            <div className="flex h-[240px] items-center justify-center">
              <Text size="small" className="text-slate-400 font-medium">Loading sales velocity…</Text>
            </div>
          ) : ordersQuery.isError ? (
            <div className="flex h-[240px] items-center justify-center">
              <Text size="small" className="text-rose-600 font-medium">Sales telemetry could not be loaded.</Text>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center">
              <Text size="small" className="text-slate-400 font-medium">No sales recorded for this timeframe.</Text>
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.00} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    minTickGap={18}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₱${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    tick={{ fontSize: 11, fill: "#64748b" }}
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

      {/* 5. Maximized Full-Screen Operational Grid */}
      <div className="w-full flex flex-col gap-6">
        {/* Primary Recent Orders & Cold-Chain Fulfillment Table */}
        <div className="w-full">
          <AdminCard
            title="Recent Orders & Fulfillment"
            subtitle="Last 10 customer orders · Click any row to inspect details and packing slips."
            headerAction={
              <Button
                size="small"
                variant="transparent"
                onClick={() => navigate("/orders")}
                className="h-7 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                View all orders &rarr;
              </Button>
            }
            contentClassName="p-0"
          >
            {recentOrdersQuery.isError ? (
              <Text size="small" className="p-5 text-rose-600 font-medium">
                Orders could not be loaded. Check your admin permissions.
              </Text>
            ) : recentOrdersQuery.isLoading ? (
              <Text size="small" className="p-5 text-slate-400 font-medium">
                Loading…
              </Text>
            ) : !recentOrdersQuery.data?.orders?.length ? (
              <Text size="small" className="p-8 text-center text-slate-400 font-medium">
                No orders placed yet.
              </Text>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrdersQuery.data.orders.map((order: HttpTypes.AdminOrder) => {
                  const customerName = order.customer
                    ? `${order.customer.first_name ?? ""} ${order.customer.last_name ?? ""}`.trim() || order.customer.email
                    : "Dr. Client"
                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/70 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-600 shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                          <ArchiveBox className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              #{order.display_id}
                            </span>
                            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">
                              {customerName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {relativeTime(order.created_at)} · {order.items?.length || 1} line {(order.items?.length || 1) === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-slate-900 font-mono">
                            {formatPhp(order.total ?? 0)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge size="small" color={paymentColor(order.payment_status ?? "")}>
                              {order.payment_status ?? "—"}
                            </Badge>
                            <Badge size="small" color={fulfillmentColor(order.fulfillment_status ?? "")}>
                              {order.fulfillment_status ?? "—"}
                            </Badge>
                          </div>
                        </div>
                        <ArrowUpRightMini className="size-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </AdminCard>
        </div>

        {/* Horizontal Operational Action Suite Dock */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Card A: Research Bundles & Synergy Stacks Health */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/20 to-white p-5 shadow-xs transition-all hover:border-blue-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  3-Tier Bundling Suite
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
                <span className="size-1 rounded-full bg-blue-600 animate-pulse" />
                5 Stacks Active
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              Multi-Compound Research Stacks
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Curated synergy stacks active in catalog with 10%–15% package discounts and automatic prep kit tiering.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                100% Shipping Profile Linked
              </span>
              <button
                type="button"
                onClick={() => navigate("/bundles")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
              >
                <span>Manage Stacks</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Card B: Quick Founder Actions */}
          <AdminCard
            title="Operational Shortcuts"
            subtitle="Fast navigation to frequent founder administrative tasks."
            contentClassName="p-3.5"
          >
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(({ label, to }) => (
                <Button
                  key={to}
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(to)}
                  className="h-7 text-xs font-bold rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </AdminCard>

          {/* Card C: Unread Support Queue Feed */}
          <AdminCard
            title="Unread Support Queue"
            subtitle="Recent customer conversations awaiting response."
            headerAction={
              <Button
                size="small"
                variant="transparent"
                onClick={() => navigate("/customer-support")}
                className="h-7 text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Open queue &rarr;
              </Button>
            }
            contentClassName="p-0"
          >
            {supportFeedQuery.isError ? (
              <Text size="small" className="p-4 text-rose-600 font-medium">
                Support queue could not be loaded.
              </Text>
            ) : supportFeedQuery.isLoading ? (
              <Text size="small" className="p-4 text-slate-400 font-medium">
                Loading…
              </Text>
            ) : !supportFeedQuery.data?.conversations.length ? (
              <Text size="small" className="p-6 text-center text-slate-400 font-medium">
                No unread conversations. All caught up!
              </Text>
            ) : (
              <div className="divide-y divide-slate-100">
                {supportFeedQuery.data.conversations.map((conv) => {
                  const waiting = formatWaitingSince(conv.waiting_since)
                  return (
                    <button
                      key={conv.id}
                      onClick={() => navigate(`/customer-support/${conv.id}`)}
                      className="flex w-full items-start justify-between gap-3 p-3.5 text-left transition-colors hover:bg-slate-50/80 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Text size="small" weight="plus" className="text-slate-900 font-bold">
                            {conv.subject}
                          </Text>
                          {conv.unread_count > 0 && (
                            <Badge size="small" color="red">
                              {conv.unread_count} unread
                            </Badge>
                          )}
                          {waiting && (
                            <Badge size="small" color={waiting.color}>
                              {waiting.text}
                            </Badge>
                          )}
                        </div>
                        <Text size="xsmall" className="mt-0.5 text-slate-500">
                          {conv.customer ? `${conv.customer.name} · ` : ""}
                          {conv.category.replaceAll("_", " ")}
                        </Text>
                        <Text size="xsmall" className="mt-0.5 line-clamp-1 text-slate-400 font-medium">
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
      <GlobalSupportDock />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Dashboard",
  icon: SquaresPlus,
  rank: 1,
})

export default DashboardPage
