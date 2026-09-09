"use client"

/**
 * @file apps/storefront/src/modules/order/templates/order-details-template.tsx
 * @module CustomerPortal (Order Details)
 * @purpose Displays full clinical order details, fulfillment telemetry, and invoice/reorder actions.
 * @contracts Medusa Store API: /store/orders/:id | Route: /account/orders/details/:id
 */

import { ArrowDownTray, ArrowLeft, ArrowPath } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import type { ManualPaymentProofResponse } from "@lib/data/manual-payment"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
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
import type { OrderResearchProtocolAccess } from "@lib/data/research-protocols"
import { ResearchProtocolAccess } from "@modules/order/components/research-protocol-access"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  manualPaymentProof: ManualPaymentProofResponse | null
  protocolAccesses?: OrderResearchProtocolAccess[]
  countryCode?: string
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  manualPaymentProof,
  protocolAccesses = [],
  countryCode = "ph",
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium h-9"
            data-testid="download-invoice-button"
          >
            <ArrowDownTray className="w-4 h-4" />
            Download Invoice
          </Button>
          <LocalizedClientLink href="/store">
            <Button
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium h-9"
              data-testid="reorder-items-button"
            >
              <ArrowPath className="w-4 h-4" />
              Re-order Items
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink
            href={`/account/support?orderId=${encodeURIComponent(order.id)}`}
            className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base"
          >
            Contact support
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/orders"
            className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base text-sm font-medium"
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
        {protocolAccesses && protocolAccesses.length > 0 ? (
          <ResearchProtocolAccess
            accesses={protocolAccesses}
            countryCode={countryCode}
          />
        ) : null}
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
