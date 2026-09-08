import type { ReactNode } from "react"

export type AdminStatCardProps = {
  label: string
  value: string | number
  subtext?: string
  icon?: ReactNode
  trend?: {
    value: string
    positive?: boolean
  }
  variant?: "default" | "emerald" | "blue" | "purple"
  className?: string
}

const variantStyles = {
  default: {
    card: "border-slate-200/80 bg-white",
    iconBg: "bg-slate-100 text-slate-700",
  },
  emerald: {
    card: "border-blue-200/80 bg-blue-50/30",
    iconBg: "bg-blue-100 text-blue-800",
  },
  blue: {
    card: "border-blue-200/80 bg-blue-50/30",
    iconBg: "bg-blue-100 text-blue-800",
  },
  purple: {
    card: "border-purple-200/80 bg-purple-50/30",
    iconBg: "bg-purple-100 text-purple-800",
  },
}

export const AdminStatCard = ({
  label,
  value,
  subtext,
  icon,
  trend,
  variant = "default",
  className = "",
}: AdminStatCardProps) => {
  const styles = variantStyles[variant] || variantStyles.default

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all duration-150 ${styles.card} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <span className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              trend.positive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  )
}
