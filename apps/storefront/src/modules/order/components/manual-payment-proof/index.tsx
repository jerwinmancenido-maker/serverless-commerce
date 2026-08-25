"use client"

import {
  submitManualPaymentProof,
  type ManualPaymentProofActionState,
  type ManualPaymentProofResponse,
} from "@lib/data/manual-payment"
import { Button } from "@medusajs/ui"
import { useActionState } from "react"
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

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function ProofSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" isLoading={pending} disabled={pending}>
      Submit payment proof
    </Button>
  )
}

const ManualPaymentProof = ({ orderId, initial }: ManualPaymentProofProps) => {
  const [state, formAction] = useActionState(
    submitManualPaymentProof,
    initialActionState,
  )
  const proof = state.proof ?? initial.manual_payment_proof
  const payment = initial.manual_qr_payment

  if (!payment.eligible) {
    return null
  }

  const maySubmit = !proof || proof.status === "rejected"

  return (
    <section
      className="border border-ui-border-base rounded-rounded p-6 flex flex-col gap-4"
      data-testid="manual-payment-proof"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg-semi">
          {payment.display_name || "Manual payment"}
        </h2>
        {payment.instructions ? (
          <p className="text-small-regular text-ui-fg-subtle whitespace-pre-line">
            {payment.instructions}
          </p>
        ) : null}
        {payment.qr_image_url ? (
          <a
            href={payment.qr_image_url}
            target="_blank"
            rel="noreferrer"
            className="text-small-regular text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            Open payment QR
          </a>
        ) : null}
      </div>

      {proof ? (
        <div className="bg-ui-bg-subtle rounded-rounded p-4 flex flex-col gap-1">
          <p className="text-small-semi">
            Proof status: {formatStatus(proof.status)}
          </p>
          <p className="text-small-regular text-ui-fg-subtle">
            {proof.file_name} · revision {proof.revision}
          </p>
          {proof.rejection_reason ? (
            <p className="text-small-regular text-ui-fg-error">
              {proof.rejection_reason}
            </p>
          ) : null}
        </div>
      ) : null}

      {maySubmit ? (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="order_id" value={orderId} />
          <label
            htmlFor="manual-payment-proof-file"
            className="text-small-semi"
          >
            {proof?.status === "rejected"
              ? "Upload corrected proof"
              : "Upload payment proof"}
          </label>
          <input
            id="manual-payment-proof-file"
            name="proof"
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            required
            className="block w-full text-small-regular file:mr-4 file:rounded-md file:border-0 file:bg-ui-bg-subtle file:px-4 file:py-2 file:text-small-semi"
          />
          <p className="text-small-regular text-ui-fg-subtle">
            PNG, JPEG, or PDF. Maximum 10 MiB.
          </p>
          <div>
            <ProofSubmitButton />
          </div>
        </form>
      ) : null}

      {state.error ? (
        <p className="text-small-regular text-ui-fg-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-small-regular text-ui-fg-success" role="status">
          Payment proof submitted for review.
        </p>
      ) : null}
    </section>
  )
}

export default ManualPaymentProof
