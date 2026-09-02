import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Spinner } from "@medusajs/icons"
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

  const fileMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ url: string }>(
        `/admin/manual-payment-proofs/${proof?.id}/file`,
      ),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer")
    },
    onError: (error) => {
      toast.error(error.message || "Payment proof file could not be opened")
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
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Review Manual QR proof</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex-1 overflow-auto p-0">
          {detailsQuery.isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner />
            </div>
          ) : currentProof ? (
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge color={proofStatusColor(currentProof.status)}>
                    Proof: {currentProof.status}
                  </Badge>
                  <Badge color={settlementStatusColor(settlement?.status || currentProof.settlement_status)}>
                    Settlement: {settlement?.status || currentProof.settlement_status || "not_started"}
                  </Badge>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={fileMutation.isPending}
                  onClick={() => fileMutation.mutate()}
                >
                  View proof file
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle"
                  >
                    Order
                  </Text>
                  <Button
                    asChild
                    size="small"
                    variant="transparent"
                    className="justify-start p-0"
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
                    className="text-ui-fg-subtle"
                  >
                    Customer
                  </Text>
                  <Button
                    asChild
                    size="small"
                    variant="transparent"
                    className="justify-start p-0"
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
                    className="text-ui-fg-subtle"
                  >
                    Revision
                  </Text>
                  <Text size="small" leading="compact" weight="plus">
                    {currentProof.revision}
                  </Text>
                </div>
                <div className="flex flex-col gap-1">
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle"
                  >
                    Submitted
                  </Text>
                  <Text size="small" leading="compact" weight="plus">
                    {formatDate(currentProof.submitted_at)}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  File
                </Text>
                <Text size="small" leading="compact" weight="plus">
                  {currentProof.file_name} ·{" "}
                  {Math.ceil(currentProof.size_bytes / 1024)} KB
                </Text>
              </div>

              {settlement?.payment_id ? (
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 space-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted uppercase font-semibold tracking-wider">
                    Medusa Financial State
                  </Text>
                  <div className="text-xs text-ui-fg-base">
                    <div>Payment ID: <span className="font-mono">{settlement.payment_id}</span></div>
                    {settlement.capture_id ? (
                      <div>Capture ID: <span className="font-mono">{settlement.capture_id}</span></div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Text size="small" leading="compact" weight="plus">
                  Audit history
                </Text>
                {detailsQuery.data?.events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-ui-bg-component shadow-elevation-card-rest rounded-md px-4 py-3"
                  >
                    <Text size="small" leading="compact" weight="plus">
                      {event.event_type} · revision {event.revision}
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {formatDate(event.occurred_at)} · {event.actor_id}
                    </Text>
                    {event.reason ? (
                      <Text
                        size="small"
                        leading="compact"
                        className="text-ui-fg-subtle"
                      >
                        {event.reason}
                      </Text>
                    ) : null}
                  </div>
                ))}
              </div>

              {currentProof.status === "pending" ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="manual-payment-rejection-reason">
                    Rejection reason
                  </Label>
                  <Textarea
                    id="manual-payment-rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Required only when rejecting"
                  />
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle"
                  >
                    Approving and capturing triggers financial authorization and capture for the full order amount in Medusa.
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
                >
                  Reject proof
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  isLoading={settleMutation.isPending}
                  disabled={isPendingAction}
                  onClick={() => settleMutation.mutate()}
                >
                  Approve and capture payment
                </Button>
              </>
            ) : null}
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
