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
import {
  DocumentText,
  CheckCircleSolid,
  ArrowRight,
  InformationCircle,
  Sparkles,
  Tag,
} from "@medusajs/icons"
import { getCompoundProtocol } from "@lib/data/compound-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const BUNDLE_CROSS_SELLS: Record<
  string,
  { handle: string; title: string; bundlePrice: number; savings: number }
> = {
  "ghk-cu": {
    handle: "ghk-cu-glutathione-bundle",
    title: "GHK-Cu + Glutathione Stack",
    bundlePrice: 2500,
    savings: 290,
  },
  "glutathione-1500mg": {
    handle: "epithalon-glutathione-nad-bundle",
    title: "Epithalon + Glutathione + NAD+ Stack",
    bundlePrice: 3960,
    savings: 720,
  },
  "epithalon": {
    handle: "epithalon-glutathione-bundle",
    title: "Epithalon + Glutathione Stack",
    bundlePrice: 2700,
    savings: 360,
  },
  "nad-plus-500mg": {
    handle: "nad-ghk-cu-bundle",
    title: "NAD+ + GHK-Cu Stack",
    bundlePrice: 2500,
    savings: 290,
  },
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
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

  const isBundle = useMemo(() => {
    return Boolean(
      product.metadata?.is_bundle ||
      product.handle?.includes("bundle") ||
      product.title?.toLowerCase().includes("bundle")
    )
  }, [product])

  const isSupply = useMemo(() => {
    return Boolean(
      product.categories?.some((c) => c.handle === "research-supplies-accessories") ||
      product.handle === "bacteriostatic-water" ||
      product.handle?.includes("box") ||
      product.handle?.includes("pen") ||
      product.handle?.includes("bottle") ||
      product.handle?.includes("set")
    )
  }, [product])

  const bundleSpec = useMemo(() => {
    return product.metadata?.bundle_spec as
      | {
          components: {
            handle: string
            title: string
            strength: string
            quantity: number
            individualPrice: number
          }[]
          sumPrice: number
          bundlePrice: number
          savingsAmount: number
        }
      | undefined
  }, [product.metadata])

  const mgValue = useMemo(() => {
    if (isBundle || isSupply) return 10
    const firstMatch = selectedNetContent.match(/([0-9]+(?:\.[0-9]+)?)/)
    const parsed = firstMatch ? parseFloat(firstMatch[1]) : 10
    return isNaN(parsed) || parsed <= 0 ? 10 : parsed
  }, [selectedNetContent, isBundle, isSupply])

  const compoundProtocol = useMemo(() => {
    return getCompoundProtocol(product.handle || product.title)
  }, [product.handle, product.title])

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
  // Price for multi-quantity & volume display
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

  // Tier 2: Volume / Multi-Pack Discounts (Single Products Only)
  const volumeDiscountRate = useMemo(() => {
    if (isBundle) return 0 // Bundles already have their stack discount baked in
    if (quantity >= 10) return 0.20
    if (quantity >= 5) return 0.15
    if (quantity >= 3) return 0.10
    return 0
  }, [quantity, isBundle])

  const discountedUnitPrice = unitPrice !== null
    ? Math.round(unitPrice * (1 - volumeDiscountRate))
    : null

  const effectiveTotalPrice = discountedUnitPrice !== null
    ? formatAmount(discountedUnitPrice * quantity)
    : null

  const totalVolumeSavings = volumeDiscountRate > 0 && unitPrice !== null
    ? formatAmount((unitPrice - discountedUnitPrice) * quantity)
    : null

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

        {/* Tier 1 Inclusion Callout */}
        {!isBundle && !isSupply && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 text-xs">
            {selectedInclusion?.includes("BAC") ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span className="text-sm">💧</span>
                <span>Includes 10mL Bacteriostatic Water USP (+₱180 — Save 50% vs standalone diluent)</span>
              </div>
            ) : selectedInclusion?.includes("SubQ") ? (
              <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                <span className="text-sm">💉</span>
                <span>Complete SubQ Prep Kit (+₱250 — Save 47% on BAC Water + 10x Syringes + Swabs)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="text-sm">🧪</span>
                <span>Pure Analytical Lyophilized Vial (Bacteriostatic Water &amp; accessories selectable above)</span>
              </div>
            )}
          </div>
        )}

        {/* Tier 2: Volume Multi-Pack Stock-Up Tiers */}
        {!isBundle && !isSupply && unitPrice !== null && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="h-3 w-3 text-emerald-600" />
                Volume Stock-Up Discounts:
              </span>
              {volumeDiscountRate > 0 && (
                <span className="text-emerald-700 font-bold">
                  Saving {totalVolumeSavings} ({Math.round(volumeDiscountRate * 100)}% OFF)
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { qty: 1, label: "1x Standard", discount: "Base" },
                { qty: 3, label: "3x Vials", discount: "Save 10%" },
                { qty: 5, label: "5x Vials", discount: "Save 15%" },
                { qty: 10, label: "10x Vials", discount: "Save 20%" },
              ].map((tier) => {
                const isSelected = quantity === tier.qty
                return (
                  <button
                    key={tier.qty}
                    type="button"
                    onClick={() => setQuantity(tier.qty)}
                    disabled={disabled || isAdding}
                    className={`py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs font-semibold ring-1 ring-emerald-500/30"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div className="text-[11px] font-bold">{tier.label}</div>
                    <div
                      className={`text-[9px] ${
                        isSelected ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      {tier.discount}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Compact Ergonomic Action Row: Stepper + Add to Cart + Buy Now */}
        <div className="flex flex-col gap-2.5 pt-1">
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

            {/* Primary CTA: Add to cart */}
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
              className="h-10 flex-1 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs text-xs transition-all"
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              {!selectedVariant
                ? "Select variant"
                : !inStock || !isValidVariant
                ? "Out of stock"
                : effectiveTotalPrice
                ? `Add to cart — ${effectiveTotalPrice}`
                : "Add to cart"}
            </Button>

            {/* Secondary Action: Buy Now Instant Checkout */}
            {inStock && selectedVariant && isValidVariant && (
              <Button
                onClick={handleBuyNow}
                disabled={!!disabled || isAdding || isBuyingNow}
                variant="secondary"
                className="h-10 flex-1 rounded-xl font-semibold border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs text-xs flex items-center justify-center transition-all"
                isLoading={isBuyingNow}
                data-testid="buy-now-button"
              >
                <span>Buy Now</span>
              </Button>
            )}
          </div>
        </div>

        {/* Minimalist Jump Link to Technical Protocol & Reconstitution Tool */}
        {!isSupply && (
          <a
            href="#protocol"
            onClick={(e) => {
              e.preventDefault()
              window.location.hash = "protocol"
              window.dispatchEvent(new HashChangeEvent("hashchange"))
              document
                .getElementById("scientific-workspace")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
            className="pt-1 text-center text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DocumentText className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold">View Full Analytical Protocol &amp; Dosing Instructions &darr;</span>
          </a>
        )}

        {/* Tier 3: Multi-Compound Synergy Stack Breakdown Card */}
        {isBundle && bundleSpec && (
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 p-4 shadow-2xs space-y-3 mt-1">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    What&apos;s In This Research Stack
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    {bundleSpec.components.length}x Individually Crimped Research Vials
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Save ₱{bundleSpec.savingsAmount} Stack Discount
              </span>
            </div>

            <div className="space-y-2">
              {bundleSpec.components.map((comp, idx) => (
                <div
                  key={comp.handle}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{comp.title}</span>
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                        {comp.strength}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 line-through text-[10px] mr-1.5">
                      ₱{comp.individualPrice}
                    </span>
                    <span className="text-emerald-700 font-bold text-xs">Included</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stack Value Bar */}
            <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Component Sum
                </span>
                <span className="text-slate-400 line-through text-xs">
                  ₱{bundleSpec.sumPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 block uppercase tracking-wider font-bold">
                  Exclusive Stack Price
                </span>
                <span className="text-base font-extrabold text-white">
                  ₱{bundleSpec.bundlePrice}
                </span>
              </div>
            </div>

            {/* Laboratory Protocol Advisory */}
            <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
              <InformationCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-800">Multi-Vial Reconstitution Protocol:</strong> Each peptide in this research stack is supplied in an independent lyophilized vial. Reconstitute each vial separately with Bacteriostatic Water USP according to its dedicated monograph. Do not blend powders prior to reconstitution.
              </p>
            </div>
          </div>
        )}

        {/* Interactive In-Page Reconstitution Snapshot (Single Peptides Only) */}
        {!isBundle && !isSupply && (
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/20 p-4 shadow-2xs space-y-3 mt-1">
            {/* Header & Quick Diluent Selector */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono shadow-2xs">
                  calc
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    Reconstitution &amp; Dosing Snapshot
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedNetContent} Lyophilized Solid Vial
                  </p>
                </div>
              </div>

              {/* Diluent Selector — typeable input + chevron nudge */}
              <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  Diluent:
                </span>
                <div className="flex items-center bg-white rounded-lg border border-slate-200/80 px-2 py-0.5 shadow-2xs">
                  <input
                    type="number"
                    min="0.1"
                    step="0.25"
                    value={reconstitutionDiluent}
                    onChange={(e) => {
                      const raw = e.target.value
                      const parsed = parseFloat(raw)
                      if (!isNaN(parsed) && parsed > 0) {
                        setReconstitutionDiluent(parsed)
                      } else if (raw === "" || raw === "0" || raw === "0.") {
                        setReconstitutionDiluent(0.1)
                      }
                    }}
                    onBlur={(e) => {
                      const parsed = parseFloat(e.target.value)
                      const clamped = isNaN(parsed) || parsed < 0.1 ? 0.1 : +parsed.toFixed(2)
                      setReconstitutionDiluent(clamped)
                    }}
                    className="text-[11px] font-bold text-slate-900 font-mono tracking-tight w-[52px] text-center bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    aria-label="Diluent volume in mL"
                  />
                  <span className="text-[11px] font-bold text-slate-500 font-mono ml-0.5 select-none">mL</span>
                  <div className="flex flex-col -space-y-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() =>
                        setReconstitutionDiluent((d) => +Math.max(0.1, d + 0.25).toFixed(2))
                      }
                      className="text-slate-400 hover:text-slate-900 p-0.5 leading-none transition-colors cursor-pointer"
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
                      className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5 leading-none transition-colors cursor-pointer disabled:cursor-not-allowed"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Concentration
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {concentrationMgPerMl} mg/mL
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                  With {reconstitutionDiluent.toFixed(1)} mL BAC Water
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Standard Protocol Dose
                </span>
                <span className="text-sm font-bold text-emerald-950 mt-0.5 block">
                  {compoundProtocol.dosing.standardDoseDisplay}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block truncate">
                  Syringe: {compoundProtocol.syringeGuide.standardIUDisplay}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Scale (1 Unit)
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {mcgPerUnit} mcg
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                  Per 0.01 mL mark (U-100)
                </span>
              </div>
            </div>

            {/* Inclusion Supply Status Note */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600 truncate pr-2">
                <CheckCircleSolid className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {selectedInclusion?.includes("BAC")
                    ? "Kit includes 10mL Bacteriostatic Water USP"
                    : selectedInclusion?.includes("SubQ")
                    ? "Kit includes 10mL BAC Water + 10x Syringes &amp; Swabs"
                    : "Lyophilized vial only (BAC Water &amp; supplies selectable above)"}
                </span>
              </div>

              <a
                href="#protocol"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.hash = "protocol"
                  window.dispatchEvent(new HashChangeEvent("hashchange"))
                  document
                    .getElementById("scientific-workspace")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold shrink-0 hover:underline text-[10px]"
              >
                Full Protocol &rarr;
              </a>
            </div>
          </div>
        )}

        {/* Cross-Sell: Upgrade to Multi-Compound Stack & Save */}
        {!isBundle && !isSupply && BUNDLE_CROSS_SELLS[product.handle || ""] && (
          <LocalizedClientLink
            href={`/products/${BUNDLE_CROSS_SELLS[product.handle || ""].handle}`}
            className="group block rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white p-3.5 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all mt-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 border border-teal-300 text-xs shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                    Synergy Research Stack Available
                  </span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {BUNDLE_CROSS_SELLS[product.handle || ""].title}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 block">
                  Save ₱{BUNDLE_CROSS_SELLS[product.handle || ""].savings}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-emerald-800 flex items-center justify-end gap-1 mt-0.5">
                  View Bundle <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        )}

        {/* Laboratory Hardware Consumable Specifications */}
        {isSupply && (
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 via-white to-slate-100/40 p-4 shadow-2xs space-y-2.5 mt-1">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700 text-xs font-bold font-mono">
                LAB
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Laboratory Consumable Specifications
                </h4>
                <p className="text-[10px] text-slate-500">
                  Certified for Precision Research &amp; Preparation Procedures
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quality Standard</span>
                <span className="font-bold text-slate-800 text-[11px]">USP / Analytical Grade</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Packaging</span>
                <span className="font-bold text-slate-800 text-[11px]">Tamper-Evident Sealed</span>
              </div>
            </div>
          </div>
        )}

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
          totalPrice={effectiveTotalPrice}
        />
      </div>
    </>
  )
}
