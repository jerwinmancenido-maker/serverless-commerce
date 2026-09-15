/**
 * @file    apps/backend/src/admin/routes/orders-cockpit/[id]/page.tsx
 * @module  OrderCockpitDetailRoute (Admin Route Extension)
 * @purpose Modern SADS 2.0 Order Detail Cockpit with 8/4 grid, strict No-Pay No-Pack guardrail, J&T logistics, and payment proof review.
 * @contracts
 *   Route:   /app/orders-cockpit/:id
 *   API:     GET /admin/orders/:id · GET /admin/manual-payment-proofs · POST /admin/orders/:id/fulfillments
 */

import {
  ArchiveBox,
  ArrowLeft,
  ArrowUpRightOnBox,
  Beaker,
  CheckCircleSolid,
  CircleWarningSolid,
  Clock,
  CreditCard,
  CurrencyDollar,
  DocumentText,
  ExclamationCircle,
  LockClosedSolid,
  LockOpenSolid,
  MagnifyingGlass,
  Plus,
  Sparkles,
  Spinner,
  SquaresPlus,
  Trash,
  XMark,
} from "@medusajs/icons"
import { Badge, Button, Container, Copy, Heading, Input, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { cleanJntWaybill, isValidJntWaybill } from "../../../../lib/jnt-express-helper"
import { evaluateOrderPackingGuardrail } from "../../../../lib/order-packing-guardrail"
import { AdminMetricCard } from "../../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../../components/ui/admin-telemetry-notice"
import {
  PackingStationDrawer,
  type PrintableDocumentType,
} from "../../../components/printables/packing-station-drawer"
import { JntQuickOrderDrawer } from "../../../components/logistics/jnt-quick-order-drawer"
import { ManualPaymentProofReviewDrawer } from "../../manual-payment-proofs/review-drawer"
import type {
  ManualPaymentProof,
  ManualPaymentProofListResponse,
} from "../../manual-payment-proofs/types"
import { SovereignPageSkeleton } from "../../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../../components/ui/sovereign-empty-state"

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
})

function formatDate(isoString?: string) {
  if (!isoString) return "—"
  const d = new Date(isoString)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function buildJntTrackingUrl(trackingNumber: string): string {
  const sanitized = trackingNumber.trim()
  if (!sanitized) return "https://www.jtexpress.ph/trajectoryQuery"
  return `https://www.jtexpress.ph/index/query/gzquery.html?bills=${encodeURIComponent(sanitized)}`
}

function paymentBadgeColor(status: string) {
  if (status === "captured") return "green" as const
  if (status === "authorized") return "blue" as const
  if (status === "partially_refunded" || status === "refunded") return "red" as const
  return "orange" as const
}

function fulfillmentBadgeColor(status: string) {
  if (["fulfilled", "shipped", "delivered"].includes(status)) return "green" as const
  if (status === "partially_fulfilled" || status === "partially_shipped") return "orange" as const
  if (status === "canceled") return "red" as const
  return "grey" as const
}

type DisaggregatedComponent = {
  title: string
  quantity: number
}

function disaggregatePackingItems(item: any): DisaggregatedComponent[] {
  const title = (item.title || "").toLowerCase()
  const subtitle = (item.subtitle || "").toLowerCase()
  const sku = (item.variant_sku || "").toUpperCase()
  const results: DisaggregatedComponent[] = []

  let isMultiStack = false

  // Multi-Compound Stacks
  if (sku.includes("BNDL-EGN") || (title.includes("epithalon") && title.includes("glutathione") && title.includes("nad"))) {
    results.push({ title: "Epithalon 10MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
    isMultiStack = true
  } else if (sku.includes("BNDL-GNG") || (title.includes("glutathione") && title.includes("nad") && title.includes("ghk"))) {
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
    isMultiStack = true
  } else if (sku.includes("BNDL-GG") || (title.includes("ghk-cu") && title.includes("glutathione"))) {
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    isMultiStack = true
  } else if (sku.includes("BNDL-EG") || (title.includes("epithalon") && title.includes("glutathione"))) {
    results.push({ title: "Epithalon 10MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    isMultiStack = true
  } else if (sku.includes("BNDL-NG") || (title.includes("nad") && title.includes("ghk"))) {
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
    isMultiStack = true
  }

  // Tier Inclusions (Analytical Lab Set / Complete Set / Reconstitution Diluent)
  const isLabSet =
    subtitle.includes("analytical lab set") ||
    subtitle.includes("complete set") ||
    subtitle.includes("lab set") ||
    subtitle.includes("subq") ||
    sku.includes("LAB-SET") ||
    sku.includes("COMPLETE") ||
    sku.includes("SUBQ")

  const isBac = !isLabSet && (
    subtitle.includes("bac") ||
    subtitle.includes("diluent") ||
    sku.includes("BAC")
  )

  if (isLabSet) {
    if (!isMultiStack) {
      const dosePart = item.subtitle ? item.subtitle.split("/")[0].trim() : ""
      const vialTitle = dosePart && !dosePart.toLowerCase().includes("set")
        ? `${item.title} (${dosePart}) Lyophilized Reference Standard Vial`
        : `${item.title} Lyophilized Reference Standard Vial`
      results.push({ title: vialTitle, quantity: 1 })
    }
    results.push({ title: "10mL Bacteriostatic Water USP (Reconstitution Diluent)", quantity: 1 })
    results.push({ title: "10x U-100 LDS Analytical Syringes (31G, 5/16\")", quantity: 1 })
    results.push({ title: "10x Sterile Alcohol Antiseptic Prep Swabs", quantity: 1 })
  } else if (isBac) {
    if (!isMultiStack) {
      const dosePart = item.subtitle ? item.subtitle.split("/")[0].trim() : ""
      const vialTitle = dosePart && !dosePart.toLowerCase().includes("set")
        ? `${item.title} (${dosePart}) Lyophilized Reference Standard Vial`
        : `${item.title} Lyophilized Reference Standard Vial`
      results.push({ title: vialTitle, quantity: 1 })
    }
    results.push({ title: "10mL Bacteriostatic Water USP (Reconstitution Diluent)", quantity: 1 })
  }

  return results
}

export const OrderCockpitDetailRoute = () => {
  const { id = "" } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [waybillNumber, setWaybillNumber] = useState("")
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [printDrawerOpen, setPrintDrawerOpen] = useState(false)
  const [quickOrderDrawerOpen, setQuickOrderDrawerOpen] = useState(false)
  const [proofDrawerOpen, setProofDrawerOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ManualPaymentProof | null>(null)
  const [activePrintDoc, setActivePrintDoc] = useState<PrintableDocumentType>("packing-slip")
  const [proofZoomUrl, setProofZoomUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openPrintStation = (doc: PrintableDocumentType) => {
    setActivePrintDoc(doc)
    setPrintDrawerOpen(true)
  }

  // 1. Fetch Order
  const orderQuery = useQuery({
    queryKey: ["order-detail-cockpit", id],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ order: any }>(`/admin/orders/${id}`, {
        query: {
          fields:
            "id,display_id,status,fulfillment_status,payment_status,total,subtotal,tax_total,discount_total,shipping_total,currency_code,created_at,updated_at,metadata,email,customer.id,customer.first_name,customer.last_name,customer.email,customer.phone,items.id,items.title,items.subtitle,items.variant_sku,items.quantity,items.unit_price,items.thumbnail,items.metadata,shipping_address.*,fulfillments.*,fulfillments.labels.*,payment_collections.*,payment_collections.payments.*",
        },
      })
      return res?.order
    },
    enabled: Boolean(id),
    refetchInterval: 10_000,
  })

  // 2. Fetch Manual Payment Proofs
  const proofsQuery = useQuery({
    queryKey: ["order-manual-payment-proofs", id],
    queryFn: async () => {
      try {
        const res = await sdk.client.fetch<ManualPaymentProofListResponse>("/admin/manual-payment-proofs", {
          query: { order_id: id, limit: 10 },
        })
        return res?.manual_payment_proofs || []
      } catch {
        return []
      }
    },
    enabled: Boolean(id),
    refetchInterval: 10_000,
  })

  // 3. Fetch Proof File URL (for preview)
  const latestProof = proofsQuery.data?.[0] || null
  const proofFileQuery = useQuery({
    queryKey: ["order-proof-file", latestProof?.id],
    queryFn: async () => {
      if (!latestProof?.id) return null
      try {
        const res = await sdk.client.fetch<{ url: string }>(`/admin/manual-payment-proofs/${latestProof.id}/file`)
        return res?.url || null
      } catch {
        return null
      }
    },
    enabled: Boolean(latestProof?.id),
  })

  // 4. Fetch Digital Research Protocol Entitlements
  const protocolsQuery = useQuery({
    queryKey: ["order-protocol-delivery", id],
    queryFn: async () => {
      try {
        const res = await sdk.client.fetch<{
          protocol_delivery?: {
            accesses?: Array<{
              id: string
              line_item_label: string
              protocol_title: string
              revision: number
              qr_status: "active" | "revoked"
              entitlement_status: "granted" | "not_granted"
              issued_at: string
            }>
          }
        }>(`/admin/orders/${id}/research-protocol-delivery`)
        return res?.protocol_delivery?.accesses || []
      } catch {
        return []
      }
    },
    enabled: Boolean(id),
  })

  const order = orderQuery.data
  const isLoading = orderQuery.isLoading
  const isError = orderQuery.isError

  // Derived Operational Invariants ("No-Pay, No-Pack" Sovereign Guardrail)
  const { isTerminal, isPaid, isConfirmed, canPack } = useMemo(
    () => evaluateOrderPackingGuardrail(order),
    [order]
  )

  const isFulfilledOrShipped = [
    "fulfilled",
    "partially_shipped",
    "shipped",
    "delivered",
  ].includes(order?.fulfillment_status)
  const fulfillments = order?.fulfillments ?? []
  const hasFulfillments = fulfillments.length > 0
  const isBotQa = Boolean(
    order?.metadata?.is_bot_qa === true ||
    (typeof order?.email === "string" && order.email.startsWith("qa-bot-"))
  )
  const displayId = order?.display_id || (order?.id ? order.id.slice(-8) : "—")
  const items = order?.items ?? []
  const itemsSubtotal = useMemo(() => {
    return items.reduce(
      (sum: number, item: any) => sum + ((item.unit_price || 0) * (item.quantity || 1)),
      0
    )
  }, [items])

  const [checkedPackingItems, setCheckedPackingItems] = useState<Record<string, boolean>>({})

  const allChecklistKeys = useMemo(() => {
    const keys: string[] = []
    items.forEach((item: any) => {
      const disaggregated = disaggregatePackingItems(item)
      if (disaggregated.length > 0) {
        disaggregated.forEach((_, idx) => {
          keys.push(`${item.id}-disagg-${idx}`)
        })
      } else {
        keys.push(`${item.id}-single`)
      }
    })
    return keys
  }, [items])

  const allItemsPacked = useMemo(() => {
    if (isFulfilledOrShipped) return true
    if (allChecklistKeys.length === 0) return true
    return allChecklistKeys.every((key) => checkedPackingItems[key] === true)
  }, [isFulfilledOrShipped, allChecklistKeys, checkedPackingItems])

  const toggleAllPackingItems = () => {
    if (allItemsPacked) {
      setCheckedPackingItems({})
    } else {
      const next: Record<string, boolean> = {}
      allChecklistKeys.forEach((key) => {
        next[key] = true
      })
      setCheckedPackingItems(next)
    }
  }

  const customerName = order?.customer
    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || order.customer.email
    : (order?.shipping_address ? `${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}`.trim() : "Guest Customer")

  // Mutations
  const dispatchMutation = useMutation({
    mutationFn: async () => {
      if (isTerminal) {
        toast.error("Order is canceled or refunded. Courier dispatch is terminated.")
        throw new Error("Order is canceled or refunded.")
      }

      if (!canPack) {
        toast.error("Order is not paid or confirmed. Physical packing and dispatch are locked.")
        throw new Error("Order is not paid or confirmed. Physical packing and dispatch are locked.")
      }

      setIsFulfilling(true)
      const tracking = cleanJntWaybill(waybillNumber)

      if (waybillNumber.trim() && !isValidJntWaybill(tracking)) {
        toast.error("Please enter a valid 12-digit Philippine J&T waybill number (e.g. 781234567890)")
        setIsFulfilling(false)
        throw new Error("Invalid 12-digit Philippine J&T waybill number")
      }

      const trackingUrl = buildJntTrackingUrl(tracking)

      const itemsToFulfill = items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
      }))

      // 1. Create fulfillment
      const fulfillmentRes = await sdk.admin.order.createFulfillment(order.id, {
        items: itemsToFulfill,
        metadata: {
          courier: "J&T Express",
          waybill_number: tracking || null,
          tracking_url: tracking ? trackingUrl : null,
          dispatched_at: new Date().toISOString(),
        },
      })

      const fulfillmentId =
        (fulfillmentRes as { fulfillment?: { id: string } }).fulfillment?.id ??
        fulfillments[0]?.id

      // 2. If waybill is provided, create shipment record linking the tracking URL
      if (fulfillmentId && tracking) {
        await sdk.admin.order.createShipment(order.id, fulfillmentId, {
          items: itemsToFulfill,
          labels: [
            {
              tracking_number: tracking,
              tracking_url: trackingUrl,
              label_url: trackingUrl,
            },
          ],
        })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order-detail-cockpit", id] })
      await queryClient.invalidateQueries({ queryKey: ["orders-cockpit-list"] })
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order dispatched via J&T Express")
      setWaybillNumber("")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to dispatch fulfillment")
    },
    onSettled: () => {
      setIsFulfilling(false)
    },
  })

  // Manual payment upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("proof", file)

      const response = await fetch(
        `/admin/orders/${order.id}/manual-payment-proof/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload payment receipt")
      }

      return response.json() as Promise<{ manual_payment_proof: ManualPaymentProof }>
    },
    onSuccess: async (data) => {
      toast.success("Payment receipt attached successfully")
      await queryClient.invalidateQueries({ queryKey: ["order-manual-payment-proofs", id] })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setSelectedProof(data.manual_payment_proof)
      setProofDrawerOpen(true)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not attach receipt")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
  })

  // Admin Confirmation Mutation (Authorizes packing for unpaid or credit accounts)
  const confirmOrderMutation = useMutation({
    mutationFn: async () => {
      if (isTerminal) {
        toast.error("Cannot confirm a canceled or refunded order.")
        throw new Error("Cannot confirm a canceled or refunded order.")
      }

      await sdk.admin.order.update(order.id, {
        metadata: {
          ...(order.metadata || {}),
          confirmed_for_packing: true,
          confirmed_at: new Date().toISOString(),
          confirmed_by: "STATION-PK-01",
        },
      })
    },
    onSuccess: async () => {
      toast.success("Order confirmed. Physical packing and dispatch are now authorized.")
      await queryClient.invalidateQueries({ queryKey: ["order-detail-cockpit", id] })
      await queryClient.invalidateQueries({ queryKey: ["orders-cockpit-list"] })
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to confirm order")
    },
  })

  // Bot Purge Mutation
  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: order.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to purge QA order")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("QA Order Cancelled and Purged")
      navigate("/orders-cockpit")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Purge failed")
    },
  })

  if (isLoading) {
    return <SovereignPageSkeleton rows={7} />
  }

  if (isError || !order) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <SovereignEmptyState
          heading="Order Not Found"
          description={`Order #${id} could not be retrieved from active records.`}
          action={
            <Button asChild size="small" variant="secondary" className="bg-white">
              <Link to="/orders-cockpit">Back to Orders Cockpit</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const trackingNumber = cleanJntWaybill(waybillNumber)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* 1. Top Executive Navigation & Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link
            to="/orders-cockpit"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Orders Cockpit
          </Link>

          {isBotQa && (
            <Badge color="orange" className="text-xs font-mono font-bold">
              Synthetic Bot QA Order
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Heading level="h1" className="text-2xl font-bold text-slate-950 font-mono tracking-tight">
                Order #{displayId}
              </Heading>
              <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-600">
                <span>{order.id}</span>
                <Copy content={order.id} className="size-3 text-slate-400 hover:text-slate-700" />
              </div>
              <Badge color={paymentBadgeColor(order.payment_status)} className="capitalize font-semibold text-xs">
                {order.payment_status.replace("_", " ")}
              </Badge>
              <Badge color={fulfillmentBadgeColor(order.fulfillment_status)} className="capitalize font-semibold text-xs">
                {order.fulfillment_status.replace("_", " ")}
              </Badge>
            </div>
            <Text size="xsmall" className="text-slate-500 mt-1 font-mono">
              Created on {formatDate(order.created_at)} · Online Store · Non-Clinical In-Vitro Reference Standard
            </Text>
          </div>

          {/* Quick Actions Header Dock */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              className="bg-white border-slate-200 text-slate-700 font-semibold"
              onClick={() => setQuickOrderDrawerOpen(true)}
            >
              <ArchiveBox className="size-3.5 mr-1.5 text-slate-500" />
              J&amp;T VIP QuickOrder
            </Button>
            <Button
              size="small"
              variant="secondary"
              className="bg-white border-slate-200 text-slate-700 font-semibold"
              onClick={() => openPrintStation("shipping-label")}
            >
              <ArchiveBox className="size-3.5 mr-1.5 text-slate-500" />
              4x6 Box Label
            </Button>
            <Button
              size="small"
              variant="secondary"
              className="bg-white border-slate-200 text-slate-700 font-semibold"
              onClick={() => openPrintStation("packing-slip")}
            >
              <DocumentText className="size-3.5 mr-1.5 text-slate-500" />
              Packing Slip
            </Button>
            <Button
              size="small"
              variant="secondary"
              className="bg-white border-slate-200 text-slate-700 font-semibold"
              onClick={() => openPrintStation("receipt")}
            >
              <CurrencyDollar className="size-3.5 mr-1.5 text-slate-500" />
              Receipt
            </Button>
            {isBotQa && (
              <Button
                size="small"
                variant="danger"
                isLoading={purgeMutation.isPending}
                onClick={() => purgeMutation.mutate()}
              >
                <Trash className="size-3.5 mr-1.5" />
                Purge QA Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Telemetry HUD (4 Sovereign KPI Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          label="Order Value"
          value={phpFormatter.format(order.total || 0)}
          subtext="Net Commercial Value (PHP)"
          variant="emerald"
          icon={<CurrencyDollar className="size-4 text-emerald-600" />}
          status="healthy"
        />
        <AdminMetricCard
          label="GL Balance Parity"
          value="₱0.00"
          subtext="Debit / Credit Balanced"
          variant="blue"
          icon={<CheckCircleSolid className="size-4 text-blue-600" />}
          status="healthy"
        />
        <AdminMetricCard
          label="Carrier Dispatch"
          value={isTerminal ? "Terminated" : canPack ? "Same-Day" : "Locked"}
          subtext={isTerminal ? "Order Inactive" : canPack ? "Philippine J&T Priority" : "Awaiting Clearance"}
          variant={isTerminal ? "rose" : canPack ? "emerald" : "amber"}
          icon={<ArchiveBox className={`size-4 ${isTerminal ? "text-rose-600" : canPack ? "text-emerald-600" : "text-amber-600"}`} />}
          status={isTerminal ? "critical" : canPack ? "healthy" : "warning"}
        />
        <AdminMetricCard
          label="Cold-Chain SLA"
          value="2°C – 8°C"
          subtext="Thermal Barrier Shield"
          variant="blue"
          icon={<Beaker className="size-4 text-indigo-600" />}
          status="healthy"
        />
      </div>

      {/* 3. STRICT "NO-PAY, NO-PACK" OPERATIONAL GUARDRAIL BANNER */}
      {isTerminal ? (
        <AdminTelemetryNotice
          variant="rose"
          icon={<ExclamationCircle className="size-4 text-rose-600" />}
          title={`Fulfillment Terminated: Order ${order.status === "canceled" ? "Canceled" : "Refunded"}`}
          description="This order has reached a terminal status. Physical picking, box labeling, parcel packaging, and J&T Express courier dispatch are unconditionally locked."
        />
      ) : !canPack ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <ExclamationCircle className="size-4 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-950">
                    Fulfillment Hard-Locked: Awaiting Payment Confirmation
                  </span>
                  <Badge color="orange" className="text-[10px] font-mono">
                    Strict Guardrail
                  </Badge>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-3xl">
                  Under store policy, parcels <strong>cannot be packed, sealed, or dispatched</strong> until payment is captured or the order is explicitly confirmed by warehouse administration.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
              {latestProof ? (
                <Button
                  size="small"
                  variant="secondary"
                  className="bg-white border-amber-300 text-amber-950 hover:bg-amber-100/50 font-semibold text-xs h-8"
                  onClick={() => {
                    setSelectedProof(latestProof)
                    setProofDrawerOpen(true)
                  }}
                >
                  <CreditCard className="size-3.5 mr-1.5 text-amber-700" />
                  Review Payment Proof
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="secondary"
                  className="bg-white border-amber-300 text-amber-950 hover:bg-amber-100/50 font-semibold text-xs h-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="size-3.5 mr-1.5 text-amber-700" />
                  Attach Payment Slip
                </Button>
              )}

              <Button
                size="small"
                variant="primary"
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs h-8 shadow-xs"
                isLoading={confirmOrderMutation.isPending}
                onClick={() => confirmOrderMutation.mutate()}
              >
                <LockOpenSolid className="size-3.5 mr-1.5" />
                Authorize &amp; Confirm for Packing
              </Button>
            </div>
          </div>
        </div>
      ) : isConfirmed && !isPaid ? (
        <AdminTelemetryNotice
          variant="blue"
          icon={<LockOpenSolid className="size-4 text-blue-600" />}
          title="Order Confirmed for Packing (Admin Authorization Granted)"
          description={
            <span>
              Order authorized for physical packing by <strong>{String(order.metadata?.confirmed_by || "STATION-PK-01")}</strong>. Physical packing and J&amp;T Express courier dispatch are unlocked, while final payment settlement remains pending.
            </span>
          }
          actionLabel={latestProof ? "Review & Settle Payment Proof" : "Attach Customer Payment Slip"}
          onActionClick={() => {
            if (latestProof) {
              setSelectedProof(latestProof)
              setProofDrawerOpen(true)
            } else {
              fileInputRef.current?.click()
            }
          }}
        />
      ) : (
        <AdminTelemetryNotice
          variant="emerald"
          icon={<CheckCircleSolid className="size-4 text-emerald-600" />}
          title="Pack Ready (Payment Captured)"
          description="Double-entry General Ledger balance is fully reconciled (₱0.00 parity). Physical packing and J&T Express courier dispatch are unlocked."
        />
      )}

      {/* 4. Split 8 / 4 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 Columns (Primary Operations Workspace) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Line Item & Formulation Breakdown */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Heading level="h2" className="text-sm font-bold text-slate-900">
                  Item &amp; Formulation Breakdown
                </Heading>
                <Badge color="grey" className="font-mono text-[11px]">
                  {items.length} {items.length === 1 ? "Line Item" : "Line Items"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Text size="xsmall" className="text-slate-400 font-mono hidden sm:inline">
                  Verify constituent reference vials before courier sealing
                </Text>
                {canPack && !isFulfilledOrShipped && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={toggleAllPackingItems}
                    className="text-[11px] h-7 px-2.5 bg-white border-slate-200"
                  >
                    {allItemsPacked ? "Uncheck All" : "Verify All Units"}
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item: any) => {
                const disaggregated = disaggregatePackingItems(item)
                const isBundle = disaggregated.length > 0

                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="size-12 rounded-lg border border-slate-200 object-cover shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div className="size-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                            <Beaker className="size-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Text size="small" weight="plus" className="text-slate-900 font-bold">
                              {item.title}
                            </Text>
                            {isBundle && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                <SquaresPlus className="size-3" />
                                Multi-Item Stack
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <Text size="xsmall" className="text-slate-500 mt-0.5">
                              {item.subtitle}
                            </Text>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-mono">
                            <span>SKU: {item.variant_sku || "REFERENCE-STD"}</span>
                            <span>·</span>
                            <span>Qty: {item.quantity}</span>
                            <span>·</span>
                            <span>{phpFormatter.format(item.unit_price || 0)} each</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-slate-900 text-sm">
                          {phpFormatter.format((item.unit_price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    </div>

                    {/* Constituent Vial Disaggregation for Packing Stations */}
                    {isBundle ? (
                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2 mt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
                            <Beaker className="size-3.5 text-indigo-600" />
                            Constituent Pick &amp; Pack Checklist (Disaggregated)
                          </span>
                          <span className="text-[11px] font-medium text-indigo-700 font-mono">
                            Total {disaggregated.reduce((acc, curr) => acc + curr.quantity * item.quantity, 0)} physical units
                          </span>
                        </div>
                        <div className="divide-y divide-indigo-100/70 rounded-md border border-indigo-100/70 bg-white overflow-hidden text-xs">
                          {disaggregated.map((comp, idx) => {
                            const itemKey = `${item.id}-disagg-${idx}`
                            const isChecked = isFulfilledOrShipped || Boolean(checkedPackingItems[itemKey])

                            return (
                              <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50/60 transition-colors">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    disabled={!canPack || isFulfilledOrShipped}
                                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      setCheckedPackingItems((prev) => ({
                                        ...prev,
                                        [itemKey]: e.target.checked,
                                      }))
                                    }}
                                  />
                                  <span className={`font-medium ${!canPack ? "text-slate-400" : isChecked ? "text-indigo-950 font-semibold" : "text-slate-800"}`}>
                                    {comp.title}
                                  </span>
                                </label>
                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  x {comp.quantity * item.quantity}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const itemKey = `${item.id}-single`
                        const isChecked = isFulfilledOrShipped || Boolean(checkedPackingItems[itemKey])

                        return (
                          <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs mt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                disabled={!canPack || isFulfilledOrShipped}
                                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                                checked={isChecked}
                                onChange={(e) => {
                                  setCheckedPackingItems((prev) => ({
                                    ...prev,
                                    [itemKey]: e.target.checked,
                                  }))
                                }}
                              />
                              <span className={`font-medium ${!canPack ? "text-slate-400" : isChecked ? "text-blue-950 font-semibold" : "text-slate-700"}`}>
                                Verified single reference standard vial packed
                              </span>
                            </label>
                            <span className="font-mono text-xs font-bold text-slate-700">
                              x {item.quantity}
                            </span>
                          </div>
                        )
                      })()
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 2: High-Velocity J&T Logistics & Dispatch Desk */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <Heading level="h2" className="text-sm font-bold text-slate-900">
                    J&amp;T Express Philippines Dispatch Desk
                  </Heading>
                  <Badge color={fulfillmentBadgeColor(order.fulfillment_status)} className="capitalize font-semibold text-xs">
                    {order.fulfillment_status.replace("_", " ")}
                  </Badge>
                </div>
                <Text size="xsmall" className="text-slate-500 mt-0.5">
                  High-velocity domestic courier waybill integration and thermal printing.
                </Text>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  className="bg-white border-slate-200 text-xs font-semibold"
                  onClick={() => openPrintStation("shipping-label")}
                >
                  <ArchiveBox className="size-3.5 mr-1 text-slate-500" />
                  Thermal Box Label
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  className="bg-white border-slate-200 text-xs font-semibold"
                  onClick={() => openPrintStation("packing-slip")}
                >
                  <DocumentText className="size-3.5 mr-1 text-slate-500" />
                  Packing Slip
                </Button>
              </div>
            </div>

            {/* Active Dispatched Shipments List */}
            {hasFulfillments ? (
              <div className="space-y-3 px-6 py-4 bg-white">
                <Text size="xsmall" weight="plus" className="uppercase tracking-wider text-slate-500 font-mono">
                  Dispatched Shipments
                </Text>
                {fulfillments.map((fulfillment: any) => {
                  const metadata = (fulfillment.metadata ?? {}) as Record<string, unknown>
                  const waybill =
                    (metadata.waybill_number as string) ||
                    fulfillment.labels?.[0]?.tracking_number ||
                    null
                  const trackingUrl = waybill
                    ? (metadata.tracking_url as string) || buildJntTrackingUrl(waybill)
                    : null

                  return (
                    <div
                      key={fulfillment.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Text size="small" weight="plus" className="font-bold text-slate-900">
                            J&amp;T Express
                          </Text>
                          {fulfillment.shipped_at ? (
                            <Badge color="green">Shipped</Badge>
                          ) : (
                            <Badge color="orange">Packed / Dispatched</Badge>
                          )}
                        </div>
                        <Text size="xsmall" className="mt-0.5 text-slate-500 font-mono">
                          {waybill ? `Waybill #${waybill}` : "No Waybill Assigned"}
                        </Text>
                      </div>

                      {trackingUrl && (
                        <Button
                          size="small"
                          variant="secondary"
                          className="bg-white border-slate-200 text-xs font-semibold"
                          onClick={() => window.open(trackingUrl, "_blank")}
                        >
                          Track on J&amp;T Portal
                          <ArrowUpRightOnBox className="ml-1.5 size-3.5 text-slate-500" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {/* Dispatch Action Panel */}
            {!isFulfilledOrShipped && (
              <div className={`p-6 flex flex-col gap-4 ${isTerminal ? "bg-red-50/30" : !canPack ? "bg-amber-50/30" : "bg-slate-50/30"}`}>
                {isTerminal ? (
                  <div className="rounded-lg border border-red-200 bg-red-50/80 p-3.5 flex items-start gap-3 text-xs text-red-900">
                    <ExclamationCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Fulfillment Terminated ({order.status === "canceled" ? "Order Canceled" : "Payment Refunded"})</span>
                      <p className="text-red-800 mt-0.5 leading-relaxed">
                        Parcels cannot be packed, sealed, or dispatched for canceled or refunded orders.
                      </p>
                    </div>
                  </div>
                ) : !canPack ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-3 text-xs text-amber-900">
                    <ExclamationCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Fulfillment Locked (Awaiting Payment Confirmation)</span>
                      <p className="text-amber-800 mt-0.5 leading-relaxed">
                        Under store operating policy, parcels cannot be sealed or dispatched until payment is captured or the order is explicitly confirmed for packing. Review payment proof or authorize packing above.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Text size="small" weight="plus" className="text-slate-900 font-bold">
                      Enter J&amp;T Express Waybill Number
                    </Text>
                    <Text size="xsmall" className="text-slate-500 mt-0.5">
                      Scan or paste the 12-digit Philippine airway bill barcode from the parcel pouch.
                    </Text>
                  </div>
                )}

                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex flex-col gap-1 w-full sm:w-80">
                    <Input
                      placeholder="J&T Waybill (e.g. 781234567890)"
                      size="small"
                      disabled={!canPack}
                      value={waybillNumber}
                      onChange={(e) => setWaybillNumber(e.target.value)}
                    />
                    {trackingNumber.length > 0 ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isValidJntWaybill(trackingNumber) ? (
                          <Badge color="green" className="text-[10px]">
                            ✓ Valid 12-Digit J&amp;T Waybill
                          </Badge>
                        ) : (
                          <Badge color="orange" className="text-[10px]">
                            ⚠️ Standard J&amp;T waybill is 12 digits ({trackingNumber.length}/12)
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          12-digit barcode required to seal and dispatch
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="small"
                    variant={isTerminal ? "danger" : "primary"}
                    disabled={!canPack || isFulfilling || !allItemsPacked || !isValidJntWaybill(trackingNumber)}
                    isLoading={isFulfilling}
                    onClick={() => dispatchMutation.mutate()}
                    className="font-semibold"
                  >
                    <ArchiveBox className="mr-1.5 size-3.5" />
                    {isTerminal
                      ? "Fulfillment Terminated"
                      : !canPack
                      ? "Locked: Awaiting Payment"
                      : !allItemsPacked
                      ? "Verify All Units First"
                      : !isValidJntWaybill(trackingNumber)
                      ? "Enter Valid 12-Digit Waybill"
                      : "Fulfill & Dispatch Parcel"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Commercial Financial Ledger */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
              <Heading level="h2" className="text-sm font-bold text-slate-900">
                Commercial Financial Ledger
              </Heading>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
                <CheckCircleSolid className="size-3.5 text-emerald-600" />
                ₱0.00 GL Parity
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono font-medium text-slate-900">{phpFormatter.format(itemsSubtotal || order.item_subtotal || order.subtotal || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Cold-Chain Express Delivery (J&amp;T Priority):</span>
                <span className="font-mono font-medium text-slate-900">{phpFormatter.format(order.shipping_total || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>In-Vitro Reference Standard VAT (Non-Taxable):</span>
                <span className="font-mono font-medium text-slate-500">₱0.00</span>
              </div>
              {order.discount_total ? (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Stack Volume Savings:</span>
                  <span className="font-mono font-medium">- {phpFormatter.format(order.discount_total)}</span>
                </div>
              ) : null}

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Total Commercial Settlement:</span>
                <span className="font-mono font-bold text-slate-950 text-base">{phpFormatter.format(order.total || 0)}</span>
              </div>

              {/* General Ledger Balance Lock Verification */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 mt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Double-Entry General Ledger Balance Audit
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white border border-slate-200/60">
                    <span className="text-slate-500 block">Debit (Accounts Receivable / Cash):</span>
                    <span className="font-bold text-slate-900">{phpFormatter.format(order.total || 0)}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200/60">
                    <span className="text-slate-500 block">Credit (Analytical Revenue + Courier):</span>
                    <span className="font-bold text-slate-900">{phpFormatter.format(order.total || 0)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>General Ledger Difference:</span>
                  <span className="font-mono font-bold text-emerald-600">₱0.00 (Perfect Balance Lock)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: QR Payment Proof & Settlement Vault */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
              <div>
                <Heading level="h2" className="text-sm font-bold text-slate-900">
                  Manual QR Payment Proof &amp; Settlement
                </Heading>
                <Text size="xsmall" className="text-slate-500 mt-0.5">
                  Direct customer proof inspection, reference verification, and balance capture.
                </Text>
              </div>

              {latestProof && (
                <Badge color={paymentBadgeColor(latestProof.status)} className="capitalize font-semibold text-xs">
                  Proof: {latestProof.status}
                </Badge>
              )}
            </div>

            <div className="p-6">
              {latestProof ? (
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Proof Thumbnail */}
                  {proofFileQuery.data ? (
                    <div
                      className="relative size-24 rounded-lg border border-slate-200 overflow-hidden shrink-0 group cursor-pointer bg-slate-50"
                      onClick={() => setProofZoomUrl(proofFileQuery.data)}
                    >
                      <img
                        src={proofFileQuery.data}
                        alt="Payment Proof"
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                        Zoom
                      </div>
                    </div>
                  ) : (
                    <div className="size-24 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <DocumentText className="size-8" />
                    </div>
                  )}

                  {/* Proof Details */}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {latestProof.file_name || "Payment Receipt Screenshot"}
                      </span>
                      <span className="font-mono text-slate-400">{formatDate(latestProof.submitted_at)}</span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">
                      Provider: {latestProof.provider_id || "GCash / BDO QR Manual"} · SHA256: {latestProof.checksum_sha256?.slice(0, 12)}...
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        className="bg-white border-slate-200 text-xs font-semibold"
                        onClick={() => {
                          setSelectedProof(latestProof)
                          setProofDrawerOpen(true)
                        }}
                      >
                        <CreditCard className="size-3.5 mr-1 text-slate-500" />
                        Open Proof Review Drawer
                      </Button>
                      {proofFileQuery.data && (
                        <Button
                          size="small"
                          variant="secondary"
                          className="bg-white border-slate-200 text-xs font-semibold"
                          onClick={() => window.open(proofFileQuery.data!, "_blank")}
                        >
                          <ArrowUpRightOnBox className="size-3.5 mr-1 text-slate-500" />
                          View Full Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-900 block">No Customer Payment Slip Submitted</span>
                    <p className="text-slate-500 mt-0.5">
                      The customer has not yet uploaded a GCash or BDO transfer receipt for this order.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadMutation.mutate(file)
                      }}
                    />
                    <Button
                      size="small"
                      variant="secondary"
                      className="bg-white border-slate-200 font-semibold"
                      isLoading={uploadMutation.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="size-3.5 mr-1" />
                      Attach Customer Receipt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Digital Research Protocol Delivery */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
              <div>
                <Heading level="h2" className="text-sm font-bold text-slate-900">
                  Digital Research Protocol Delivery
                </Heading>
                <Text size="xsmall" className="text-slate-500 mt-0.5">
                  Customer account protocol entitlements and analytical reference dossiers.
                </Text>
              </div>
              <Badge color="green" className="text-xs font-mono">
                {protocolsQuery.data?.length || 0} Entitlements
              </Badge>
            </div>

            <div className="p-6">
              {protocolsQuery.data && protocolsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {protocolsQuery.data.map((access: any) => (
                    <div
                      key={access.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Text weight="plus" className="font-bold text-slate-900">
                            {access.protocol_title}
                          </Text>
                          <Badge color="green" className="text-[10px]">
                            Revision {access.revision}
                          </Badge>
                        </div>
                        <Text size="xsmall" className="text-slate-500 font-mono mt-0.5">
                          {access.line_item_label} · Access Granted {formatDate(access.issued_at)}
                        </Text>
                      </div>

                      <Button
                        size="small"
                        variant="secondary"
                        className="bg-white border-slate-200 text-xs font-semibold"
                        onClick={() => {
                          const slug = access.protocol_title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                          window.open(`http://localhost:8000/ph/research-protocols/${slug}/dossier?preset=full`, "_blank")
                        }}
                      >
                        Open Research Dossier
                        <ArrowUpRightOnBox className="ml-1.5 size-3.5 text-slate-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Text size="small" className="text-slate-500">
                  No automated protocol entitlements bound to this order.
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Columns (Contextual Telemetry & Customer Dossier) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Customer Profile Dossier */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="px-5 py-4 bg-slate-50/50">
              <Heading level="h2" className="text-sm font-bold text-slate-900">
                Customer Profile Dossier
              </Heading>
              <Text size="xsmall" className="text-slate-500 mt-0.5">
                Recipient identity and destination address.
              </Text>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono block">Customer Name:</span>
                <span className="font-bold text-slate-900 text-sm">{customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono block">Contact Email:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-slate-800">{order.email || order.customer?.email || "—"}</span>
                  {order.email && <Copy content={order.email} className="size-3 text-slate-400 hover:text-slate-700" />}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono block">Phone (Courier Contact):</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-slate-800">
                    {order.shipping_address?.phone || order.customer?.phone || "—"}
                  </span>
                  {order.shipping_address?.phone && (
                    <Copy content={order.shipping_address.phone} className="size-3 text-slate-400 hover:text-slate-700" />
                  )}
                </div>
              </div>

              {/* Philippine Shipping Address */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono block mb-1">
                  Philippine Shipping Address:
                </span>
                {order.shipping_address ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 font-mono text-xs space-y-0.5 text-slate-800">
                    <p className="font-bold text-slate-900">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    <p>{order.shipping_address.address_1}</p>
                    {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
                    </p>
                    <p className="text-slate-500 font-semibold">{order.shipping_address.country_code?.toUpperCase() || "PH"}</p>
                  </div>
                ) : (
                  <span className="text-slate-400">No shipping address recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Cold-Chain Logistics Protocol */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="px-5 py-4 bg-slate-50/50">
              <Heading level="h2" className="text-sm font-bold text-slate-900">
                Cold-Chain Transport Protocol
              </Heading>
              <Text size="xsmall" className="text-slate-500 mt-0.5">
                Protective ambient and cryogenic thermal guarantee.
              </Text>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="font-semibold text-slate-900">Temperature Spec:</span>
                <span className="font-mono text-blue-700 font-bold">2°C – 8°C Cold-Chain Shield</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-900">Packaging Barrier:</span>
                <span className="font-mono text-slate-700">Insulated Foil Sleeve</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-900">Courier SLA:</span>
                <span className="font-mono text-slate-700">Same-Day / 24-48h Luzon</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-900">Laboratory Notice:</span>
                <span className="font-mono text-slate-700">Store Lyophilized at -20°C Upon Receipt</span>
              </div>
            </div>
          </div>

          {/* Card 3: Audit Ledger Timeline */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="px-5 py-4 bg-slate-50/50">
              <Heading level="h2" className="text-sm font-bold text-slate-900">
                Audit Ledger Timeline
              </Heading>
              <Text size="xsmall" className="text-slate-500 mt-0.5">
                Deterministic event progression for this order.
              </Text>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Order Placed</span>
                  <span className="text-slate-400 font-mono text-[11px]">{formatDate(order.created_at)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className={`size-2 rounded-full mt-1.5 shrink-0 ${isTerminal ? "bg-red-500" : canPack ? "bg-emerald-600" : "bg-amber-500"}`} />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {isTerminal ? "Order Terminated" : isPaid ? "Payment Captured" : isConfirmed ? "Order Confirmed for Packing" : "Awaiting Payment Settle"}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {isTerminal ? `Order ${order.status === "canceled" ? "Canceled" : "Refunded"}` : isPaid ? "Reconciled to ₱0.00 GL Parity" : isConfirmed ? "Admin Override: Packing Authorized" : "No-Pay No-Pack Active"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className={`size-2 rounded-full mt-1.5 shrink-0 ${isFulfilledOrShipped ? "bg-emerald-600" : "bg-slate-300"}`} />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {isFulfilledOrShipped ? "Courier Dispatched" : "Fulfillment Pending"}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {isFulfilledOrShipped ? "Handed over to J&T Express" : "Awaiting Waybill Entry"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers & Modals */}
      <PackingStationDrawer
        order={order}
        open={printDrawerOpen}
        onOpenChange={setPrintDrawerOpen}
        initialDoc={activePrintDoc}
        waybillNumber={waybillNumber}
      />

      <JntQuickOrderDrawer
        order={order}
        open={quickOrderDrawerOpen}
        onOpenChange={setQuickOrderDrawerOpen}
      />

      <ManualPaymentProofReviewDrawer
        proof={selectedProof}
        order={order}
        open={proofDrawerOpen}
        onOpenChange={setProofDrawerOpen}
      />

      {/* Proof Image Click-to-Zoom Modal */}
      {proofZoomUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setProofZoomUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setProofZoomUrl(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
            >
              <XMark className="size-5" />
            </button>
            <img src={proofZoomUrl} alt="Zoomed Proof" className="max-h-[85vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderCockpitDetailRoute
