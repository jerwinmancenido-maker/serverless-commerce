"use client"

/**
 * @file apps/storefront/src/modules/order/components/fulfillment-stepper/index.tsx
 * @module OrderComponents (Order Fulfillment Progression)
 * @purpose Renders visual dispatch stepper with J&T Express tracking telemetry and external query bridge.
 * @contracts Section 3 Clinical Usability Standard | Route: /account/orders/details/[id]
 */

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

type StepState = "complete" | "active" | "upcoming"

const STEPS = [
  { id: "placed", label: "Order\nPlaced" },
  { id: "payment", label: "Payment\nVerified" },
  { id: "packed", label: "Packed &\nReady" },
  { id: "dispatched", label: "Dispatched\nvia J&T" },
]

function deriveCurrentStep(order: HttpTypes.StoreOrder): number {
  if (order.payment_status === "captured") {
    const isFulfilled =
      order.fulfillment_status === "fulfilled" ||
      order.fulfillment_status === "partially_fulfilled" ||
      order.fulfillment_status === "shipped" ||
      order.fulfillment_status === "partially_shipped" ||
      order.fulfillment_status === "delivered"
    if (isFulfilled) {
      const tracking = getTrackingNumber(order)
      if (tracking || order.fulfillment_status === "delivered") return 3
      return 2
    }
    return 1
  }
  return 0
}

function getTrackingNumber(order: HttpTypes.StoreOrder): string | null {
  const fulfillments = order.fulfillments as
    | Array<{
        tracking_numbers?: string[]
        labels?: Array<{ tracking_number?: string }>
        metadata?: Record<string, unknown>
      }>
    | undefined
  if (!fulfillments?.length) return null
  const first = fulfillments[0]
  if (first.tracking_numbers?.length && first.tracking_numbers[0]) {
    return first.tracking_numbers[0]
  }
  if (first.labels?.length && first.labels[0]?.tracking_number) {
    return first.labels[0].tracking_number
  }
  if (first.metadata?.waybill_number) {
    return String(first.metadata.waybill_number)
  }
  if (first.metadata?.tracking_number) {
    return String(first.metadata.tracking_number)
  }
  return null
}

function StepDot({ state }: { state: StepState }) {
  if (state === "complete") {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (state === "active") {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-blue-100">
        <div className="w-2.5 h-2.5 rounded-full bg-white" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex-shrink-0" />
  )
}

const FulfillmentStepper = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const [copied, setCopied] = useState(false)

  if (order.status === "canceled") {
    return null
  }
  const currentStep = deriveCurrentStep(order)
  const trackingNumber = getTrackingNumber(order)

  const handleCopyTracking = async () => {
    if (!trackingNumber) return
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="py-4 px-1">
      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const state: StepState =
            index < currentStep
              ? "complete"
              : index === currentStep
              ? "active"
              : "upcoming"
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index <= currentStep ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                )}
                <StepDot state={state} />
                {!isLast && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index < currentStep ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-center text-xs leading-tight whitespace-pre-line ${
                  state === "active"
                    ? "text-blue-700 font-semibold"
                    : state === "complete"
                    ? "text-emerald-700 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {currentStep >= 3 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                J&amp;T Express
              </span>
              <span className="text-xs font-medium text-slate-600">
                Domestic Courier Dispatch
              </span>
            </div>
            {trackingNumber && (
              <a
                href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${encodeURIComponent(trackingNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Track on J&amp;T Portal &rarr;
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Waybill:</span>
              {trackingNumber ? (
                <span className="font-mono text-sm font-extrabold tracking-wider text-slate-900">
                  {trackingNumber}
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-400">Pending Assignment</span>
              )}
            </div>

            {trackingNumber && (
              <button
                type="button"
                onClick={handleCopyTracking}
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Store lyophilized research peptide vials upright in standard laboratory conditions away from direct light.
          </p>
        </div>
      )}

      {currentStep === 2 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs">
              📦
            </span>
            <span className="font-semibold text-xs text-slate-900">
              Packed &amp; Ready for Courier Pickup
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Lyophilized vials packaged in protective laboratory mailer with impact cushioning. Awaiting courier handoff to J&amp;T Express.
          </p>
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
            <span>Transit Expectations:</span>
            <span>NCR: 24–48 Hours &middot; Provincial: 2–4 Business Days</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FulfillmentStepper

