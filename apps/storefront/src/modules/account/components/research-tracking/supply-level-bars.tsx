"use client"

import type { TrackedResearchMaterial, ResearchReplenishmentProjection } from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ExclamationCircle } from "@medusajs/icons"

type Props = {
  materials: TrackedResearchMaterial[]
  projections: ResearchReplenishmentProjection[]
}

function pctColor(pct: number) {
  if (pct >= 40) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" }
  if (pct >= 10) return { bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" }
  return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" }
}

export default function SupplyLevelBars({ materials, projections }: Props) {
  if (materials.length === 0) {
    return (
      <p className="text-xs text-ui-fg-subtle">
        No tracked materials.{" "}
        <LocalizedClientLink href="/account/research-hub?section=routines" className="underline">
          Activate a product →
        </LocalizedClientLink>
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {materials.slice(0, 4).map((mat) => {
        const activeSupplies = mat.supplies.filter((s) => s.status === "active")
        const totalInitial = activeSupplies.reduce((s, x) => s + x.initial_quantity_base_units, 0)
        const totalRemaining = activeSupplies.reduce((s, x) => s + x.remaining_quantity_base_units, 0)
        const pct = totalInitial === 0 ? 0 : Math.round((totalRemaining / totalInitial) * 100)
        const colors = pctColor(pct)

        // Find replenishment projection
        const proj = projections.find((p) => p.tracked_material_id === mat.tracked_material_id)
        const daysLabel = proj?.estimated_days_remaining != null
          ? `~${proj.estimated_days_remaining}d left`
          : null

        return (
          <li key={mat.tracked_material_id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-xs font-medium text-ui-fg-base">{mat.label}</span>
              <span className={`shrink-0 text-[10px] font-semibold ${colors.text}`}>
                {pct}%{daysLabel ? ` · ${daysLabel}` : ""}
              </span>
            </div>
            {/* Progress bar track */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-ui-bg-subtle">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                style={{ width: `${Math.max(pct, 2)}%` }}
                role="meter"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${mat.label}: ${pct}% remaining`}
              />
            </div>
            {proj?.urgency === "reorder_now" && (
              <p className={`mt-1 text-[10px] font-semibold ${colors.text} flex items-center gap-1`}>
                <ExclamationCircle className="h-3 w-3 shrink-0" />
                <span>Reorder now</span>
              </p>
            )}
          </li>
        )
      })}
      {materials.length > 4 && (
        <li className="text-xs text-ui-fg-muted">+{materials.length - 4} more materials</li>
      )}
    </ul>
  )
}
