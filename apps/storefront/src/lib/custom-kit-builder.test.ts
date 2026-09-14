/**
 * @file    apps/storefront/src/lib/custom-kit-builder.test.ts
 * @module  CustomKitBuilderUnitTest
 * @purpose Unit test verification for stoichiometry calculations, cycle supplies, and commercial tier bundle discounts.
 * @contracts
 *   Test:    calculateStoichiometry · calculateCycleSupplies · calculateBundlePricing · parseNetMassMg
 */

import assert from "node:assert/strict"
import test from "node:test"
import {
  calculateBundlePricing,
  calculateCycleSupplies,
  calculateStoichiometry,
  parseNetMassMg,
} from "../modules/custom-kit-builder/utils/stoichiometry.ts"
import type { KitCompoundConfig } from "../modules/custom-kit-builder/types.ts"

test("parseNetMassMg correctly extracts milligrams from diverse compound titles", () => {
  assert.equal(parseNetMassMg("Tirzepatide 10MG"), 10)
  assert.equal(parseNetMassMg("BPC-157 5mg Lyophilized Vial"), 5)
  assert.equal(parseNetMassMg("Glutathione 1500mg"), 1500)
  assert.equal(parseNetMassMg("GHK-Cu 100mg Standard"), 100)
  assert.equal(parseNetMassMg("Semaglutide", "15mg (3x 5mg)"), 15)
  assert.equal(parseNetMassMg("Unknown Compound"), 10) // default fallback
})

test("calculateStoichiometry yields exact in-vitro concentration and U-100 syringe units", () => {
  // Test case 1: 10mg compound in 2.0mL BAC water with 500mcg target dose
  const stoich1 = calculateStoichiometry({
    netMassMg: 10,
    diluentVolumeMl: 2.0,
    targetDoseMcg: 500,
  })

  assert.equal(stoich1.concentrationMgMl, 5.0)
  assert.equal(stoich1.doseVolumeMl, 0.1)
  assert.equal(stoich1.syringeUnits, 10.0)
  assert.equal(stoich1.concentrationMcgPerTick, 50.0)
  assert.equal(stoich1.isOverCapacity, false)

  // Test case 2: 5mg compound in 1.0mL BAC water with 250mcg target dose
  const stoich2 = calculateStoichiometry({
    netMassMg: 5,
    diluentVolumeMl: 1.0,
    targetDoseMcg: 250,
  })

  assert.equal(stoich2.concentrationMgMl, 5.0)
  assert.equal(stoich2.doseVolumeMl, 0.05)
  assert.equal(stoich2.syringeUnits, 5.0)
  assert.equal(stoich2.isOverCapacity, false)
})

test("calculateCycleSupplies calculates precise vials, diluents, and SubQ hardware with 10% research buffer", () => {
  // 8 weeks cycle, 3 doses per week = 24 doses. Target dose: 500 mcg = 12 mg total.
  // 10mg vial: buffered = 12 * 1.1 = 13.2 mg -> 2 vials required.
  const supplies = calculateCycleSupplies({
    netMassMg: 10,
    targetDoseMcg: 500,
    frequencyPerWeek: 3,
    cycleWeeks: 8,
    packagingTier: "complete_subq",
  })

  assert.equal(supplies.totalDoses, 24)
  assert.equal(supplies.totalMgNeeded, 12.0)
  assert.equal(supplies.vialsRequired, 2)
  assert.equal(supplies.diluentVialsRequired, 2)
  // 24 + ceil(2.4) = 27
  assert.equal(supplies.syringesRequired, 27)
  assert.equal(supplies.alcoholPadsRequired, 27)
})

test("calculateBundlePricing computes accurate tiered savings: 0% for 1 vial, 10% for 2 vials, 15% for 3+ vials", () => {
  const createMockConfig = (id: string, title: string, price: number, massMg: number): KitCompoundConfig => ({
    slotId: id,
    product: { id: `prod_${id}`, title } as unknown as KitCompoundConfig["product"],
    variant: { id: `var_${id}`, title: `${massMg}MG`, calculated_price: { calculated_amount: price } } as unknown as KitCompoundConfig["variant"],
    netMassMg: massMg,
    diluentVolumeMl: 2.0,
    targetDoseMcg: 500,
    packagingTier: "vial_only",
    frequencyPerWeek: 1,
  })

  // 1 compound: ₱3,000 gross -> 0% discount -> ₱3,000 net
  const price1 = calculateBundlePricing({
    configs: [createMockConfig("1", "Tirzepatide", 3000, 10)],
    cycleWeeks: 4,
  })
  assert.equal(price1.discountPercent, 0)
  assert.equal(price1.discountAmount, 0)
  assert.equal(price1.bundleNetTotal, 3000)

  // 2 compounds: ₱3,000 + ₱2,000 = ₱5,000 gross -> 10% discount (₱500) -> ₱4,500 net
  const price2 = calculateBundlePricing({
    configs: [
      createMockConfig("1", "Tirzepatide", 3000, 10),
      createMockConfig("2", "BPC-157", 2000, 5),
    ],
    cycleWeeks: 4,
  })
  assert.equal(price2.discountPercent, 10)
  assert.equal(price2.discountAmount, 500)
  assert.equal(price2.bundleNetTotal, 4500)

  // 3 compounds: ₱3,000 + ₱2,000 + ₱5,000 = ₱10,000 gross -> 15% discount (₱1,500) -> ₱8,500 net
  const price3 = calculateBundlePricing({
    configs: [
      createMockConfig("1", "Tirzepatide", 3000, 10),
      createMockConfig("2", "BPC-157", 2000, 5),
      createMockConfig("3", "NAD+", 5000, 500),
    ],
    cycleWeeks: 4,
  })
  assert.equal(price3.discountPercent, 15)
  assert.equal(price3.discountAmount, 1500)
  assert.equal(price3.bundleNetTotal, 8500)
})
