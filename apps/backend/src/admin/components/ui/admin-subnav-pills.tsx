/**
 * @file    apps/backend/src/admin/components/ui/admin-subnav-pills.tsx
 * @module  AdminSubNavPills (Sovereign Admin Design System)
 * @purpose Reusable segmented sub-navigation pill bar for operational cockpits and multi-tab domains.
 * @contracts
 *   Component: AdminSubNavPills
 */

import { Button } from "@medusajs/ui"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export type SubNavPillItem = {
  id?: string
  label: string
  href?: string
  active?: boolean
  dot?: boolean
  count?: number
  onClick?: () => void
}

export type AdminSubNavPillsProps = {
  items: SubNavPillItem[]
  activeId?: string
  rightContent?: ReactNode
  className?: string
}

export const AdminSubNavPills = ({
  items,
  activeId,
  rightContent,
  className = "",
}: AdminSubNavPillsProps) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 ${className}`}>
      {/* Segmented Pill Container */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-medium">
        {items.map((item, idx) => {
          const isActive = item.active || (activeId && item.id === activeId)

          if (isActive) {
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={item.onClick}
                className="h-7 px-3 flex items-center gap-1.5 bg-white text-blue-700 font-semibold rounded-lg shadow-xs border border-blue-200/60 select-none cursor-default"
              >
                {item.dot !== false && <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />}
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            )
          }

          if (item.href) {
            // Strip any leading /app/ so React Router evaluates relative to basename /app
            const cleanHref = item.href.startsWith("/app/")
              ? item.href.replace(/^\/app/, "")
              : item.href

            return (
              <Button
                key={item.id || idx}
                asChild
                variant="transparent"
                size="small"
                className="h-7 px-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <Link to={cleanHref}>
                  <span>{item.label}</span>
                  {typeof item.count === "number" && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold">
                      {item.count}
                    </span>
                  )}
                </Link>
              </Button>
            )
          }

          return (
            <button
              key={item.id || idx}
              type="button"
              onClick={item.onClick}
              className="h-7 px-3 flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer rounded-lg hover:bg-slate-200/50"
            >
              <span>{item.label}</span>
              {typeof item.count === "number" && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold">
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Right Side Content (e.g. Filter helper or live status) */}
      {rightContent && (
        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          {rightContent}
        </div>
      )}
    </div>
  )
}

export default AdminSubNavPills
