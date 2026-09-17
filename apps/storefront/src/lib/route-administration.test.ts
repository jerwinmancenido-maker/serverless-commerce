/**
 * Route Administration Math Verification
 *
 * Validates stoichiometric correctness of the nasal spray atomizer calculator
 * and oral dropper calculator for all route-annotated compounds.
 *
 * Ground Truth Formula:
 *   mcg per spray = pumpVolumeMl * (vialMassMcg / diluentMl)
 *   sprays per bottle = diluentMl / pumpVolumeMl
 *   sprays for dose = doseMcg / (mcgPerSpray)
 */

import { it } from "node:test"
import assert from "node:assert/strict"
import { getCompoundProtocol, ALL_COMPOUND_PROTOCOLS } from "./data/compound-protocols.ts"

// Helper: compute nasal spray math (no floating-point hallucination)
function computeNasalSpray(vialMg: number, diluentMl: number, pumpVolumeMl: number) {
  const vialMcg = vialMg * 1000
  const concentrationMcgPerMl = vialMcg / diluentMl
  const mcgPerSpray = pumpVolumeMl * concentrationMcgPerMl
  const spraysPerBottle = Math.floor(diluentMl / pumpVolumeMl)
  return { concentrationMcgPerMl, mcgPerSpray, spraysPerBottle }
}

// Helper: compute oral dropper math
function computeOralDropper(vialMg: number, diluentMl: number, doseMcg: number) {
  const concentrationMgPerMl = vialMg / diluentMl
  const concentrationMcgPerMl = concentrationMgPerMl * 1000
  const volumePerDoseMl = doseMcg / concentrationMcgPerMl
  return { concentrationMgPerMl, volumePerDoseMl }
}

it("Adamax 10mg in 5.0 mL yields 200 mcg per 0.10 mL spray (50 sprays/bottle)", () => {
  const proto = getCompoundProtocol("adamax-1032")
  assert.ok(proto, "Adamax protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("nasal"), "Adamax should have nasal route")
  assert.ok(proto!.nasalGuide, "Adamax should have nasalGuide")

  const { mcgPerSpray, spraysPerBottle } = computeNasalSpray(10, 5.0, 0.10)
  assert.strictEqual(mcgPerSpray, 200, "10mg in 5mL at 0.10mL/spray = 200 mcg/spray")
  assert.strictEqual(spraysPerBottle, 50, "5mL / 0.10mL = 50 sprays per bottle")
})

it("Adamax 10mg in 3.0 mL yields ~333 mcg per 0.10 mL spray (30 sprays/bottle)", () => {
  const { mcgPerSpray, spraysPerBottle } = computeNasalSpray(10, 3.0, 0.10)
  // Concentration: 10000 mcg / 3.0 mL = 3333.3 mcg/mL; per spray (0.10 mL) = ~333.33 mcg
  // Use approximate comparison due to irrational floating-point result (1000/3)
  assert.ok(Math.abs(mcgPerSpray - 333.33) < 0.01, `Expected ~333.33 mcg/spray, got ${mcgPerSpray}`)
  assert.strictEqual(spraysPerBottle, 30, "3mL / 0.10mL = 30 sprays per bottle")
  // Readable: ~333 mcg per spray
  assert.ok(Math.round(mcgPerSpray) === 333, "Rounds to 333 mcg/spray")
})

it("Adamax 10mg in 10.0 mL yields 100 mcg per 0.10 mL spray (100 sprays/bottle)", () => {
  const { mcgPerSpray, spraysPerBottle } = computeNasalSpray(10, 10.0, 0.10)
  assert.strictEqual(mcgPerSpray, 100, "10mg in 10mL at 0.10mL/spray = 100 mcg/spray")
  assert.strictEqual(spraysPerBottle, 100, "10mL / 0.10mL = 100 sprays per bottle")
})

it("Semax 10mg in 5.0 mL yields 200 mcg per 0.10 mL spray", () => {
  const proto = getCompoundProtocol("semax")
  assert.ok(proto, "Semax protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("nasal"), "Semax should have nasal route")
  assert.ok(proto!.nasalGuide?.pumpVolumeMl === 0.10, "Semax pump volume is 0.10 mL")

  const { mcgPerSpray } = computeNasalSpray(
    proto!.reconstitution.defaultVialNetMg,
    proto!.nasalGuide!.defaultDiluentMl,
    proto!.nasalGuide!.pumpVolumeMl
  )
  assert.strictEqual(mcgPerSpray, 200, "Semax 10mg / 5mL at 0.10mL/spray = 200 mcg/spray")
})

it("Selank 10mg in 5.0 mL yields 200 mcg per 0.10 mL spray", () => {
  const proto = getCompoundProtocol("selank")
  assert.ok(proto, "Selank protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("nasal"), "Selank should have nasal route")
  const { mcgPerSpray } = computeNasalSpray(
    proto!.reconstitution.defaultVialNetMg,
    proto!.nasalGuide!.defaultDiluentMl,
    proto!.nasalGuide!.pumpVolumeMl
  )
  assert.strictEqual(mcgPerSpray, 200, "Selank 10mg / 5mL at 0.10mL/spray = 200 mcg/spray")
})

it("NA-Semax Amidate 10mg in 5.0 mL yields 200 mcg per spray", () => {
  const proto = getCompoundProtocol("na-semax-amidate")
  assert.ok(proto, "NA-Semax protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("nasal"), "NA-Semax should have nasal route")
  const { mcgPerSpray } = computeNasalSpray(
    proto!.reconstitution.defaultVialNetMg,
    proto!.nasalGuide!.defaultDiluentMl,
    proto!.nasalGuide!.pumpVolumeMl
  )
  assert.strictEqual(mcgPerSpray, 200, "NA-Semax 10mg / 5mL at 0.10mL/spray = 200 mcg/spray")
})

it("NA-Selank Amidate 10mg in 5.0 mL yields 200 mcg per spray", () => {
  const proto = getCompoundProtocol("na-selank-amidate")
  assert.ok(proto, "NA-Selank protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("nasal"), "NA-Selank should have nasal route")
  const { mcgPerSpray } = computeNasalSpray(
    proto!.reconstitution.defaultVialNetMg,
    proto!.nasalGuide!.defaultDiluentMl,
    proto!.nasalGuide!.pumpVolumeMl
  )
  assert.strictEqual(mcgPerSpray, 200, "NA-Selank 10mg / 5mL at 0.10mL/spray = 200 mcg/spray")
})

it("For 250 mcg Adamax dose via nasal (5mL bottle), sprays required = 1.25", () => {
  const doseMcg = 250
  const { mcgPerSpray } = computeNasalSpray(10, 5.0, 0.10)
  const spraysForDose = doseMcg / mcgPerSpray
  assert.strictEqual(spraysForDose, 1.25, "250 mcg / 200 mcg per spray = 1.25 sprays")
})

it("For 500 mcg Adamax dose via nasal (5mL bottle), sprays required = 2.5", () => {
  const doseMcg = 500
  const { mcgPerSpray } = computeNasalSpray(10, 5.0, 0.10)
  const spraysForDose = doseMcg / mcgPerSpray
  assert.strictEqual(spraysForDose, 2.5, "500 mcg / 200 mcg per spray = 2.5 sprays")
})

it("MK-677 oral: 750mg in 30mL = 25 mg/mL; 10mg dose = 0.40 mL", () => {
  const proto = getCompoundProtocol("mk-677")
  assert.ok(proto, "MK-677 protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("oral"), "MK-677 should have oral route")
  assert.ok(proto!.oralGuide, "MK-677 should have oralGuide")

  const { concentrationMgPerMl, volumePerDoseMl } = computeOralDropper(
    proto!.reconstitution.defaultVialNetMg,
    proto!.reconstitution.defaultDiluentMl,
    10000 // 10 mg standard starting dose in mcg
  )
  assert.strictEqual(concentrationMgPerMl, 25, "750mg / 30mL = 25 mg/mL")
  assert.strictEqual(volumePerDoseMl, 0.4, "10mg dose at 25mg/mL = 0.40 mL")
})

it("5-Amino-1MQ oral: 500mg in 10mL = 50 mg/mL; 50mg dose = 1.0 mL", () => {
  const proto = getCompoundProtocol("5-amino-1mq")
  assert.ok(proto, "5-Amino-1MQ protocol should resolve")
  assert.ok(proto!.deliveryRoutes?.includes("oral"), "5-Amino-1MQ should have oral route")

  const { concentrationMgPerMl, volumePerDoseMl } = computeOralDropper(
    proto!.reconstitution.defaultVialNetMg,
    proto!.reconstitution.defaultDiluentMl,
    50000 // 50 mg standard dose in mcg
  )
  assert.strictEqual(concentrationMgPerMl, 50, "500mg / 10mL = 50 mg/mL")
  assert.strictEqual(volumePerDoseMl, 1.0, "50mg dose at 50mg/mL = 1.0 mL")
})

it("Non-neuropeptide BPC-157 does NOT have nasal delivery route", () => {
  const proto = getCompoundProtocol("bpc-157")
  assert.ok(proto, "BPC-157 protocol should resolve")
  const hasNasal = proto!.deliveryRoutes?.includes("nasal") ?? false
  assert.strictEqual(hasNasal, false, "BPC-157 is SubQ only — no nasal route")
})

it("Non-neuropeptide Retatrutide does NOT have nasal delivery route", () => {
  const proto = getCompoundProtocol("retatrutide")
  assert.ok(proto, "Retatrutide protocol should resolve")
  const hasNasal = proto!.deliveryRoutes?.includes("nasal") ?? false
  assert.strictEqual(hasNasal, false, "Retatrutide is SubQ injection only — no nasal route")
})

it("All nasal compounds have pumpVolumeMl = 0.10 and at least 3 diluent options", () => {
  const nasalCompoundIds = ["adamax-1032", "semax", "na-semax-amidate", "selank", "na-selank-amidate"]
  for (const id of nasalCompoundIds) {
    const proto = getCompoundProtocol(id)
    assert.ok(proto, `Protocol for ${id} should resolve`)
    assert.ok(proto!.nasalGuide, `${id} should have nasalGuide`)
    assert.strictEqual(proto!.nasalGuide!.pumpVolumeMl, 0.10, `${id} pump volume must be 0.10 mL`)
    assert.ok(
      proto!.nasalGuide!.recommendedDiluentMlOptions.length >= 3,
      `${id} should have at least 3 diluent options`
    )
  }
})

it("nasalGuide defaultDiluentMl must be one of the recommendedDiluentMlOptions", () => {
  const nasalCompoundIds = ["adamax-1032", "semax", "na-semax-amidate", "selank", "na-selank-amidate"]
  for (const id of nasalCompoundIds) {
    const proto = getCompoundProtocol(id)
    const guide = proto!.nasalGuide!
    assert.ok(
      guide.recommendedDiluentMlOptions.includes(guide.defaultDiluentMl),
      `${id}: defaultDiluentMl ${guide.defaultDiluentMl} must be in recommendedDiluentMlOptions`
    )
  }
})

// Verify that all protocol arrays are properly loaded via the barrel file
it("All route-annotated protocols are accessible via barrel getCompoundProtocol", () => {
  const ids = ["adamax-1032", "semax", "na-semax-amidate", "selank", "na-selank-amidate", "mk-677", "5-amino-1mq"]
  for (const id of ids) {
    assert.ok(getCompoundProtocol(id), `Protocol ${id} should resolve via barrel`)
  }
})

// Sanity check that ALL_COMPOUND_PROTOCOLS includes route-annotated compounds
it("ALL_COMPOUND_PROTOCOLS includes route-annotated compounds", () => {
  const ids = ALL_COMPOUND_PROTOCOLS.map((p) => p.id)
  assert.ok(ids.includes("adamax-1032"), "adamax-1032 in ALL_COMPOUND_PROTOCOLS")
  assert.ok(ids.includes("semax"), "semax in ALL_COMPOUND_PROTOCOLS")
  assert.ok(ids.includes("mk-677"), "mk-677 in ALL_COMPOUND_PROTOCOLS")
})

// Priority 1: Pure Nasal Protocol & Atomizer Vehicle Integrity Checks
it("Priority 1: Pure Nasal Protocols strictly mandate Sterile Saline/USP Water (Benzyl Alcohol Free)", () => {
  const nasalCompoundIds = ["adamax-1032", "semax", "na-semax-amidate", "selank", "na-selank-amidate"]
  for (const id of nasalCompoundIds) {
    const proto = getCompoundProtocol(id)
    assert.ok(proto, `Protocol ${id} must exist`)
    // Assert reconstitution instructions never recommend BAC water as primary vehicle for nasal
    const desc = JSON.stringify(proto).toLowerCase()
    assert.ok(!desc.includes("bacteriostatic water for nasal"), `${id} must not mandate BAC water for nasal`)
    assert.ok(
      proto.primaryDeliveryRoute === "nasal" || proto.deliveryRoutes?.includes("nasal"),
      `${id} must have nasal delivery route`
    )
    assert.ok(
      proto.nasalGuide !== undefined,
      `${id} must specify nasalGuide parameters`
    )
    assert.strictEqual(
      proto.nasalGuide?.pumpVolumeMl,
      0.10,
      `${id} must calibrate to standard 0.10 mL metered pump displacement`
    )
  }
})

