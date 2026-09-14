/**
 * @file    apps/storefront/src/lib/link-integrity.test.ts
 * @module  LinkIntegrityTest
 * @purpose Automated regression test suite validating link, route, and hash anchor integrity.
 */

import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const storefrontRoot = path.resolve(__dirname, "..")

test("Tools Menu links strictly reference valid calculator and laboratory guide routes", () => {
  const menuPath = path.join(storefrontRoot, "modules/layout/components/tools-menu/index.tsx")
  assert.ok(fs.existsSync(menuPath), "tools-menu/index.tsx must exist")
  const content = fs.readFileSync(menuPath, "utf-8")

  const expectedRoutes = [
    "/calculator",
    "/dosage-chart",
    "/research-stacks",
    "/learn/syringe-guide",
    "/learn/storage-guide",
    "/learn",
    "/research-library",
  ]

  for (const route of expectedRoutes) {
    assert.ok(
      content.includes(route),
      `Tools menu must include valid route link '${route}'`
    )
  }
})

test("Protocols Mega Menu links strictly reference valid routes without broken anchors", () => {
  const menuPath = path.join(storefrontRoot, "modules/layout/components/protocols-mega-menu/index.tsx")
  assert.ok(fs.existsSync(menuPath), "protocols-mega-menu/index.tsx must exist")
  const content = fs.readFileSync(menuPath, "utf-8")

  // Syringe visualizer must link to /learn/syringe-guide, NOT /dosage-chart#syringe
  assert.doesNotMatch(
    content,
    /\/dosage-chart#syringe/,
    "Protocols mega menu must NOT contain deprecated /dosage-chart#syringe anchor"
  )
  assert.match(
    content,
    /\/learn\/syringe-guide/,
    "Protocols mega menu must link U-100 Syringe Visualizer to /learn/syringe-guide"
  )
  assert.match(
    content,
    /\/research-library#calculator/,
    "Protocols mega menu must link reconstitution calculator to /research-library#calculator"
  )
})

test("Research Mega Menu links strictly reference valid SOP guides and clean-bench hub", () => {
  const menuPath = path.join(storefrontRoot, "modules/layout/components/research-mega-menu/index.tsx")
  assert.ok(fs.existsSync(menuPath), "research-mega-menu/index.tsx must exist")
  const content = fs.readFileSync(menuPath, "utf-8")

  const expectedGuides = [
    "/learn/syringe-guide",
    "/learn/reconstitution-guide",
    "/learn/storage-guide",
    "/learn/beginners-guide",
    "/learn/glossary",
  ]

  for (const guide of expectedGuides) {
    assert.ok(
      content.includes(guide),
      `Research mega menu must include valid link to '${guide}'`
    )
  }

  // All SOPs hub
  assert.match(
    content,
    /href="\/learn"/,
    "Research mega menu must link 'All SOPs & Guides' to /learn"
  )
})

test("Learn clean-bench hub page exists and is rendered", () => {
  const learnPagePath = path.join(storefrontRoot, "app/[countryCode]/(main)/learn/page.tsx")
  assert.ok(fs.existsSync(learnPagePath), "app/[countryCode]/(main)/learn/page.tsx must exist")
  const content = fs.readFileSync(learnPagePath, "utf-8")
  assert.match(content, /Laboratory SOPs &amp; Clean-Bench Learning Hub/, "Learn page must render SOP header")
})

test("Research Library Directory contains matching HTML ids for all hash deep-links", () => {
  const directoryPath = path.join(storefrontRoot, "modules/research-library/directory.tsx")
  assert.ok(fs.existsSync(directoryPath), "directory.tsx must exist")
  const content = fs.readFileSync(directoryPath, "utf-8")

  const supportedHashes = [
    "articles",
    "comparisons",
    "protocols",
    "stacks",
    "chart",
    "calculator",
    "coa",
  ]

  for (const hash of supportedHashes) {
    const idRegex = new RegExp(`id=["']${hash}["']`)
    assert.match(
      content,
      idRegex,
      `directory.tsx must have an HTML container with id="${hash}" for native browser anchor navigation`
    )
  }
})

test("Product templates contain #protocol anchor target for product action jump links", () => {
  const templatePath = path.join(storefrontRoot, "modules/products/templates/index.tsx")
  assert.ok(fs.existsSync(templatePath), "products/templates/index.tsx must exist")
  const content = fs.readFileSync(templatePath, "utf-8")

  assert.match(
    content,
    /id="protocol"/,
    "Product template must contain an element with id='protocol' for fast fragment jumping"
  )
})

test("Order Help module contains zero dead /contact links and points to valid support routes", () => {
  const helpPath = path.join(storefrontRoot, "modules/order/components/help/index.tsx")
  assert.ok(fs.existsSync(helpPath), "order/components/help/index.tsx must exist")
  const content = fs.readFileSync(helpPath, "utf-8")

  assert.doesNotMatch(
    content,
    /href="\/contact"/,
    "Order help module must NOT link to non-existent /contact page"
  )
  assert.match(
    content,
    /href="\/account\/support"/,
    "Order help module must link Customer Support to /account/support"
  )
  assert.match(
    content,
    /href="\/faq"/,
    "Order help module must link Returns & Replacements to /faq"
  )
})

test("Standalone calculator page exists and mounts StandaloneReconstitutionCalculator", () => {
  const calcPagePath = path.join(storefrontRoot, "app/[countryCode]/(main)/calculator/page.tsx")
  assert.ok(fs.existsSync(calcPagePath), "calculator/page.tsx must exist")
  const content = fs.readFileSync(calcPagePath, "utf-8")

  assert.match(
    content,
    /StandaloneReconstitutionCalculator/,
    "Calculator page must render StandaloneReconstitutionCalculator"
  )
})

test("Navigation categories strictly match canonical Medusa category handles without broken slugs", () => {
  const navDataPath = path.join(storefrontRoot, "lib/data/navigation-data.ts")
  assert.ok(fs.existsSync(navDataPath), "navigation-data.ts must exist")
  const content = fs.readFileSync(navDataPath, "utf-8")

  // Ensure outdated slugs are eliminated
  assert.doesNotMatch(
    content,
    /\/categories\/cognitive-nootropic-peptides/,
    "navigation-data.ts must NOT contain deprecated cognitive-nootropic-peptides slug"
  )
  assert.doesNotMatch(
    content,
    /\/categories\/immune-defense-peptides/,
    "navigation-data.ts must NOT contain deprecated immune-defense-peptides slug"
  )
  assert.doesNotMatch(
    content,
    /\/categories\/multi-peptide-blends/,
    "navigation-data.ts must NOT contain deprecated multi-peptide-blends slug"
  )

  // Ensure canonical slugs are present
  assert.match(
    content,
    /\/categories\/cognitive-neuroprotective-peptides/,
    "navigation-data.ts must link to canonical cognitive-neuroprotective-peptides"
  )
  assert.match(
    content,
    /\/categories\/immune-inflammation-research-peptides/,
    "navigation-data.ts must link to canonical immune-inflammation-research-peptides"
  )
  assert.match(
    content,
    /\/categories\/multi-compound-research-bundles/,
    "navigation-data.ts must link to canonical multi-compound-research-bundles"
  )
})

test("Category handle aliases redirect legacy slugs to canonical counterparts", () => {
  const categoriesDataPath = path.join(storefrontRoot, "lib/data/categories.ts")
  assert.ok(fs.existsSync(categoriesDataPath), "categories.ts must exist")
  const content = fs.readFileSync(categoriesDataPath, "utf-8")

  assert.match(
    content,
    /"cognitive-nootropic-peptides":\s*"cognitive-neuroprotective-peptides"/,
    "categories.ts must define alias for cognitive-nootropic-peptides"
  )
  assert.match(
    content,
    /"immune-defense-peptides":\s*"immune-inflammation-research-peptides"/,
    "categories.ts must define alias for immune-defense-peptides"
  )
  assert.match(
    content,
    /"multi-peptide-blends":\s*"multi-compound-research-bundles"/,
    "categories.ts must define alias for multi-peptide-blends"
  )
})
