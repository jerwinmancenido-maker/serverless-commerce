import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BreadcrumbItem = {
  label: string
  href?: string
}

type CatalogHeaderProps = {
  title: string
  description?: string | null
  badge?: string
  breadcrumbs?: BreadcrumbItem[]
}

export default function CatalogHeader({
  title,
  description,
  badge = "LABORATORY REFERENCE CATALOG",
  breadcrumbs,
}: CatalogHeaderProps) {
  return (
    <div className="w-full pb-6 pt-2 border-b border-slate-200/80 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3" aria-label="Breadcrumb">
          <LocalizedClientLink href="/store" className="hover:text-emerald-700 transition-colors">
            Catalog
          </LocalizedClientLink>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              {crumb.href ? (
                <LocalizedClientLink href={crumb.href} className="hover:text-emerald-700 transition-colors">
                  {crumb.label}
                </LocalizedClientLink>
              ) : (
                <span className="text-slate-700 font-medium truncate max-w-[280px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 tracking-wider uppercase mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="catalog-title">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Cold-chain dispatched nationwide &middot; Metro Manila</span>
        </div>
      </div>
    </div>
  )
}
