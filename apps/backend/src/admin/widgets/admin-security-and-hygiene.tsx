/**
 * @file    apps/backend/src/admin/widgets/admin-security-and-hygiene.tsx
 * @module  AdminSecurityAndHygiene (Admin Extension)
 * @purpose Suppresses dangerous raw Metadata and JSON inspection cards across Medusa Admin detail pages to protect system integrity.
 * @contracts
 *   Widget: product_variant.details.after, product.details.after, inventory_item.details.after, order.details.after, store.details.after
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const AdminSecurityAndHygiene = () => {
  const location = useLocation()
  const showDebugMetadata =
    new URLSearchParams(location.search).get("debug_metadata") === "true"

  useEffect(() => {
    if (showDebugMetadata) return

    const hideRawCards = () => {
      document.querySelectorAll("div.shadow-elevation-card-rest").forEach((card) => {
        const h2 = card.querySelector("h2")
        const text = h2?.textContent?.trim()
        if (text === "JSON" || text === "Metadata") {
          ;(card as HTMLElement).style.display = "none"
        }
      })
    }

    hideRawCards()
    const interval = setInterval(hideRawCards, 400)
    return () => clearInterval(interval)
  }, [showDebugMetadata])

  if (showDebugMetadata) {
    return null
  }

  return (
    <style>{`
      /* Suppress raw Metadata editing cards (prevents unauthorized staff modifications to recipe_hash/compounding keys) */
      div.shadow-elevation-card-rest:has(a[href*="metadata/edit"]),
      div.bg-ui-bg-base.shadow-elevation-card-rest:has(a[href*="metadata/edit"]),
      div[data-entry-id="MetadataSection"],
      /* Suppress raw JSON debug inspection cards */
      div.shadow-elevation-card-rest:has(a[href$="/raw"]),
      div.shadow-elevation-card-rest:has(a[href$="raw"]),
      div.bg-ui-bg-base.shadow-elevation-card-rest:has(a[href$="/raw"]),
      div[data-entry-id="JsonViewSection"] {
        display: none !important;
      }
    `}</style>
  )
}

export const config = defineWidgetConfig({
  zone: [
    "product_variant.details.after",
    "product.details.after",
    "inventory_item.details.after",
    "order.details.after",
    "customer.details.after",
    "promotion.details.after",
    "price_list.details.after",
    "store.details.after",
  ],
})

export default AdminSecurityAndHygiene
