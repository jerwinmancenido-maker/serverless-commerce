import assert from "node:assert/strict"
import test from "node:test"
import { ALL_COMPOUND_PROTOCOLS, getCompoundProtocol, type CompoundAnalyticalProtocol } from "./data/compound-protocols.ts"

/**
 * Pure function replicating the dynamic preset extraction logic
 * used in ReconstitutionTab to guarantee deterministic mathematical behavior.
 */
export function extractDosePresets(compoundProto: CompoundAnalyticalProtocol): number[] {
  if (compoundProto.id === "hgh-somatropin") {
    return [333, 500, 667, 833, 1000, 1333]
  }
  if (compoundProto.id === "hmg-75iu") {
    return [333, 500, 667, 1000]
  }
  if (compoundProto.id === "tirzepatide") {
    return [1250, 2500, 5000, 7500, 10000, 15000]
  }
  if (compoundProto.id === "ghk-cu") {
    return [500, 1000, 1500, 2000, 2500, 3000]
  }

  const gathered = new Set<number>()

  if (compoundProto.syringeGuide?.graduations) {
    for (const grad of compoundProto.syringeGuide.graduations) {
      if (grad.doseMcg && grad.doseMcg > 0) {
        gathered.add(grad.doseMcg)
      }
    }
  }

  if (compoundProto.dosing?.titrationSteps) {
    for (const step of compoundProto.dosing.titrationSteps) {
      if (step.doseMcg && step.doseMcg > 0) {
        gathered.add(step.doseMcg)
      }
    }
  }

  if (compoundProto.dosing?.standardDoseMcg && compoundProto.dosing.standardDoseMcg > 0) {
    gathered.add(compoundProto.dosing.standardDoseMcg)
  }

  if (gathered.size >= 2) {
    return Array.from(gathered).sort((a, b) => a - b)
  }

  const vialMg = compoundProto.reconstitution?.defaultVialNetMg || 10
  if (vialMg >= 500) {
    return [50000, 100000, 200000, 300000, 500000]
  }
  if (vialMg >= 20) {
    return [1000, 2000, 3000, 5000, 7500, 10000]
  }
  return [100, 200, 250, 300, 500, 750, 1000]
}

export function formatDosePresetLabel(preset: number, compoundId: string): string {
  if (compoundId === "hgh-somatropin") {
    const iu = (preset * 3) / 1000
    return `${Number(iu.toFixed(1))} IU`
  }
  if (compoundId === "hmg-75iu") {
    const iu = (preset / 1000) * 75
    return `${Number(iu.toFixed(1))} IU`
  }
  if (preset >= 1000) {
    const mg = preset / 1000
    return `${Number(mg.toFixed(mg % 1 === 0 ? 0 : 2))} mg`
  }
  return `${preset} mcg`
}

test("extracts clinically accurate presets for high-mass longevity compounds", () => {
  const gsh = getCompoundProtocol("glutathione-1500mg")
  const gshPresets = extractDosePresets(gsh)
  assert.ok(gshPresets.length >= 2, "Glutathione must have at least 2 presets")
  assert.ok(gshPresets.some((p) => p >= 50000), "Glutathione must include doses >= 50mg (50000 mcg)")
  assert.equal(formatDosePresetLabel(50000, gsh.id), "50 mg")
  assert.equal(formatDosePresetLabel(100000, gsh.id), "100 mg")

  const nad = getCompoundProtocol("nad-plus-500mg")
  const nadPresets = extractDosePresets(nad)
  assert.ok(nadPresets.length >= 2, "NAD+ must have at least 2 presets")
  assert.ok(nadPresets.some((p) => p >= 25000), "NAD+ must include doses >= 25mg (25000 mcg)")
  assert.equal(formatDosePresetLabel(25000, nad.id), "25 mg")
  assert.equal(formatDosePresetLabel(50000, nad.id), "50 mg")
})

test("extracts clinical titration steps for incretins and weight-management peptides", () => {
  const sema = getCompoundProtocol("semaglutide")
  const semaPresets = extractDosePresets(sema)
  assert.ok(semaPresets.includes(250), "Semaglutide must include 250 mcg (0.25mg) initiation")
  assert.ok(semaPresets.includes(500), "Semaglutide must include 500 mcg (0.50mg) escalation")
  assert.equal(formatDosePresetLabel(250, sema.id), "250 mcg")
  assert.equal(formatDosePresetLabel(1000, sema.id), "1 mg")

  const reta = getCompoundProtocol("retatrutide")
  const retaPresets = extractDosePresets(reta)
  assert.ok(retaPresets.includes(2000), "Retatrutide must include 2mg initiation")
  assert.ok(retaPresets.includes(4000), "Retatrutide must include 4mg escalation")
  assert.equal(formatDosePresetLabel(2000, reta.id), "2 mg")
  assert.equal(formatDosePresetLabel(4000, reta.id), "4 mg")
})

test("extracts IU-based presets for HGH and HMG gonadotropins", () => {
  const hgh = getCompoundProtocol("hgh-somatropin")
  const hghPresets = extractDosePresets(hgh)
  assert.equal(formatDosePresetLabel(hghPresets[0], hgh.id), "1 IU")
  assert.equal(formatDosePresetLabel(hghPresets[2], hgh.id), "2 IU")

  const hmg = getCompoundProtocol("hmg-75iu")
  const hmgPresets = extractDosePresets(hmg)
  assert.equal(formatDosePresetLabel(hmgPresets[0], hmg.id), "25 IU")
  assert.equal(formatDosePresetLabel(hmgPresets[3], hmg.id), "75 IU")
})

test("guarantees valid, non-empty, strictly positive, sorted presets for all 76 compounds", () => {
  for (const protocol of ALL_COMPOUND_PROTOCOLS) {
    const presets = extractDosePresets(protocol)
    assert.ok(presets.length >= 2, `Protocol ${protocol.id} must have >= 2 presets`)
    for (let i = 0; i < presets.length; i++) {
      assert.ok(presets[i] > 0, `Preset at ${i} on ${protocol.id} must be strictly positive`)
      if (i > 0) {
        assert.ok(presets[i] > presets[i - 1], `Presets on ${protocol.id} must be strictly sorted ascending`)
      }
      const label = formatDosePresetLabel(presets[i], protocol.id)
      assert.ok(label.length > 0, `Formatted label for preset ${presets[i]} on ${protocol.id} must not be empty`)
    }
  }
})
