import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { listCategories } from "@lib/data/categories"
import CatalogHeader from "@modules/store/components/catalog-header"
import CatalogToolbar from "@modules/store/components/catalog-toolbar"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const allCategories = await listCategories()

  const parents = [] as HttpTypes.StoreProductCategory[]
  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }
  getParents(category)

  const breadcrumbs = [
    ...parents.map((p) => ({
      label: p.name,
      href: `/categories/${p.handle}`,
    })),
    {
      label: category.name,
    },
  ]

  return (
    <div className="content-container py-8 max-w-7xl mx-auto px-4 sm:px-6 min-h-[70vh]">
      <CatalogHeader
        title={category.name}
        description={category.description || "Analytical reference compounds and reagents formulated for targeted scientific research."}
        badge="RESEARCH DOMAIN DOSSIER"
        breadcrumbs={breadcrumbs}
      />

      <CatalogToolbar
        sortBy={sort}
        categories={allCategories || []}
        activeCategoryHandle={category.handle}
      />

      <Suspense
        fallback={
          <SkeletonProductGrid
            numberOfProducts={category.products?.length ?? 8}
          />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          categoryId={category.id}
          countryCode={countryCode}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </div>
  )
}
