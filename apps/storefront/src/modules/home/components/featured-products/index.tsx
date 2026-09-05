import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function FeaturedProducts({
  categories,
  region: _region,
}: {
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}) {
  // Focus on core research categories and exclude empty apparel categories if present
  const researchCategories = categories.filter(
    (c) =>
      c.handle &&
      !["shirts", "sweatshirts", "pants", "merch"].includes(c.handle.toLowerCase())
  )

  const displayCategories = researchCategories.length
    ? researchCategories
    : categories

  return (
    <section className="w-full py-12 small:py-16">
      <div className="content-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Curated Catalog
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Explore by Research Focus
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Browse reference compounds, peptide analogs, and laboratory supplies.
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors shrink-0"
          >
            Full Product Catalog &rarr;
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.slice(0, 6).map((category) => (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="flex flex-col justify-between p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Category
                  </span>
                  <span className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all text-sm">
                    &rarr;
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {category.name}
                </h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {category.description ||
                    "Reference compounds formulated for controlled laboratory investigation."}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span>View Compounds</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
