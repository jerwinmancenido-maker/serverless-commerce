/**
 * @file    apps/backend/src/admin/widgets/order-list-redirect.tsx
 * @module  OrderListRedirect (Admin Extension Widget)
 * @purpose Intercepts legacy /app/orders visits and seamlessly redirects to the modern SADS 2.0 Orders Cockpit.
 * @contracts
 *   Route:  /orders
 *   Widget: order.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const OrderListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers
  if (searchParams.get("view") === "raw_table") {
    return null
  }

  const target = location.search
    ? `/orders-cockpit${location.search}`
    : "/orders-cockpit"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default OrderListRedirect
