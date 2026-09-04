"use client"

import { addToCart } from "@lib/data/cart"
import {
  activatePurchasedSupplyAction,
  type PurchasedItemCandidate,
  type ResearchProfile,
  type ResearchReplenishmentProjection,
  type ResearchTrackingActionState,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import type { PurchasedActivationSubmissionKeys } from "@lib/research-tracking-idempotency"
import { formatResearchQuantity } from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
}

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"

function extractCompoundDetails(candidate: PurchasedItemCandidate) {
  let mass = ""
  let unit = "mg"
  if (candidate.initial_quantity_base_units && candidate.base_unit) {
    if (candidate.display_unit === "mg" && candidate.base_units_per_display_unit) {
      mass = (candidate.initial_quantity_base_units / candidate.base_units_per_display_unit).toString()
      unit = "mg"
    } else if (candidate.base_unit === "microgram") {
      mass = (candidate.initial_quantity_base_units / 1000).toString()
      unit = "mg"
    } else {
      mass = candidate.initial_quantity_base_units.toString()
      unit = candidate.display_unit || "mcg"
    }
  }
  return { mass, unit }
}

function extractSupplyDetails(supply: TrackedResearchMaterial["supplies"][number]) {
  let mass = ""
  let unit = "mg"
  if (supply.initial_quantity_base_units) {
    if (supply.display_unit === "mg" && supply.base_units_per_display_unit) {
      mass = (supply.initial_quantity_base_units / supply.base_units_per_display_unit).toString()
      unit = "mg"
    } else if (supply.base_unit === "microgram") {
      mass = (supply.initial_quantity_base_units / 1000).toString()
      unit = "mg"
    } else {
      mass = supply.initial_quantity_base_units.toString()
      unit = supply.display_unit || "mcg"
    }
  }
  return { mass, unit }
}

function StartTrackingButton({ className = "" }: { className?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white transition-colors hover:bg-indigo-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? "Activating Vial…" : "Register & Activate Vial"}
    </button>
  )
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
        href={`/products/${productHandle}`}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors touch-manipulation ${className}`}
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
            : "bg-indigo-600 text-white hover:bg-indigo-700"
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
        <span className="text-xs font-medium text-rose-600">{errorMsg}</span>
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
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white p-4.5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-600 p-2 text-white shrink-0">
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
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
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
                <span>Dosing Schedule →</span>
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
                  Activate this delivered compound to add it to your active inventory for dose logging and reconstitution math.
                </p>
                {candidate.initial_quantity_base_units && candidate.base_unit && (
                  <p className="mt-1 text-xs font-medium text-ui-fg-base">
                    Verified Quantity:{" "}
                    <span className="font-semibold text-indigo-700">
                      {formatResearchQuantity(
                        candidate.initial_quantity_base_units,
                        {
                          base_unit: candidate.base_unit,
                          display_unit: candidate.display_unit,
                          base_units_per_display_unit:
                            candidate.base_units_per_display_unit,
                          display_precision: candidate.display_precision,
                        },
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
                    className="h-4 w-4 rounded border-ui-border-base text-indigo-600 focus:ring-indigo-600"
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
}: ProductsAndSuppliesProps) {
  const profileReady =
    profile.status === "active" &&
    profile.consent_version === configuration.consent_version

  const storageKey = "pepstack_archived_vials"
  const [archivedVialIds, setArchivedVialIds] = useState<string[]>([])
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null)

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

  const activeMaterials = trackedMaterials
    .map((m) => ({
      ...m,
      supplies: m.supplies.filter((s) => !isVialArchived(s)),
    }))
    .filter((m) => m.supplies.length > 0)

  const archivedMaterials = trackedMaterials
    .map((m) => ({
      ...m,
      supplies: m.supplies.filter((s) => isVialArchived(s)),
    }))
    .filter((m) => m.supplies.length > 0)

  const totalActiveVials = activeMaterials.reduce((acc, m) => acc + m.supplies.length, 0)
  const totalArchivedVials = archivedMaterials.reduce((acc, m) => acc + m.supplies.length, 0)

  // Only consider items that are genuinely eligible and not yet added to tracking
  const actionablePurchases = purchasedItems.filter(
    (p) => p.eligibility === "eligible" && p.added_to_tracking_at === null,
  )

  return (
    <section className="mt-6" aria-labelledby="products-and-supplies-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ui-border-base pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
            Physical Inventory
          </p>
          <h2 id="products-and-supplies-title" className="mt-1 text-xl font-bold tracking-tight text-ui-fg-base">
            Tracked Vials & Supplies
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ui-fg-subtle">
            Manage your physical vials, monitor remaining dose levels, and calculate reconstitution dilution.
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
            href={`/${countryCode}/account/research-tracking`}
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
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
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
              <div className="grid grid-cols-1 gap-4 large:grid-cols-2">
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

                  return (
                    <div
                      key={material.tracked_material_id}
                      className="rounded-xl border border-ui-border-base bg-white p-5 shadow-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-ui-border-base pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="text-base font-semibold text-ui-fg-base">{material.label}</p>
                          </div>
                          <p className="mt-0.5 text-xs text-ui-fg-muted">
                            {material.supplies.length === 1 ? "1 active vial" : `${material.supplies.length} active vials`}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          In Inventory
                        </span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {material.supplies.map((supply, sIdx) => {
                          const initial = supply.initial_quantity_base_units || 1
                          const remaining = supply.remaining_quantity_base_units
                          const pct = Math.max(0, Math.min(100, Math.round((remaining / initial) * 100)))
                          const { mass: supplyMass, unit: supplyUnit } = extractSupplyDetails(supply)

                          const supplyPurchased = supply.source_order_line_item_id
                            ? purchasedItems.find((p) => p.line_item_id === supply.source_order_line_item_id)
                            : null
                          const variantId = supplyPurchased?.variant_id || materialVariantId
                          const productHandle = materialProductHandle

                          const isLowSupply = pct <= 20 || matchingProjection?.urgency === "reorder_now"

                          const barColor =
                            pct > 40
                              ? "bg-emerald-500"
                              : pct > 15
                                ? "bg-amber-500"
                                : "bg-rose-500"

                          return (
                            <div
                              key={supply.supply_id}
                              className="rounded-lg border border-ui-border-base bg-ui-bg-subtle/30 p-4"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-ui-fg-base">
                                  Vial #{sIdx + 1}
                                </span>
                                <span className="font-medium text-ui-fg-subtle">
                                  {formatResearchQuantity(remaining, supply)} / {formatResearchQuantity(initial, supply)} ({pct}%)
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ui-border-base">
                                <div
                                  className={`h-full transition-all duration-300 ${barColor}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              {/* Batch & Dates */}
                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Registered</span>
                                  <p className="font-medium text-ui-fg-base">
                                    {new Date(supply.added_to_tracking_at).toLocaleDateString("en-PH", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Lot / Batch</span>
                                  <p className="font-medium text-ui-fg-base truncate">
                                    {supply.lot_number || supply.batch_number || "Standard Batch"}
                                  </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Storage</span>
                                  <p className="font-medium text-ui-fg-base truncate">
                                    {supply.storage_note || "2°C - 8°C Protected"}
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
                                        {matchingProjection?.estimated_days_remaining !== null &&
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

                              {/* Quick actions for this vial */}
                              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-ui-border-base pt-3">
                                <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
                                  <LocalizedClientLink
                                    href={`/account/research-hub?section=calculator&mass=${supplyMass}&unit=${supplyUnit}&name=${encodeURIComponent(material.label)}`}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-ui-border-base bg-white px-3 py-2 min-h-[40px] text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto"
                                  >
                                    <span>Reconstitution Math →</span>
                                  </LocalizedClientLink>
                                  <LocalizedClientLink
                                    href="/account/research-hub?section=schedule"
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-ui-border-base bg-white px-3 py-2 min-h-[40px] text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors touch-manipulation w-full sm:w-auto"
                                  >
                                    <span>Dosing Schedule →</span>
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
                                      className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-2 min-h-[38px] text-xs font-semibold text-white hover:bg-rose-700 transition-colors touch-manipulation"
                                    >
                                      Confirm Archive
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmArchiveId(null)}
                                      className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-3 py-2 min-h-[38px] text-xs font-medium text-ui-fg-subtle hover:bg-ui-bg-subtle transition-colors touch-manipulation"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end pt-1 sm:pt-0">
                                    <button
                                      type="button"
                                      onClick={() => setConfirmArchiveId(supply.supply_id)}
                                      className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 min-h-[38px] text-xs font-medium text-ui-fg-muted hover:text-rose-600 hover:bg-rose-50/50 transition-colors touch-manipulation"
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
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle p-8 text-center">
                <p className="text-sm font-medium text-ui-fg-base">No active vials in storage</p>
                <p className="mt-1 text-xs text-ui-fg-subtle">
                  {totalArchivedVials > 0
                    ? "All registered vials are currently in archive. You can restore vials below."
                    : "Delivered orders with research compounds will appear above for activation."}
                </p>
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

                      return (
                        <div key={mat.tracked_material_id} className="space-y-2">
                          <p className="text-xs font-bold text-ui-fg-muted uppercase tracking-wider">{mat.label}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {mat.supplies.map((sup, idx) => {
                              const supPurchased = sup.source_order_line_item_id
                                ? purchasedItems.find((p) => p.line_item_id === sup.source_order_line_item_id)
                                : null
                              const variantId = supPurchased?.variant_id || matVariantId
                              const productHandle = matProductHandle

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
                                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
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
