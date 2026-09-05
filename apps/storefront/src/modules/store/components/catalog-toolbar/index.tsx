"use client"

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type CatalogToolbarProps = {
  sortBy: SortOptions
  count?: number
  categories?: HttpTypes.StoreProductCategory[]
  activeCategoryHandle?: string
}

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

export default function CatalogToolbar({
  sortBy,
  count,
  categories,
  activeCategoryHandle,
}: CatalogToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { countryCode } = useParams() as { countryCode?: string }
  const base = countryCode ? `/${countryCode}` : ""

  const setSortBy = useCallback(
    (newSort: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sortBy", newSort)
      params.delete("page")
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const handleCategoryChange = (val: string) => {
    if (val === "all") {
      router.push(`${base}/store`)
    } else {
      router.push(`${base}/categories/${val}`)
    }
  }

  // Filter to top level categories
  const topLevelCategories = categories?.filter((c) => !c.parent_category_id) || []

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl mb-6 text-xs shadow-2xs">
      {/* Left indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="font-bold text-slate-900">
          {typeof count === "number"
            ? `${count} ${count === 1 ? "Compound" : "Compounds"} Listed`
            : "Analytical Reference Compounds"}
        </span>
        <span className="hidden sm:inline text-slate-300">&middot;</span>
        <span className="hidden sm:inline text-slate-500 font-medium">
          In Vitro Research Reagents
        </span>
      </div>

      {/* Right controls: Domain Selector & Sort */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Research Domain Dropdown */}
        {topLevelCategories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="catalog-domain" className="text-slate-500 font-medium whitespace-nowrap">
              Domain:
            </label>
            <select
              id="catalog-domain"
              value={activeCategoryHandle || "all"}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
            >
              <option value="all">All Research Domains ({categories?.length || 0})</option>
              {topLevelCategories.map((cat) => (
                <option key={cat.id} value={cat.handle}>
                  {cat.name} {typeof cat.products?.length === "number" && cat.products.length > 0 ? `(${cat.products.length})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="catalog-sort" className="text-slate-500 font-medium whitespace-nowrap">
            Sort:
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
