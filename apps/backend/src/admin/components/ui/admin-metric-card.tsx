/**
 * @file    apps/backend/src/admin/components/ui/admin-metric-card.tsx
 * @module  AdminMetricCard (Sovereign Admin Design System)
 * @purpose Canonical, high-density metric card for operational cockpits, KPI strips, and executive dashboards.
 * @contracts
 *   Component: AdminMetricCard
 *   Design:    Linear / Stripe / Vercel Sovereign Standard
 */

import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export type MetricStatus = "healthy" | "warning" | "critical" | "neutral" | "info"
export type MetricVariant = "default" | "blue" | "emerald" | "amber" | "rose" | "purple"

export type AdminMetricCardProps = {
  /** Metric label / header text */
  label?: string
  /** Alias for label for compatibility with legacy KpiCard */
  title?: string
  /** Primary metric value (formatted number, currency, or node) */
  value: string | number | ReactNode
  /** Descriptive subtext or secondary status description */
  subtext?: string | ReactNode
  /** Icon element (preferably @medusajs/icons SVG) */
  icon?: ReactNode
  /** Trend badge object */
  trend?: {
    value: string
    positive?: boolean
    label?: string
  }
  /** Operational health status */
  status?: MetricStatus
  /** Color theme variant */
  variant?: MetricVariant
  /** Pulse dot indicator */
  pulse?: boolean
  /** Click action handler */
  onClick?: () => void
  /** Navigation link target */
  href?: string
  /** Custom container class overrides */
  className?: string
}

const statusIndicatorColors: Record<MetricStatus, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
}

const variantStyles: Record<
  MetricVariant,
  {
    card: string
    iconBox: string
    accent: string
    border: string
  }
> = {
  default: {
    card: "bg-white hover:bg-slate-50/50",
    iconBox: "bg-slate-50 text-slate-700 border-slate-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-slate-300",
  },
  blue: {
    card: "bg-white hover:bg-blue-50/30",
    iconBox: "bg-blue-50 text-blue-700 border-blue-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-blue-300",
  },
  emerald: {
    card: "bg-white hover:bg-emerald-50/30",
    iconBox: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-emerald-300",
  },
  amber: {
    card: "bg-white hover:bg-amber-50/30",
    iconBox: "bg-amber-50 text-amber-700 border-amber-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-amber-300",
  },
  rose: {
    card: "bg-white hover:bg-rose-50/30",
    iconBox: "bg-rose-50 text-rose-700 border-rose-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-rose-300",
  },
  purple: {
    card: "bg-white hover:bg-purple-50/30",
    iconBox: "bg-purple-50 text-purple-700 border-purple-200/80",
    accent: "text-slate-900",
    border: "border-slate-200/80 hover:border-purple-300",
  },
}

export const AdminMetricCard = ({
  label,
  title,
  value,
  subtext,
  icon,
  trend,
  status,
  variant = "default",
  pulse,
  onClick,
  href,
  className = "",
}: AdminMetricCardProps) => {
  const displayLabel = label || title || ""
  const styles = variantStyles[variant] || variantStyles.default
  const isInteractive = Boolean(onClick || href)

  // Determine whether to show status pulse dot
  const hasStatusDot = Boolean(status)
  const shouldPulse = pulse !== undefined ? pulse : status === "healthy" || status === "warning"

  const cardContent = (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between p-2.5 sm:p-3 rounded-lg border transition-all duration-150 shadow-2xs ${styles.card} ${styles.border} ${
        isInteractive ? "cursor-pointer hover:shadow-xs hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {/* Top Row: Label + Icon & Status */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && (
            <span
              className={`flex size-5.5 items-center justify-center rounded-md border text-[11px] shrink-0 shadow-2xs [&>svg]:size-3.5 ${styles.iconBox}`}
            >
              {icon}
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate font-mono">
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {trend && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-bold font-mono ${
                trend.positive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : "bg-rose-50 text-rose-700 border border-rose-200/80"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </span>
          )}

          {hasStatusDot && status && (
            <span
              className={`size-1.5 rounded-full ${statusIndicatorColors[status]} ${
                shouldPulse ? "animate-pulse" : ""
              }`}
              title={`Status: ${status}`}
            />
          )}
        </div>
      </div>

      {/* Middle: Monospace Primary Value */}
      <div className="mt-1.5">
        <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight tabular-nums ${styles.accent}`}>
          {value}
        </div>
        {subtext && (
          <div className="mt-0.5 text-[10px] text-slate-400 font-medium truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    const cleanHref = href.startsWith("/app/") ? href.replace(/^\/app/, "") : href
    return (
      <Link to={cleanHref} className="block no-underline">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export default AdminMetricCard
