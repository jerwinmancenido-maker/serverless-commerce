"use client"

/**
 * @file    apps/storefront/src/modules/layout/components/cart-dropdown/index.tsx
 * @module  CartDropdownComponent (Storefront Layout)
 * @purpose Cart quick-view popover dropdown in the storefront navigation header.
 */

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import { getLineItemThumbnail } from "@lib/util/get-line-item-thumbnail"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState, useCallback } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pepstack:header-popover-opened", { detail: "cart" })
      )
    }
    setCartDropdownOpen(true)
  }

  const close = useCallback(() => {
    if (activeTimer) {
      clearTimeout(activeTimer)
      setActiveTimer(undefined)
    }
    setCartDropdownOpen(false)
  }, [activeTimer])

  // Listen for other header popovers opening to maintain mutual exclusivity
  useEffect(() => {
    const handleOtherPopover = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail !== "cart") {
        close()
      }
    }

    window.addEventListener("pepstack:header-popover-opened", handleOtherPopover)
    return () => {
      window.removeEventListener(
        "pepstack:header-popover-opened",
        handleOtherPopover
      )
    }
  }, [close])

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }


  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div className="h-full z-50 relative">
      <Popover className="relative h-full">
        <PopoverButton className="h-full flex items-center">
          <LocalizedClientLink
            className="hover:text-ui-fg-base min-h-[48px] min-w-[48px] inline-flex items-center justify-center px-2 focus:outline-none"
            href="/cart"
            data-testid="nav-cart-link"
          >{`Cart (${totalItems})`}</LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+8px)] right-0 bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-[420px] text-slate-800 overflow-hidden z-50 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Research Cart</h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>
              <LocalizedClientLink
                href="/cart"
                onClick={close}
                className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
              >
                View full cart &rarr;
              </LocalizedClientLink>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[380px] p-3 flex flex-col gap-y-2.5 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[72px_1fr] gap-x-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${getCanonicalProductSlug(item.product_handle)}`}
                          className="w-[72px] aspect-square rounded-lg border border-slate-200/70 overflow-hidden bg-slate-50 flex items-center justify-center p-1"
                          onClick={close}
                        >
                          <Thumbnail
                            thumbnail={getLineItemThumbnail(item)}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                <LocalizedClientLink
                                  href={`/products/${getCanonicalProductSlug(item.product_handle)}`}
                                  data-testid="product-link"
                                  onClick={close}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h4>
                              <div className="text-right shrink-0">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                            <div className="mt-0.5">
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[11px] text-slate-500">
                            <span
                              data-testid="cart-item-quantity"
                              data-value={item.quantity}
                              className="font-medium"
                            >
                              Qty: {item.quantity}
                            </span>
                            <DeleteButton
                              id={item.id}
                              className="text-slate-400 hover:text-rose-600 transition-colors text-[11px]"
                              data-testid="cart-item-remove-button"
                            >
                              Remove
                            </DeleteButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-y-3 bg-slate-50/70 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Subtotal
                    </span>
                    <span
                      className="text-base font-bold text-slate-900 font-mono"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Insulation foam protected &middot; Dispatched from Metro Manila</span>
                  </div>
                  <LocalizedClientLink href="/cart" onClick={close} className="w-full">
                    <button
                      type="button"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                      data-testid="go-to-cart-button"
                    >
                      <span>Proceed to Cart &amp; Reconstitution</span>
                      <span>&rarr;</span>
                    </button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 border border-slate-200/80">
                  <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.375A4.5 4.5 0 008.25 21h7.5A4.5 4.5 0 0019 14.375l-4.091-3.966a2.25 2.25 0 01-.659-1.591V3.104" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.104h7.5M9.75 14.25h4.5" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Your Research Cart is Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  No compounds or reconstitution supplies currently added.
                </p>
                <div className="mt-4">
                  <LocalizedClientLink href="/store" onClick={close}>
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all">
                      Browse Research Compounds &rarr;
                    </span>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
