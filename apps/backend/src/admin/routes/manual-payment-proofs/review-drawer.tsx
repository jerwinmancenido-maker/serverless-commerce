/**
 * @file    apps/backend/src/admin/routes/manual-payment-proofs/review-drawer.tsx
 * @module  ManualPaymentProofReviewDrawer
 * @purpose Split-screen payment slip inspection canvas and financial match audit console.
 * @contracts
 *   API:     GET /admin/manual-payment-proofs/:id · POST /settle · POST /review
 *   Service: ManualPaymentModuleService · Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowPath,
  ArrowUpRightOnBox,
  DocumentText,
  ShieldCheck,
  Spinner,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Drawer,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import type {
  ManualPaymentProof,
  ManualPaymentProofDetailsResponse,
  ManualPaymentProofLinkedOrder,
  ManualPaymentProofReviewResponse,
  ManualPaymentProofSettleResponse,
  ManualPaymentSettlementStatus,
} from "./types"

type ReviewDrawerProps = {
  proof: ManualPaymentProof | null
  order?: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
})

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—"
}

function proofStatusColor(status: ManualPaymentProof["status"]) {
  if (status === "approved") return "green" as const
  if (status === "rejected") return "red" as const
  if (status === "expired") return "grey" as const
  return "orange" as const
}

function settlementStatusColor(status?: ManualPaymentSettlementStatus) {
  if (status === "captured") return "green" as const
  if (status === "authorized") return "blue" as const
  if (status === "authorizing" || status === "capturing") return "orange" as const
  if (status === "failed") return "red" as const
  return "grey" as const
}

const REJECTION_PRESETS = [
  {
    label: "Amount Mismatch",
    text: "The submitted payment slip amount does not match the required order balance.",
  },
  {
    label: "Reference Not in Ledger",
    text: "Transaction reference number could not be located in bank or e-wallet account records.",
  },
  {
    label: "Unreadable / Blurry",
    text: "Payment slip screenshot is blurry, cropped, or illegible. Please upload a clear official receipt.",
  },
  {
    label: "Duplicate Slip",
    text: "This payment receipt has already been submitted for another transaction.",
  },
]

export const ManualPaymentProofReviewDrawer = ({
  proof,
  order: propOrder,
  open,
  onOpenChange,
}: ReviewDrawerProps) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const queryClient = useQueryClient()

  const detailsQuery = useQuery({
    queryKey: ["manual-payment-proofs", "details", proof?.id],
    queryFn: () =>
      sdk.client.fetch<ManualPaymentProofDetailsResponse>(
        `/admin/manual-payment-proofs/${proof?.id}`,
      ),
    enabled: open && Boolean(proof?.id),
  })

  const currentProof = detailsQuery.data?.manual_payment_proof ?? proof
  const settlement = detailsQuery.data?.settlement
  const linkedOrder: ManualPaymentProofLinkedOrder = propOrder ?? detailsQuery.data?.order ?? null

  const fileQuery = useQuery({
    queryKey: ["manual-payment-proofs", "file", proof?.id],
    queryFn: () =>
      sdk.client.fetch<{ url: string }>(
        `/admin/manual-payment-proofs/${proof?.id}/file`,
      ),
    enabled: open && Boolean(proof?.id),
  })

  useEffect(() => {
    setRejectionReason(currentProof?.rejection_reason ?? "")
    setZoomLevel(100)
    setRotation(0)
  }, [currentProof?.id, currentProof?.rejection_reason])

  const rejectMutation = useMutation({
    mutationFn: (input: { reason: string }) =>
      sdk.client.fetch<ManualPaymentProofReviewResponse>(
        `/admin/manual-payment-proofs/${proof?.id}/review`,
        { method: "POST", body: { decision: "rejected", reason: input.reason } },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["manual-payment-proofs"],
      })
      toast.success("Payment proof rejected")
    },
    onError: (error) => {
      toast.error(error.message || "Payment proof rejection failed")
    },
  })

  const settleMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<ManualPaymentProofSettleResponse>(
        `/admin/manual-payment-proofs/${proof?.id}/settle`,
        { method: "POST" },
      ),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["manual-payment-proofs"],
      })
      toast.success(`Payment approved and settled (${data.settlement_status})`)
    },
    onError: (error) => {
      toast.error(error.message || "Payment settlement failed")
    },
  })

  const reject = () => {
    const reason = rejectionReason.trim()

    if (!reason) {
      toast.error("Enter a rejection reason")
      return
    }

    rejectMutation.mutate({ reason })
  }

  const isPendingAction = rejectMutation.isPending || settleMutation.isPending

  const rawUrl = fileQuery.data?.url
  const fileUrl = rawUrl?.startsWith("http")
    ? rawUrl
    : rawUrl
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${rawUrl}`
      : undefined

  const isPdf =
    currentProof?.mime_type === "application/pdf" ||
    Boolean(currentProof?.file_name?.toLowerCase().endsWith(".pdf"))

  const customerName =
    [linkedOrder?.customer?.first_name, linkedOrder?.customer?.last_name]
      .filter(Boolean)
      .join(" ") || "—"

  const customerEmail = linkedOrder?.customer?.email || "—"
  const customerPhone = linkedOrder?.customer?.phone || null
  const displayId = linkedOrder?.display_id
    ? `#${linkedOrder.display_id}`
    : currentProof?.order_id
      ? `#${currentProof.order_id.slice(-6)}`
      : "—"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="w-full sm:max-w-4xl lg:max-w-5xl h-dvh sm:h-full flex flex-col justify-between">
        <Drawer.Header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Drawer.Title className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Review Manual QR Proof
                {displayId !== "—" && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                    Order {displayId}
                  </span>
                )}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Inspect payment slip, match reference number against account ledger, and settle order balance.
              </Drawer.Description>
            </div>
            {currentProof ? (
              <div className="flex items-center gap-2">
                <Badge color={proofStatusColor(currentProof.status)}>
                  Proof: {currentProof.status}
                </Badge>
                <Badge
                  color={settlementStatusColor(
                    settlement?.status || currentProof.settlement_status,
                  )}
                >
                  Settlement:{" "}
                  {settlement?.status ||
                    currentProof.settlement_status ||
                    "not_started"}
                </Badge>
              </div>
            ) : null}
          </div>
        </Drawer.Header>

        <Drawer.Body className="flex-1 overflow-hidden p-0">
          {detailsQuery.isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : currentProof ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-y-auto lg:overflow-hidden">
              {/* LEFT COLUMN: Receipt Inspection Canvas (7 cols) */}
              <div className="lg:col-span-7 flex flex-col bg-slate-950 border-r border-slate-800 h-full overflow-hidden">
                {/* Canvas Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium mr-1">Zoom:</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                      disabled={zoomLevel <= 50}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] w-10 text-center text-slate-200">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                      disabled={zoomLevel >= 250}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomLevel(100)
                        setRotation(0)
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs ml-1 font-medium transition-colors"
                      title="Reset view to 100%"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-medium transition-colors"
                      title="Rotate 90 degrees clockwise"
                    >
                      <ArrowPath className="h-3 w-3" />
                      Rotate ({rotation}°)
                    </button>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900 text-xs flex items-center gap-1 font-medium transition-colors"
                      >
                        Fullscreen
                        <ArrowUpRightOnBox className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Main Inspection Viewport */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-6 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                  {fileQuery.isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Spinner className="h-6 w-6 animate-spin text-emerald-500" />
                      <span className="text-xs">Loading receipt image...</span>
                    </div>
                  ) : isPdf ? (
                    <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-900 rounded-xl p-6 text-center border border-slate-800">
                      <DocumentText className="h-12 w-12 text-rose-400 mb-3" />
                      <div className="text-sm font-semibold text-white mb-1">
                        PDF Payment Document
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mb-4">
                        {currentProof.file_name} (
                        {Math.ceil(currentProof.size_bytes / 1024)} KB)
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-colors"
                      >
                        Open PDF in New Window
                        <ArrowUpRightOnBox className="h-4 w-4" />
                      </a>
                    </div>
                  ) : fileUrl ? (
                    <div
                      className="transition-transform duration-150 flex items-center justify-center"
                      style={{
                        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                    >
                      <img
                        src={fileUrl}
                        alt="Payment Proof Slip"
                        className="max-h-[60vh] max-w-full object-contain rounded shadow-2xl bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs">
                      <DocumentText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                      No preview available for this proof slip
                    </div>
                  )}
                </div>

                {/* Bottom Slip File Information */}
                <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="font-mono truncate max-w-xs flex items-center gap-1.5 text-slate-300">
                    <DocumentText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{currentProof.file_name}</span>
                    <span>· {Math.ceil(currentProof.size_bytes / 1024)} KB</span>
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    SHA:{" "}
                    {currentProof.checksum_sha256
                      ? currentProof.checksum_sha256.slice(0, 12) + "..."
                      : "—"}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Financial Match & Audit Console (5 cols) */}
              <div className="lg:col-span-5 flex flex-col overflow-y-auto bg-slate-50/50 p-4 sm:p-6 space-y-4">
                {/* 1. Target Order Balance Card */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Order Balance to Settle
                    </span>
                    {linkedOrder?.display_id && (
                      <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        #{linkedOrder.display_id}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono tracking-tight">
                    {linkedOrder?.total != null
                      ? phpFormatter.format(linkedOrder.total)
                      : "—"}
                  </div>
                  <div className="text-[11px] text-emerald-700/90 mt-1 flex items-center gap-1.5">
                    <span>
                      Channel:{" "}
                      <strong className="font-semibold text-emerald-950">
                        Manual QR / InstaPay
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Status:{" "}
                      <strong className="font-semibold capitalize text-emerald-950">
                        {linkedOrder?.status || "pending"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 2. Customer & Order Context Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Customer & Protocol Items
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Customer</span>
                      <span className="font-semibold text-slate-900">{customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email</span>
                      <span
                        className="font-medium text-slate-700 truncate block"
                        title={customerEmail}
                      >
                        {customerEmail}
                      </span>
                    </div>
                    {customerPhone && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Phone</span>
                        <span className="font-mono text-slate-700">{customerPhone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 block text-[11px]">Submitted</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(currentProof.submitted_at)}
                      </span>
                    </div>
                  </div>

                  {/* Line items mini breakdown */}
                  {linkedOrder?.items && linkedOrder.items.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Ordered Compounds ({linkedOrder.items.length})
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
                        {linkedOrder.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-slate-700"
                          >
                            <span className="truncate max-w-[170px]">{item.title}</span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {item.quantity}x @{" "}
                              {phpFormatter.format(item.unit_price || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deep links */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <Link
                      to={`/orders-cockpit/${currentProof.order_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                    >
                      View Order Cockpit{" "}
                      <ArrowUpRightOnBox className="h-3 w-3" />
                    </Link>
                    <Link
                      to={`/customers/${currentProof.customer_id}`}
                      className="text-slate-500 hover:text-slate-700 font-mono"
                    >
                      ID: {currentProof.customer_id.slice(0, 12)}...
                    </Link>
                  </div>
                </div>

                {/* 3. Rejection Presets & Input (Only in pending state) */}
                {currentProof.status === "pending" ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="manual-payment-rejection-reason"
                        className="text-xs font-bold text-slate-800"
                      >
                        Rejection Reason
                      </Label>
                      <span className="text-[10px] text-slate-400">
                        Required to reject
                      </span>
                    </div>

                    {/* Quick Rejection Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Quick Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {REJECTION_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setRejectionReason(preset.text)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium border border-slate-200/60"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      id="manual-payment-rejection-reason"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Select a preset above or enter specific mismatch details..."
                      className="text-xs resize-none rounded-lg"
                      rows={2}
                    />
                  </div>
                ) : null}

                {/* 4. Financial State Details */}
                {settlement?.payment_id ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-xs">
                    <Text
                      size="xsmall"
                      className="text-slate-400 uppercase font-semibold tracking-wider text-[10px]"
                    >
                      Medusa Financial Settlement
                    </Text>
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <div>
                        Payment ID:{" "}
                        <span className="font-mono text-slate-500">
                          {settlement.payment_id}
                        </span>
                      </div>
                      {settlement.capture_id ? (
                        <div>
                          Capture ID:{" "}
                          <span className="font-mono text-slate-500">
                            {settlement.capture_id}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* 5. Audit History Timeline */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Audit History
                  </div>
                  <div className="space-y-2">
                    {detailsQuery.data?.events?.map((event) => (
                      <div
                        key={event.id}
                        className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold capitalize text-slate-800">
                            {event.event_type} · rev {event.revision}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(event.occurred_at)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          Actor: {event.actor_id}
                        </div>
                        {event.reason ? (
                          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded p-1.5 mt-1.5 italic">
                            "{event.reason}"
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-error px-6 py-4"
            >
              Payment proof could not be loaded.
            </Text>
          )}
        </Drawer.Body>

        <Drawer.Footer className="px-4 sm:px-6 py-3 pb-[env(safe-area-inset-bottom,1rem)] border-t border-slate-200 bg-white">
          <div className="flex w-full items-center justify-between gap-3">
            <Drawer.Close asChild>
              <Button
                size="small"
                variant="secondary"
                disabled={isPendingAction}
                className="h-9 text-xs px-4"
              >
                Close
              </Button>
            </Drawer.Close>
            {currentProof?.status === "pending" ? (
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={isPendingAction || !rejectionReason.trim()}
                  isLoading={rejectMutation.isPending}
                  onClick={reject}
                  className="h-9 text-xs px-3 text-rose-700 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-40"
                >
                  Reject Proof
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  isLoading={settleMutation.isPending}
                  disabled={isPendingAction}
                  onClick={() => settleMutation.mutate()}
                  className="h-9 text-xs px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Approve & Capture{" "}
                  {linkedOrder?.total != null
                    ? phpFormatter.format(linkedOrder.total)
                    : "Payment"}
                </Button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Proof already {currentProof?.status}
              </span>
            )}
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

