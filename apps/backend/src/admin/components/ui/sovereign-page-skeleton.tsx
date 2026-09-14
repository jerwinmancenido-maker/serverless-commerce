/**
 * @file    apps/backend/src/admin/components/ui/sovereign-page-skeleton.tsx
 * @module  SovereignPageSkeleton (Sovereign Admin Design System)
 * @purpose Canonical full-page loading skeleton for SADS operational cockpits and list views.
 * @contracts
 *   Component: SovereignPageSkeleton
 */

export type SovereignPageSkeletonProps = {
  cards?: number
  rows?: number
  hasHeader?: boolean
  hasTabs?: boolean
  className?: string
}

export const SovereignPageSkeleton = ({
  cards = 4,
  rows = 6,
  hasHeader = true,
  hasTabs = true,
  className = "",
}: SovereignPageSkeletonProps) => {
  return (
    <div className={`flex flex-col gap-4 pb-8 px-6 pt-6 animate-pulse ${className}`}>
      {/* Header skeleton */}
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-7 w-56 bg-slate-300 rounded-md" />
            <div className="h-3 w-72 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-slate-200 rounded-md" />
            <div className="h-8 w-32 bg-slate-200 rounded-md" />
          </div>
        </div>
      )}

      {/* KPI metric cards skeleton grid */}
      {cards > 0 && (
        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            cards <= 2 ? "lg:grid-cols-2" : cards === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-100 rounded-lg border border-slate-200/60" />
              </div>
              <div className="h-8 w-32 bg-slate-300 rounded-md" />
              <div className="h-2.5 w-20 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Segmented tabs skeleton */}
      {hasTabs && (
        <div className="border-b border-slate-200/80 bg-white px-2 py-3 flex gap-4">
          <div className="h-4 w-16 bg-slate-300 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
      )}

      {/* Table skeleton */}
      {rows > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          {/* Table filter bar */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="h-8 w-64 bg-slate-100 rounded-lg border border-slate-200" />
            <div className="h-8 w-20 bg-slate-100 rounded-lg border border-slate-200" />
          </div>

          {/* Table headers */}
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-200 rounded ml-auto" />
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3.5 items-center">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3.5 w-28 bg-slate-150 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-full border border-slate-200" />
                <div className="h-3.5 w-24 bg-slate-150 rounded" />
                <div className="h-7 w-16 bg-slate-100 rounded-md border border-slate-200 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SovereignPageSkeleton
