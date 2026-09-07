import { HttpTypes } from "@medusajs/types"

type FulfillmentStatus = HttpTypes.StoreOrder["fulfillment_status"]
type PaymentStatus = HttpTypes.StoreOrder["payment_status"]

const FULFILLMENT_LABELS: Record<string, { label: string; className: string }> =
  {
    not_fulfilled: {
      label: "Pending Dispatch",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    partially_fulfilled: {
      label: "Partially Shipped",
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    fulfilled: {
      label: "Dispatched",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    partially_shipped: {
      label: "Partially Shipped",
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    shipped: {
      label: "Shipped",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-50 text-green-800 border border-green-200",
    },
    returned: {
      label: "Returned",
      className: "bg-red-50 text-red-700 border border-red-200",
    },
    canceled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    },
  }

const PAYMENT_LABELS: Record<string, { label: string; className: string }> = {
  awaiting: {
    label: "Awaiting Payment",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  not_paid: {
    label: "Unpaid",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  captured: {
    label: "Payment Confirmed",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  partially_captured: {
    label: "Partial Payment",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  canceled: {
    label: "Payment Cancelled",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  requires_action: {
    label: "Action Required",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

export function FulfillmentStatusBadge({
  status,
}: {
  status: FulfillmentStatus
}) {
  const config =
    FULFILLMENT_LABELS[status as string] ?? {
      label: String(status).split("_").join(" "),
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    }
  return <StatusPill label={config.label} className={config.className} />
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config =
    PAYMENT_LABELS[status as string] ?? {
      label: String(status).split("_").join(" "),
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    }
  return <StatusPill label={config.label} className={config.className} />
}
