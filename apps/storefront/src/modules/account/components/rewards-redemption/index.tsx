"use client"

import { useActionState } from "react"

import { redeemRewardsAction } from "@lib/data/rewards"

export default function RewardsRedemption({
  available,
  minimum,
  pesoValuePerPoint,
  idempotencyKey,
}: {
  available: number
  minimum: number
  pesoValuePerPoint: number
  idempotencyKey: string
}) {
  const [state, action, pending] = useActionState(redeemRewardsAction, null)

  return (
    <form action={action} className="mt-4 max-w-md space-y-3">
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      <label className="block text-sm font-medium" htmlFor="reward-points">
        Points to apply
      </label>
      <input
        className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
        id="reward-points"
        name="points"
        type="number"
        min={minimum}
        max={available}
        step="1"
        required
      />
      <p className="text-xs text-ui-fg-subtle">
        The selected points are worth ₱{pesoValuePerPoint.toLocaleString("en-PH")} each and will be applied to your current eligible cart.
      </p>
      {state?.error ? <p className="text-sm text-ui-fg-error">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-700">Points applied to your cart.</p> : null}
      <button
        className="rounded-md bg-ui-button-inverted px-4 py-2 text-sm font-medium text-ui-fg-on-inverted disabled:opacity-50"
        type="submit"
        disabled={pending || available < minimum}
      >
        {pending ? "Applying..." : "Apply points to cart"}
      </button>
    </form>
  )
}
