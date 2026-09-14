/**
 * @file    apps/backend/src/admin/components/ui/admin-suite-card.tsx
 * @module  AdminSuiteCard (Sovereign Admin Design System)
 * @purpose Reusable right-column tool suite sidecar card matching Storefront Account Overview.
 * @contracts
 *   Component: AdminSuiteCard
 *   Design:    Storefront SADS 2.0
 */

import React, { ReactNode } from "react"
import { Link } from "react-router-dom"

export type AdminSuiteCardProps = {
  icon?: ReactNode
  eyebrow?: string
  statusBadge?: string
  statusVariant?: "emerald" | "blue" | "purple" | "amber" | "rose" | "neutral"
  title: string
  description: string | ReactNode
  actionLabel?: string
  actionHref?: string
  onActionClick?: () => void
  children?: ReactNode
  className?: string
  variant?: "blue" | "purple" | "emerald" | "amber" | "slate"
}

const statusClasses = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald-500",
  blue: "bg-blue-50 text-blue-700 border-blue-200/80 dot-blue-500",
  purple: "bg-purple-50 text-purple-700 border-purple-200/80 dot-purple-500",
  amber: "bg-amber-50 text-amber-700 border-amber-200/80 dot-amber-500",
  rose: "bg-rose-50 text-rose-700 border-rose-200/80 dot-rose-500",
  neutral: "bg-slate-50 text-slate-700 border-slate-200/80 dot-slate-400",
}

const gradientVariants = {
  blue: "from-white via-blue-50/20 to-white",
  purple: "from-white via-purple-50/20 to-white",
  emerald: "from-white via-emerald-50/20 to-white",
  amber: "from-white via-amber-50/20 to-white",
  slate: "from-white via-slate-50/30 to-white",
}

export const AdminSuiteCard: React.FC<AdminSuiteCardProps> = ({
  icon,
  eyebrow,
  statusBadge,
  statusVariant = "emerald",
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  children,
  className = "",
  variant = "blue",
}) => {
  const gradient = gradientVariants[variant] || gradientVariants.blue
  const statusStyle = statusClasses[statusVariant] || statusClasses.emerald

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br ${gradient} p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Eyebrow & Status Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <span className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 text-xs shrink-0 shadow-2xs">
                {icon}
              </span>
            )}
            {eyebrow && (
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 font-mono truncate">
                {eyebrow}
              </span>
            )}
          </div>

          {statusBadge && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${statusStyle}`}
            >
              <span className="size-1.5 rounded-full bg-current animate-pulse" />
              <span>{statusBadge}</span>
            </span>
          )}
        </div>

        {/* Title and Description */}
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-3">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-1 font-normal">
          {description}
        </p>

        {children && <div className="mt-3">{children}</div>}
      </div>

      {/* Footer Action Divider */}
      {(actionLabel || actionHref || onActionClick) && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          {actionHref ? (
            <Link
              to={actionHref.startsWith("/app/") ? actionHref.replace(/^\/app/, "") : actionHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors hover:underline"
            >
              <span>{actionLabel || "Manage"}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors hover:underline cursor-pointer"
            >
              <span>{actionLabel || "Manage"}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminSuiteCard
