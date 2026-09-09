/**
 * @file apps/storefront/src/modules/order/components/order-summary/index.tsx
 * @module OrderComponents (Financial Receipt Summary)
 * @purpose Renders financial breakdown of line items, discounts, shipping, taxes, and grand total with clinical precision.
 * @contracts Section 3 Clinical Usability Standard | Route: /account/orders/details/[id]
 */

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div>
      <h2 className="text-base-semi">Order Summary</h2>
      <div className="text-small-regular text-ui-fg-base my-2">
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Subtotal</span>
          <span className="font-mono tracking-tight font-extrabold">{getAmount(order.item_subtotal)}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="font-mono tracking-tight font-extrabold text-ui-fg-interactive">- {getAmount(order.discount_total)}</span>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="font-mono tracking-tight font-extrabold text-ui-fg-interactive">- {getAmount(order.gift_card_total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="font-mono tracking-tight font-extrabold">{getAmount(order.shipping_total)}</span>
          </div>
          {!!order.tax_total && order.tax_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Taxes</span>
              <span className="font-mono tracking-tight font-extrabold">{getAmount(order.tax_total)}</span>
            </div>
          )}
        </div>
        <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="font-mono tracking-tight font-extrabold text-lg text-slate-900">{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary

