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
  badge?: ReactNode
  actions?: ReactNode
  backHref?: string
  className?: string
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  backHref,
  className = "",
}: PageHeaderProps) => {
  return (
    <div className={`flex flex-col gap-y-2 pb-1 ${className}`}>
      {/* Breadcrumb row */}
      {(breadcrumbs?.length || backHref) && (
        <nav className="flex items-center gap-1.5 text-xs text-ui-fg-muted">
          {backHref && (
            <Link
              to={backHref}
              className="inline-flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors mr-1"
            >
              <ArrowLeftMini className="size-3.5" />
              <span>Back</span>
            </Link>
          )}

          {breadcrumbs?.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1

            return (
              <span key={idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span className="text-ui-fg-muted/60">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-ui-fg-base font-medium" : "text-ui-fg-subtle"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      )}

      {/* Main Title + Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {typeof title === "string" ? (
            <Heading level="h1" className="text-lg font-semibold text-ui-fg-base truncate">
              {title}
            </Heading>
          ) : (
            title
          )}
          {badge}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {subtitle}
        </Text>
      )}
    </div>
  )
}

export default PageHeader
