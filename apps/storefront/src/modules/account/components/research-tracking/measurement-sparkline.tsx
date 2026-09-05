"use client"

import type { ResearchMeasurementSummary } from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  summary: ResearchMeasurementSummary
}

const METRIC_LABEL: Record<string, string> = {
  weight: "Weight",
  waist: "Waist",
  body_fat: "Body Fat",
}

export default function MeasurementSparkline({ summary }: Props) {
  const label = METRIC_LABEL[summary.metric_type] ?? summary.metric_type
  const points = summary.points.slice(-30)

  if (!summary.summary || points.length < 2) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg bg-ui-bg-subtle text-center">
        <p className="text-xs text-ui-fg-subtle">
          {points.length < 2 ? "Log 2+ entries to see your trend." : "No data yet."}
        </p>
        <LocalizedClientLink
          href="/account/research-hub?section=progress"
          className="text-xs font-medium text-indigo-600 underline hover:text-indigo-700"
        >
          Start logging →
        </LocalizedClientLink>
      </div>
    )
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100
    const y = 80 - ((p.value - min) / span) * 60
    return { x, y }
  })

  // Smooth bezier curve path generation
  let curvePath = `M ${coords[0].x},${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i]
    const next = coords[i + 1]
    const cp1x = current.x + (next.x - current.x) / 2
    const cp1y = current.y
    const cp2x = current.x + (next.x - current.x) / 2
    const cp2y = next.y
    curvePath += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`
  }

  const lastCoord = coords[coords.length - 1]
  const areaPath = `${curvePath} L 100,95 L 0,95 Z`

  const delta = summary.summary.absolute_change
  const isDown = delta < 0
  const unit = summary.summary.normalized_unit

  return (
    <div className="space-y-3">
      {/* Stat row */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-xs font-bold text-slate-900 block">{label} Tracking</span>
          <span className="text-[11px] text-slate-500 font-medium">Last 30-day recorded baseline</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {summary.summary.current_value}
          </span>
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              isDown
                ? "text-emerald-800 bg-emerald-50 border border-emerald-200/80"
                : delta > 0
                ? "text-amber-800 bg-amber-50 border border-amber-200/80"
                : "text-slate-600 bg-slate-100"
            }`}
          >
            {delta > 0 ? "+" : ""}{delta.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      {/* SVG Smooth Spline Sparkline */}
      <div className="relative pt-1">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-20 w-full overflow-visible"
          role="img"
          aria-label={`${label} smooth trend over last ${points.length} entries`}
        >
          <defs>
            <linearGradient id="clinicalSparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Smooth area fill */}
          <path d={areaPath} fill="url(#clinicalSparkGradient)" />
          {/* Smooth line */}
          <path
            d={curvePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Glowing pulse ring & last point dot */}
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r="4.5"
            fill="#ffffff"
            stroke="#2563eb"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r="2"
            fill="#2563eb"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
        <span>Stable telemetry baseline</span>
        <span>{points.length} entries &middot; {summary.summary.measurement_count} total</span>
      </div>
    </div>
  )
}
