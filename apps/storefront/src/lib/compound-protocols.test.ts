import assert from "node:assert/strict"
import test from "node:test"
import {
  ALL_COMPOUND_PROTOCOLS,
  COMPOUND_ANALYTICAL_PROTOCOLS,
  CATEGORY_1_TISSUE_REPAIR_PROTOCOLS,
  CATEGORY_2_METABOLIC_INCRETIN_PROTOCOLS,
  CATEGORY_3_GH_AXIS_PROTOCOLS,
  CATEGORY_4_LONGEVITY_PROTOCOLS,
  CATEGORY_5_NEURO_PROTOCOLS,
  CATEGORY_6_IMMUNE_SEXUAL_PROTOCOLS,
  CATEGORY_7_BLENDS_PROTOCOLS,
  getCompoundProtocol,
  normalizeProductHandle,
  getProtocolsByCategory,
  getProtocolsByCatalogStatus,
  getProtocolById,
} from "./data/compound-protocols.ts"

test("contains all 55+ verified analytical protocols across 7 categories", () => {
  assert.equal(CATEGORY_1_TISSUE_REPAIR_PROTOCOLS.length, 8)
  assert.equal(CATEGORY_2_METABOLIC_INCRETIN_PROTOCOLS.length, 12)
  assert.equal(CATEGORY_3_GH_AXIS_PROTOCOLS.length, 13)
  assert.equal(CATEGORY_4_LONGEVITY_PROTOCOLS.length, 8)
  assert.equal(CATEGORY_5_NEURO_PROTOCOLS.length, 12)
  assert.equal(CATEGORY_6_IMMUNE_SEXUAL_PROTOCOLS.length, 9)
  assert.equal(CATEGORY_7_BLENDS_PROTOCOLS.length, 6)

  const expectedTotal = 8 + 12 + 13 + 8 + 12 + 9 + 6
  assert.equal(ALL_COMPOUND_PROTOCOLS.length, expectedTotal)
  assert.equal(COMPOUND_ANALYTICAL_PROTOCOLS.length, expectedTotal)
})

test("validates complete type fields and non-empty metadata for every protocol", () => {
  for (const protocol of ALL_COMPOUND_PROTOCOLS) {
    assert.ok(protocol.id, `Missing ID on ${protocol.compoundName}`)
    assert.ok(protocol.compoundName, `Missing compoundName on ${protocol.id}`)
    assert.ok(protocol.subtitle, `Missing subtitle on ${protocol.id}`)
    assert.ok(protocol.category, `Missing category on ${protocol.id}`)
    assert.ok(protocol.catalogStatus, `Missing catalogStatus on ${protocol.id}`)
    assert.ok(protocol.reconstitution.defaultVialNetMg > 0, `Invalid vial mg on ${protocol.id}`)
    assert.ok(protocol.reconstitution.defaultDiluentMl > 0, `Invalid diluent mL on ${protocol.id}`)
    assert.ok(protocol.reconstitution.solvent, `Missing solvent on ${protocol.id}`)
    assert.ok(protocol.reconstitution.dissolutionMethod, `Missing dissolution method on ${protocol.id}`)
    assert.ok(protocol.dosing.standardDoseDisplay, `Missing standardDoseDisplay on ${protocol.id}`)
    assert.ok(protocol.dosing.cadence, `Missing cadence on ${protocol.id}`)
    assert.ok(protocol.dosing.halfLife, `Missing halfLife on ${protocol.id}`)
    assert.ok(protocol.dosing.titrationSteps.length >= 3, `Expected at least 3 titration steps on ${protocol.id}`)
    assert.ok(protocol.syringeGuide.graduations.length >= 1, `Expected at least 1 syringe graduation on ${protocol.id}`)
    assert.ok(protocol.citations.length >= 1, `Expected at least 1 citation on ${protocol.id}`)
    assert.ok(protocol.longDescription && protocol.longDescription.length >= 150, `Missing or short longDescription on ${protocol.id}`)
    assert.ok(protocol.disclaimer, `Missing disclaimer on ${protocol.id}`)

    if (protocol.isBlend) {
      assert.ok(protocol.blendConstituents && protocol.blendConstituents.length >= 2, `Blend ${protocol.id} must have >= 2 constituents`)
    }
  }
})

test("verifies stoichiometric dilution and syringe unit math for every compound", () => {
  for (const protocol of ALL_COMPOUND_PROTOCOLS) {
    const { defaultVialNetMg, defaultDiluentMl, resultingConcentrationMgPerMl } = protocol.reconstitution
    const expectedConcentration = defaultVialNetMg / defaultDiluentMl
    const concDiff = Math.abs(resultingConcentrationMgPerMl - expectedConcentration)
    assert.ok(
      concDiff < 0.001,
      `Concentration mismatch on ${protocol.id}: expected ${expectedConcentration}, got ${resultingConcentrationMgPerMl}`
    )

    for (const grad of protocol.syringeGuide.graduations) {
      const expectedVolume = grad.doseMcg / (resultingConcentrationMgPerMl * 1000)
      const volDiff = Math.abs(grad.volumeMl - expectedVolume)
      assert.ok(
        volDiff < 0.005,
        `Graduation volume mismatch on ${protocol.id} (${grad.doseDisplay}): expected ${expectedVolume}, got ${grad.volumeMl}`
      )

      const expectedIU = Math.round(grad.volumeMl * 100 * 10) / 10
      const iuDiff = Math.abs(grad.syringeIU - expectedIU)
      assert.ok(
        iuDiff < 0.1,
        `Syringe IU mismatch on ${protocol.id} (${grad.doseDisplay}): expected ${expectedIU}, got ${grad.syringeIU}`
      )
    }
  }
})

test("resolves protocols accurately via getCompoundProtocol", () => {
  // Direct handle / ID
  const bpc = getCompoundProtocol("bpc-157")
  assert.equal(bpc.id, "bpc-157")

  const tirz = getCompoundProtocol("tirzepatide")
  assert.equal(tirz.id, "tirzepatide")

  const reta = getCompoundProtocol("retatrutide")
  assert.equal(reta.id, "retatrutide")

  const ghk = getCompoundProtocol("ghk-cu")
  assert.equal(ghk.id, "ghk-cu")

  // Common aliases and trade names
  const ozempic = getCompoundProtocol("ozempic")
  assert.equal(ozempic.id, "semaglutide")

  const mounjaro = getCompoundProtocol("mounjaro")
  assert.equal(mounjaro.id, "tirzepatide")

  const mots = getCompoundProtocol("mots-c")
  assert.equal(mots.id, "mots-c")

  const klow = getCompoundProtocol("klow")
  assert.equal(klow.id, "klow-blend")

  const wolverine = getCompoundProtocol("wolverine")
  assert.equal(wolverine.id, "wolverine-blend")

  const pt141 = getCompoundProtocol("pt-141")
  assert.equal(pt141.id, "pt-141")

  // Substring search
  const semax = getCompoundProtocol("semax peptide")
  assert.equal(semax.id, "semax")

  // Fallback for unknown compound
  const unknown = getCompoundProtocol("Unknown Custom Fragment 99")
  assert.equal(unknown.id, "generic-peptide")
  assert.equal(unknown.compoundName, "Unknown Custom Fragment 99")
})

test("Safeguard 3: strips dosage and packaging suffixes via normalizeProductHandle and getCompoundProtocol", () => {
  assert.equal(normalizeProductHandle("bpc-157-5mg"), "bpc-157")
  assert.equal(normalizeProductHandle("bpc-157-vial"), "bpc-157")
  assert.equal(normalizeProductHandle("tb-500-10mg-vial"), "tb-500")
  assert.equal(normalizeProductHandle("kisspeptin-10-10mg"), "kisspeptin-10")
  assert.equal(normalizeProductHandle("kisspeptin-10"), "kisspeptin-10")

  const bpc5mg = getCompoundProtocol("bpc-157-5mg")
  assert.equal(bpc5mg.id, "bpc-157")

  const bpcVial = getCompoundProtocol("bpc-157-vial")
  assert.equal(bpcVial.id, "bpc-157")

  const tb500Vial = getCompoundProtocol("tb-500-10mg-vial")
  assert.equal(tb500Vial.id, "tb-500")

  const sema5mg = getCompoundProtocol("semaglutide-5mg")
  assert.equal(sema5mg.id, "semaglutide")

  const kisspeptin = getCompoundProtocol("kisspeptin-10-10mg")
  assert.equal(kisspeptin.id, "kisspeptin-10")
})

test("filters protocols by category and catalog status", () => {
  const tissueProtocols = getProtocolsByCategory("Tissue Repair & Healing")
  assert.equal(tissueProtocols.length, 8)

  const incretinProtocols = getProtocolsByCategory("Metabolic Signaling & Incretins")
  assert.equal(incretinProtocols.length, 12)

  const inCatalog = getProtocolsByCatalogStatus("in_catalog")
  assert.equal(inCatalog.length, 68)

  const referenceOnly = getProtocolsByCatalogStatus("reference_only")
  assert.equal(referenceOnly.length, 0)

  const byId = getProtocolById("bpc-157")
  assert.ok(byId)
  assert.equal(byId?.id, "bpc-157")
})
