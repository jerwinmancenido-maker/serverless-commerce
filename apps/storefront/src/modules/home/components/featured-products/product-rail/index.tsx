import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  category,
  region,
}: {
  category: HttpTypes.StoreProductCategory
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      category_id: [category.id],
      fields: "*variants.calculated_price",
      limit: 6,
    },
  })

  if (!pricedProducts.length) {
    return null
  }

  return (
    <div className="content-container py-8 small:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 gap-2">
        <div>
          <Text className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {category.name}
          </Text>
          {category.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <InteractiveLink href={`/categories/${category.handle}`}>
            View all
          </InteractiveLink>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
