import assert from "node:assert/strict"
import test from "node:test"
import {
  getCompoundProtocol,
  CATEGORY_8_SUPPLIES_PROTOCOLS,
} from "./data/compound-protocols.ts"

const SUPPLY_HANDLES = [
  "bacteriostatic-water",
  "peptide-reconstitution-set",
  "reusable-metal-insulin-pen",
  "50-slot-vial-organizer-box",
  "custom-mixed-vial-organizer-box",
  "clear-nasal-spray-bottles",
]

test("all 6 supply products resolve to Category 8 Laboratory Supplies with isSupply flag", () => {
  assert.equal(CATEGORY_8_SUPPLIES_PROTOCOLS.length, 6)

  for (const handle of SUPPLY_HANDLES) {
    const proto = getCompoundProtocol(handle)
    assert.ok(proto, `Failed to resolve protocol for ${handle}`)
    assert.equal(proto.category, "Laboratory Supplies", `${handle} must be Laboratory Supplies`)
    assert.equal(proto.isSupply, true, `${handle} must have isSupply: true`)
    assert.notEqual(proto.id, "generic-peptide", `${handle} must NOT resolve to fallback generic-peptide`)
    assert.notEqual(proto.category, "Tissue Repair & Healing", `${handle} must not be Tissue Repair & Healing`)
  }
})

test("every supply protocol contains complete, verified supplyGuide schema", () => {
  for (const proto of CATEGORY_8_SUPPLIES_PROTOCOLS) {
    const guide = proto.supplyGuide
    assert.ok(guide, `Missing supplyGuide on ${proto.id}`)
    assert.ok(guide.physicalState && guide.physicalState.length > 5, `Missing physicalState on ${proto.id}`)
    assert.ok(guide.sterilityStandard && guide.sterilityStandard.length > 5, `Missing sterilityStandard on ${proto.id}`)
    assert.ok(guide.material && guide.material.length > 5, `Missing material on ${proto.id}`)

    // Exactly 4 structured SOP steps matching Peptides deck standard
    assert.equal(guide.protocolSteps.length, 4, `${proto.id} must have exactly 4 SOP steps`)
    for (const step of guide.protocolSteps) {
      assert.ok(step.stepNumber >= 1 && step.stepNumber <= 4, `Invalid step number on ${proto.id}`)
      assert.ok(step.title && step.title.length > 3, `Empty step title on ${proto.id}`)
      assert.ok(step.instruction && step.instruction.length > 15, `Short step instruction on ${proto.id}`)
    }

    // At least 4 engineering and integrity highlights
    assert.ok(guide.features.length >= 4, `${proto.id} must have >= 4 feature cards`)
    for (const feat of guide.features) {
      assert.ok(feat.title && feat.title.length > 3, `Empty feature title on ${proto.id}`)
      assert.ok(feat.desc && feat.desc.length > 15, `Short feature description on ${proto.id}`)
    }

    // Must have package inclusions manifest
    assert.ok(guide.inclusions && guide.inclusions.length >= 2, `${proto.id} must have inclusions manifest`)
  }
})

test("bacteriostatic-water: verified USP multi-dose diluent specifications", () => {
  const bac = getCompoundProtocol("bacteriostatic-water")
  assert.equal(bac.id, "bacteriostatic-water")
  assert.equal(bac.supplyGuide?.material, "Type I USP Borosilicate Glass Vial")
  assert.ok(bac.supplyGuide?.specs["Preservative"]?.includes("0.9% (9 mg/mL) Benzyl Alcohol"))
  assert.ok(bac.supplyGuide?.specs["Closure System"]?.includes("Chlorobutyl"))
  assert.ok(bac.storage.reconstituted.includes("28 days"))
  assert.equal(bac.reconstitution.defaultVialNetMg, 0, "Solvent must not claim lyophilized cake mass")
})

test("peptide-reconstitution-set: verified consumables kit inclusions", () => {
  const set = getCompoundProtocol("peptide-reconstitution-set")
  assert.equal(set.id, "peptide-reconstitution-set")
  assert.equal(set.supplyGuide?.isHardware, true)
  assert.ok(set.supplyGuide?.specs["SubQ Syringes"]?.includes("6x 1cc"))
  assert.ok(set.supplyGuide?.specs["Transfer Syringe"]?.includes("5cc"))
  assert.ok(set.supplyGuide?.specs["Antiseptic Swabs"]?.includes("10x Sterile 70% Isopropyl"))
  assert.ok(set.supplyGuide?.sterilityStandard?.includes("ETO Sterilized"))
})

test("reusable-metal-insulin-pen: verified 0.01 mL click-dose calibration", () => {
  const pen = getCompoundProtocol("reusable-metal-insulin-pen")
  assert.equal(pen.id, "reusable-metal-insulin-pen")
  assert.equal(pen.supplyGuide?.isHardware, true)
  assert.ok(pen.supplyGuide?.material?.includes("Aluminum"))
  assert.ok(pen.supplyGuide?.specs["Dosing Increment"]?.includes("0.01 mL"))
  assert.ok(pen.supplyGuide?.specs["Cartridge Specification"]?.includes("3.0 mL"))
  assert.ok(pen.supplyGuide?.specs["Needle Compatibility"]?.includes("29G–32G"))
})

test("50-slot-vial-organizer-box: verified cryo-grade -80°C specifications", () => {
  const box = getCompoundProtocol("50-slot-vial-organizer-box")
  assert.equal(box.id, "50-slot-vial-organizer-box")
  assert.equal(box.supplyGuide?.isHardware, true)
  assert.ok(box.supplyGuide?.specs["Capacity"]?.includes("50 Standard Laboratory Vials"))
  assert.ok(box.supplyGuide?.specs["Grid Matrix"]?.includes("10 x 5 Alphanumerically Indexed"))
  assert.ok(box.supplyGuide?.specs["Temperature Range"]?.includes("-80°C Deep Freeze"))
  assert.ok(box.supplyGuide?.specs["Closure Mechanism"]?.includes("Snap-Lock Latches"))
})

test("custom-mixed-vial-organizer-box: verified multi-diameter hybrid grid", () => {
  const box = getCompoundProtocol("custom-mixed-vial-organizer-box")
  assert.equal(box.id, "custom-mixed-vial-organizer-box")
  assert.equal(box.supplyGuide?.isHardware, true)
  assert.ok(box.supplyGuide?.specs["Configuration"]?.includes("Multi-Size Hybrid Grid"))
  assert.ok(box.supplyGuide?.specs["Finish & Aesthetic"]?.includes("Pastel Pink"))
})

test("clear-nasal-spray-bottles: verified 0.10 mL metered fine-mist atomizer", () => {
  const bottle = getCompoundProtocol("clear-nasal-spray-bottles")
  assert.equal(bottle.id, "clear-nasal-spray-bottles")
  assert.equal(bottle.supplyGuide?.isHardware, true)
  assert.ok(bottle.supplyGuide?.specs["Pump Output"]?.includes("0.10 mL"))
  assert.ok(bottle.supplyGuide?.specs["Neck & Thread"]?.includes("18/410"))
  assert.ok(bottle.supplyGuide?.specs["Material Clarity"]?.includes("High-Clarity PET"))
})

test("anti-hallucination guard: supply aliases resolve directly without generic peptide fallback", () => {
  const aliases = [
    "bac-water",
    "bacwater",
    "reconstitution-set",
    "reconstitution-kit",
    "insulin-pen",
    "metal-insulin-pen",
    "vial-organizer-box-50",
    "mixed-vial-box",
    "nasal-spray-bottles",
  ]

  for (const alias of aliases) {
    const proto = getCompoundProtocol(alias)
    assert.equal(proto.category, "Laboratory Supplies", `Alias ${alias} should resolve to Laboratory Supplies`)
    assert.equal(proto.isSupply, true, `Alias ${alias} should have isSupply: true`)
    assert.notEqual(proto.id, "generic-peptide", `Alias ${alias} must not be generic-peptide`)
  }
})
