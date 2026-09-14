/**
 * @file    apps/storefront/src/lib/navigation-data.test.ts
 * @module  NavigationDataTest
 * @purpose Unit test verification for dynamic navigation data architecture.
 */
import assert from "node:assert/strict"
import test from "node:test"
import {
  getFeaturedNavCompounds,
  getNavCategories,
  getNavMetrics,
} from "./data/navigation-data.ts"

test("getNavMetrics dynamically resolves all dataset counts accurately", () => {
  const metrics = getNavMetrics()

  assert.ok(metrics.totalCompounds >= 176, `Expected at least 176 compounds, got ${metrics.totalCompounds}`)
  assert.ok(metrics.totalComparisons >= 24, `Expected at least 24 comparisons, got ${metrics.totalComparisons}`)
  assert.ok(metrics.totalArticles >= 80, `Expected at least 80 monographs/articles, got ${metrics.totalArticles}`)
  assert.ok(metrics.totalGlossaryTerms >= 30, `Expected at least 30 glossary terms, got ${metrics.totalGlossaryTerms}`)
})

test("getNavCategories returns all 8 pharmacological categories with positive counts", () => {
  const categories = getNavCategories()

  assert.equal(categories.length, 8, "Must contain exactly 8 pharmacological categories")

  const expectedCategories = [
    "Metabolic & Incretin Signaling",
    "Tissue Repair & Cytoprotection",
    "Growth Hormone Axis Secretagogues",
    "Cellular Longevity & Bioregulators",
    "Neurobiology & Cognitive Peptides",
    "Immunomodulatory & Antimicrobial",
    "Compounded Blends & Synergies",
    "Sterile Consumables & Labware",
  ]

  for (const expected of expectedCategories) {
    const found = categories.find((c) => c.name === expected)
    assert.ok(found, `Category '${expected}' must be present in navigation categories`)
    assert.ok(found.href.startsWith("/categories/"), `Href '${found.href}' must be a valid category route`)
    assert.ok(found.count > 0, `Category '${expected}' must have positive compound count, got ${found.count}`)
  }
})

test("getFeaturedNavCompounds returns 4 flagship standards with valid tags and routes", () => {
  const featured = getFeaturedNavCompounds()

  assert.equal(featured.length, 4, "Must return 4 flagship reference standards")

  for (const comp of featured) {
    assert.ok(comp.title.length > 0, "Compound title must not be empty")
    assert.ok(comp.tag.length > 0, "Compound tag must not be empty")
    assert.ok(comp.desc.length > 0, "Compound description must not be empty")
    assert.ok(comp.href.startsWith("/products/"), `Href '${comp.href}' must start with /products/`)
  }
})
