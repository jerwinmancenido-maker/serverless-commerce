/**
 * @file    apps/backend/src/admin/widgets/order-payment-proof.tsx
 * @module  OrderPaymentProofWidget
 * @purpose Order detail widget displaying submitted QR / bank transfer payment proofs.
 * @contracts
 *   Widget: order.details.after
 *   Service: ManualPaymentModuleService
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpTray, DocumentText, Plus } from "@medusajs/icons"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"

import { sdk } from "../lib/sdk"
import { ManualPaymentProofReviewDrawer } from "../routes/manual-payment-proofs/review-drawer"
import type {
  ManualPaymentProof,
  ManualPaymentProofListResponse,
  ManualPaymentProofStatus,
} from "../routes/manual-payment-proofs/types"

function statusColor(status: ManualPaymentProofStatus) {
  if (status === "approved") return "green" as const
  if (status === "rejected") return "red" as const
  if (status === "expired") return "grey" as const
  return "orange" as const
}

const OrderPaymentProofWidget = ({
  data: order,
}: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const [selectedProof, setSelectedProof] = useState<ManualPaymentProof | null>(
    null,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const proofQuery = useQuery({
    queryKey: ["manual-payment-proofs", "order", order.id],
    queryFn: () =>
      sdk.client.fetch<ManualPaymentProofListResponse>(
        "/admin/manual-payment-proofs",
        {
          query: {
            order_id: order.id,
            limit: 5,
            offset: 0,
          },
        },
      ),
  })

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
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload payment receipt")
      }

      return response.json() as Promise<{ manual_payment_proof: ManualPaymentProof }>
    },
    onSuccess: async (data) => {
      toast.success("Payment receipt attached successfully")
      await queryClient.invalidateQueries({
        queryKey: ["manual-payment-proofs", "order", order.id],
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Instantly open review drawer so staff can review & settle in 1 click
      setSelectedProof(data.manual_payment_proof)
      setDrawerOpen(true)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not attach receipt")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
  })

  const proofs = proofQuery.data?.manual_payment_proofs ?? []
  const latestProof = proofs[0] ?? null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Receipt file size cannot exceed 10 MiB")
      return
    }

    uploadMutation.mutate(file)
  }

  if (proofQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <Text size="small" className="text-ui-fg-subtle">
          Loading manual payment verification…
        </Text>
      </div>
    )
  }

  // If no proofs and payment is already captured via another provider, don't show distraction
  if (!latestProof && order.payment_status === "captured") {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden divide-y divide-slate-100 mb-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h2">Manual Payment Proof (GCash / Maya)</Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Customer transfer receipts and settlement status for this order.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {latestProof && (
            <Badge color={statusColor(latestProof.status)}>
              {latestProof.status === "approved"
                ? "● Settled"
                : latestProof.status === "rejected"
                  ? "● Rejected"
                  : "● Pending Audit"}
            </Badge>
          )}
          <Button
            size="small"
            variant="secondary"
            isLoading={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <ArrowUpTray />
            {latestProof ? "Upload New Receipt" : "Attach Payment Receipt"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {latestProof ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-ui-border-base bg-white shadow-2xs text-xl">
                🧾
              </div>
              <div>
                <Text weight="plus" className="text-ui-fg-base">
                  {latestProof.file_name}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
                  Submitted: {new Date(latestProof.submitted_at).toLocaleString()} · Revision #{latestProof.revision}
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant={latestProof.status === "pending" ? "primary" : "secondary"}
                onClick={() => {
                  setSelectedProof(latestProof)
                  setDrawerOpen(true)
                }}
              >
                {latestProof.status === "pending" ? "⚡ Review & Settle" : "🔍 View Proof Details"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ui-border-base p-6 text-center">
            <div className="rounded-full bg-ui-bg-subtle p-3 text-ui-fg-muted">
              <DocumentText />
            </div>
            <div>
              <Text weight="plus" className="text-ui-fg-base">
                No Payment Proof Attached
              </Text>
              <Text size="small" className="mt-1 text-ui-fg-subtle max-w-sm">
                If the customer sent a payment screenshot via Viber, WhatsApp, or Email, attach it here to review and settle the order.
              </Text>
            </div>
            <Button
              size="small"
              variant="secondary"
              isLoading={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus />
              Attach GCash / Maya Receipt
            </Button>
          </div>
        )}
      </div>

      <ManualPaymentProofReviewDrawer
        proof={selectedProof}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderPaymentProofWidget

