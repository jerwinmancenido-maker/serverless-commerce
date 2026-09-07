"use client"

import { Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-xl font-bold text-slate-900 tracking-tight">
        Order Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="w-full"
      >
        <button
          type="button"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <span>&rarr;</span>
        </button>
      </LocalizedClientLink>

      <div className="pt-2 border-t border-slate-100 flex flex-col gap-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Instant GCash, Maya &amp; Bank QR settlement</span>
        </div>
      </div>
    </div>
  )
}

export default Summary
