/**
 * @file    apps/storefront/src/modules/order/templates/order-completed-template.tsx
 * @module  OrderCompletedTemplate (Storefront Order)
 * @purpose Renders the order confirmation page with payment status, verification alert, and protocol access.
 * @contracts
 *   Fetches: listOrderResearchProtocols, manualPaymentProof
 */

import { Heading } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ManualPaymentProof from "@modules/order/components/manual-payment-proof"
import type { ManualPaymentProofResponse } from "@lib/data/manual-payment"
import { HttpTypes } from "@medusajs/types"
import { listOrderResearchProtocols } from "@lib/data/research-protocols"
import { ResearchProtocolAccess } from "@modules/order/components/research-protocol-access"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  manualPaymentProof?: ManualPaymentProofResponse | null
}

export default async function OrderCompletedTemplate({
  order,
  manualPaymentProof,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const countryCode = order.shipping_address?.country_code || "ph"
  const protocolAccesses = await listOrderResearchProtocols(order.id)
    .then((response) => response.research_protocols)
    .catch(() => [])

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>

          {manualPaymentProof?.manual_payment_proof?.status === "pending" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 mb-2 flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-sm font-bold shrink-0">
                ⏳
              </div>
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-sm text-amber-950 mb-0.5">
                  Payment Proof Submitted — Pending Admin Verification
                </p>
                <p>
                  Your payment receipt was successfully attached to this order. Your analytical compound inventory is reserved. Warehouse fulfillment and courier dispatch will proceed once staff verifies your payment proof against the account ledger.
                </p>
              </div>
            </div>
          )}
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Summary
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          {manualPaymentProof ? (
            <ManualPaymentProof
              orderId={order.id}
              initial={manualPaymentProof}
            />
          ) : null}
          <PaymentDetails order={order} />
          <ResearchProtocolAccess
            accesses={protocolAccesses}
            countryCode={countryCode}
          />
          <Help />
        </div>
      </div>
    </div>
  )
}
