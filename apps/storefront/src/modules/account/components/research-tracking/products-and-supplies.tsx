"use client"

import {
  activatePurchasedSupplyAction,
  type PurchasedItemCandidate,
  type PurchasedItemIneligibilityReason,
  type ResearchProfile,
  type ResearchTrackingActionState,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import type { PurchasedActivationSubmissionKeys } from "@lib/research-tracking-idempotency"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

type ProductsAndSuppliesProps = {
  configuration: ResearchTrackingConfiguration
  countryCode: string
  profile: ResearchProfile
  purchasedActivationKeys: PurchasedActivationSubmissionKeys
  purchasedItems: PurchasedItemCandidate[]
  runtimeReady: boolean
  trackedMaterials: TrackedResearchMaterial[]
}

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"

const reasonLabels: Record<PurchasedItemIneligibilityReason, string> = {
  not_fulfilled: "Available after the full order-item quantity is fulfilled.",
  order_cancelled: "This item belongs to a cancelled order.",
  returned_or_reversed: "No eligible fulfilled quantity remains for tracking.",
  unsupported_order_source:
    "This order source is not currently eligible for private tracking.",
  material_profile_unavailable:
    "Verified material information is not currently available for this item.",
  quantity_unavailable:
    "The eligible material quantity could not be verified safely.",
  already_tracked: "This purchased item is already in private tracking.",
  archived_material_action_required:
    "An archived material requires a separate customer-controlled action.",
}

function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString("en-PH")} ${unit}`
}

function StartTrackingButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-ui-fg-base px-4 py-2.5 text-sm font-medium text-ui-bg-base disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Starting…" : "Start tracking"}
    </button>
  )
}

function CandidateCard({
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

  return (
    <div className="rounded-lg border border-ui-border-base p-4">
      <div className="flex flex-col justify-between gap-2 small:flex-row">
        <div>
          <p className="text-sm font-semibold">{candidate.label}</p>
          <p className="mt-1 text-xs text-ui-fg-muted">
            Order #{candidate.order_display_id}
            {candidate.variant_sku ? ` · ${candidate.variant_sku}` : ""}
          </p>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-ui-fg-muted">
          {candidate.eligibility === "eligible"
            ? "Ready for review"
            : candidate.eligibility === "already_tracked"
              ? "Tracked"
              : "Unavailable"}
        </span>
      </div>

      {candidate.eligibility === "eligible" ? (
        <details className="mt-4 rounded-lg bg-ui-bg-subtle p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Review private tracking details
          </summary>
          <form action={action} className="mt-4 space-y-4">
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
            <p className="text-sm leading-6 text-ui-fg-subtle">
              This creates a private material and supply record for organization.
              It is not proof of possession, use, administration, or intended use.
            </p>
            {candidate.initial_quantity_base_units && candidate.base_unit && (
              <p className="text-sm">
                Initial verified quantity: {formatQuantity(
                  candidate.initial_quantity_base_units,
                  candidate.base_unit,
                )}
              </p>
            )}
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                name="confirm_tracking"
                required
                className="mt-1"
              />
              <span>I reviewed this item and want to add it to private tracking.</span>
            </label>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state.success && (
              <p className="text-sm text-emerald-700">Added to tracking.</p>
            )}
            <StartTrackingButton />
          </form>
        </details>
      ) : (
        <p className="mt-3 text-sm leading-6 text-ui-fg-subtle">
          {candidate.ineligibility_reason
            ? reasonLabels[candidate.ineligibility_reason]
            : "This item cannot be added to tracking right now."}
        </p>
      )}
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
}: ProductsAndSuppliesProps) {
  const profileReady =
    profile.status === "active" &&
    profile.consent_version === configuration.consent_version

  return (
    <section className="mt-10" aria-labelledby="products-and-supplies-title">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Private organization
        </p>
        <h2 id="products-and-supplies-title" className="mt-2 text-lg font-semibold">
          My Products & Supplies
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Eligible purchases appear here for optional tracking. Purchases are
          never added automatically.
        </p>
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
        <div className="grid grid-cols-1 gap-5 large:grid-cols-2">
          <div className={`${cardClass} space-y-3`}>
            <h3 className="text-base font-semibold">Eligible purchases</h3>
            {purchasedItems.length ? (
              purchasedItems.map((candidate) => (
                <CandidateCard
                  key={candidate.line_item_id}
                  candidate={candidate}
                  countryCode={countryCode}
                  idempotencyKey={purchasedActivationKeys[candidate.line_item_id]}
                />
              ))
            ) : (
              <p className="text-sm leading-6 text-ui-fg-subtle">
                No fulfilled purchased items are available for review yet.
              </p>
            )}
          </div>

          <div className={`${cardClass} space-y-4`}>
            <h3 className="text-base font-semibold">Tracked materials</h3>
            {trackedMaterials.length ? (
              trackedMaterials.map((material) => (
                <div
                  key={material.tracked_material_id}
                  className="rounded-lg border border-ui-border-base p-4"
                >
                  <p className="text-sm font-semibold">{material.label}</p>
                  <div className="mt-3 space-y-3">
                    {material.supplies.map((supply) => (
                      <div key={supply.supply_id} className="text-sm">
                        <p>
                          Remaining: {formatQuantity(
                            supply.remaining_quantity_base_units,
                            supply.base_unit,
                          )}
                        </p>
                        <p className="mt-1 text-xs text-ui-fg-muted">
                          Added to tracking {new Date(
                            supply.added_to_tracking_at,
                          ).toLocaleDateString("en-PH")}
                        </p>
                        {(supply.lot_number ||
                          supply.batch_number ||
                          supply.expires_at ||
                          supply.storage_note) && (
                          <p className="mt-2 text-xs text-ui-fg-subtle">
                            Optional lot, batch, expiry, and storage details are
                            read-only in RT-4.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-ui-fg-subtle">
                No purchased supplies have been added to private tracking.
              </p>
            )}
            <div className="rounded-lg bg-ui-bg-subtle p-3 text-xs leading-5 text-ui-fg-subtle">
              Protocols, product documents, COA access, and calculator actions
              remain unavailable until RT-7. Quantity deductions remain unavailable
              until RT-5.
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
