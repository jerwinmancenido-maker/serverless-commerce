import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by research category.",
}

export default async function CategoriesPage() {
  const categories = (await listCategories()).filter(
    (category) => !category.parent_category
  )

  return (
    <div className="content-container py-12 small:py-20">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl-semi text-ui-fg-base">Categories</h1>
        <p className="mt-3 text-base-regular text-ui-fg-subtle">
          Browse the catalog by research area.
        </p>
      </div>

      {categories.length ? (
        <ul className="grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-6"
            >
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="text-large-semi text-ui-fg-base hover:text-ui-fg-interactive"
              >
                {category.name}
              </LocalizedClientLink>
              {category.description ? (
                <p className="mt-2 text-small-regular text-ui-fg-subtle">
                  {category.description}
                </p>
              ) : null}
              {!!category.category_children?.length && (
                <ul className="mt-4 flex flex-col gap-2">
                  {category.category_children.map((child) => (
                    <li key={child.id}>
                      <LocalizedClientLink
                        href={`/categories/${child.handle}`}
                        className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base"
                      >
                        {child.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base-regular text-ui-fg-subtle">
          No product categories are available yet.
        </p>
      )}
    </div>
  )
}
