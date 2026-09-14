import { calculateProtocol } from "./calculate-protocol.ts"
import assert from "node:assert/strict"
import test from "node:test"

test("protocol calculator preserves explicit mass and volume conversions", () => {
  assert.deepEqual(
    calculateProtocol({
      compoundMass: 10,
      compoundMassUnit: "mg",
      finalVolumeMl: 5,
      targetAmount: 200,
      targetAmountUnit: "mcg",
      deviceVolumeMl: 0.1,
    }),
    {
      concentrationMgPerMl: 2,
      concentrationIuPerMl: null,
      volumeMl: 0.1,
      deviceMeasurements: 1,
      usesPerContainer: 50,
    }
  )
})

test("protocol calculator accurately calculates Botulinum 100 IU reconstitution volume", () => {
  // Botulinum: 100 IU in 2.5 mL -> 40 IU/mL. Target: 10 IU -> 0.25 mL
  const result = calculateProtocol({
    compoundMass: 100,
    compoundMassUnit: "IU",
    finalVolumeMl: 2.5,
    targetAmount: 10,
    targetAmountUnit: "IU",
  })
  assert.ok(result)
  assert.equal(result.concentrationIuPerMl, 40)
  assert.equal(result.volumeMl, 0.25)
  assert.equal(result.usesPerContainer, 10)
})

test("protocol calculator accurately calculates hCG 10,000 IU reconstitution volume", () => {
  // hCG: 10,000 IU in 2.0 mL -> 5,000 IU/mL. Target: 500 IU -> 0.10 mL
  const result = calculateProtocol({
    compoundMass: 10000,
    compoundMassUnit: "IU",
    finalVolumeMl: 2.0,
    targetAmount: 500,
    targetAmountUnit: "IU",
  })
  assert.ok(result)
  assert.equal(result.concentrationIuPerMl, 5000)
  assert.equal(result.volumeMl, 0.1)
  assert.equal(result.usesPerContainer, 20)
})

test("protocol calculator accurately calculates EPO 3,000 IU reconstitution volume", () => {
  // EPO: 3,000 IU in 1.0 mL -> 3,000 IU/mL. Target: 100 IU -> 0.0333 mL
  const result = calculateProtocol({
    compoundMass: 3000,
    compoundMassUnit: "IU",
    finalVolumeMl: 1.0,
    targetAmount: 100,
    targetAmountUnit: "IU",
  })
  assert.ok(result)
  assert.equal(result.concentrationIuPerMl, 3000)
  assert.ok(Math.abs(result.volumeMl - 0.03333333333333333) < 0.0001)
  assert.equal(result.usesPerContainer, 30)
})
