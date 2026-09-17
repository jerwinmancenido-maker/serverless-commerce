"use client"

/**
 * @file    apps/storefront/src/modules/checkout/components/payment-button/index.tsx
 * @module  PaymentButtonComponent (Checkout Module)
 * @purpose Renders payment submission actions for Stripe and manual QR payments with proof upload gating.
 * @contracts
 *   Action: placeOrder, placeOrderWithManualProof
 */

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder, placeOrderWithManualProof } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, CloudArrowUp } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
  disabled?: boolean
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
  disabled = false,
}) => {
  const notReady =
    disabled ||
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualPaymentWithProofButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualPaymentWithProofButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [referenceNumber, setReferenceNumber] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]
  const sessionData = (paymentSession?.data || {}) as Record<string, unknown>
  const qrImageUrl = (sessionData.qr_image_url as string) || null
  const instructions = (sessionData.instructions as string) || null
  const displayName =
    (sessionData.display_name as string) || "Manual QR Payment"

  const formattedTotal = convertToLocale({
    amount: cart.total ?? 0,
    currency_code: cart.currency_code,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Payment proof file must not exceed 10 MiB")
        return
      }
      setErrorMessage(null)
      setSelectedFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Payment proof file must not exceed 10 MiB")
        return
      }
      setErrorMessage(null)
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePayment = async () => {
    if (!selectedFile) {
      setErrorMessage(
        "Please upload your payment screenshot or receipt before placing your order"
      )
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.set("proof", selectedFile, selectedFile.name)
    if (referenceNumber.trim()) {
      formData.set("reference_number", referenceNumber.trim())
    }

    try {
      await placeOrderWithManualProof(formData)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (
        errorMsg === "NEXT_REDIRECT" ||
        (err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")
      ) {
        throw err
      }
      setErrorMessage(
        errorMsg ||
          "Could not place order with payment proof. Please verify your file and try again."
      )
      setSubmitting(false)
    }
  }

  const canSubmit = !notReady && !!selectedFile && !submitting

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {/* Payment Instructions & QR Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              QR
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500">
                InstaPay · GCash · Maya · Bank Transfer
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total to Transfer
            </span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              {formattedTotal}
            </span>
          </div>
        </div>

        {instructions && (
          <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
            {instructions}
          </p>
        )}

        {qrImageUrl && (
          <div className="flex items-center gap-3 pt-1">
            <a
              href={qrImageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              <span>View QR Code</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        )}
      </div>

      {/* Mandatory Proof Upload Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Upload Proof of Payment <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
            Required before order placement
          </span>
        </div>

        {/* Dropzone */}
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
              ? "border-emerald-500 bg-emerald-50/50"
              : selectedFile
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="sr-only"
            data-testid="manual-payment-proof-input"
          />

          {selectedFile ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircleSolid className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to submit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:scale-105 transition-transform shrink-0">
                <CloudArrowUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-800">
                  <span className="text-emerald-700 font-bold underline underline-offset-2">
                    Click to select payment screenshot
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, or PDF (up to 10 MB · Camera capture supported)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Optional Reference Number */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Reference / Transaction Number (optional, e.g. GCash Ref No.)"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            data-testid="manual-payment-reference-input"
          />
        </div>
      </div>

      {/* Admin Verification Notice */}
      <div className="rounded-lg bg-amber-50/70 border border-amber-200/70 p-3 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
        <span className="shrink-0 text-sm">🛡️</span>
        <span>
          <strong>Admin Verification:</strong> Your analytical compound stock is
          reserved upon order placement. Orders proceed to warehouse packaging
          and courier dispatch once staff verifies your payment receipt.
        </span>
      </div>

      {/* Error Message */}
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />

      {/* Place Order CTA Button */}
      <Button
        disabled={!canSubmit}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl text-sm transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        data-testid={dataTestId || "submit-order-button"}
      >
        {submitting
          ? "Creating order & uploading proof…"
          : !selectedFile
            ? "Upload Payment Proof to Place Order"
            : `Submit Payment Proof & Place Order (${formattedTotal})`}
      </Button>
    </div>
  )
}

export default PaymentButton
