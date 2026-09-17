/**
 * @file apps/storefront/src/modules/order/components/order-details/index.tsx
 * @module OrderComponents (Order Telemetry & Identification)
 * @purpose Displays order human identifier, dispatch email, timestamp, and fulfillment status pills.
 * @contracts Section 3 Clinical Usability Standard | Route: /account/orders/details/[id]
 */

import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Order
          </span>
          <span
            className="font-mono tracking-tight font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md text-sm"
            data-testid="order-id"
          >
            #{order.display_id}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Date:{" "}
          <span data-testid="order-date" className="font-semibold text-slate-700">
            {new Date(order.created_at).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/70">
        Order confirmation recorded for{" "}
        <span
          className="text-slate-900 font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        . Verification, analytical releases, and courier tracking updates will be communicated once payment is approved.
      </p>

      {showStatus && (
        <div className="flex items-center text-compact-small gap-x-4 pt-2 border-t border-slate-200/70">
          <Text>
            Order status:{" "}
            <span className="text-slate-800 font-semibold" data-testid="order-status">
              {formatStatus(order.fulfillment_status)}
            </span>
          </Text>
          <Text>
            Payment status:{" "}
            <span
              className="text-slate-800 font-semibold"
              data-testid="order-payment-status"
            >
              {formatStatus(order.payment_status)}
            </span>
          </Text>
        </div>
      )}
    </div>
  )
}

export default OrderDetails

