import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const sourceRoot = process.cwd()

test("renders products without compound-family storefront grouping", () => {
  const page = readFileSync(
    join(sourceRoot, "src/app/[countryCode]/(main)/products/[handle]/page.tsx"),
    "utf8",
  )
  const template = readFileSync(
    join(sourceRoot, "src/modules/products/templates/index.tsx"),
    "utf8",
  )

  assert.doesNotMatch(page, /retrieveCompoundFamily/)
  assert.doesNotMatch(page, /familyGroup/)
  assert.doesNotMatch(template, /CompoundPresentationSwitcher/)
})
