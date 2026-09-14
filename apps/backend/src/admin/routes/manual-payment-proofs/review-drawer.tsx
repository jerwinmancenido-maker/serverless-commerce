import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowUpRightOnBox,
  DocumentText,
  MagnifyingGlass,
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
  ManualPaymentProofReviewResponse,
  ManualPaymentProofSettleResponse,
  ManualPaymentSettlementStatus,
} from "./types"

type ReviewDrawerProps = {
  proof: ManualPaymentProof | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export const ManualPaymentProofReviewDrawer = ({
  proof,
  open,
  onOpenChange,
}: ReviewDrawerProps) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [isZoomed, setIsZoomed] = useState(false)
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="sm:max-w-lg">
        <Drawer.Header>
          <Drawer.Title className="text-base font-bold text-slate-900">Review Manual QR Proof</Drawer.Title>
          <Drawer.Description className="text-xs text-slate-500">
            Inspect customer payment slip, match reference number, and settle order balance.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="flex-1 overflow-auto p-0">
          {detailsQuery.isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner />
            </div>
          ) : currentProof ? (
            <div className="flex flex-col gap-4 px-6 py-4">
              {/* Status Badges & Quick Link */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge color={proofStatusColor(currentProof.status)}>
                    Proof: {currentProof.status}
                  </Badge>
                  <Badge color={settlementStatusColor(settlement?.status || currentProof.settlement_status)}>
                    Settlement: {settlement?.status || currentProof.settlement_status || "not_started"}
                  </Badge>
                </div>
                {fileQuery.data?.url && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => window.open(fileQuery.data!.url, "_blank", "noopener,noreferrer")}
                  >
                    View Original
                    <ArrowUpRightOnBox className="ml-1 h-3.5 w-3.5 text-slate-500" />
                  </Button>
                )}
              </div>

              {/* Embedded Proof Inspector with Zoom Toggle */}
              {fileQuery.data?.url && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex flex-col items-center">
                  <div
                    className={`w-full overflow-auto rounded-lg transition-all ${
                      isZoomed ? "max-h-[500px] cursor-zoom-out bg-white p-2" : "max-h-64 cursor-zoom-in flex justify-center"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    title={isZoomed ? "Click to minimize view" : "Click to zoom receipt"}
                  >
                    <img
                      src={fileQuery.data.url}
                      alt="Payment Proof Slip"
                      className={`object-contain rounded shadow-xs transition-transform duration-150 ${
                        isZoomed ? "w-full max-w-none scale-105" : "max-h-64"
                      }`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-slate-200 px-1 text-[11px]">
                    <span className="text-slate-500 font-mono truncate max-w-[200px] flex items-center gap-1">
                      <DocumentText className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{currentProof.file_name}</span>
                      <span>· {Math.ceil(currentProof.size_bytes / 1024)} KB</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        <MagnifyingGlass className="h-3 w-3" />
                        {isZoomed ? "Reset Zoom" : "Zoom Receipt"}
                      </button>
                      <a
                        href={fileQuery.data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        Fullscreen
                        <ArrowUpRightOnBox className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle text-xs"
                  >
                    Order
                  </Text>
                  <Button
                    asChild
                    size="small"
                    variant="transparent"
                    className="justify-start p-0 text-xs font-mono font-medium"
                  >
                    <Link to={`/orders/${currentProof.order_id}`}>
                      {currentProof.order_id}
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle text-xs"
                  >
                    Customer
                  </Text>
                  <Button
                    asChild
                    size="small"
                    variant="transparent"
                    className="justify-start p-0 text-xs font-mono font-medium"
                  >
                    <Link to={`/customers/${currentProof.customer_id}`}>
                      {currentProof.customer_id}
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle text-xs"
                  >
                    Revision
                  </Text>
                  <Text size="small" leading="compact" weight="plus" className="text-xs">
                    {currentProof.revision}
                  </Text>
                </div>
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle text-xs"
                  >
                    Submitted
                  </Text>
                  <Text size="small" leading="compact" weight="plus" className="text-xs">
                    {formatDate(currentProof.submitted_at)}
                  </Text>
                </div>
              </div>

              {settlement?.payment_id ? (
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 space-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted uppercase font-semibold tracking-wider text-[10px]">
                    Medusa Financial State
                  </Text>
                  <div className="text-xs text-ui-fg-base space-y-0.5">
                    <div>Payment ID: <span className="font-mono text-ui-fg-subtle">{settlement.payment_id}</span></div>
                    {settlement.capture_id ? (
                      <div>Capture ID: <span className="font-mono text-ui-fg-subtle">{settlement.capture_id}</span></div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Text size="small" leading="compact" weight="plus" className="text-xs font-semibold uppercase tracking-wider text-ui-fg-muted">
                  Audit History
                </Text>
                {detailsQuery.data?.events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-ui-bg-subtle border border-ui-border-base rounded-lg px-3 py-2 text-xs"
                  >
                    <Text size="small" leading="compact" weight="plus" className="text-xs">
                      {event.event_type} · revision {event.revision}
                    </Text>
                    <Text
                      size="xsmall"
                      leading="compact"
                      className="text-ui-fg-subtle text-[11px]"
                    >
                      {formatDate(event.occurred_at)} · {event.actor_id}
                    </Text>
                    {event.reason ? (
                      <Text
                        size="xsmall"
                        leading="compact"
                        className="text-ui-fg-muted text-[11px] mt-1 italic"
                      >
                        "{event.reason}"
                      </Text>
                    ) : null}
                  </div>
                ))}
              </div>

              {currentProof.status === "pending" ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-ui-border-base">
                  <Label htmlFor="manual-payment-rejection-reason" className="text-xs font-semibold">
                    Rejection Reason
                  </Label>
                  <Textarea
                    id="manual-payment-rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Required only when rejecting proof slip…"
                    className="text-xs resize-none"
                    rows={2}
                  />
                  <Text
                    size="xsmall"
                    leading="compact"
                    className="text-ui-fg-subtle text-[11px]"
                  >
                    Approving triggers native financial authorization and capture for the full order amount in Medusa.
                  </Text>
                </div>
              ) : null}
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
        <Drawer.Footer>
          <div className="flex w-full items-center justify-end gap-2">
            <Drawer.Close asChild>
              <Button
                size="small"
                variant="secondary"
                disabled={isPendingAction}
                className="h-8 text-xs"
              >
                Close
              </Button>
            </Drawer.Close>
            {currentProof?.status === "pending" ? (
              <>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={isPendingAction}
                  isLoading={rejectMutation.isPending}
                  onClick={reject}
                  className="h-8 text-xs"
                >
                  Reject Proof
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  isLoading={settleMutation.isPending}
                  disabled={isPendingAction}
                  onClick={() => settleMutation.mutate()}
                  className="h-8 text-xs"
                >
                  Approve and Capture Payment
                </Button>
              </>
            ) : null}
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
