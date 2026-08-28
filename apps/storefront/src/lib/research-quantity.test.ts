import assert from "node:assert/strict"
import test from "node:test"

import {
  convertResearchDisplayQuantityToBaseUnits,
  formatResearchQuantity,
  parseResearchUnitProfile,
  serializeResearchUnitProfile,
} from "./research-quantity.ts"

test("formats fixed mass and volume profiles", () => {
  assert.equal(
    formatResearchQuantity(10_000, {
      base_unit: "microgram",
      display_unit: "mg",
      base_units_per_display_unit: 1_000,
      display_precision: 2,
    }),
    "10 mg",
  )
  assert.equal(
    formatResearchQuantity(2_500, {
      base_unit: "microliter",
      display_unit: "mL",
      base_units_per_display_unit: 1_000,
      display_precision: 3,
    }),
    "2.5 mL",
  )
})

test("uses the explicit product profile for IU", () => {
  const profile = {
    base_unit: "microliter" as const,
    display_unit: "IU" as const,
    base_units_per_display_unit: 10,
    display_precision: 0,
  }

  assert.equal(formatResearchQuantity(500, profile), "50 IU")
  assert.equal(convertResearchDisplayQuantityToBaseUnits(50, profile), 500)
})

test("rejects fractional base-unit results", () => {
  assert.equal(
    convertResearchDisplayQuantityToBaseUnits(0.0005, {
      base_unit: "microliter",
      display_unit: "mL",
      base_units_per_display_unit: 1_000,
      display_precision: 4,
    }),
    null,
  )
})

test("round-trips a verified form unit profile", () => {
  const profile = {
    base_unit: "microgram" as const,
    display_unit: "mcg" as const,
    base_units_per_display_unit: 1,
    display_precision: 0,
  }

  assert.deepEqual(parseResearchUnitProfile(serializeResearchUnitProfile(profile)), profile)
})
