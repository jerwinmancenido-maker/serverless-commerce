import { INCRETINS_PROTOCOLS, INCRETINS_PRODUCTS } from "./incretins.mjs"
import { KHAVINSON_PROTOCOLS, KHAVINSON_PRODUCTS } from "./khavinson.mjs"
import { GH_ANABOLICS_PROTOCOLS, GH_ANABOLICS_PRODUCTS } from "./gh-axis-anabolics.mjs"
import { COGNITIVE_NEURO_PROTOCOLS, COGNITIVE_NEURO_PRODUCTS } from "./cognitive-neuro.mjs"
import { TISSUE_SKIN_PROTOCOLS, TISSUE_SKIN_PRODUCTS } from "./tissue-skin-matrix.mjs"
import { IMMUNE_MITO_PROTOCOLS, IMMUNE_MITO_PRODUCTS } from "./immune-mitochondrial.mjs"
import { BLENDS_BUNDLES_PROTOCOLS, BLENDS_BUNDLES_PRODUCTS } from "./blends-bundles.mjs"
import { LAB_SUPPLIES_PROTOCOLS, LAB_SUPPLIES_PRODUCTS } from "./lab-supplies.mjs"

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

console.log(`Total new protocols: ${allNewProtocols.length}`)
console.log(`Total new products: ${allNewProducts.length}`)

if (allNewProtocols.length !== 66) {
  throw new Error(`Expected exactly 66 new protocols, got ${allNewProtocols.length}`)
}

if (allNewProducts.length !== 66) {
  throw new Error(`Expected exactly 66 new products, got ${allNewProducts.length}`)
}

// 1. Check ID uniqueness
const ids = allNewProtocols.map(p => p.id)
const idSet = new Set(ids)
if (idSet.size !== ids.length) {
  throw new Error(`Duplicate IDs detected in new protocols!`)
}

// 2. Check title uniqueness (normalized)
const names = allNewProtocols.map(p => p.compoundName.replace(/\(.*?\)/g, "").trim().toLowerCase())
const nameSet = new Set(names)
if (nameSet.size !== names.length) {
  const dupes = names.filter((item, index) => names.indexOf(item) !== index)
  throw new Error(`Duplicate normalized names detected in new protocols: ${dupes.join(", ")}`)
}

// 3. Check types and stoichiometry
for (const p of allNewProtocols) {
  if (!p.id || !p.compoundName || !p.subtitle || !p.category || !p.catalogStatus) {
    throw new Error(`Missing basic fields on ${p.id}`)
  }
  if (!p.citations || p.citations.length < 1) {
    throw new Error(`Missing citations on ${p.id}`)
  }
  if (!p.longDescription || p.longDescription.length < 150) {
    throw new Error(`Short or missing longDescription on ${p.id}`)
  }
  if (typeof p.storage.lightProtection !== "boolean") {
    throw new Error(`storage.lightProtection must be boolean on ${p.id}, got ${typeof p.storage.lightProtection}`)
  }

  if (p.isSupply || p.category === "Laboratory Supplies") {
    if (!p.supplyGuide || !p.supplyGuide.physicalState) {
      throw new Error(`Missing supplyGuide or physicalState on ${p.id}`)
    }
    if (!p.supplyGuide.protocolSteps || p.supplyGuide.protocolSteps.length !== 4) {
      throw new Error(`Expected exactly 4 protocolSteps on ${p.id}, got ${p.supplyGuide.protocolSteps?.length}`)
    }
    if (!p.supplyGuide.features || p.supplyGuide.features.length < 4) {
      throw new Error(`Expected >= 4 features on ${p.id}, got ${p.supplyGuide.features?.length}`)
    }
  } else {
    const { defaultVialNetMg, defaultDiluentMl, resultingConcentrationMgPerMl } = p.reconstitution
    if (defaultVialNetMg <= 0 || defaultDiluentMl <= 0) {
      throw new Error(`Invalid reconstitution amounts on ${p.id}`)
    }
    const expectedConc = defaultVialNetMg / defaultDiluentMl
    if (Math.abs(resultingConcentrationMgPerMl - expectedConc) > 0.001) {
      throw new Error(`Stoichiometric mismatch on ${p.id}: expected ${expectedConc}, got ${resultingConcentrationMgPerMl}`)
    }
    if (!p.dosing.titrationSteps || p.dosing.titrationSteps.length < 3) {
      throw new Error(`Expected >= 3 titration steps on ${p.id}`)
    }
    if (!p.syringeGuide.graduations || p.syringeGuide.graduations.length < 1) {
      throw new Error(`Expected >= 1 graduation on ${p.id}`)
    }
    for (const grad of p.syringeGuide.graduations) {
      const expectedVol = grad.doseMcg / (resultingConcentrationMgPerMl * 1000)
      if (Math.abs(grad.volumeMl - expectedVol) > 0.005) {
        throw new Error(`Graduation volume mismatch on ${p.id}: expected ${expectedVol}, got ${grad.volumeMl}`)
      }
      const expectedIU = Math.round(grad.volumeMl * 100 * 10) / 10
      if (Math.abs(grad.syringeIU - expectedIU) > 0.1) {
        throw new Error(`Syringe IU mismatch on ${p.id}: expected ${expectedIU}, got ${grad.syringeIU}`)
      }
    }
  }

  if (p.isBlend) {
    if (!p.blendConstituents || p.blendConstituents.length < 2) {
      throw new Error(`Blend ${p.id} must have >= 2 blendConstituents`)
    }
  }
}

// 4. Check products
for (const pr of allNewProducts) {
  if (!pr.handle || !pr.title || !pr.category_handle || !pr.variants || pr.variants.length < 1) {
    throw new Error(`Incomplete product on ${pr.handle}`)
  }
}

console.log("All 66 new protocols and 66 new products passed 100% of validation checks successfully!")
