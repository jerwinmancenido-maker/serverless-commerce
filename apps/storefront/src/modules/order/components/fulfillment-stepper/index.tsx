import { HttpTypes } from "@medusajs/types"

type StepState = "complete" | "active" | "upcoming"

const STEPS = [
  { id: "placed", label: "Order\nPlaced" },
  { id: "payment", label: "Payment\nVerified" },
  { id: "packed", label: "Cold-Chain\nPacked" },
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
        metadata?: Record<string, unknown>
      }>
    | undefined
  if (!fulfillments?.length) return null
  const first = fulfillments[0]
  if (first.tracking_numbers?.length) return first.tracking_numbers[0]
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
  if (order.status === "canceled") {
    return null
  }
  const currentStep = deriveCurrentStep(order)
  const trackingNumber = getTrackingNumber(order)

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
        <div className="mt-5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm">
          <span className="text-slate-500 flex-shrink-0">📦 J&T Tracking:</span>
          {trackingNumber ? (
            <>
              <span className="font-mono font-medium text-slate-800">{trackingNumber}</span>
              <a
                href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${encodeURIComponent(trackingNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Track →
              </a>
            </>
          ) : (
            <span className="font-mono font-medium text-slate-500">—</span>
          )}
        </div>
      )}
      {currentStep === 2 && (
        <div className="mt-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          📦 Tracking number will appear once J&T picks up the package
        </div>
      )}
    </div>
  )
}

export default FulfillmentStepper
