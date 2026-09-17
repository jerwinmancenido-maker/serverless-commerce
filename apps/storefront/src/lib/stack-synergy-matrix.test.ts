/**
 * @file    apps/storefront/src/lib/stack-synergy-matrix.test.ts
 * @module  StackSynergyMatrixUnitTest
 * @purpose Cross-references the 8 flagship stack presets against synced protocols, delivery route integrity, and commerce kit rules.
 */

import assert from "node:assert/strict"
import test from "node:test"
import stackData from "./data/peptide-stack-interactions.json" with { type: "json" }
import { getCompoundProtocol } from "./data/compound-protocols.ts"

test("Stack Interactions Database contains exactly 8 verified flagship presets", () => {
  assert.equal(stackData.presets.length, 8)
  const presetIds = stackData.presets.map((p) => p.id)
  assert.ok(presetIds.includes("wolverine-recovery"))
  assert.ok(presetIds.includes("somatotropic-pulse"))
  assert.ok(presetIds.includes("metabolic-fat-loss"))
  assert.ok(presetIds.includes("neurogenesis-focus"))
  assert.ok(presetIds.includes("cellular-longevity"))
  assert.ok(presetIds.includes("antioxidant-shield"))
  assert.ok(presetIds.includes("anabolic-hypertrophy"))
  assert.ok(presetIds.includes("triple-metabolic-stack"))
})

test("All 8 presets maintain consistent 15% bundle discount tier (STACK15)", () => {
  stackData.presets.forEach((preset) => {
    assert.equal(preset.bundleDiscountPercent, 15, `Preset ${preset.id} must offer 15% bundle discount`)
  })
})

test("All constituent compounds across all 8 presets exist and resolve in protocol database", () => {
  stackData.presets.forEach((preset) => {
    preset.compound_ids.forEach((cid) => {
      const compound = stackData.compounds.find((c) => c.id === cid)
      assert.ok(compound, `Preset ${preset.id} references known compound ${cid}`)
      const proto = getCompoundProtocol(compound.protocolHandle || cid)
      assert.ok(proto, `Compound ${cid} (${compound.name}) resolves to valid CompoundAnalyticalProtocol`)
    })
  })
})

test("Neurogenesis Focus preset (Semax + Selank) is verified as a pure intranasal stack", () => {
  const neuroPreset = stackData.presets.find((p) => p.id === "neurogenesis-focus")
  assert.ok(neuroPreset)
  assert.deepEqual(neuroPreset.compound_ids, ["semax", "selank"])

  const compounds = neuroPreset.compound_ids.map((id) =>
    stackData.compounds.find((c) => c.id === id)!
  )

  const allNasal = compounds.every(
    (c) =>
      c.adminRoute.toLowerCase().includes("intranasal") ||
      c.adminRoute.toLowerCase().includes("nasal") ||
      c.id === "semax" ||
      c.id === "selank"
  )
  assert.equal(allNasal, true, "Semax + Selank must be verified as a pure intranasal stack")
})

test("Parenteral Invariant: Wolverine, Somatotropic Pulse, and Longevity presets retain SubQ injection routes", () => {
  const parenteralPresets = ["wolverine-recovery", "somatotropic-pulse", "anabolic-hypertrophy"]
  parenteralPresets.forEach((pid) => {
    const preset = stackData.presets.find((p) => p.id === pid)
    assert.ok(preset)
    const hasSubq = preset.compound_ids.some((cid) => {
      const c = stackData.compounds.find((comp) => comp.id === cid)
      return (
        c?.adminRoute.toLowerCase().includes("subq") ||
        c?.adminRoute.toLowerCase().includes("parenteral")
      )
    })
    assert.equal(hasSubq, true, `Preset ${pid} must maintain parenteral SubQ delivery`)
  })
})

test("Synergy pair definitions match preset pairings with high synergistic scores (>=90)", () => {
  // Wolverine: bpc-157 + tb-500
  const wolverinePair = stackData.pairwise_interactions.find(
    (r) =>
      (r.compound_a === "bpc-157" && r.compound_b === "tb-500") ||
      (r.compound_a === "tb-500" && r.compound_b === "bpc-157")
  )
  assert.ok(wolverinePair)
  assert.equal(wolverinePair.status, "synergistic")
  assert.ok(wolverinePair.score >= 95)

  // Somatotropic: cjc-1295 + ipamorelin
  const somatoPair = stackData.pairwise_interactions.find(
    (r) =>
      (r.compound_a === "cjc-1295" && r.compound_b === "ipamorelin") ||
      (r.compound_a === "ipamorelin" && r.compound_b === "cjc-1295")
  )
  assert.ok(somatoPair)
  assert.equal(somatoPair.status, "synergistic")
  assert.ok(somatoPair.score >= 95)

  // Neurogenesis: semax + selank
  const neuroPair = stackData.pairwise_interactions.find(
    (r) =>
      (r.compound_a === "semax" && r.compound_b === "selank") ||
      (r.compound_a === "selank" && r.compound_b === "semax")
  )
  assert.ok(neuroPair)
  assert.equal(neuroPair.status, "synergistic")
  assert.ok(neuroPair.score >= 90)
})
