/**
 * @file    apps/backend/src/admin/components/ui/sovereign-empty-state.tsx
 * @module  SovereignEmptyState (Sovereign Admin Design System)
 * @purpose Canonical empty state block for SADS tables, drawers, and filter results.
 * @contracts
 *   Component: SovereignEmptyState
 */

import type { ReactNode } from "react"
import { InformationCircleSolid } from "@medusajs/icons"

export type SovereignEmptyStateProps = {
  heading?: string
  subtext?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}

export const SovereignEmptyState = ({
  heading = "No records found",
  subtext,
  description,
  icon,
  action,
  secondaryAction,
  className = "",
}: SovereignEmptyStateProps) => {
  const effectiveSubtext = description || subtext || "Get started by creating your first entry or adjust your search filters."

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200/90 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 mb-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-sm">
        {icon || <InformationCircleSolid className="w-6 h-6 text-slate-400" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 tracking-tight mb-1">{heading}</h3>
      {effectiveSubtext && <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">{effectiveSubtext}</p>}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-1">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export default SovereignEmptyState
