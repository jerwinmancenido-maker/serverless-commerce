/**
 * @file    apps/backend/src/admin/components/admin-card.tsx
 * @module  AdminCard (Admin Extension)
 * @purpose Modern flat section card for studios, dashboards, and detail views.
 * @contracts
 *   Component: AdminCard
 */

import { Heading, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export type AdminCardProps = {
  title?: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  footer?: ReactNode
}

export const AdminCard = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  className = "",
  contentClassName = "p-4 sm:p-5",
  headerClassName = "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50",
  footer,
}: AdminCardProps) => {
  const hasHeader = title || subtitle || badge || headerAction

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white overflow-hidden ${className}`}>
      {hasHeader && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex flex-col gap-y-0.5">
            <div className="flex items-center gap-2">
              {typeof title === "string" ? (
                <Heading level="h2" className="text-sm font-bold text-slate-900 tracking-tight">
                  {title}
                </Heading>
              ) : (
                title
              )}
              {badge}
            </div>
            {subtitle && typeof subtitle === "string" ? (
              <Text size="xsmall" className="text-xs text-slate-500">
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </div>
          {headerAction && <div className="shrink-0 flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div className={contentClassName}>{children}</div>

      {footer && <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">{footer}</div>}
    </div>
  )
}

export default AdminCard
