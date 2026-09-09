/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/orders/details/[id]/page.tsx
 * @module  OrderDetailPage (Customer Account & Orders)
 * @purpose Renders the customer order details screen with fulfillment telemetry, payment proof, and research protocol access tokens.
 * @contracts
 *   Fetches: retrieveOrder() · retrieveManualPaymentProof() · listOrderResearchProtocols()
 *   API: GET /store/orders/:id · GET /store/customers/me/orders/:id/research-protocols
 */

import { retrieveOrder } from "@lib/data/orders"
import { retrieveManualPaymentProof } from "@lib/data/manual-payment"
import { listOrderResearchProtocols } from "@lib/data/research-protocols"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string; countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  const [manualPaymentProof, protocolAccesses] = await Promise.all([
    retrieveManualPaymentProof(order.id).catch(() => null),
    listOrderResearchProtocols(order.id)
      .then((response) => response.research_protocols)
      .catch(() => []),
  ])

  const countryCode =
    params.countryCode || order.shipping_address?.country_code || "ph"

  return (
    <OrderDetailsTemplate
      order={order}
      manualPaymentProof={manualPaymentProof}
      protocolAccesses={protocolAccesses}
      countryCode={countryCode}
    />
  )
}
