"use client"

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
      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
        <ArchiveBox className="w-5 h-5" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">No verified orders yet</h2>
      <p className="text-sm text-slate-500 max-w-md">
        Your verified research orders, temperature-controlled J&amp;T delivery tracking, and official invoices will be archived here once placed.
      </p>
      <div className="mt-2">
        <LocalizedClientLink href="/store">
          <Button data-testid="continue-shopping-button">
            Explore Compound Catalog
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
