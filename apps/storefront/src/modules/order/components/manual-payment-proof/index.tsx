"use client"

/**
 * @file    apps/storefront/src/modules/order/components/manual-payment-proof/index.tsx
 * @module  ManualPaymentProofComponent (Order Module)
 * @purpose Customer Manual QR (GCash/Maya) payment proof upload component with camera & mobile receipt support.
 * @contracts
 *   API: POST /store/customers/me/orders/:id/manual-payment-proof
 */

import {
  submitManualPaymentProof,
  type ManualPaymentProofActionState,
  type ManualPaymentProofResponse,
} from "@lib/data/manual-payment"
import { cancelCustomerOrder } from "@lib/data/orders"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowPath,
  CheckCircleSolid,
  ClockSolid,
  CloudArrowUp,
  DocumentText,
  Receipt,
  XMark,
} from "@medusajs/icons"
import { useActionState, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ManualPaymentProofProps = {
  orderId: string
  initial: ManualPaymentProofResponse
  order?: HttpTypes.StoreOrder
}

const initialActionState: ManualPaymentProofActionState = {
  success: false,
  error: null,
  proof: null,
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ProofSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-ui-fg-base px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-ui-fg-base/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <ArrowPath className="h-4 w-4 animate-spin" />
          <span>Uploading proof…</span>
        </>
      ) : (
        <>
          <CloudArrowUp className="h-4 w-4" />
          <span>Submit payment proof</span>
        </>
      )}
    </button>
  )
}

const ManualPaymentProof = ({
  orderId,
  initial,
  order,
}: ManualPaymentProofProps) => {
  const router = useRouter()
  const [state, formAction] = useActionState(
    submitManualPaymentProof,
    initialActionState
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [localCanceled, setLocalCanceled] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const proof = state.proof ?? initial.manual_payment_proof
  const payment = initial.manual_qr_payment

  if (!payment?.eligible) {
    return null
  }

  const isCanceled = order?.status === "canceled" || localCanceled
  const maySubmit = !isCanceled && (!proof || proof.status === "rejected")
  const mayCancel =
    !isCanceled &&
    order?.payment_status === "awaiting" &&
    (!proof || proof.status !== "pending")

  // Expiration calculation: default 24h (1440m)
  const expiresInMinutes = payment.expires_in_minutes || 24 * 60
  const orderCreated = order?.created_at ? new Date(order.created_at) : null
  const expiresAt = proof?.expires_at
    ? new Date(proof.expires_at)
    : orderCreated
      ? new Date(orderCreated.getTime() + expiresInMinutes * 60 * 1000)
      : null

  const formattedExpiresAt = expiresAt
    ? expiresAt.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files
      setSelectedFile(file)
    }
  }

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    setCancelError(null)
    const res = await cancelCustomerOrder(orderId)
    if (res.success) {
      setLocalCanceled(true)
      setShowCancelDialog(false)
      router.refresh()
    } else {
      setCancelError(res.error)
      setIsCancelling(false)
    }
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm transition-all"
      data-testid="manual-payment-proof"
    >
      {/* Header Banner */}
      <div className="border-b border-ui-border-base bg-ui-bg-subtle/50 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ui-fg-base text-white">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ui-fg-base">
                {payment.display_name || "Manual QR Payment"}
              </h2>
              <p className="text-xs text-ui-fg-muted">
                {isCanceled
                  ? "Order reservation expired or cancelled"
                  : "Complete your transfer and upload payment proof"}
              </p>
            </div>
          </div>
          {!isCanceled && payment.qr_image_url ? (
            <a
              href={payment.qr_image_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-2xs hover:bg-ui-bg-subtle"
            >
              Open QR Code ↗
            </a>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Reservation Window & Voluntary Cancel Bar */}
        {!isCanceled && formattedExpiresAt && (
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 font-medium">
              <span>⏳</span>
              <span>
                Compound stock reserved until{" "}
                <span className="font-semibold">{formattedExpiresAt}</span>
              </span>
            </div>
            {mayCancel && (
              <button
                type="button"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel order &amp; release reservation
              </button>
            )}
          </div>
        )}

        {/* Confirmation Modal for Voluntary Cancellation */}
        {showCancelDialog && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-900 font-semibold text-sm">
                <XMark className="h-4 w-4" />
                <span>Cancel this order?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="text-xs text-rose-500 hover:text-rose-700"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Are you sure you want to cancel this order? This will immediately
              release your reserved compound inventory back to available stock.
            </p>
            {cancelError && (
              <p className="text-xs font-semibold text-rose-700">
                {cancelError}
              </p>
            )}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling…" : "Yes, cancel order"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-medium text-rose-800 hover:bg-rose-50"
              >
                Keep reservation
              </button>
            </div>
          </div>
        )}

        {/* Expired / Cancelled State */}
        {isCanceled ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-sm font-bold text-gray-900">
                Order Expired
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                Reservation Released
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              This order was cancelled and the reserved compound stock was
              returned to inventory because payment proof was not confirmed
              within the reservation window.
            </p>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-gray-800 transition-colors"
              >
                <span>Re-order Compounds</span>
                <span aria-hidden="true">&rarr;</span>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/support"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                Already transferred payment? Contact support &rarr;
              </LocalizedClientLink>
            </div>
          </div>
        ) : (
          <>
            {/* Payment Transfer Instructions */}
            {payment.instructions ? (
              <p className="text-xs leading-relaxed text-ui-fg-subtle whitespace-pre-line">
                {payment.instructions}
              </p>
            ) : null}

            {/* Existing Proof Status Card */}
            {proof ? (
              <div
                className={`rounded-xl border p-4 transition-all ${
                  proof.status === "approved"
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-950"
                    : proof.status === "rejected"
                      ? "border-rose-200 bg-rose-50/60 text-rose-950"
                      : "border-amber-200 bg-amber-50/60 text-amber-950"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {proof.status === "approved" ? (
                      <CheckCircleSolid className="h-5 w-5 text-emerald-600" />
                    ) : proof.status === "rejected" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold">
                        !
                      </div>
                    ) : (
                      <ClockSolid className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        Proof status: {proof.status}
                      </p>
                      <p className="text-xs opacity-75">
                        {proof.file_name} · revision {proof.revision} · submitted
                        on{" "}
                        {new Date(proof.submitted_at).toLocaleDateString(
                          "en-PH",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      proof.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : proof.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {proof.status}
                  </span>
                </div>
                {proof.rejection_reason ? (
                  <div className="mt-3 rounded-lg bg-white/80 p-3 text-xs text-rose-700 border border-rose-200">
                    <span className="font-semibold">Reason:</span>{" "}
                    {proof.rejection_reason}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Upload Form */}
            {maySubmit ? (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="order_id" value={orderId} />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ui-fg-muted mb-2">
                    {proof?.status === "rejected"
                      ? "Upload Corrected Payment Receipt"
                      : "Upload Payment Receipt"}
                  </label>

                  {/* Compact horizontal dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-ui-fg-base bg-ui-bg-subtle"
                        : selectedFile
                          ? "border-ui-border-interactive bg-ui-bg-subtle/30"
                          : "border-ui-border-base bg-ui-bg-subtle/20 hover:border-ui-fg-muted hover:bg-ui-bg-subtle/40"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="manual-payment-proof-file"
                      name="proof"
                      type="file"
                      accept="image/*,application/pdf"
                      required
                      onChange={handleFileChange}
                      className="sr-only"
                    />

                    {selectedFile ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base flex-shrink-0">
                          <DocumentText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ui-fg-base truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-ui-fg-muted">
                            {formatBytes(selectedFile.size)} · Click or drop to
                            replace
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ui-bg-subtle text-ui-fg-subtle group-hover:scale-110 transition-transform flex-shrink-0">
                          <CloudArrowUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ui-fg-base">
                            <span className="text-ui-fg-interactive font-semibold underline underline-offset-2">
                              Click to browse
                            </span>{" "}
                            or drag and drop receipt
                          </p>
                          <p className="text-xs text-ui-fg-muted">
                            PNG, JPG, WEBP, or PDF (up to 10 MB · Camera upload supported)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {state.error ? (
                  <div
                    className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200"
                    role="alert"
                  >
                    {state.error}
                  </div>
                ) : null}

                {/* Success Message */}
                {state.success ? (
                  <div
                    className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200"
                    role="status"
                  >
                    Payment proof submitted successfully and queued for staff
                    review.
                  </div>
                ) : null}

                <div className="pt-1">
                  <ProofSubmitButton disabled={!selectedFile} />
                </div>
              </form>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export default ManualPaymentProof
