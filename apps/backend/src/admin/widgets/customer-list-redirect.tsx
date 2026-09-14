/**
 * @file    apps/backend/src/admin/widgets/customer-list-redirect.tsx
 * @module  CustomerListRedirect (Admin Widget Extension)
 * @purpose Intercepts legacy /app/customers list visits and seamlessly redirects to the modern SADS 2.0 Customers Registry.
 * @contracts
 *   Route:  /customers
 *   Widget: customer.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const CustomerListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers who explicitly want the raw Medusa table
  if (searchParams.get("view") === "raw_table") {
    return null
  }

  const target = location.search
    ? `/customers-registry${location.search}`
    : "/customers-registry"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerListRedirect
