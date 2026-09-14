import { Suspense } from "react"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"
import CatalogHeader from "@modules/store/components/catalog-header"
import CatalogToolbar from "@modules/store/components/catalog-toolbar"
import PaginatedProducts from "./paginated-products"

export default async function StoreTemplate({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const categories = await listCategories()

  return (
    <div className="content-container py-8 max-w-7xl mx-auto px-4 sm:px-6 min-h-[70vh]">
      <CatalogHeader
        title="Analytical Reference Compounds & Reagents"
        description="High-purity lyophilized research peptides and biochemical reference standards. Custom insulation foam packaging with shock-buffering dispatched nationwide."
        badge="LABORATORY REFERENCE CATALOG"
      />

      <CatalogToolbar
        sortBy={sort}
        categories={categories || []}
      />

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </div>
  )
}
