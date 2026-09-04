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

  const svgPoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100
      const y = 85 - ((p.value - min) / span) * 70
      return `${x},${y}`
    })
    .join(" ")

  // Area path: close below the line
  const first = points[0]
  const last = points[points.length - 1]
  const firstX = 0
  const lastX = 100
  const firstY = 85 - ((first.value - min) / span) * 70
  const lastY = 85 - ((last.value - min) / span) * 70
  const areaPath = `M ${firstX},${firstY} L ${svgPoints.split(" ").slice(1).join(" L ")} L ${lastX},95 L ${firstX},95 Z`

  const delta = summary.summary.absolute_change
  const isDown = delta < 0
  const unit = summary.summary.normalized_unit

  return (
    <div className="space-y-2">
      {/* Stat row */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-ui-fg-subtle">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-ui-fg-base">
            {summary.summary.current_value}
          </span>
          <span className="text-xs text-ui-fg-subtle">{unit}</span>
          <span className={`text-xs font-semibold ${isDown ? "text-emerald-600" : delta > 0 ? "text-rose-500" : "text-ui-fg-subtle"}`}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      {/* SVG Sparkline */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-20 w-full"
        role="img"
        aria-label={`${label} trend over last ${points.length} entries`}
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaPath} fill="url(#sparkGradient)" />
        {/* Line */}
        <polyline
          points={svgPoints}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Last point dot */}
        <circle cx={lastX} cy={lastY} r="3" fill="#6366f1" vectorEffect="non-scaling-stroke" />
      </svg>

      <p className="text-right text-[10px] text-ui-fg-muted">
        {points.length} entries · {summary.summary.measurement_count} total
      </p>
    </div>
  )
}
