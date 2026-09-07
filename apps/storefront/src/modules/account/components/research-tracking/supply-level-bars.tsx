"use client"

import type { TrackedResearchMaterial, ResearchReplenishmentProjection } from "@lib/data/research-tracking"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ExclamationCircle } from "@medusajs/icons"
import { resolveCompoundIdentity } from "@lib/util/compound-identity"
import { addToCart } from "@lib/data/cart"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import { useState, useTransition } from "react"

type Props = {
  materials: TrackedResearchMaterial[]
  projections: ResearchReplenishmentProjection[]
  products?: HttpTypes.StoreProduct[]
  countryCode?: string
}

function pctColor(pct: number, isDepleted: boolean) {
  if (isDepleted) return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" }
  if (pct >= 40) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" }
  if (pct >= 10) return { bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" }
  return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" }
}

export default function SupplyLevelBars({
  materials,
  projections,
  products,
  countryCode = "ph",
}: Props) {
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null)
  const [cartSuccess, setCartSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleReorder = (variantId: string, compoundName: string) => {
    setCartSuccess(null)
    setAddingVariantId(variantId)
    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
        setCartSuccess(`Added ${compoundName} to cart!`)
      } catch (err) {
        setCartSuccess(err instanceof Error ? err.message : "Failed to add to cart")
      } finally {
        setAddingVariantId(null)
      }
    })
  }

  if (materials.length === 0) {
    return (
      <p className="text-xs text-ui-fg-subtle">
        No tracked materials.{" "}
        <LocalizedClientLink href="/account/research-hub?section=routines" className="underline font-medium hover:text-emerald-700">
          Activate a product →
        </LocalizedClientLink>
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {cartSuccess && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 border border-emerald-200 animate-in fade-in duration-200">
          <span>{cartSuccess}</span>
          <LocalizedClientLink href="/cart" className="font-bold underline ml-2 shrink-0 hover:text-emerald-950">
            View Cart →
          </LocalizedClientLink>
        </div>
      )}
      <ul className="space-y-3">
        {materials.slice(0, 4).map((mat) => {
          const activeSupplies = mat.supplies.filter((s) => s.status === "active")
          const totalInitial = activeSupplies.reduce((s, x) => s + x.initial_quantity_base_units, 0)
          const totalRemaining = activeSupplies.reduce((s, x) => s + x.remaining_quantity_base_units, 0)
          const isDepleted = totalRemaining === 0 || activeSupplies.length === 0
          const pct = totalInitial === 0 ? 0 : Math.round((totalRemaining / totalInitial) * 100)
          const colors = pctColor(pct, isDepleted)

          const supplyLineItemIds = mat.supplies
            .map((s) => s.source_order_line_item_id)
            .filter(Boolean) as string[]

          // Resolve compound identity
          const identity = resolveCompoundIdentity({
            label: mat.label,
            productVariantId: mat.product_variant_id,
            products,
            projections,
            lineItemIds: supplyLineItemIds,
          })

          // Find replenishment projections for this material and compute combined runout
          const matProjections = projections.filter(
            (p) =>
              p.tracked_material_id === mat.tracked_material_id ||
              p.tracked_material_label.toLowerCase() === mat.label.toLowerCase()
          )
          const totalDailyBurn = matProjections.reduce(
            (sum, p) => sum + ((p.planned_quantity_base_units * (p.estimated_uses_per_week || 0)) / 7),
            0
          )
          const combinedDays =
            totalDailyBurn > 0
              ? Math.floor(totalRemaining / totalDailyBurn)
              : matProjections[0]?.estimated_days_remaining ?? null

          const daysLabel = isDepleted
            ? "Depleted"
            : combinedDays != null
              ? `~${combinedDays}d left`
              : null

          const isReorderNow =
            isDepleted ||
            (combinedDays != null && combinedDays <= 14) ||
            matProjections.some((p) => p.urgency === "reorder_now")

          // Target variant ID for 1-click reorder
          const targetVariantId =
            matProjections[0]?.source_product_variant_id ||
            matProjections[0]?.product_variant_id ||
            mat.product_variant_id ||
            identity.matchedVariant?.id ||
            null

          // Product slug for link fallback
          const targetSlug =
            identity.productHandle ||
            matProjections[0]?.source_product_handle ||
            getCanonicalProductSlug(identity.compoundName)

          return (
            <li key={mat.tracked_material_id}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-xs font-medium text-ui-fg-base flex items-center gap-1.5">
                  <span className="font-semibold">{identity.compoundName}</span>
                  {identity.variantLabel && (
                    <span className="text-[10px] text-ui-fg-muted font-normal">
                      · {identity.variantLabel}
                    </span>
                  )}
                </span>
                <span className={`shrink-0 text-[10px] font-semibold ${colors.text}`}>
                  {isDepleted ? "0% · Depleted" : `${pct}%${daysLabel ? ` · ${daysLabel}` : ""}`}
                </span>
              </div>
              {/* Progress bar track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-ui-bg-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${Math.max(pct, isDepleted ? 0 : 2)}%` }}
                  role="meter"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${identity.compoundName}: ${pct}% remaining`}
                />
              </div>
              {isReorderNow && (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className={`text-[10px] font-semibold ${colors.text} flex items-center gap-1`}>
                    <ExclamationCircle className="h-3 w-3 shrink-0" />
                    <span>{isDepleted ? "Supply exhausted" : "Low supply"}</span>
                  </p>
                  {targetVariantId ? (
                    <button
                      type="button"
                      disabled={isPending && addingVariantId === targetVariantId}
                      onClick={() => handleReorder(targetVariantId, identity.compoundName)}
                      className="inline-flex items-center gap-1 rounded bg-ui-fg-base px-2 py-0.5 text-[10px] font-semibold text-ui-bg-base hover:bg-ui-fg-subtle transition-colors disabled:opacity-50 touch-manipulation"
                    >
                      {addingVariantId === targetVariantId ? "Adding…" : "Reorder 1-Click"}
                    </button>
                  ) : targetSlug ? (
                    <LocalizedClientLink
                      href={`/products/${targetSlug}`}
                      className="inline-flex items-center gap-1 rounded border border-ui-border-base px-2 py-0.5 text-[10px] font-semibold text-ui-fg-base hover:bg-ui-bg-subtle transition-colors touch-manipulation"
                    >
                      Restock →
                    </LocalizedClientLink>
                  ) : null}
                </div>
              )}
            </li>
          )
        })}
        {materials.length > 4 && (
          <li className="text-xs text-ui-fg-muted">+{materials.length - 4} more materials</li>
        )}
      </ul>
    </div>
  )
}
