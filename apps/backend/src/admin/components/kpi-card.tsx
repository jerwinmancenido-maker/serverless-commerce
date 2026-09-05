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
  healthy: "border-emerald-200/80 hover:border-emerald-300 bg-white",
  warning: "border-amber-200/80 hover:border-amber-300 bg-white",
  critical: "border-rose-200/80 hover:border-rose-300 bg-white",
  info: "border-indigo-200/80 hover:border-indigo-300 bg-white",
  neutral: "border-slate-200/80 hover:border-slate-300 bg-white",
}

const statusIconBgClasses: Record<KpiStatus, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 border-amber-200/80",
  critical: "bg-rose-50 text-rose-700 border-rose-200/80",
  info: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  neutral: "bg-slate-50 text-slate-700 border-slate-200/80",
}

const statusIndicatorColors: Record<KpiStatus, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
  info: "bg-indigo-500",
  neutral: "bg-slate-400",
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
      className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-150 shadow-xs ${
        statusBorderClasses[status]
      } ${
        onClick
          ? "cursor-pointer hover:shadow-sm hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className={`flex size-8 items-center justify-center rounded-xl border text-sm shadow-2xs ${statusIconBgClasses[status]}`}>
              {icon}
            </span>
          )}
          <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
            {title}
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          {trend && (
            <Badge
              color={trend.positive ? "green" : "red"}
              className="text-[10px] font-bold py-0.5 px-1.5 rounded-full"
            >
              {trend.value}
            </Badge>
          )}
          <span
            className={`size-2 rounded-full ${statusIndicatorColors[status]} ${
              status === "healthy" || status === "warning" ? "animate-pulse" : ""
            }`}
            title={`Status: ${status}`}
          />
        </div>
      </div>

      <div className="mt-3.5">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </div>
        {subtext && (
          <div className="mt-1 text-xs text-slate-500 font-medium truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

export default KpiCard
