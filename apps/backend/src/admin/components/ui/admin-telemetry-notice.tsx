/**
 * @file    apps/backend/src/admin/components/ui/admin-telemetry-notice.tsx
 * @module  AdminTelemetryNotice (Sovereign Admin Design System)
 * @purpose Top telemetry and operational alert notice banner for executive cockpits.
 * @contracts
 *   Component: AdminTelemetryNotice
 *   Design:    Storefront SADS 2.0
 */

import React, { ReactNode } from "react"
import { Link } from "react-router-dom"

export type AdminTelemetryNoticeProps = {
  icon?: ReactNode
  title: string
  description?: string | ReactNode
  statusText?: string
  actionLabel?: string
  actionHref?: string
  onActionClick?: () => void
  variant?: "blue" | "amber" | "emerald" | "rose" | "indigo"
  className?: string
}

const variantClasses = {
  blue: {
    banner: "border-blue-200/80 bg-blue-50/50 text-blue-900",
    iconBox: "bg-white border-blue-200 text-blue-700",
    action: "text-blue-700 hover:text-blue-900",
  },
  indigo: {
    banner: "border-indigo-200/80 bg-indigo-50/50 text-indigo-950",
    iconBox: "bg-white border-indigo-200 text-indigo-700",
    action: "text-indigo-700 hover:text-indigo-900",
  },
  amber: {
    banner: "border-amber-200/80 bg-amber-50/50 text-amber-900",
    iconBox: "bg-white border-amber-200 text-amber-700",
    action: "text-amber-700 hover:text-amber-900",
  },
  emerald: {
    banner: "border-emerald-200/80 bg-emerald-50/50 text-emerald-900",
    iconBox: "bg-white border-emerald-200 text-emerald-700",
    action: "text-emerald-700 hover:text-emerald-900",
  },
  rose: {
    banner: "border-rose-200/80 bg-rose-50/50 text-rose-900",
    iconBox: "bg-white border-rose-200 text-rose-700",
    action: "text-rose-700 hover:text-rose-900",
  },
}

export const AdminTelemetryNotice: React.FC<AdminTelemetryNoticeProps> = ({
  icon,
  title,
  description,
  statusText,
  actionLabel,
  actionHref,
  onActionClick,
  variant = "blue",
  className = "",
}) => {
  const styles = variantClasses[variant] || variantClasses.blue

  return (
    <div
      className={`rounded-lg border py-1.5 px-3 flex items-center justify-between gap-2.5 text-xs shadow-2xs transition-all ${styles.banner} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span
            className={`flex size-5.5 items-center justify-center rounded-md border text-xs shrink-0 shadow-2xs [&>svg]:size-3.5 ${styles.iconBox}`}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <span className="font-bold tracking-tight text-slate-900 text-xs">{title}</span>
          {statusText && (
            <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold tracking-wider bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs">
              {statusText}
            </span>
          )}
          {description && (
            <span className="text-[10.5px] text-slate-500 font-medium truncate">
              · {description}
            </span>
          )}
        </div>
      </div>

      {(actionLabel || actionHref) && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              to={actionHref.startsWith("/app/") ? actionHref.replace(/^\/app/, "") : actionHref}
              className={`inline-flex items-center gap-1 font-semibold text-xs transition-colors hover:underline ${styles.action}`}
            >
              <span>{actionLabel || "View"}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className={`inline-flex items-center gap-1 font-semibold text-xs transition-colors hover:underline cursor-pointer ${styles.action}`}
            >
              <span>{actionLabel || "View"}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminTelemetryNotice
