import { ArrowLeftMini } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export type BreadcrumbItem = {
  label: string
  href?: string
}

export type PageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  eyebrow?: ReactNode
  eyebrowText?: string
  eyebrowBadge?: ReactNode
  badge?: ReactNode
  statusDropdown?: ReactNode
  actions?: ReactNode
  backHref?: string
  className?: string
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  eyebrow,
  eyebrowText,
  eyebrowBadge,
  badge,
  statusDropdown,
  actions,
  backHref,
  className = "",
}: PageHeaderProps) => {
  return (
    <div className={`flex flex-col gap-y-2 pb-2 ${className}`}>
      {/* Breadcrumb row */}
      {(breadcrumbs?.length || backHref) && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          {backHref && (
            <Link
              to={backHref}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors mr-1 font-medium"
            >
              <ArrowLeftMini className="size-3.5" />
              <span>Back</span>
            </Link>
          )}

          {breadcrumbs?.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1

            return (
              <span key={idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-300">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-slate-900 font-bold" : "text-slate-500"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      )}

      {/* Tier 1 Eyebrow Row */}
      {(eyebrow || eyebrowText) && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          {eyebrowText && (
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
              {eyebrowText}
            </span>
          )}
          {eyebrowBadge}
          {eyebrow}
        </div>
      )}

      {/* Main Title + Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {typeof title === "string" ? (
            <Heading level="h1" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words sm:truncate">
              {title}
            </Heading>
          ) : (
            title
          )}
          {badge}
          {statusDropdown}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">{actions}</div>}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <Text size="xsmall" className="text-xs text-slate-500 mt-0.5">
          {subtitle}
        </Text>
      )}
    </div>
  )
}

export default PageHeader
