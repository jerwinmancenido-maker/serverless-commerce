import { Badge, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export type KpiStatus = "healthy" | "warning" | "critical" | "neutral" | "info"

export type KpiCardProps = {
  title: string
  value: string | number | ReactNode
  icon?: ReactNode
  subtext?: string | ReactNode
  trend?: {
    value: string
    positive?: boolean
    label?: string
  }
  status?: KpiStatus
  className?: string
  onClick?: () => void
}

const statusBorderClasses: Record<KpiStatus, string> = {
  healthy: "border-emerald-500/25 bg-emerald-500/[0.04] dark:bg-emerald-950/20 hover:border-emerald-500/40",
  warning: "border-amber-500/25 bg-amber-500/[0.04] dark:bg-amber-950/20 hover:border-amber-500/40",
  critical: "border-rose-500/25 bg-rose-500/[0.04] dark:bg-rose-950/20 hover:border-rose-500/40",
  info: "border-blue-500/25 bg-blue-500/[0.04] dark:bg-blue-950/20 hover:border-blue-500/40",
  neutral: "border-ui-border-base bg-ui-bg-subtle/30 hover:border-ui-border-strong",
}

const statusIndicatorColors: Record<KpiStatus, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
  info: "bg-blue-500",
  neutral: "bg-zinc-400 dark:bg-zinc-600",
}

export const KpiCard = ({
  title,
  value,
  icon,
  subtext,
  trend,
  status = "neutral",
  className = "",
  onClick,
}: KpiCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${
        statusBorderClasses[status]
      } ${
        onClick
          ? "cursor-pointer hover:border-ui-border-strong hover:shadow-xs"
          : "shadow-2xs"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex size-7 items-center justify-center rounded-lg bg-ui-bg-base border border-ui-border-base text-sm shadow-2xs">
              {icon}
            </span>
          )}
          <Text size="xsmall" weight="plus" className="text-ui-fg-subtle uppercase tracking-wider text-[11px]">
            {title}
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          {trend && (
            <Badge
              color={trend.positive ? "green" : "red"}
              className="text-[10px] font-medium py-0 px-1.5"
            >
              {trend.value}
            </Badge>
          )}
          <span
            className={`size-2 rounded-full ${statusIndicatorColors[status]}`}
            title={`Status: ${status}`}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl font-bold tracking-tight text-ui-fg-base font-mono tabular-nums">
          {value}
        </div>
        {subtext && (
          <div className="mt-1 text-xs text-ui-fg-muted truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}
export default KpiCard
