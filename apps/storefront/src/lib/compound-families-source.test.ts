import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const sourceRoot = process.cwd()

test("loads compound families through the Medusa SDK and native product endpoint", () => {
  const source = readFileSync(
    join(sourceRoot, "src/lib/data/compound-families.ts"),
    "utf8",
  )

  assert.match(source, /sdk\.client\.fetch/)
  assert.match(source, /\/store\/compound-families\//)
  assert.match(source, /\/store\/compound-products\//)
  assert.match(source, /listProducts\(/)
  assert.match(source, /productIds\.slice\(index \* 100/)
  assert.match(source, /Promise\.all/)
  assert.doesNotMatch(source, /\bfetch\(/)
  assert.doesNotMatch(source, /JSON\.stringify/)
})

test("switches between separate native products without combining commerce data", () => {
  const switcher = readFileSync(
    join(
      sourceRoot,
      "src/modules/products/components/compound-presentation-switcher/index.tsx",
    ),
    "utf8",
  )
  const productPage = readFileSync(
    join(sourceRoot, "src/app/[countryCode]/(main)/products/[handle]/page.tsx"),
    "utf8",
  )

  assert.match(switcher, /href=\{`\/products\/\$\{member\.product\.handle\}`\}/)
  assert.match(switcher, /member\.presentation\.name/)
  assert.match(productPage, /retrieveCompoundFamilyByProductId/)
  assert.doesNotMatch(switcher, /inventory|variant|price|recipe/i)
})

test("provides a storefront family page for presentation-specific products", () => {
  const source = readFileSync(
    join(
      sourceRoot,
      "src/app/[countryCode]/(main)/families/[familyKey]/page.tsx",
    ),
    "utf8",
  )

  assert.match(source, /retrieveCompoundFamilyByKey/)
  assert.match(source, /member\.presentation\.name/)
  assert.match(source, /ProductPreview/)
})
