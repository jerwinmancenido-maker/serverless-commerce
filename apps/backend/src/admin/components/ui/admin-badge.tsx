import type { ReactNode } from "react"

export type AdminBadgeVariant = "emerald" | "blue" | "purple" | "amber" | "rose" | "slate"

export type AdminBadgeProps = {
  children: ReactNode
  variant?: AdminBadgeVariant
  dot?: boolean
  icon?: ReactNode
  className?: string
}

const variantStyles: Record<AdminBadgeVariant, { container: string; dot: string }> = {
  emerald: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-600",
  },
  blue: {
    container: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-600",
  },
  purple: {
    container: "bg-purple-50 text-purple-700 border-purple-200/80",
    dot: "bg-purple-500",
  },
  amber: {
    container: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
  },
  rose: {
    container: "bg-rose-50 text-rose-700 border-rose-200/80",
    dot: "bg-rose-600",
  },
  slate: {
    container: "bg-slate-100 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
  },
}

export const AdminBadge = ({
  children,
  variant = "slate",
  dot = false,
  icon,
  className = "",
}: AdminBadgeProps) => {
  const styles = variantStyles[variant] || variantStyles.slate

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${styles.container} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
