"use client"

import {
  submitManualPaymentProof,
  type ManualPaymentProofActionState,
  type ManualPaymentProofResponse,
} from "@lib/data/manual-payment"
import {
  ArrowPath,
  CheckCircleSolid,
  ClockSolid,
  CloudArrowUp,
  DocumentText,
  Receipt,
} from "@medusajs/icons"
import { useActionState, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

type ManualPaymentProofProps = {
  orderId: string
  initial: ManualPaymentProofResponse
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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-ui-fg-base px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-ui-fg-base/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

const ManualPaymentProof = ({ orderId, initial }: ManualPaymentProofProps) => {
  const [state, formAction] = useActionState(
    submitManualPaymentProof,
    initialActionState
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const proof = state.proof ?? initial.manual_payment_proof
  const payment = initial.manual_qr_payment

  if (!payment?.eligible) {
    return null
  }

  const maySubmit = !proof || proof.status === "rejected"

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
                Complete your transfer and upload payment proof
              </p>
            </div>
          </div>
          {payment.qr_image_url ? (
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

      <div className="p-6 space-y-5">
        {/* Instructions */}
        {payment.instructions ? (
          <div className="rounded-xl bg-ui-bg-subtle/60 p-4 text-xs leading-relaxed text-ui-fg-subtle whitespace-pre-line border border-ui-border-base/50">
            {payment.instructions}
          </div>
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
                    {proof.file_name} · revision {proof.revision} · submitted on{" "}
                    {new Date(proof.submitted_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

              {/* Styled Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
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
                  accept="image/png,image/jpeg,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="sr-only"
                />

                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base">
                      <DocumentText className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ui-fg-base truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-ui-fg-muted">
                        {formatBytes(selectedFile.size)} · Click or drop to
                        replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-subtle group-hover:scale-110 transition-transform">
                      <CloudArrowUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-fg-interactive font-semibold underline underline-offset-2">
                          Click to browse
                        </span>{" "}
                        or drag and drop receipt
                      </p>
                      <p className="text-xs text-ui-fg-muted mt-0.5">
                        PNG, JPEG, or PDF (up to 10 MB)
                      </p>
                    </div>
                  </div>
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
      </div>
    </section>
  )
}

export default ManualPaymentProof
