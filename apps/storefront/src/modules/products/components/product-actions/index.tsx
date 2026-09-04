"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
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

  const [options, setOptions] = useState<Record<string, string | undefined>>(() => {
    if (!product.variants?.length) return {}
    const defaultVariant =
      product.variants.find(
        (v) => !v.manage_inventory || (v.inventory_quantity ?? 1) > 0
      ) || product.variants[0]
    return optionsAsKeymap(defaultVariant?.options) ?? {}
  })
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [reconstitutionDiluent, setReconstitutionDiluent] = useState<number>(1.0)
  const countryCode = useParams().countryCode as string

  const selectedNetContent = useMemo(() => {
    const contentOption = product.options?.find(
      (o) =>
        o.title?.toLowerCase().includes("content") ||
        o.title?.toLowerCase().includes("size") ||
        o.title?.toLowerCase().includes("strength")
    )
    if (contentOption && options[contentOption.id]) {
      return options[contentOption.id]!
    }
    const val = Object.values(options).find((v) => v?.toLowerCase().includes("mg"))
    return val || "10MG"
  }, [options, product.options])

  const selectedInclusion = useMemo(() => {
    const inclusionOption = product.options?.find(
      (o) =>
        o.title?.toLowerCase().includes("inclusion") ||
        o.title?.toLowerCase().includes("kit")
    )
    if (inclusionOption && options[inclusionOption.id]) {
      return options[inclusionOption.id]!
    }
    const val = Object.values(options).find(
      (v) =>
        v?.toLowerCase().includes("bac") ||
        v?.toLowerCase().includes("subq") ||
        v?.toLowerCase() === "vial"
    )
    return val || "Vial"
  }, [options, product.options])

  const mgValue = useMemo(() => {
    const parsed = parseFloat(selectedNetContent.replace(/[^0-9.]/g, ""))
    return isNaN(parsed) || parsed <= 0 ? 10 : parsed
  }, [selectedNetContent])

  const concentrationMgPerMl = (mgValue / reconstitutionDiluent).toFixed(2)
  const mcgPerUnit = Math.round((mgValue / reconstitutionDiluent) * 10)

  // Synchronize variant options with searchParams or when product.variants load
  useEffect(() => {
    if (!product.variants?.length) return

    const urlVariantId = searchParams.get("v_id")
    let targetVariant = urlVariantId
      ? product.variants.find((v) => v.id === urlVariantId)
      : undefined

    if (!targetVariant) {
      const sorted = [...product.variants].sort((a, b) => {
        const priceA =
          a.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER
        const priceB =
          b.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER
        return priceA - priceB
      })

      targetVariant =
        sorted.find(
          (v) => !v.manage_inventory || (v.inventory_quantity ?? 1) > 0
        ) || sorted[0]
    }

    if (targetVariant) {
      const variantOptions = optionsAsKeymap(targetVariant.options)
      if (variantOptions) {
        setOptions((current) => {
          if (isEqual(current, variantOptions)) return current
          return variantOptions
        })
      }
    }
  }, [product.variants, searchParams])

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

  const [isBuyingNow, setIsBuyingNow] = useState(false)

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })
      router.push(`/${countryCode}/cart`)
    } catch {
      setIsBuyingNow(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {/* Top Header Row: Stock Reassurance & Dynamic Price */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            {!inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <span className="size-2 rounded-full bg-red-500" />
                Out of stock
              </span>
            ) : stockQty < 10 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                Low Stock ({stockQty} units)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                In Stock · Verified Batch
              </span>
            )}
          </div>

          <div>
            <ProductPrice product={product} variant={selectedVariant} />
          </div>
        </div>

        {/* Minimalist Variant Options */}
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-3.5">
            {(product.options || []).map((option) => (
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
            ))}
          </div>
        )}

        {/* Subtle 1-Line Inclusion Summary */}
        {packageItems.length > 0 && (
          <p className="text-xs text-zinc-500 italic">
            Includes: {packageItems.join(" + ")}
          </p>
        )}

        {/* Compact Ergonomic Action Row: Stepper + Add to Cart + Buy Now */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center gap-2" data-testid="quantity-stepper">
            {/* Stepper */}
            <div className="flex h-10 items-center rounded-xl border border-zinc-200 bg-white px-1.5 shadow-2xs">
              <button
                type="button"
                id="qty-decrement"
                disabled={quantity <= 1 || !!disabled || isAdding}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-base leading-none"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="w-8 text-center text-xs font-semibold text-zinc-900"
                data-testid="quantity-display"
              >
                {quantity}
              </span>
              <button
                type="button"
                id="qty-increment"
                disabled={quantity >= maxQty || !!disabled || isAdding}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="size-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors text-base leading-none"
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
                isBuyingNow ||
                !isValidVariant
              }
              variant="secondary"
              className="h-10 flex-1 rounded-xl font-semibold border-zinc-300 hover:bg-zinc-50 text-xs transition-all"
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

            {/* ⚡ Buy Now Instant Checkout Button */}
            {inStock && selectedVariant && isValidVariant && (
              <Button
                onClick={handleBuyNow}
                disabled={!!disabled || isAdding || isBuyingNow}
                variant="primary"
                className="h-10 flex-1 rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs text-xs flex items-center justify-center gap-1.5 transition-all"
                isLoading={isBuyingNow}
                data-testid="buy-now-button"
              >
                <span>⚡</span>
                <span>Buy Now</span>
              </Button>
            )}
          </div>
        </div>

        {/* Minimalist Jump Link to Technical Protocol & Reconstitution Tool */}
        <a
          href="#protocol"
          onClick={(e) => {
            e.preventDefault()
            window.location.hash = "protocol"
            document
              .getElementById("scientific-workspace")
              ?.scrollIntoView({ behavior: "smooth" })
          }}
          className="pt-1 text-center text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🔬</span>
          <span>View Technical Protocol & Reconstitution Tool ↓</span>
        </a>

        {/* Interactive In-Page Reconstitution Snapshot (Option 2) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50/80 via-white to-sky-50/25 p-4 shadow-2xs space-y-3 mt-1">
          {/* Header & Quick Diluent Selector */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs shadow-2xs">
                🧮
              </span>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 tracking-tight">
                  Reconstitution Snapshot
                </h4>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {selectedNetContent} Lyophilized Solid Vial
                </p>
              </div>
            </div>

            {/* Diluent Selector — typeable input + chevron nudge */}
            <div className="flex items-center gap-1.5 bg-zinc-100/90 px-2 py-1 rounded-xl border border-zinc-200/60">
              <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
                Diluent:
              </span>
              <div className="flex items-center bg-white rounded-lg border border-zinc-200/80 px-2 py-0.5 shadow-2xs">
                <input
                  type="number"
                  min="0.1"
                  step="0.25"
                  value={reconstitutionDiluent}
                  onChange={(e) => {
                    const raw = e.target.value
                    // allow typing freely; parse and store
                    const parsed = parseFloat(raw)
                    if (!isNaN(parsed) && parsed > 0) {
                      setReconstitutionDiluent(parsed)
                    } else if (raw === "" || raw === "0" || raw === "0.") {
                      // keep intermediate states while typing
                      setReconstitutionDiluent(0.1)
                    }
                  }}
                  onBlur={(e) => {
                    // on blur: clamp to min 0.1, round to 2 dp
                    const parsed = parseFloat(e.target.value)
                    const clamped = isNaN(parsed) || parsed < 0.1 ? 0.1 : +parsed.toFixed(2)
                    setReconstitutionDiluent(clamped)
                  }}
                  className="text-[11px] font-bold text-zinc-900 font-mono tracking-tight w-[52px] text-center bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label="Diluent volume in mL"
                />
                <span className="text-[11px] font-bold text-zinc-500 font-mono ml-0.5 select-none">mL</span>
                <div className="flex flex-col -space-y-0.5 ml-1">
                  <button
                    type="button"
                    onClick={() =>
                      setReconstitutionDiluent((d) => +Math.max(0.1, d + 0.25).toFixed(2))
                    }
                    className="text-zinc-400 hover:text-zinc-900 p-0.5 leading-none transition-colors cursor-pointer"
                    aria-label="Increase diluent volume"
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M5 0L10 6H0L5 0Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReconstitutionDiluent((d) => +Math.max(0.1, d - 0.25).toFixed(2))
                    }
                    disabled={reconstitutionDiluent <= 0.1}
                    className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20 p-0.5 leading-none transition-colors cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease diluent volume"
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M5 6L0 0H10L5 6Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Concentration
              </span>
              <span className="text-sm font-bold text-zinc-900 mt-0.5 block">
                {concentrationMgPerMl} mg/mL
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                With {reconstitutionDiluent.toFixed(1)} mL BAC Water
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Scale (1 Unit)
              </span>
              <span className="text-sm font-bold text-zinc-900 mt-0.5 block">
                {mcgPerUnit} mcg
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Per 0.01 mL graduation (U-100)
              </span>
            </div>
          </div>

          {/* Inclusion Supply Status Note */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-zinc-600 truncate pr-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span className="truncate">
                {selectedInclusion === "Vial + BAC3"
                  ? "Kit includes 30mL Bacteriostatic Water USP"
                  : selectedInclusion === "Complete SubQ"
                  ? "Kit includes BAC3, 10x 31G Syringes & Swabs"
                  : "Lyophilized vial only (BAC Water available separately)"}
              </span>
            </div>

            <a
              href="#calculator"
              onClick={(e) => {
                e.preventDefault()
                window.location.hash = "calculator"
                document
                  .getElementById("scientific-workspace")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 hover:underline text-[10px]"
            >
              Full Tool →
            </a>
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
