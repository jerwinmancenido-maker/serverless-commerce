"use client"

/**
 * @file apps/storefront/src/modules/account/components/order-overview/index.tsx
 * @module CustomerPortal (Order History)
 * @purpose Displays customer order history or an actionable clinical empty state.
 * @contracts Medusa Store API: /store/orders | Route: /account/orders
 */

import { Button } from "@modules/common/components/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { ArchiveBox } from "@medusajs/icons"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center gap-y-3"
      data-testid="no-orders-container"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
        <ArchiveBox className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">No Research Orders Found</h2>
      <p className="text-sm text-slate-500 max-w-md">
        Your verified research orders, nationwide express J&amp;T delivery tracking, and batch certificates will appear here once confirmed.
      </p>
      <div className="mt-2">
        <LocalizedClientLink href="/store">
          <Button data-testid="continue-shopping-button" className="font-medium">
            Browse Research Catalog →
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
