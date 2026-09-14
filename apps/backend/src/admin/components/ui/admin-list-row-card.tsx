/**
 * @file    apps/backend/src/admin/components/ui/admin-list-row-card.tsx
 * @module  AdminListRowCard (Sovereign Admin Design System)
 * @purpose Reusable high-density micro-card list item matching Storefront Account Overview.
 * @contracts
 *   Component: AdminListRowCard
 *   Design:    Storefront SADS 2.0
 */

import React, { ReactNode } from "react"
import { Link } from "react-router-dom"

export type AdminListRowCardProps = {
  icon?: ReactNode
  title: string | ReactNode
  subtitle?: string | ReactNode
  badge?: ReactNode
  value?: string | number | ReactNode
  secondaryValue?: string | ReactNode
  statusPill?: ReactNode
  actions?: ReactNode
  href?: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export const AdminListRowCard: React.FC<AdminListRowCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  value,
  secondaryValue,
  statusPill,
  actions,
  href,
  onClick,
  onEdit,
  onDelete,
  className = "",
}) => {
  const content = (
    <div
      className={`group rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Left side: Icon + Title/Subtitle/Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 text-slate-600 text-xs shrink-0 shadow-2xs group-hover:border-slate-300 transition-colors">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-slate-900 tracking-tight">
              {title}
            </span>
            {badge && <span>{badge}</span>}
          </div>
          {subtitle && (
            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Numerical Metric + Status + Row Action triggers */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {(value || secondaryValue) && (
          <div className="text-left sm:text-right">
            {value && (
              <div className="font-extrabold font-mono text-xs text-slate-900 tracking-tight tabular-nums">
                {value}
              </div>
            )}
            {secondaryValue && (
              <div className="text-[10px] text-slate-400 font-mono">
                {secondaryValue}
              </div>
            )}
          </div>
        )}

        {statusPill && <div className="shrink-0">{statusPill}</div>}

        {/* Action Triggers: Edit, Delete, or Custom Actions */}
        {(actions || onEdit || onDelete || href) && (
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {actions}

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                title="Edit"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-rose-200 bg-rose-50/50 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-2xs cursor-pointer"
                title="Delete"
              >
                Delete
              </button>
            )}

            {href && (
              <Link
                to={href}
                className="inline-flex items-center justify-center size-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50/40 transition-colors shadow-2xs"
                title="Open Details"
              >
                &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return content
}

export default AdminListRowCard
