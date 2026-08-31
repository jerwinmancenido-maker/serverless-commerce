import { calculateProtocol } from "./calculate-protocol.ts"
import assert from "node:assert/strict"
import test from "node:test"

test("protocol calculator preserves explicit mass and volume conversions", () => {
  assert.deepEqual(calculateProtocol({ compoundMass: 10, compoundMassUnit: "mg", finalVolumeMl: 5, targetAmount: 200, targetAmountUnit: "mcg", deviceVolumeMl: 0.1 }), { concentrationMgPerMl: 2, volumeMl: 0.1, deviceMeasurements: 1, usesPerContainer: 50 })
})

test("protocol calculator requires an explicit IU conversion", () => {
  assert.equal(calculateProtocol({ compoundMass: 1_000, compoundMassUnit: "IU", finalVolumeMl: 1, targetAmount: 100, targetAmountUnit: "IU" }), null)
  assert.equal(calculateProtocol({ compoundMass: 1_000, compoundMassUnit: "IU", finalVolumeMl: 1, targetAmount: 100, targetAmountUnit: "IU", iuPerMg: 1_000 })?.usesPerContainer, 10)
})
