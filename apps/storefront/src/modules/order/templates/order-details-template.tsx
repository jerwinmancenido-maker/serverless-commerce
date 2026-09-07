"use client"

import { ArrowLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import type { ManualPaymentProofResponse } from "@lib/data/manual-payment"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import ManualPaymentProof from "@modules/order/components/manual-payment-proof"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import FulfillmentStepper from "@modules/order/components/fulfillment-stepper"
import {
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from "@modules/order/components/order-status-badge"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  manualPaymentProof: ManualPaymentProofResponse | null
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  manualPaymentProof,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl-semi">Order details</h1>
          <div className="flex items-center gap-2">
            {order.status === "canceled" ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
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
        <div className="flex flex-wrap items-center gap-3">
          <LocalizedClientLink
            href={`/account/support?orderId=${encodeURIComponent(order.id)}`}
            className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
          >
            Contact support
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/orders"
            className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
            data-testid="back-to-overview-button"
          >
            <ArrowLeft /> Back to overview
          </LocalizedClientLink>
        </div>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} />
        <FulfillmentStepper order={order} />
        {manualPaymentProof ? (
          <ManualPaymentProof orderId={order.id} initial={manualPaymentProof} order={order} />
        ) : null}
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
