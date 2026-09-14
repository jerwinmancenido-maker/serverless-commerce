/**
 * @file    apps/backend/src/admin/widgets/inventory-list-redirect.tsx
 * @module  InventoryListRedirect (Admin Widget Extension)
 * @purpose Intercepts legacy /app/inventory list visits and seamlessly redirects to the modern SADS 2.0 Inventory Registry.
 * @contracts
 *   Route:  /inventory
 *   Widget: inventory_item.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

const InventoryListRedirect = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Escape hatch for developers who explicitly want the raw Medusa table
  if (searchParams.get("view") === "raw_table") {
    return null
  }

  const target = location.search
    ? `/inventory-registry${location.search}`
    : "/inventory-registry"

  return <Navigate to={target} replace />
}

export const config = defineWidgetConfig({
  zone: "inventory_item.list.before",
})

export default InventoryListRedirect
