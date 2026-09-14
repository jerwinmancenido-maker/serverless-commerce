/**
 * @file    apps/backend/src/admin/widgets/order-details-redirect.tsx
 * @module  OrderDetailsRedirectWidget (Admin Extension)
 * @purpose Seamlessly redirects legacy Medusa order details route to the modern SADS 2.0 Order Detail Cockpit.
 * @contracts
 *   Route:   /app/orders-cockpit/:id
 *   Widget:  zone: "order.details.before"
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Navigate, useLocation } from "react-router-dom"

const OrderDetailsRedirectWidget = ({
  data: order,
}: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const location = useLocation()

  // Honor ?view=raw escape hatch for troubleshooting low-level Medusa states
  if (location.search.includes("view=raw")) {
    return null
  }

  return <Navigate to={`/orders-cockpit/${order.id}`} replace />
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderDetailsRedirectWidget
