import fs from "fs"
import path from "path"

import { INCRETINS_PROTOCOLS, INCRETINS_PRODUCTS } from "./incretins.mjs"
import { KHAVINSON_PROTOCOLS, KHAVINSON_PRODUCTS } from "./khavinson.mjs"
import { GH_ANABOLICS_PROTOCOLS, GH_ANABOLICS_PRODUCTS } from "./gh-axis-anabolics.mjs"
import { COGNITIVE_NEURO_PROTOCOLS, COGNITIVE_NEURO_PRODUCTS } from "./cognitive-neuro.mjs"
import { TISSUE_SKIN_PROTOCOLS, TISSUE_SKIN_PRODUCTS } from "./tissue-skin-matrix.mjs"
import { IMMUNE_MITO_PROTOCOLS, IMMUNE_MITO_PRODUCTS } from "./immune-mitochondrial.mjs"
import { BLENDS_BUNDLES_PROTOCOLS, BLENDS_BUNDLES_PRODUCTS } from "./blends-bundles.mjs"
import { LAB_SUPPLIES_PROTOCOLS, LAB_SUPPLIES_PRODUCTS } from "./lab-supplies.mjs"

const STOREFRONT_PROTOCOLS_PATH = path.resolve("apps/storefront/src/lib/data/compound-protocols/all-protocols.json")
const BACKEND_PROTOCOLS_PATH = path.resolve("apps/backend/data/all-compound-protocols.json")
const BACKEND_CATALOG_PATH = path.resolve("apps/backend/data/unified-catalog.json")

console.log("Loading existing files...")
const existingStorefrontProtocols = JSON.parse(fs.readFileSync(STOREFRONT_PROTOCOLS_PATH, "utf8"))
const existingBackendProtocols = JSON.parse(fs.readFileSync(BACKEND_PROTOCOLS_PATH, "utf8"))
const existingCatalog = JSON.parse(fs.readFileSync(BACKEND_CATALOG_PATH, "utf8"))

console.log(`Current storefront protocols: ${existingStorefrontProtocols.length}`)
console.log(`Current backend protocols: ${existingBackendProtocols.length}`)
console.log(`Current catalog products: ${existingCatalog.length}`)

const allNewProtocols = [
  ...INCRETINS_PROTOCOLS,
  ...KHAVINSON_PROTOCOLS,
  ...GH_ANABOLICS_PROTOCOLS,
  ...COGNITIVE_NEURO_PROTOCOLS,
  ...TISSUE_SKIN_PROTOCOLS,
  ...IMMUNE_MITO_PROTOCOLS,
  ...BLENDS_BUNDLES_PROTOCOLS,
  ...LAB_SUPPLIES_PROTOCOLS
]

const allNewProducts = [
  ...INCRETINS_PRODUCTS,
  ...KHAVINSON_PRODUCTS,
  ...GH_ANABOLICS_PRODUCTS,
  ...COGNITIVE_NEURO_PRODUCTS,
  ...TISSUE_SKIN_PRODUCTS,
  ...IMMUNE_MITO_PRODUCTS,
  ...BLENDS_BUNDLES_PRODUCTS,
  ...LAB_SUPPLIES_PRODUCTS
]

console.log(`New protocols to inject: ${allNewProtocols.length}`)
console.log(`New products to inject: ${allNewProducts.length}`)

if (allNewProtocols.length !== 66 || allNewProducts.length !== 66) {
  throw new Error("Validation failed: expected exactly 66 new protocols and 66 new products.")
}

// Extract base datasets (first 88 protocols and first 82 catalog products)
const baseStorefrontProtocols = existingStorefrontProtocols.slice(0, 88).map(p => {
  if (p.id === "ti15") {
    return { ...p, handles: ["ti15", "ti-15", "ti15-blend"] }
  }
  return p
})

const baseBackendProtocols = existingBackendProtocols.slice(0, 88).map(p => {
  if (p.id === "ti15") {
    return { ...p, handles: ["ti15", "ti-15", "ti15-blend"] }
  }
  return p
})

const baseCatalog = existingCatalog.slice(0, 82)

console.log(`Base storefront protocols: ${baseStorefrontProtocols.length}`)
console.log(`Base backend protocols: ${baseBackendProtocols.length}`)
console.log(`Base catalog products: ${baseCatalog.length}`)

// Merge protocols and products
const mergedStorefrontProtocols = [...baseStorefrontProtocols, ...allNewProtocols]
const mergedBackendProtocols = [...baseBackendProtocols, ...allNewProtocols]
const mergedCatalog = [...baseCatalog, ...allNewProducts]

if (mergedStorefrontProtocols.length !== 154) {
  throw new Error(`Expected exactly 154 merged protocols, got ${mergedStorefrontProtocols.length}`)
}

if (mergedCatalog.length !== 148) {
  throw new Error(`Expected exactly 148 merged catalog products, got ${mergedCatalog.length}`)
}

// Check uniqueness
const pIds = mergedStorefrontProtocols.map(p => p.id)
if (new Set(pIds).size !== pIds.length) {
  throw new Error("Protocol ID collision detected!")
}

const handleSet = new Set()
for (const p of mergedStorefrontProtocols) {
  for (const h of (p.handles || [])) {
    if (handleSet.has(h)) {
      throw new Error(`Duplicate protocol handle detected: ${h} in ${p.id}`)
    }
    handleSet.add(h)
  }
}

const cHandles = mergedCatalog.map(p => p.handle)
if (new Set(cHandles).size !== cHandles.length) {
  throw new Error("Catalog handle collision detected!")
}

const pNames = mergedStorefrontProtocols.map(p => p.compoundName.replace(/\(.*?\)/g, "").trim().toLowerCase())
if (new Set(pNames).size !== pNames.length) {
  const dupes = pNames.filter((item, index) => pNames.indexOf(item) !== index)
  throw new Error(`Protocol compoundName collision detected: ${dupes.join(", ")}`)
}

console.log("Writing expanded datasets to disk...")
fs.writeFileSync(STOREFRONT_PROTOCOLS_PATH, JSON.stringify(mergedStorefrontProtocols, null, 2) + "\n", "utf8")
fs.writeFileSync(BACKEND_PROTOCOLS_PATH, JSON.stringify(mergedBackendProtocols, null, 2) + "\n", "utf8")
fs.writeFileSync(BACKEND_CATALOG_PATH, JSON.stringify(mergedCatalog, null, 2) + "\n", "utf8")

console.log("SUCCESSFULLY INJECTED ALL 66 PROTOCOLS AND PRODUCTS!")
console.log(`New Storefront Protocols: ${mergedStorefrontProtocols.length} (target: 154)`)
console.log(`New Backend Protocols: ${mergedBackendProtocols.length} (target: 154)`)
console.log(`New Unified Catalog Products: ${mergedCatalog.length} (target: 148)`)
