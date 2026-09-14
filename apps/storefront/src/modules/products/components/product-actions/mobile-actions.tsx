import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@modules/common/components/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
  quantity: number
  onQuantityChange: (qty: number) => void
  maxQty: number
  totalPrice: string | null
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
  quantity,
  onQuantityChange,
  maxQty,
  totalPrice,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0 translate-y-4"
          enterTo="opacity-100 translate-y-0"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-4"
        >
          <div
            className="bg-white/95 backdrop-blur-md flex flex-col gap-y-2.5 p-3.5 w-full border-t border-zinc-200/90 shadow-2xl safe-area-pb"
            data-testid="mobile-actions"
          >
            <div className="flex items-center justify-between px-1">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-semibold text-zinc-900 truncate block" data-testid="mobile-title">
                  {product.title}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {variant && Object.values(options).length > 0
                    ? Object.values(options).join(" · ")
                    : "Select options"}
                </span>
              </div>
              {selectedPrice && (
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-zinc-900">
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity stepper + Add to cart row */}
            <div className="flex items-center gap-2.5 w-full">
              {/* Compact quantity stepper */}
              <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-1.5 shadow-xs shrink-0">
                <button
                  type="button"
                  id="mobile-qty-decrement"
                  disabled={quantity <= 1 || optionsDisabled}
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="relative size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-lg leading-none after:absolute after:-inset-2.5 after:content-['']"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span
                  className="w-7 text-center text-sm font-semibold text-zinc-900"
                  data-testid="mobile-quantity-display"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  id="mobile-qty-increment"
                  disabled={quantity >= maxQty || optionsDisabled}
                  onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
                  className="relative size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-lg leading-none after:absolute after:-inset-2.5 after:content-['']"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div
                className={clx("flex gap-x-2.5 flex-1", {
                  "!flex-col": !isSimple,
                })}
              >
                {!isSimple && (
                  <Button
                    onClick={open}
                    variant="secondary"
                    className="h-11 rounded-xl text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                    data-testid="mobile-actions-button"
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="truncate">
                        {variant && Object.values(options).length > 0
                          ? Object.values(options).join(" / ")
                          : "Select Options"}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-60 ml-1" />
                    </div>
                  </Button>
                )}
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || !variant}
                  className="h-11 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs flex-1"
                  isLoading={isAdding}
                  data-testid="mobile-cart-button"
                >
                  {!variant
                    ? "Select variant"
                    : !inStock
                    ? "Out of stock"
                    : totalPrice
                    ? `Add to cart — ${totalPrice}`
                    : "Add to cart"}
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-white w-12 h-12 rounded-full text-ui-fg-base flex justify-center items-center"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-white px-6 py-12">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
