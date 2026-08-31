import type { ResearchReplenishmentProjection } from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const urgencyLabels = {
  reorder_now: ["Reorder soon", "bg-amber-50 text-amber-800"],
  plan_reorder: ["Plan a reorder", "bg-blue-50 text-blue-700"],
  on_track: ["Supply on track", "bg-emerald-50 text-emerald-700"],
  not_projected: ["Projection unavailable", "bg-ui-bg-subtle text-ui-fg-subtle"],
} as const

export default function Replenishment({
  projections,
  runtimeReady,
}: {
  projections: ResearchReplenishmentProjection[]
  runtimeReady: boolean
}) {
  if (!runtimeReady) {
    return (
      <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold">Supply outlook</h2>
        <p className="mt-2 text-sm text-amber-800">
          Supply projections could not be calculated right now.
        </p>
      </section>
    )
  }

  if (!projections.length) return null

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Supply outlook</h2>
        <p className="mt-1 text-sm text-ui-fg-subtle">
          Estimates use your current routine phase and private tracked balance.
        </p>
      </div>
      <div className="grid gap-4 large:grid-cols-2">
        {projections.map((projection) => {
          const [label, tone] = urgencyLabels[projection.urgency]
          return (
            <article
              key={projection.routine_id}
              className="rounded-xl border border-ui-border-base bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {projection.tracked_material_label}
                  </h3>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    Current phase: {projection.current_phase}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
                  {label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-ui-bg-subtle p-3">
                  <p className="text-xs text-ui-fg-muted">Estimated remaining</p>
                  <p className="mt-1 text-lg font-semibold">
                    {projection.estimated_days_remaining === null
                      ? "—"
                      : `${projection.estimated_days_remaining} days`}
                  </p>
                </div>
                <div className="rounded-lg bg-ui-bg-subtle p-3">
                  <p className="text-xs text-ui-fg-muted">Tracked balance</p>
                  <p className="mt-1 text-lg font-semibold">
                    {projection.remaining_quantity_base_units.toLocaleString()} {projection.base_unit}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-ui-fg-muted">
                {projection.calculation_basis} Actual use may differ.
              </p>
              {projection.source_product_handle ? (
                <LocalizedClientLink
                  href={`/products/${projection.source_product_handle}`}
                  className="mt-4 inline-flex rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
                >
                  View product
                </LocalizedClientLink>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
