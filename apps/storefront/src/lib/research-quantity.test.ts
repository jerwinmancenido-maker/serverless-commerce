import assert from "node:assert/strict"
import test from "node:test"

import {
  convertResearchDisplayQuantityToBaseUnits,
  formatPeptideDosage,
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
  assert.equal(
    formatResearchQuantity(2_000_000, {
      base_unit: "microgram",
      display_unit: "g",
      base_units_per_display_unit: 1_000_000,
      display_precision: 3,
    }),
    "2 g",
  )
  assert.equal(
    formatResearchQuantity(250, {
      base_unit: "microliter",
      display_unit: "µL",
      base_units_per_display_unit: 1,
      display_precision: 0,
    }),
    "250 µL",
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

test("defaults microgram to mg for standard peptides", () => {
  const fallbackProfile = {
    base_unit: "microgram" as const,
    display_unit: null,
    base_units_per_display_unit: null,
    display_precision: null,
  }

  // Without compound name, defaults to mg
  assert.equal(formatResearchQuantity(50_000, fallbackProfile), "50 mg")
  assert.equal(formatResearchQuantity(96_500, fallbackProfile), "96.5 mg")
  assert.equal(formatResearchQuantity(2_500, fallbackProfile), "2.5 mg")

  // With standard peptide compound names, formats as mg
  assert.equal(formatResearchQuantity(50_000, fallbackProfile, "Vial Only / 50 mg"), "50 mg")
  assert.equal(formatResearchQuantity(96_500, fallbackProfile, "GHK-Cu 50 mg"), "96.5 mg")
  assert.equal(formatResearchQuantity(10_000, fallbackProfile, "Tirzepatide 10mg"), "10 mg")
  assert.equal(formatResearchQuantity(5_000, fallbackProfile, "BPC-157 5mg"), "5 mg")
})

test("defaults microgram to mcg for Semax, Selank, and DSIP", () => {
  const fallbackProfile = {
    base_unit: "microgram" as const,
    display_unit: null,
    base_units_per_display_unit: null,
    display_precision: null,
  }

  // Semax
  assert.equal(formatResearchQuantity(500, fallbackProfile, "Semax 10mg Nasal Spray"), "500 mcg")
  assert.equal(formatResearchQuantity(1_000, fallbackProfile, "Semax"), "1,000 mcg")

  // Selank
  assert.equal(formatResearchQuantity(250, fallbackProfile, "Selank 0.15%"), "250 mcg")

  // DSIP
  assert.equal(formatResearchQuantity(500, fallbackProfile, "DSIP 2mg"), "500 mcg")

  // Explicit mcg in title
  assert.equal(formatResearchQuantity(200, fallbackProfile, "Custom Blend 200mcg"), "200 mcg")
})

test("formatPeptideDosage normalizes dosages across <1000mcg and >=1000mcg thresholds", () => {
  // < 1000 mcg -> strictly mcg (never fractional mg)
  assert.deepEqual(formatPeptideDosage(200, "mcg"), {
    amount: "200",
    unit: "mcg",
    formatted: "200 mcg",
  })
  assert.deepEqual(formatPeptideDosage(250, "mcg"), {
    amount: "250",
    unit: "mcg",
    formatted: "250 mcg",
  })
  assert.deepEqual(formatPeptideDosage(500, "mcg"), {
    amount: "500",
    unit: "mcg",
    formatted: "500 mcg",
  })
  assert.deepEqual(formatPeptideDosage(999, "mcg"), {
    amount: "999",
    unit: "mcg",
    formatted: "999 mcg",
  })

  // Inverse normalization: < 1 mg specified in mg -> normalized to mcg (e.g. 0.2 mg -> 200 mcg)
  assert.deepEqual(formatPeptideDosage(0.2, "mg"), {
    amount: "200",
    unit: "mcg",
    formatted: "200 mcg",
  })
  assert.deepEqual(formatPeptideDosage("0.25", "mg"), {
    amount: "250",
    unit: "mcg",
    formatted: "250 mcg",
  })

  // >= 1000 mcg -> strictly mg (never thousands of mcg)
  assert.deepEqual(formatPeptideDosage(1000, "mcg"), {
    amount: "1",
    unit: "mg",
    formatted: "1 mg",
  })
  assert.deepEqual(formatPeptideDosage(1250, "mcg"), {
    amount: "1.25",
    unit: "mg",
    formatted: "1.25 mg",
  })
  assert.deepEqual(formatPeptideDosage(2500, "mcg"), {
    amount: "2.5",
    unit: "mg",
    formatted: "2.5 mg",
  })
  assert.deepEqual(formatPeptideDosage(5000, "mcg"), {
    amount: "5",
    unit: "mg",
    formatted: "5 mg",
  })
  assert.deepEqual(formatPeptideDosage("5000", "mcg"), {
    amount: "5",
    unit: "mg",
    formatted: "5 mg",
  })
  assert.deepEqual(formatPeptideDosage(7500, "mcg"), {
    amount: "7.5",
    unit: "mg",
    formatted: "7.5 mg",
  })
  assert.deepEqual(formatPeptideDosage(10000, "mcg"), {
    amount: "10",
    unit: "mg",
    formatted: "10 mg",
  })
  assert.deepEqual(formatPeptideDosage(15000, "mcg"), {
    amount: "15",
    unit: "mg",
    formatted: "15 mg",
  })

  // Fallback for invalid or 0
  assert.deepEqual(formatPeptideDosage(0, "mcg"), {
    amount: "0",
    unit: "mcg",
    formatted: "0 mcg",
  })
})
