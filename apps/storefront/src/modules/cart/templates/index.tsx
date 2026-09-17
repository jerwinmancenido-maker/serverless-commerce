/**
 * @file    apps/storefront/src/modules/cart/templates/index.tsx
 * @module  CartTemplate (Storefront Cart)
 * @purpose Main shopping cart page template containing items table and order summary.
 * @contracts
 *   Fetches: cart items, customer session
 */

import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-10 min-h-[calc(100vh-64px)] bg-slate-50/40">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="flex flex-col gap-y-6">
              {!customer && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                  <SignInPrompt />
                </div>
              )}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                <ItemsTemplate cart={cart} />
              </div>
            </div>
            <div className="relative">
              <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <Summary cart={cart} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
