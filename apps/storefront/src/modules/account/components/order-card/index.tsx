/**
 * @file apps/storefront/src/modules/account/components/order-card/index.tsx
 * @module CustomerPortal (Order History Item Card)
 * @purpose Displays order summary, human-readable display ID, tracking telemetry, and real line-item thumbnails.
 * @contracts Section 3 Clinical Usability Standard | Routes: /account/orders
 */

import { useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import {
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from "@modules/order/components/order-status-badge"
import { getLineItemThumbnail } from "@lib/util/get-line-item-thumbnail"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
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

type BannerVariant = {
  color: "amber" | "blue" | "green" | "purple" | "gray"
  message: string
  actionText: string
  trackingNumber?: string | null
}

function getActionBanner(order: HttpTypes.StoreOrder): BannerVariant | null {
  const trackingNumber = getTrackingNumber(order)

  if (order.status === "canceled") {
    return {
      color: "gray",
      message: "Order expired or cancelled — compound inventory released",
      actionText: "View details",
    }
  }
  if (order.payment_status === "refunded") {
    return {
      color: "purple",
      message: "Order refunded — contact support if you have questions",
      actionText: "Support",
    }
  }
  if (order.payment_status === "awaiting") {
    return {
      color: "amber",
      message: "Upload your GCash/InstaPay receipt to confirm payment",
      actionText: "Upload receipt",
    }
  }
  if (order.payment_status === "requires_action") {
    return {
      color: "amber",
      message: "Action required — complete your payment",
      actionText: "Complete payment",
    }
  }
  if (order.fulfillment_status === "delivered") {
    return {
      color: "green",
      message: "Delivered — view your invoice",
      actionText: "View invoice",
    }
  }
  if (
    order.fulfillment_status === "shipped" ||
    order.fulfillment_status === "fulfilled" ||
    order.fulfillment_status === "partially_shipped" ||
    order.fulfillment_status === "partially_fulfilled"
  ) {
    return {
      color: "blue",
      message: "Dispatched via J&T Express",
      actionText: "Track shipment",
      trackingNumber,
    }
  }
  if (
    order.payment_status === "captured" &&
    order.fulfillment_status === "not_fulfilled"
  ) {
    return {
      color: "blue",
      message: "Payment confirmed — being packed for express dispatch",
      actionText: "View order",
    }
  }
  return null
}

const BANNER_STYLES: Record<"amber" | "blue" | "green" | "purple" | "gray", string> = {
  amber:
    "bg-amber-50/90 border-amber-200/70 text-amber-900 group-hover:bg-amber-100/80",
  blue:
    "bg-blue-50/90 border-blue-200/70 text-blue-900 group-hover:bg-blue-100/80",
  green:
    "bg-emerald-50/90 border-emerald-200/70 text-emerald-900 group-hover:bg-emerald-100/80",
  purple:
    "bg-purple-50/90 border-purple-200/70 text-purple-900 group-hover:bg-purple-100/80",
  gray:
    "bg-gray-50/90 border-gray-200/70 text-gray-700 group-hover:bg-gray-100/80",
}

const BANNER_PREFIX: Record<"amber" | "blue" | "green" | "purple" | "gray", string> = {
  amber: "⚠ ",
  blue: "🚚 ",
  green: "✓ ",
  purple: "↩ ",
  gray: "✕ ",
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  const addr = order.shipping_address
  const recipient = [addr?.first_name, addr?.last_name]
    .filter(Boolean)
    .join(" ")
  const city = addr?.city

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    "en-PH",
    { month: "short", day: "numeric", year: "numeric" }
  )

  const banner = getActionBanner(order)

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="group block rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
      data-testid="order-card"
    >
      {/* Row 1: Header with Order #, Date, Status Badges, Total, and Arrow */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm text-gray-900 flex items-center gap-0.5">
            <span className="text-gray-500 font-medium">#</span>
            <span className="font-mono tracking-tight font-extrabold text-slate-900" data-testid="order-display-id">
              {order.display_id}
            </span>
          </span>
          <span className="text-gray-300">·</span>
          <span
            className="text-xs text-gray-500"
            data-testid="order-created-at"
          >
            {formattedDate}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap ml-1">
            {order.status === "canceled" ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Cancelled / Expired
              </span>
            ) : (
              <>
                <FulfillmentStatusBadge status={order.fulfillment_status} />
                <PaymentStatusBadge status={order.payment_status} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-sm font-mono tracking-tight font-extrabold text-gray-900"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          <span
            className="text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors flex items-center gap-1"
            data-testid="order-details-link"
          >
            View details
            <span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </span>
        </div>
      </div>

      {/* Row 2: Thumbnails + Item titles/variants + shipping destination */}
      <div className="pt-3.5 flex items-start gap-4">
        {/* Thumbnail strip */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {order.items?.slice(0, 4).map((i) => (
            <div
              key={i.id}
              className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50"
              data-testid="order-item"
            >
              {getLineItemThumbnail(i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getLineItemThumbnail(i)}
                  alt={i.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                  Vial
                </div>
              )}
            </div>
          ))}
          {numberOfProducts > 4 && (
            <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                +{numberOfProducts - 4}
              </span>
            </div>
          )}
        </div>

        {/* Item titles & variants */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            {order.items?.map((item) => {
              const variantLabel = item.variant?.title
              const qtyLabel =
                item.quantity > 1 ? `Qty ${item.quantity}` : null
              const subline = [variantLabel, qtyLabel]
                .filter(Boolean)
                .join(" · ")
              return (
                <div key={item.id} className="flex flex-col leading-snug">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.title}
                  </span>
                  {subline ? (
                    <span className="text-xs text-gray-500">{subline}</span>
                  ) : null}
                </div>
              )
            })}
          </div>

          {recipient || city ? (
            <div className="mt-1.5 text-xs text-gray-400 flex items-center gap-1.5">
              <span>📦</span>
              <span>{[recipient, city].filter(Boolean).join(" — ")}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Row 3: Contextual Action Banner / Footer */}
      {banner ? (
        <div
          className={`mt-3.5 rounded-lg px-3.5 py-2 text-xs font-medium flex items-center justify-between gap-2 border transition-colors ${BANNER_STYLES[banner.color]}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0">{BANNER_PREFIX[banner.color]}</span>
            <span className="truncate">
              {banner.message}
              {banner.trackingNumber ? (
                <>
                  {" "}· Tracking:{" "}
                  <span className="font-mono tracking-tight font-extrabold">
                    {banner.trackingNumber}
                  </span>
                </>
              ) : null}
            </span>
          </div>
          <span className="flex-shrink-0 font-semibold flex items-center gap-1">
            {banner.actionText}
            <span
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </span>
        </div>
      ) : null}
    </LocalizedClientLink>
  )
}

export default OrderCard
