import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const sourceRoot = process.cwd()
const readSource = (path: string) =>
  readFileSync(join(sourceRoot, path), "utf8")

test("uses product categories instead of collections on the storefront", () => {
  const home = readSource("src/app/[countryCode]/(main)/page.tsx")
  const footer = readSource("src/modules/layout/templates/footer/index.tsx")
  const productInfo = readSource(
    "src/modules/products/templates/product-info/index.tsx"
  )
  const relatedProducts = readSource(
    "src/modules/products/components/related-products/index.tsx"
  )

  assert.match(home, /listCategories/)
  assert.match(home, /categories=\{categories\}/)
  assert.doesNotMatch(home, /listCollections|collections=/)

  assert.match(footer, /data-testid="footer-categories"/)
  assert.doesNotMatch(footer, /listCollections|\/collections\//)

  assert.match(productInfo, /product\.categories/)
  assert.match(productInfo, /\/categories\//)
  assert.doesNotMatch(productInfo, /product\.collection|\/collections\//)

  assert.match(relatedProducts, /queryParams\.category_id/)
  assert.doesNotMatch(relatedProducts, /collection_id/)
})

test("provides a dynamic category directory and category product rails", () => {
  const directory = readSource(
    "src/app/[countryCode]/(main)/categories/page.tsx"
  )
  const rail = readSource(
    "src/modules/home/components/featured-products/product-rail/index.tsx"
  )
  const sideMenu = readSource(
    "src/modules/layout/components/side-menu/index.tsx"
  )

  assert.match(directory, /listCategories/)
  assert.match(directory, /!category\.parent_category/)
  assert.match(directory, /category\.category_children/)
  assert.match(rail, /category_id: \[category\.id\]/)
  assert.match(rail, /`\/categories\/\$\{category\.handle\}`/)
  assert.match(sideMenu, /Categories: "\/categories"/)
})

test("does not retain stale Admin-managed category results", () => {
  const categoriesData = readSource("src/lib/data/categories.ts")

  assert.match(categoriesData, /cache: "no-store"/)
  assert.doesNotMatch(categoriesData, /cache: "force-cache"/)
})

test("removes the obsolete customer-facing collection implementation", () => {
  assert.equal(
    existsSync(
      join(
        sourceRoot,
        "src/app/[countryCode]/(main)/collections/[handle]/page.tsx"
      )
    ),
    false
  )
  assert.equal(
    existsSync(join(sourceRoot, "src/lib/data/collections.ts")),
    false
  )
  assert.equal(
    existsSync(join(sourceRoot, "src/modules/collections/templates/index.tsx")),
    false
  )
})
