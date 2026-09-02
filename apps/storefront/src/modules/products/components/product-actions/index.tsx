"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

// ---------------------------------------------------------------------------
// Package contents: parse the inclusion option value into a list of items
// e.g. "10x BAC Water, 10x Syringe, 10x Alcohol Pad" → ["10x BAC Water", …]
// ---------------------------------------------------------------------------
function parsePackageItems(inclusionValue: string | undefined): string[] {
  if (!inclusionValue) return []
  // Split by comma or semicolon, clean up whitespace, drop empty tokens
  return inclusionValue
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string

  // Auto-preselect the lowest-priced in-stock variant on initial mount
  useEffect(() => {
    if (!product.variants?.length) return
    if (Object.keys(options).length > 0) return

    const sorted = [...product.variants].sort((a, b) => {
      const priceA =
        a.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER
      const priceB =
        b.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER
      return priceA - priceB
    })

    const targetVariant =
      sorted.find(
        (v) => !v.manage_inventory || (v.inventory_quantity ?? 1) > 0
      ) || sorted[0]

    if (targetVariant) {
      const variantOptions = optionsAsKeymap(targetVariant.options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants, options])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Reset quantity stepper when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [isValidVariant, pathname, router, searchParams, selectedVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  // Stock quantity for stepper max and reassurance text
  const stockQty = selectedVariant?.manage_inventory
    ? (selectedVariant.inventory_quantity ?? 0)
    : 999
  const maxQty = Math.max(1, stockQty)

  // ---------------------------------------------------------------------------
  // 3.1 – Dynamic package contents
  // Identify the "inclusion" option and extract the value for the active variant
  // ---------------------------------------------------------------------------
  const inclusionOption = useMemo(
    () =>
      product.options?.find((o) =>
        o.title?.toLowerCase().includes("inclusion")
      ),
    [product.options]
  )

  const activeInclusionTitle = useMemo(() => {
    if (!inclusionOption || !selectedVariant) return null
    const variantOptionValue = selectedVariant.options?.find(
      (o) => o.option_id === inclusionOption.id
    )
    return variantOptionValue?.value ?? null
  }, [inclusionOption, selectedVariant])

  const packageItems = useMemo(
    () => parsePackageItems(activeInclusionTitle ?? undefined),
    [activeInclusionTitle]
  )

  // ---------------------------------------------------------------------------
  // Price for multi-quantity display
  // ---------------------------------------------------------------------------
  const priceData = useMemo(
    () => getProductPrice({ product, variantId: selectedVariant?.id }),
    [product, selectedVariant]
  )
  const unitPrice =
    priceData.variantPrice?.calculated_price_number ??
    priceData.cheapestPrice?.calculated_price_number ??
    null
  const currencyCode =
    priceData.variantPrice?.currency_code ??
    priceData.cheapestPrice?.currency_code ??
    "PHP"

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount)

  const totalPrice =
    unitPrice !== null ? formatAmount(unitPrice * quantity) : null

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {/* ------------------------------------------------------------------ */}
        {/* 3.1 – Dynamic "What's in this Package" breakdown card               */}
        {/* ------------------------------------------------------------------ */}
        {packageItems.length > 0 && (
          <div
            className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 text-xs text-zinc-700"
            data-testid="package-contents-card"
          >
            <div className="mb-2 flex items-center justify-between font-semibold text-zinc-900">
              <span>
                Package Contents
                {activeInclusionTitle ? ` — ${activeInclusionTitle}` : ""}
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                Research Complete Kit
              </span>
            </div>
            <ul className="space-y-1.5 text-zinc-600">
              {packageItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-emerald-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 3.3 – Live stock reassurance                                        */}
        {/* ------------------------------------------------------------------ */}
        {selectedVariant && (
          <div
            className="flex items-center gap-1.5 text-[11px] font-medium"
            data-testid="stock-reassurance"
          >
            {!inStock ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-red-600">Out of stock</span>
              </>
            ) : stockQty < 10 ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600">
                  ⚡ Low Stock — Only {stockQty} kit{stockQty === 1 ? "" : "s"}{" "}
                  left
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700">● In Stock</span>
              </>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 3.2 – Inline quantity stepper + Add to cart                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center gap-2.5" data-testid="quantity-stepper">
          {/* Stepper */}
          <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-2 shadow-xs">
            <button
              type="button"
              id="qty-decrement"
              disabled={quantity <= 1 || !!disabled || isAdding}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-lg leading-none"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span
              className="w-9 text-center text-sm font-semibold text-zinc-900"
              data-testid="quantity-display"
            >
              {quantity}
            </span>
            <button
              type="button"
              id="qty-increment"
              disabled={quantity >= maxQty || !!disabled || isAdding}
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-lg leading-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="h-11 flex-1 rounded-xl font-semibold shadow-xs"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock || !isValidVariant
              ? "Out of stock"
              : totalPrice
              ? `Add to cart — ${totalPrice}`
              : "Add to cart"}
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 text-xs text-zinc-600 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-sm">📦</span>
            <div className="leading-tight">
              <span className="font-semibold text-zinc-800">Plain, Discreet Mailer</span>
              <span className="text-zinc-400 text-[11px] block">No external chemical labeling or compound markings</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm">❄️</span>
            <div className="leading-tight">
              <span className="font-semibold text-zinc-800">Thermal Insulated Packaging</span>
              <span className="text-zinc-400 text-[11px] block">Shock-absorbing barrier protects against Philippine tropical heat</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm">⚡</span>
            <div className="leading-tight">
              <span className="font-semibold text-zinc-800">Nationwide Express Dispatch</span>
              <span className="text-zinc-400 text-[11px] block">Dispatched from Metro Manila in 24h via J&T Express (2–3 Days)</span>
            </div>
          </div>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          quantity={quantity}
          onQuantityChange={setQuantity}
          maxQty={maxQty}
          totalPrice={totalPrice}
        />
      </div>
    </>
  )
}
