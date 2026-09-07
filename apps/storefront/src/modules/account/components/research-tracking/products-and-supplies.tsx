"use client"

import { addToCart } from "@lib/data/cart"
import {
  activatePurchasedSupplyAction,
  type PurchasedItemCandidate,
  type ResearchProfile,
  type ResearchReplenishmentProjection,
  type ResearchRoutine,
  type ResearchTrackingActionState,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import type { PurchasedActivationSubmissionKeys } from "@lib/research-tracking-idempotency"
import {
  formatResearchQuantity,
  isMcgPreferredCompound,
} from "@lib/research-quantity"
import type { HttpTypes } from "@medusajs/types"
import {
  resolveCompoundIdentity,
  isRoutineCompatibleWithCompound,
  getRoutineTargetCompound,
  type CompoundIdentity,
} from "@lib/util/compound-identity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import { useActionState, useEffect, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"

type ProductsAndSuppliesProps = {
  configuration: ResearchTrackingConfiguration
  countryCode: string
  profile: ResearchProfile
  purchasedActivationKeys: PurchasedActivationSubmissionKeys
  purchasedItems: PurchasedItemCandidate[]
  runtimeReady: boolean
  trackedMaterials: TrackedResearchMaterial[]
  projections?: ResearchReplenishmentProjection[]
  routines?: ResearchRoutine[]
  products?: HttpTypes.StoreProduct[]
}

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"

function extractCompoundDetails(candidate: PurchasedItemCandidate) {
  let mass = ""
  let unit = "mg"
  if (candidate.initial_quantity_base_units && candidate.base_unit) {
    if (isMcgPreferredCompound(candidate.label)) {
      mass = candidate.initial_quantity_base_units.toString()
      unit = "mcg"
    } else if (candidate.display_unit === "mg" && candidate.base_units_per_display_unit) {
      mass = (candidate.initial_quantity_base_units / candidate.base_units_per_display_unit).toString()
      unit = "mg"
    } else if (candidate.base_unit === "microgram") {
      mass = (candidate.initial_quantity_base_units / 1000).toString()
      unit = "mg"
    } else {
      mass = candidate.initial_quantity_base_units.toString()
      unit = candidate.display_unit || "mg"
    }
  }
  return { mass, unit }
}

function extractSupplyDetails(
  supply: TrackedResearchMaterial["supplies"][number],
  materialLabel?: string,
) {
  let mass = ""
  let unit = "mg"
  if (supply.initial_quantity_base_units) {
    if (isMcgPreferredCompound(materialLabel)) {
      mass = supply.initial_quantity_base_units.toString()
      unit = "mcg"
    } else if (supply.display_unit === "mg" && supply.base_units_per_display_unit) {
      mass = (supply.initial_quantity_base_units / supply.base_units_per_display_unit).toString()
      unit = "mg"
    } else if (supply.base_unit === "microgram") {
      mass = (supply.initial_quantity_base_units / 1000).toString()
      unit = "mg"
    } else {
      mass = supply.initial_quantity_base_units.toString()
      unit = supply.display_unit || "mg"
    }
  }
  return { mass, unit }
}

export function evaluateSupplyReceipt(
  supply: TrackedResearchMaterial["supplies"][number],
  purchasedItems: PurchasedItemCandidate[],
  manuallyReceivedIds: string[] = []
) {
  if (manuallyReceivedIds.includes(supply.supply_id)) {
    return {
      isReceived: true,
      daysElapsed: 5,
      daysUntilAutoReceive: 0,
      orderCreatedAt: null,
      orderDisplayId: null,
      orderStatus: "delivered",
    }
  }

  const candidate = supply.source_order_line_item_id
    ? purchasedItems.find((p) => p.line_item_id === supply.source_order_line_item_id)
    : null

  // If partially utilized in research, it is physically in storage
  if (supply.remaining_quantity_base_units < supply.initial_quantity_base_units) {
    return {
      isReceived: true,
      daysElapsed: 5,
      daysUntilAutoReceive: 0,
      orderCreatedAt: candidate?.order_created_at ? new Date(candidate.order_created_at) : null,
      orderDisplayId: candidate?.order_display_id ?? null,
      orderStatus: candidate?.order_status || "completed",
    }
  }

  const status = candidate?.order_status?.toLowerCase()
  if (status === "completed" || status === "delivered") {
    return {
      isReceived: true,
      daysElapsed: 5,
      daysUntilAutoReceive: 0,
      orderCreatedAt: candidate?.order_created_at ? new Date(candidate.order_created_at) : null,
      orderDisplayId: candidate?.order_display_id ?? null,
      orderStatus: status,
    }
  }

  const orderTimestamp = candidate?.order_created_at
    ? new Date(candidate.order_created_at).getTime()
    : new Date(supply.added_to_tracking_at).getTime()

  const daysElapsed = Math.max(0, Math.floor((Date.now() - orderTimestamp) / 86_400_000))
  const isReceived = daysElapsed >= 5
  const daysUntilAutoReceive = Math.max(0, 5 - daysElapsed)

  return {
    isReceived,
    daysElapsed,
    daysUntilAutoReceive,
    orderCreatedAt: candidate?.order_created_at
      ? new Date(candidate.order_created_at)
      : new Date(supply.added_to_tracking_at),
    orderDisplayId: candidate?.order_display_id ?? null,
    orderStatus: candidate?.order_status || "pending",
  }
}

function TruckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function StartTrackingButton({ className = "" }: { className?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white transition-colors hover:bg-emerald-800 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? "Activating Vial…" : "Register & Activate Vial"}
    </button>
  )
}

/**
 * Resolves a guaranteed active, purchasable variant from the published catalog.
 * Protects against historical line-item variants that have since been archived or replaced in Medusa.
 */
function resolveActiveReplenishVariant({
  candidateVariantId,
  identity,
  products,
  targetMass,
  packagingPreference,
}: {
  candidateVariantId?: string | null
  identity?: CompoundIdentity | null
  products?: HttpTypes.StoreProduct[] | null
  targetMass?: number | string | null
  packagingPreference?: string | null
}): { variantId: string | null; productHandle: string | null } {
  // 1. If candidateVariantId is currently present in a published catalog product, use it directly
  if (candidateVariantId && products && products.length > 0) {
    for (const p of products) {
      const activeVariant = p.variants?.find((v) => v.id === candidateVariantId)
      if (activeVariant) {
        return {
          variantId: candidateVariantId,
          productHandle: p.handle || identity?.productHandle || null,
        }
      }
    }
  }

  // 2. Candidate variant is either absent or belongs to an archived / legacy test product.
  // Resolve the canonical published product from the live catalog.
  const activeProduct =
    (identity?.matchedProduct && products?.some((p) => p.id === identity.matchedProduct?.id)
      ? identity.matchedProduct
      : null) ||
    (products && identity?.productHandle
      ? products.find((p) => p.handle === identity.productHandle)
      : null) ||
    (products && identity?.compoundName
      ? products.find(
          (p) =>
            p.title?.toLowerCase().trim() === identity.compoundName.toLowerCase().trim() ||
            p.handle?.toLowerCase() === identity.compoundName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        )
      : null)

  if (activeProduct && activeProduct.variants && activeProduct.variants.length > 0) {
    const liveVariants = activeProduct.variants

    // If targetMass is known (e.g. 50 or "50"), prioritize a variant with that mass
    if (targetMass !== null && targetMass !== undefined && targetMass !== "") {
      const massStr = String(targetMass).trim()
      const matchingVariants = liveVariants.filter((v) => {
        const title = (v.title || "").toLowerCase()
        return title.includes(massStr)
      })

      if (matchingVariants.length > 0) {
        // If packagingPreference is provided (e.g. "vial only"), check exact packaging match
        if (packagingPreference) {
          const pref = packagingPreference.toLowerCase()
          const exactPkg = matchingVariants.find((v) => (v.title || "").toLowerCase().includes(pref))
          if (exactPkg) {
            return { variantId: exactPkg.id, productHandle: activeProduct.handle || null }
          }
        }
        // Prefer "Vial Only" as standard single vial replenishment if available
        const vialOnly = matchingVariants.find((v) => (v.title || "").toLowerCase().includes("vial only"))
        if (vialOnly) {
          return { variantId: vialOnly.id, productHandle: activeProduct.handle || null }
        }
        return { variantId: matchingVariants[0].id, productHandle: activeProduct.handle || null }
      }
    }

    // Fall back to identity.matchedVariant if it belongs to this active product
    if (identity?.matchedVariant && liveVariants.some((v) => v.id === identity.matchedVariant!.id)) {
      return { variantId: identity.matchedVariant.id, productHandle: activeProduct.handle || null }
    }

    // Default to the first live variant of this active product
    return { variantId: liveVariants[0].id, productHandle: activeProduct.handle || null }
  }

  // 3. Fallback: variant is unavailable in catalog, but product handle allows navigating to store
  return {
    variantId: null,
    productHandle: identity?.productHandle || activeProduct?.handle || null,
  }
}

function ReplenishButton({
  variantId,
  productHandle,
  countryCode,
  label = "Replenish Supply",
  className = "",
}: {
  variantId?: string | null
  productHandle?: string | null
  countryCode: string
  label?: string
  className?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!variantId && !productHandle) {
    return (
      <LocalizedClientLink
        href="/store"
        className={`inline-flex items-center justify-center gap-1 rounded-lg border border-ui-border-base bg-white px-3 py-2 min-h-[40px] text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors touch-manipulation ${className}`}
      >
        <span>Browse Store →</span>
      </LocalizedClientLink>
    )
  }

  if (!variantId && productHandle) {
    return (
      <LocalizedClientLink
        href={`/products/${getCanonicalProductSlug(productHandle)}`}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors touch-manipulation ${className}`}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span>Reorder Compound →</span>
      </LocalizedClientLink>
    )
  }

  return (
    <div className={`inline-flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={isPending || status === "success"}
        onClick={() => {
          startTransition(async () => {
            try {
              setStatus("idle")
              setErrorMsg(null)
              await addToCart({ variantId: variantId!, quantity: 1, countryCode })
              setStatus("success")
            } catch (err) {
              setStatus("error")
              setErrorMsg(err instanceof Error ? err.message : "Could not add to cart")
            }
          })
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 min-h-[40px] text-xs font-semibold transition-all touch-manipulation shadow-2xs disabled:opacity-50 w-full sm:w-auto ${
          status === "success"
            ? "bg-emerald-600 text-white"
            : "bg-emerald-700 text-white hover:bg-emerald-800"
        }`}
      >
        {isPending ? (
          <span>Adding…</span>
        ) : status === "success" ? (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>

      {status === "success" && (
        <LocalizedClientLink
          href="/cart"
          className="inline-flex items-center justify-center min-h-[36px] text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 touch-manipulation"
        >
          View Cart →
        </LocalizedClientLink>
      )}

      {status === "error" && errorMsg && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-1">
          <span className="text-xs font-medium text-rose-600">
            {errorMsg.toLowerCase().includes("not exist") || errorMsg.toLowerCase().includes("not published")
              ? "Catalog variant updated."
              : errorMsg}
          </span>
          {productHandle && (
            <LocalizedClientLink
              href={`/products/${getCanonicalProductSlug(productHandle)}`}
              className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
            >
              Select live options →
            </LocalizedClientLink>
          )}
        </div>
      )}
    </div>
  )
}

function ActionableCandidateCard({
  candidate,
  countryCode,
  idempotencyKey,
}: {
  candidate: PurchasedItemCandidate
  countryCode: string
  idempotencyKey: string
}) {
  const initialState: ResearchTrackingActionState = {
    success: false,
    error: null,
  }
  const [state, action] = useActionState(
    activatePurchasedSupplyAction,
    initialState,
  )
  const { mass, unit } = extractCompoundDetails(candidate)

  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-white p-4.5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-emerald-100 pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-700 p-2 text-white shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-ui-fg-base">{candidate.label}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ui-fg-muted">
              <span>Order #{candidate.order_display_id}</span>
              {candidate.variant_sku && (
                <>
                  <span>·</span>
                  <span>SKU: {candidate.variant_sku}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          Ready for Activation
        </span>
      </div>

      <div className="mt-3.5">
        {state.success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
            <div className="flex items-center gap-2 text-emerald-900">
              <svg className="h-5 w-5 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold">Vial Registered in Inventory</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-emerald-800">
              This vial is now active in your inventory. You can now calculate reconstitution dilution or assign it to a protocol routine.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2">
              <LocalizedClientLink
                href={`/account/research-hub?section=calculator&mass=${mass}&unit=${unit}&name=${encodeURIComponent(candidate.label)}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white transition-colors hover:bg-emerald-800 touch-manipulation w-full sm:w-auto"
              >
                <span>Reconstitution Calculator →</span>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/research-hub?section=schedule"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 min-h-[40px] text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 touch-manipulation w-full sm:w-auto"
              >
                <span>Research Schedule →</span>
              </LocalizedClientLink>
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="country_code" value={countryCode} />
            <input
              type="hidden"
              name="idempotency_key"
              value={idempotencyKey}
            />
            <input type="hidden" name="order_id" value={candidate.order_id} />
            <input
              type="hidden"
              name="line_item_id"
              value={candidate.line_item_id}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-ui-fg-subtle">
                  Review private tracking details. Purchases are never added automatically. Activate this delivered compound to add it to your active inventory for research tracking and reconstitution math.
                </p>
                {candidate.initial_quantity_base_units && candidate.base_unit && (
                  <p className="mt-1 text-xs font-medium text-ui-fg-base">
                    Verified Quantity:{" "}
                    <span className="font-semibold text-emerald-800">
                      {formatResearchQuantity(
                        candidate.initial_quantity_base_units,
                        {
                          base_unit: candidate.base_unit,
                          display_unit: candidate.display_unit,
                          base_units_per_display_unit:
                            candidate.base_units_per_display_unit,
                          display_precision: candidate.display_precision,
                        },
                        candidate.label,
                      )}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <label className="flex items-center gap-2.5 text-xs text-ui-fg-subtle min-h-[40px] cursor-pointer select-none touch-manipulation">
                  <input
                    type="checkbox"
                    name="confirm_tracking"
                    required
                    className="h-4 w-4 rounded border-ui-border-base text-emerald-700 focus:ring-emerald-700"
                  />
                  <span>Confirm receipt</span>
                </label>
                <StartTrackingButton className="w-full sm:w-auto" />
              </div>
            </div>

            {state.error && <p className="text-xs font-medium text-rose-600">{state.error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default function ProductsAndSupplies({
  configuration,
  countryCode,
  profile,
  purchasedActivationKeys,
  purchasedItems,
  runtimeReady,
  trackedMaterials,
  projections = [],
  routines = [],
  products = [],
}: ProductsAndSuppliesProps) {
  const profileReady =
    profile.status === "active" &&
    profile.consent_version === configuration.consent_version

  const storageKey = "pepstack_archived_vials"
  const [archivedVialIds, setArchivedVialIds] = useState<string[]>([])
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null)

  const receiptStorageKey = "pepstack_manually_received_vials"
  const [manuallyReceivedIds, setManuallyReceivedIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setArchivedVialIds(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(receiptStorageKey)
      if (stored) {
        setManuallyReceivedIds(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [receiptStorageKey])

  const handleMarkReceived = (supplyId: string) => {
    setManuallyReceivedIds((prev) => {
      const next = prev.includes(supplyId) ? prev : [...prev, supplyId]
      try {
        localStorage.setItem(receiptStorageKey, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleArchiveVial = (supplyId: string) => {
    setArchivedVialIds((prev) => {
      const next = prev.includes(supplyId) ? prev : [...prev, supplyId]
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleRestoreVial = (supplyId: string) => {
    setArchivedVialIds((prev) => {
      const next = prev.filter((id) => id !== supplyId)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const isVialArchived = (supply: TrackedResearchMaterial["supplies"][number]) => {
    return (
      supply.status === "archived" ||
      supply.status === "depleted" ||
      supply.remaining_quantity_base_units <= 0 ||
      archivedVialIds.includes(supply.supply_id)
    )
  }

  // Physical vials in cold storage: verified received (order completed/delivered, >= 5 days elapsed, or manually confirmed)
  const activeMaterials = trackedMaterials
    .map((m) => ({
      ...m,
      supplies: m.supplies.filter(
        (s) => !isVialArchived(s) && evaluateSupplyReceipt(s, purchasedItems, manuallyReceivedIds).isReceived
      ),
    }))
    .filter((m) => m.supplies.length > 0)

  // In-transit incoming supplies: active, but order is pending and placed < 5 days ago
  const inTransitMaterials = trackedMaterials
    .map((m) => ({
      ...m,
      supplies: m.supplies.filter(
        (s) => !isVialArchived(s) && !evaluateSupplyReceipt(s, purchasedItems, manuallyReceivedIds).isReceived
      ),
    }))
    .filter((m) => m.supplies.length > 0)

  const archivedMaterials = trackedMaterials
    .map((m) => ({
      ...m,
      supplies: m.supplies.filter((s) => isVialArchived(s)),
    }))
    .filter((m) => m.supplies.length > 0)

  const totalActiveVials = activeMaterials.reduce((acc, m) => acc + m.supplies.length, 0)
  const totalInTransitVials = inTransitMaterials.reduce((acc, m) => acc + m.supplies.length, 0)
  const totalArchivedVials = archivedMaterials.reduce((acc, m) => acc + m.supplies.length, 0)

  // Only consider items that are genuinely eligible and not yet added to tracking
  const actionablePurchases = purchasedItems.filter(
    (p) => p.eligibility === "eligible" && p.added_to_tracking_at === null,
  )

  // Active routines awaiting physical inventory (e.g. Tirzepatide configured without active vials)
  const unlinkedActiveRoutines = (routines || []).filter((r) => {
    if (r.status !== "active") return false
    const matchesAnyActiveMaterial = activeMaterials.some((m) => {
      const supplyLineItemIds = m.supplies
        .map((s) => s.source_order_line_item_id)
        .filter(Boolean) as string[]
      const mId = resolveCompoundIdentity({
        materialLabel: m.label,
        variantId: m.product_variant_id,
        products,
        purchasedItems,
        projections,
        lineItemIds: supplyLineItemIds,
      })
      return (
        (r.tracked_material_id === m.tracked_material_id ||
          r.tracked_material_label.toLowerCase() === m.label.toLowerCase()) &&
        isRoutineCompatibleWithCompound(r, mId.compoundName)
      )
    })
    return !matchesAnyActiveMaterial
  })

  return (
    <section className="mt-6" aria-labelledby="products-and-supplies-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ui-border-base pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
            Physical Inventory
          </p>
          <h2 id="products-and-supplies-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Vials &amp; Stability Inventory
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Track active reference vials, 28-day reconstituted liquid stability countdowns, and storage temperatures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocalizedClientLink
            href="/account/research-hub?section=calculator"
            className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
          >
            Reconstitution Tool →
          </LocalizedClientLink>
        </div>
      </div>

      {!profileReady ? (
        <div className={`${cardClass} bg-ui-bg-subtle`}>
          <p className="text-sm">An active profile with current consent is required.</p>
        </div>
      ) : !configuration.purchased_activation_available ? (
        <div className={`${cardClass} bg-ui-bg-subtle`}>
          <p className="text-sm">Purchased-item tracking is not configured yet.</p>
        </div>
      ) : !runtimeReady ? (
        <div className={`${cardClass} border-amber-200 bg-amber-50`}>
          <p className="text-sm font-medium text-amber-900">
            Products & Supplies is temporarily unavailable
          </p>
          <p className="mt-2 text-sm text-amber-800">
            No tracking change was made. Please try again later.
          </p>
          <a
            href={`/${countryCode}/account/research-hub`}
            className="mt-3 inline-block text-sm font-medium underline"
          >
            Retry
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Actionable Purchases Banner (Only renders when there is an actual eligible purchase waiting) */}
          {actionablePurchases.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Delivered Compound Ready to Activate ({actionablePurchases.length})
              </p>
              <div className="space-y-3">
                {actionablePurchases.map((candidate) => (
                  <ActionableCandidateCard
                    key={candidate.line_item_id}
                    candidate={candidate}
                    countryCode={countryCode}
                    idempotencyKey={purchasedActivationKeys[candidate.line_item_id]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Full-width Tracked Vials & Materials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ui-fg-base">Active Vials in Storage</h3>
              <span className="rounded-full bg-ui-bg-subtle px-2.5 py-0.5 text-xs font-medium text-ui-fg-subtle">
                {totalActiveVials} Active {totalActiveVials === 1 ? "Vial" : "Vials"}
              </span>
            </div>

            {activeMaterials.length ? (
              <div className="space-y-8 w-full">
                {activeMaterials.map((material) => {
                  const matchingProjection = projections.find(
                    (p) =>
                      p.tracked_material_id === material.tracked_material_id ||
                      p.tracked_material_label.toLowerCase() === material.label.toLowerCase()
                  )
                  const matchingPurchased = purchasedItems.find(
                    (p) => p.label.toLowerCase() === material.label.toLowerCase()
                  )
                  const materialVariantId =
                    matchingProjection?.source_product_variant_id ||
                    matchingProjection?.product_variant_id ||
                    material.product_variant_id ||
                    matchingPurchased?.variant_id ||
                    null
                  const materialProductHandle =
                    matchingProjection?.source_product_handle ||
                    (material.label.toLowerCase().includes("tirzepatide") ? "tirzepatide" : null)

                  const supplyLineItemIds = material.supplies
                    .map((s) => s.source_order_line_item_id)
                    .filter(Boolean) as string[]

                  const identity = resolveCompoundIdentity({
                    materialLabel: material.label,
                    variantId: materialVariantId,
                    productHandle: materialProductHandle,
                    products,
                    purchasedItems,
                    projections,
                    lineItemIds: supplyLineItemIds,
                  })

                  const effectiveProductHandle =
                    identity.productHandle ||
                    materialProductHandle ||
                    (identity.matchedProduct?.handle ? getCanonicalProductSlug(identity.matchedProduct.handle) : null)

                  // Linked active routines for this tracked material (strictly chemically compatible)
                  const linkedRoutines = (routines || []).filter(
                    (r) =>
                      r.status === "active" &&
                      (r.tracked_material_id === material.tracked_material_id ||
                        r.tracked_material_label.toLowerCase() === material.label.toLowerCase()) &&
                      isRoutineCompatibleWithCompound(r, identity.compoundName)
                  )

                  // Matching replenishment projections
                  const materialProjections = projections.filter(
                    (p) =>
                      p.tracked_material_id === material.tracked_material_id ||
                      p.tracked_material_label.toLowerCase() === material.label.toLowerCase()
                  )

                  // Calculate total remaining base units across all supplies for this material
                  const totalRemainingBaseUnits = material.supplies.reduce(
                    (acc, s) => acc + s.remaining_quantity_base_units,
                    0
                  )

                  // Combined daily consumption in base units (micrograms or base unit)
                  let totalDailyConsumptionBaseUnits = 0
                  const routineBurnBreakdown: {
                    routineId: string
                    routineLabel: string
                    dailyBaseUnits: number
                    frequencyLabel: string
                    amountLabel: string
                  }[] = []

                  for (const routine of linkedRoutines) {
                    const rev = routine.current_revision
                    if (!rev) continue
                    const sched = rev.schedule
                    let dailyBaseUnits = 0
                    let frequencyLabel = "daily"

                    if (sched.recurrence_type === "daily") {
                      const interval = Math.max(1, sched.daily_interval || 1)
                      dailyBaseUnits = rev.planned_quantity_base_units / interval
                      frequencyLabel = interval === 1 ? "Daily" : `Every ${interval}d`
                    } else if (sched.recurrence_type === "weekly") {
                      const count = Math.max(1, sched.weekdays?.length || 1)
                      const interval = Math.max(1, sched.weekly_interval || 1)
                      dailyBaseUnits = (rev.planned_quantity_base_units * count) / (interval * 7)
                      frequencyLabel = interval === 1 ? `${count}x / week` : `Every ${interval} wks`
                    } else {
                      dailyBaseUnits = 0
                      frequencyLabel = "Single session"
                    }

                    totalDailyConsumptionBaseUnits += dailyBaseUnits

                    const isMcg = isMcgPreferredCompound(identity.compoundName)
                    const amountNumber = isMcg
                      ? rev.planned_quantity_base_units
                      : rev.planned_quantity_base_units / 1000
                    const amountLabel = `${Number(amountNumber.toFixed(2))} ${isMcg ? "mcg" : "mg"}`

                    routineBurnBreakdown.push({
                      routineId: routine.routine_id,
                      routineLabel: rev.label,
                      dailyBaseUnits,
                      frequencyLabel,
                      amountLabel,
                    })
                  }

                  // Fallback to projections if no routines directly passed
                  if (totalDailyConsumptionBaseUnits === 0 && materialProjections.length > 0) {
                    for (const proj of materialProjections) {
                      if (proj.estimated_days_remaining && proj.estimated_days_remaining > 0) {
                        const dailyBase = proj.remaining_quantity_base_units / proj.estimated_days_remaining
                        totalDailyConsumptionBaseUnits += dailyBase
                        routineBurnBreakdown.push({
                          routineId: proj.routine_id,
                          routineLabel: proj.routine_id ? `Protocol ${proj.routine_id.slice(0, 6)}` : "Active Protocol",
                          dailyBaseUnits: dailyBase,
                          frequencyLabel: `${proj.estimated_uses_per_week}x/wk`,
                          amountLabel: `${(proj.planned_quantity_base_units / 1000).toFixed(1)} mg`,
                        })
                      }
                    }
                  }

                  const combinedEstimatedDaysRemaining =
                    totalDailyConsumptionBaseUnits > 0
                      ? Math.floor(totalRemainingBaseUnits / totalDailyConsumptionBaseUnits)
                      : null

                  const combinedRunoutDate =
                    combinedEstimatedDaysRemaining !== null
                      ? new Date(Date.now() + combinedEstimatedDaysRemaining * 86_400_000)
                      : null

                  const isCombinedLowSupply =
                    combinedEstimatedDaysRemaining !== null && combinedEstimatedDaysRemaining <= 14

                  return (
                    <div
                      key={material.tracked_material_id}
                      className="w-full space-y-5"
                    >
                      {/* Full-Width Compound Overview & Runway Banner */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
                              <h4 className="text-xl font-bold tracking-tight text-slate-900">
                                {identity.compoundName}
                              </h4>
                              {identity.variantLabel && (
                                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                                  {identity.variantLabel}
                                </span>
                              )}
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                In Inventory
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">
                              {material.supplies.length === 1 ? "1 active physical vial in storage" : `${material.supplies.length} active physical vials in storage`}
                              {" · "}
                              <strong className="font-semibold text-slate-700">
                                {formatResearchQuantity(totalRemainingBaseUnits, material.supplies[0] || { base_unit: "microgram" }, identity.compoundName)}
                              </strong>{" "}
                              total available inventory
                              {identity.matchedProduct?.title && identity.compoundName !== material.label && (
                                <span className="ml-1 text-slate-400">· Resolved from {identity.matchedProduct.title}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {effectiveProductHandle && (
                              <LocalizedClientLink
                                href={`/products/${getCanonicalProductSlug(effectiveProductHandle)}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 hover:bg-emerald-50/50 transition-colors shadow-2xs"
                              >
                                <span>View Compound Details →</span>
                              </LocalizedClientLink>
                            )}
                          </div>
                        </div>

                        {/* Integrated Routine Supply Outlook & Combined Burn Rate */}
                        <div className="mt-5 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Supply Outlook & Protocol Runway
                              </span>
                              {isCombinedLowSupply && (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                  Low Supply
                                </span>
                              )}
                            </div>
                            {combinedEstimatedDaysRemaining !== null ? (
                              <span className={`text-xs font-bold ${combinedEstimatedDaysRemaining <= 14 ? "text-amber-800" : "text-emerald-800"}`}>
                                ~{combinedEstimatedDaysRemaining} days remaining ({combinedRunoutDate?.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })})
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">No active protocol consumption</span>
                            )}
                          </div>

                          {routineBurnBreakdown.length > 0 ? (
                            <div className="mt-3.5 space-y-3">
                              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                                <span>
                                  Combined Daily Consumption:{" "}
                                  <strong className="text-slate-900">
                                    {isMcgPreferredCompound(identity.compoundName)
                                      ? `${Math.round(totalDailyConsumptionBaseUnits)} mcg/day`
                                      : `${(totalDailyConsumptionBaseUnits / 1000).toFixed(2)} mg/day`}
                                  </strong>
                                </span>
                                <span>
                                  {routineBurnBreakdown.length} active {routineBurnBreakdown.length === 1 ? "protocol" : "protocols"} linked
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                                {routineBurnBreakdown.map((item) => (
                                  <div
                                    key={item.routineId}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs"
                                  >
                                    <div className="truncate pr-2">
                                      <p className="font-semibold text-slate-900 truncate">{item.routineLabel}</p>
                                      <p className="text-[11px] text-slate-500">{item.frequencyLabel}</p>
                                    </div>
                                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                                      {item.amountLabel}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                              <p>No active routines are currently consuming this compound.</p>
                              <LocalizedClientLink
                                href="/account/research-hub?section=routines"
                                className="font-semibold text-emerald-800 underline hover:text-emerald-900"
                              >
                                + Link to Protocol Routine
                              </LocalizedClientLink>
                            </div>
                          )}

                          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-[11px] text-slate-500">
                            <span>Cold-Chain Buffer: 2°C – 8°C Monitored Cold Storage</span>
                            <span>Preservation: Bacteriostatic 0.9% Protected</span>
                          </div>
                        </div>

                        {/* Physical Vials in Storage Grid */}
                        <div className="mt-6 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Physical Vials in Cold Storage ({material.supplies.length})
                              </h5>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Refrigerated 2°C – 8°C Monitored Storage · Private Research Inventory
                              </p>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                              Verified Received &amp; In Cold Storage
                            </span>
                          </div>

                          {/* Viability Tracking Science Callout */}
                          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-xs text-slate-700">
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 shrink-0 border border-emerald-200 mt-0.5">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                              </div>
                              <div className="space-y-1.5 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-bold text-emerald-950">
                                    Compound Viability &amp; Stability Lifecycle
                                  </p>
                                  <span className="text-[11px] font-medium text-emerald-800">
                                    Cold-Chain Standard: 2°C – 8°C Protection
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px] leading-relaxed">
                                  <div className="rounded-lg bg-white/90 p-3 border border-emerald-200/60 shadow-2xs">
                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                                      1. Lyophilized Powder (Sealed Cake)
                                    </span>
                                    <span className="mt-1 text-slate-600 block">
                                      Stable up to <strong>24 months</strong> in -20°C or 2°C–8°C dark storage. The 28-day stability countdown does not begin while intact in dry powder state.
                                    </span>
                                  </div>
                                  <div className="rounded-lg bg-white/90 p-3 border border-emerald-200/60 shadow-2xs">
                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                      2. Reconstituted Solution (Active Research)
                                    </span>
                                    <span className="mt-1 text-slate-600 block">
                                      28-day countdown begins <strong>on the day solvent (bacteriostatic water) is introduced</strong> and research starts. Retains peptide integrity for <strong>28 days</strong> at 2°C–8°C.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`grid gap-5 ${material.supplies.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                            {material.supplies.map((supply, sIdx) => {
                              const initial = supply.initial_quantity_base_units || 1
                              const remaining = supply.remaining_quantity_base_units
                              const pct = Math.max(0, Math.min(100, Math.round((remaining / initial) * 100)))
                              const { mass: supplyMass, unit: supplyUnit } = extractSupplyDetails(supply, identity.compoundName)

                              const supplyPurchased = supply.source_order_line_item_id
                                ? purchasedItems.find((p) => p.line_item_id === supply.source_order_line_item_id)
                                : null
                              
                              const candidateVariantId = supplyPurchased?.variant_id || materialVariantId || null
                              const { variantId, productHandle } = resolveActiveReplenishVariant({
                                candidateVariantId,
                                identity,
                                products,
                                targetMass: supplyMass,
                                packagingPreference: supplyPurchased?.label || identity.variantLabel || null,
                              })

                              const isLowSupply = pct <= 20 || isCombinedLowSupply || matchingProjection?.urgency === "reorder_now"

                              const barColor =
                                pct > 40
                                  ? "bg-emerald-500"
                                  : pct > 15
                                    ? "bg-amber-500"
                                    : "bg-rose-500"

                              const addedAt = new Date(supply.added_to_tracking_at).getTime()
                              const daysElapsed = Math.max(0, Math.floor((Date.now() - addedAt) / 86400000))
                              const stabilityDaysRemaining = Math.max(0, 28 - daysElapsed)
                              const stabilityPct = Math.max(0, Math.min(100, Math.round((stabilityDaysRemaining / 28) * 100)))

                              const stabilityStatus =
                                stabilityDaysRemaining > 10
                                  ? {
                                      label: "Optimal Viability",
                                      badge: `${stabilityDaysRemaining}d remaining`,
                                      barColor: "bg-emerald-500",
                                      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
                                    }
                                  : stabilityDaysRemaining > 0
                                    ? {
                                        label: "Expiring Soon",
                                        badge: `${stabilityDaysRemaining}d remaining`,
                                        barColor: "bg-amber-500",
                                        badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
                                      }
                                    : {
                                        label: "Degradation Warning",
                                        badge: "Past 28d viability",
                                        barColor: "bg-rose-500",
                                        badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
                                      }

                              const isReserve = pct === 100

                              return (
                                <div
                                  key={supply.supply_id}
                                  className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-emerald-300 transition-all"
                                >
                                  <div>
                                    {/* Prominent Compound + Vial Header */}
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div>
                                        <h6 className="text-base font-bold text-slate-900">
                                          {identity.compoundName} — Vial #{sIdx + 1}
                                        </h6>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                          Standard Reference Batch · Registered {new Date(supply.added_to_tracking_at).toLocaleDateString("en-PH", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        {isReserve ? (
                                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                                            Sealed Reserve (100% Intact)
                                          </span>
                                        ) : (
                                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                            In Active Research ({pct}%)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Meter 1: Volume remaining */}
                                    <div className="mt-4">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600 font-medium">
                                          {supply.base_unit === "microgram"
                                            ? "Compound Mass"
                                            : supply.base_unit === "microliter"
                                              ? "Liquid Volume"
                                              : "Unit Count"}
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                          {formatResearchQuantity(remaining, supply, identity.compoundName)} / {formatResearchQuantity(initial, supply, identity.compoundName)} ({pct}%)
                                        </span>
                                      </div>
                                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className={`h-full transition-all duration-300 ${barColor}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Meter 2: Physical stability & degradation gauge */}
                                    {isReserve ? (
                                      <div className="mt-4 rounded-lg border border-sky-200/80 bg-sky-50/50 p-3.5">
                                        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                                              Lyophilized Powder Stability
                                            </span>
                                            <span className="text-[11px] text-sky-700">
                                              · 24-Month Shelf Life
                                            </span>
                                          </div>
                                          <span className="rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                                            Sealed Cake (Intact)
                                          </span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sky-200">
                                          <div
                                            className="h-full bg-sky-500"
                                            style={{ width: "100%" }}
                                          />
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-sky-800/80">
                                          <span>Storage: -20°C to 8°C Protected</span>
                                          <span>28d countdown begins upon reconstitution</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5">
                                        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                              28-Day Stability Window
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                              · Day {Math.min(28, daysElapsed + 1)} of 28
                                            </span>
                                          </div>
                                          <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stabilityStatus.badgeClass}`}
                                          >
                                            {stabilityStatus.label} ({stabilityStatus.badge})
                                          </span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                          <div
                                            className={`h-full transition-all duration-300 ${stabilityStatus.barColor}`}
                                            style={{ width: `${stabilityPct}%` }}
                                          />
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                          <span>Cold-Chain: 2°C – 8°C Monitored</span>
                                          <span>Preservation: Bacteriostatic 0.9%</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Batch & Dates */}
                                    <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 border-t border-slate-100 pt-3">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Registered</span>
                                        <p className="font-semibold text-slate-800">
                                          {new Date(supply.added_to_tracking_at).toLocaleDateString("en-PH", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Lot / Batch</span>
                                        <p className="font-semibold text-slate-800 truncate">
                                          {supply.lot_number || supply.batch_number || "Standard Batch"}
                                        </p>
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Storage</span>
                                        <p className="font-semibold text-slate-800 truncate">
                                          {supply.storage_note || "2°C – 8°C Protected"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Low Supply Alert */}
                                    {isLowSupply && (
                                      <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950">
                                        <div className="flex items-center gap-2.5">
                                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                                            !
                                          </span>
                                          <div>
                                            <p className="font-semibold leading-tight">
                                              Low Supply ({pct}% Remaining)
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-amber-800 leading-tight">
                                              {combinedEstimatedDaysRemaining !== null
                                                ? `Estimated ${combinedEstimatedDaysRemaining} days of supply remaining across active protocols. Reorder now to maintain continuity.`
                                                : matchingProjection?.estimated_days_remaining !== null &&
                                                  matchingProjection?.estimated_days_remaining !== undefined
                                                  ? `Estimated ${matchingProjection.estimated_days_remaining} days of supply remaining. Reorder now to maintain continuity.`
                                                  : "Supply level is running low. Reorder now to maintain research continuity."}
                                            </p>
                                          </div>
                                        </div>
                                        <ReplenishButton
                                          variantId={variantId}
                                          productHandle={productHandle}
                                          countryCode={countryCode}
                                          label="Replenish Now"
                                          className="w-full sm:w-auto shrink-0"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick actions for this vial */}
                                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
                                      <LocalizedClientLink
                                        href={`/account/research-hub?section=calculator&mass=${supplyMass}&unit=${supplyUnit}&name=${encodeURIComponent(identity.compoundName)}`}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 min-h-[38px] text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 hover:bg-emerald-50/40 transition-colors touch-manipulation w-full sm:w-auto shadow-2xs"
                                      >
                                        <span>Reconstitution Math →</span>
                                      </LocalizedClientLink>
                                      <LocalizedClientLink
                                        href="/account/research-hub?section=schedule"
                                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 min-h-[38px] text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors touch-manipulation w-full sm:w-auto shadow-2xs"
                                      >
                                        <span>Research Schedule →</span>
                                      </LocalizedClientLink>
                                      {!isLowSupply && (
                                        <ReplenishButton
                                          variantId={variantId}
                                          productHandle={productHandle}
                                          countryCode={countryCode}
                                          label="Replenish Supply"
                                          className="w-full sm:w-auto"
                                        />
                                      )}
                                    </div>
                                    {confirmArchiveId === supply.supply_id ? (
                                      <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleArchiveVial(supply.supply_id)
                                            setConfirmArchiveId(null)
                                          }}
                                          className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-2 min-h-[36px] text-xs font-semibold text-white hover:bg-rose-700 transition-colors touch-manipulation"
                                        >
                                          Confirm Archive
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmArchiveId(null)}
                                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 min-h-[36px] text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors touch-manipulation"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-end pt-1 sm:pt-0">
                                        <button
                                          type="button"
                                          onClick={() => setConfirmArchiveId(supply.supply_id)}
                                          className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors touch-manipulation"
                                        >
                                          <span>Archive Vial</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center flex flex-col items-center justify-center gap-y-3">
                <p className="text-sm font-semibold text-slate-900">No active physical vials in cold storage</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {totalArchivedVials > 0
                    ? "All registered vials are currently in archive. You can restore vials below."
                    : "Delivered orders with research compounds will appear here for 28-day stability activation once received."}
                </p>
                {totalArchivedVials === 0 && (
                  <div className="mt-2">
                    <LocalizedClientLink
                      href="/store"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <span>Explore Compound Catalog</span>
                      <span aria-hidden="true">&rarr;</span>
                    </LocalizedClientLink>
                  </div>
                )}
              </div>
            )}

            {/* Incoming Supply & In-Transit Orders Card */}
            {totalInTransitVials > 0 && (
              <div className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/50 via-white to-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-sky-600 p-2.5 text-white shrink-0 shadow-2xs">
                      <TruckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          Incoming Supply &amp; In-Transit Orders
                        </h4>
                        <span className="rounded-full border border-sky-200 bg-sky-100/80 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                          {totalInTransitVials} {totalInTransitVials === 1 ? "Vial" : "Vials"} En Route
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                        Orders automatically confirm receipt within 5 days of placement in accordance with Philippine logistics fulfillment, or can be confirmed immediately upon physical courier arrival.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {inTransitMaterials.map((mat) => {
                    const matchingProjection = projections.find(
                      (p) =>
                        p.tracked_material_id === mat.tracked_material_id ||
                        p.tracked_material_label.toLowerCase() === mat.label.toLowerCase()
                    )
                    const matchingPurchased = purchasedItems.find(
                      (p) => p.label.toLowerCase() === mat.label.toLowerCase()
                    )
                    const matVariantId =
                      matchingProjection?.source_product_variant_id ||
                      matchingProjection?.product_variant_id ||
                      mat.product_variant_id ||
                      matchingPurchased?.variant_id ||
                      null
                    const matProductHandle =
                      matchingProjection?.source_product_handle ||
                      (mat.label.toLowerCase().includes("tirzepatide") ? "tirzepatide" : null)

                    const supplyLineItemIds = mat.supplies
                      .map((s) => s.source_order_line_item_id)
                      .filter(Boolean) as string[]

                    const identity = resolveCompoundIdentity({
                      materialLabel: mat.label,
                      variantId: matVariantId,
                      productHandle: matProductHandle,
                      products,
                      purchasedItems,
                      projections,
                      lineItemIds: supplyLineItemIds,
                    })

                    return mat.supplies.map((sup) => {
                      const receipt = evaluateSupplyReceipt(sup, purchasedItems, manuallyReceivedIds)
                      const { mass, unit } = extractSupplyDetails(sup, identity.compoundName)
                      const autoReceiveDate = receipt.orderCreatedAt
                        ? new Date(receipt.orderCreatedAt.getTime() + 5 * 86_400_000).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "within 5 days"

                      return (
                        <div
                          key={sup.supply_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-sky-200/80 bg-white p-4.5 shadow-2xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-sky-50 border border-sky-200 p-2 text-sky-700 shrink-0 mt-0.5">
                              <ClockIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-slate-900">
                                  {identity.compoundName} {mass ? `(${mass} ${unit})` : ""}
                                </p>
                                {identity.variantLabel && (
                                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {identity.variantLabel}
                                  </span>
                                )}
                                {receipt.orderDisplayId && (
                                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    Order #{receipt.orderDisplayId}
                                  </span>
                                )}
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                                  Auto-receives in {receipt.daysUntilAutoReceive} {receipt.daysUntilAutoReceive === 1 ? "day" : "days"}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                {receipt.orderCreatedAt && (
                                  <span>
                                    Placed: {receipt.orderCreatedAt.toLocaleDateString("en-PH", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                                <span>·</span>
                                <span>
                                  Delivery Window: Auto-transfers to Cold Storage on <strong>{autoReceiveDate}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMarkReceived(sup.supply_id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-2xs touch-manipulation"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Confirm Physical Arrival</span>
                            </button>
                          </div>
                        </div>
                      )
                    })
                  })}
                </div>
              </div>
            )}

            {/* Protocols Awaiting Physical Supply Section */}
            {unlinkedActiveRoutines.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Protocols Awaiting Physical Inventory ({unlinkedActiveRoutines.length})
                  </h3>
                </div>
                {unlinkedActiveRoutines.map((routine) => {
                  const targetCompoundName = getRoutineTargetCompound(routine) || "Reference Compound"
                  const targetSlug = getCanonicalProductSlug(targetCompoundName.toLowerCase().replace(/\s+/g, "-"))
                  const rev = routine.current_revision
                  let amountLabel = ""
                  let freqLabel = ""
                  if (rev) {
                    const isMcg = isMcgPreferredCompound(targetCompoundName)
                    const amtNum = isMcg ? rev.planned_quantity_base_units : rev.planned_quantity_base_units / 1000
                    amountLabel = `${Number(amtNum.toFixed(2))} ${isMcg ? "mcg" : "mg"}`
                    const sched = rev.schedule
                    if (sched.recurrence_type === "daily") {
                      freqLabel = sched.daily_interval === 1 ? "Daily" : `Every ${sched.daily_interval}d`
                    } else if (sched.recurrence_type === "weekly") {
                      freqLabel = `${sched.weekdays?.length || 1}x / week`
                    } else {
                      freqLabel = "Single session"
                    }
                  }

                  return (
                    <div
                      key={routine.routine_id}
                      className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800 shrink-0 border border-amber-200">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                Protocol Awaiting Physical Inventory
                              </span>
                              <span className="rounded-md border border-amber-300 bg-white/80 px-2 py-0.5 text-xs font-bold text-amber-900">
                                {targetCompoundName}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-amber-950">
                              {rev?.label || "Configured Protocol"}
                              {amountLabel && <span className="ml-2 font-normal text-amber-800">({amountLabel} · {freqLabel})</span>}
                            </p>
                            <p className="mt-0.5 text-xs text-amber-800 leading-relaxed max-w-2xl">
                              This protocol is configured, but no physical {targetCompoundName} vials are currently activated in storage. Order reference standard or activate a delivered order to track vial stability and reconstitution math.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                          <LocalizedClientLink
                            href={targetSlug ? `/products/${targetSlug}` : "/store"}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-800 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white hover:bg-amber-900 transition-colors shadow-2xs"
                          >
                            <span>Order {targetCompoundName} →</span>
                          </LocalizedClientLink>
                          <LocalizedClientLink
                            href="/account/research-hub?section=routines"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 py-2 min-h-[40px] text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors shadow-2xs"
                          >
                            <span>Manage Protocols →</span>
                          </LocalizedClientLink>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Archived & Depleted Vials Section */}
            {totalArchivedVials > 0 && (
              <div className="rounded-xl border border-ui-border-base bg-white p-4 shadow-xs">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-sm text-ui-fg-base">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-ui-fg-muted transition-transform group-open:rotate-90"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Archived & Depleted Vials ({totalArchivedVials})</span>
                    </div>
                    <span className="text-xs text-ui-fg-muted">Historical Lot & Batch Records</span>
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-ui-border-base pt-4">
                    {archivedMaterials.map((mat) => {
                      const matchingProjection = projections.find(
                        (p) =>
                          p.tracked_material_id === mat.tracked_material_id ||
                          p.tracked_material_label.toLowerCase() === mat.label.toLowerCase()
                      )
                      const matchingPurchased = purchasedItems.find(
                        (p) => p.label.toLowerCase() === mat.label.toLowerCase()
                      )
                      const matVariantId =
                        matchingProjection?.source_product_variant_id ||
                        matchingProjection?.product_variant_id ||
                        mat.product_variant_id ||
                        matchingPurchased?.variant_id ||
                        null
                      const matProductHandle =
                        matchingProjection?.source_product_handle ||
                        (mat.label.toLowerCase().includes("tirzepatide") ? "tirzepatide" : null)

                      const supLineItemIds = mat.supplies
                        .map((s) => s.source_order_line_item_id)
                        .filter(Boolean) as string[]

                      const matIdentity = resolveCompoundIdentity({
                        materialLabel: mat.label,
                        variantId: matVariantId,
                        productHandle: matProductHandle,
                        products,
                        purchasedItems,
                        projections,
                        lineItemIds: supLineItemIds,
                      })

                      return (
                        <div key={mat.tracked_material_id} className="space-y-2">
                          <p className="text-xs font-bold text-ui-fg-muted uppercase tracking-wider">{mat.label}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {mat.supplies.map((sup, idx) => {
                              const supPurchased = sup.source_order_line_item_id
                                ? purchasedItems.find((p) => p.line_item_id === sup.source_order_line_item_id)
                                : null
                              
                              const { mass: supMass } = extractSupplyDetails(sup, matIdentity.compoundName)
                              const { variantId, productHandle } = resolveActiveReplenishVariant({
                                candidateVariantId: supPurchased?.variant_id || matVariantId,
                                identity: matIdentity,
                                products,
                                targetMass: supMass,
                                packagingPreference: supPurchased?.label || matIdentity.variantLabel || null,
                              })

                              return (
                                <div
                                  key={sup.supply_id}
                                  className="rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3.5 text-xs text-ui-fg-subtle"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ui-fg-base">Vial #{idx + 1}</span>
                                    <span className="rounded-full bg-ui-bg-base border border-ui-border-base px-2 py-0.5 text-[10px] font-medium text-ui-fg-muted">
                                      {sup.remaining_quantity_base_units <= 0 ? "Depleted" : "Archived"}
                                    </span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                                    <div>
                                      <span className="text-ui-fg-muted">Lot / Batch:</span>{" "}
                                      <span className="font-medium text-ui-fg-base truncate block">{sup.lot_number || sup.batch_number || "Standard Batch"}</span>
                                    </div>
                                    <div>
                                      <span className="text-ui-fg-muted">Registered:</span>{" "}
                                      <span className="font-medium text-ui-fg-base block">
                                        {new Date(sup.added_to_tracking_at).toLocaleDateString("en-PH", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ui-border-base pt-2">
                                    <ReplenishButton
                                      variantId={variantId}
                                      productHandle={productHandle}
                                      countryCode={countryCode}
                                      label="Reorder Compound"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreVial(sup.supply_id)}
                                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                                    >
                                      Restore to Active Storage ↑
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </details>
              </div>
            )}

            <div className="rounded-xl border border-ui-border-base bg-white p-4 text-xs leading-relaxed text-ui-fg-subtle">
              <p className="font-medium text-ui-fg-base">Protocol & Safety Notice</p>
              <p className="mt-1">
                Always verify reconstitution solvent volume (e.g. bacteriostatic water) and syringe calibration units (U-100) before preparing any compound. All private records and calculations are strictly customer-controlled.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
