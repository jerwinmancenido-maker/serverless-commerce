/**
 * @file    apps/backend/src/admin/routes/compounded-products/[id]/__tests__/kit-template-matcher.unit.spec.ts
 * @module  KitTemplateMatcherUnitSpec
 * @purpose Unit test verifying clinical dosage and kit tier variant sorting in Compounded Products BOM Matrix.
 */

import {
  extractDosageMg,
  getKitTypeTier,
  sortCompoundedProductVariants,
} from "../kit-template-matcher"

describe("kit-template-matcher variant sorting", () => {
  it("extracts numeric dosage in milligrams accurately", () => {
    expect(extractDosageMg("10MG / Vial")).toBe(10)
    expect(extractDosageMg("50mg / Complete SubQ Set")).toBe(50)
    expect(extractDosageMg("2.5MG / Vial")).toBe(2.5)
    expect(extractDosageMg("500mcg / Lyophilized Powder")).toBe(0.5)
    expect(extractDosageMg("1g / Bulk")).toBe(1000)
    expect(extractDosageMg("Lyophilized Powder Only")).toBe(0)
  })

  it("determines kit tiers in clinical progression", () => {
    expect(getKitTypeTier("10MG / Vial")).toBe(1)
    expect(getKitTypeTier("10MG / Vial + BAC")).toBe(2)
    expect(getKitTypeTier("10MG / Complete SubQ Set")).toBe(3)
  })

  it("sorts jumbled variants into canonical clinical order (BPC-157 6-variant test)", () => {
    const jumbledVariants = [
      { id: "v1", title: "10MG / Vial", prices: [{ amount: 1000 }] },
      { id: "v2", title: "50MG / Complete SubQ Set", prices: [{ amount: 5200 }] },
      { id: "v3", title: "10MG / Vial + BAC", prices: [{ amount: 1100 }] },
      { id: "v4", title: "10MG / Complete SubQ Set", prices: [{ amount: 1200 }] },
      { id: "v5", title: "50MG / Vial", prices: [{ amount: 5000 }] },
      { id: "v6", title: "50MG / Vial + BAC", prices: [{ amount: 5100 }] },
    ]

    const sorted = sortCompoundedProductVariants(jumbledVariants)

    expect(sorted.map((v) => v.title)).toEqual([
      "10MG / Vial",
      "10MG / Vial + BAC",
      "10MG / Complete SubQ Set",
      "50MG / Vial",
      "50MG / Vial + BAC",
      "50MG / Complete SubQ Set",
    ])
  })

  it("handles decimal dosages and price tiebreaking properly", () => {
    const variants = [
      { id: "v1", title: "5MG / Vial", prices: [{ amount: 700 }] },
      { id: "v2", title: "2.5MG / Vial", prices: [{ amount: 450 }] },
      { id: "v3", title: "10MG / Vial", prices: [{ amount: 1200 }] },
    ]

    const sorted = sortCompoundedProductVariants(variants)

    expect(sorted.map((v) => v.title)).toEqual([
      "2.5MG / Vial",
      "5MG / Vial",
      "10MG / Vial",
    ])
  })

  it("calculates reference component unit costs accurately for gross margin modeling", () => {
    const { estimateComponentUnitCost } = require("../kit-template-matcher")
    expect(estimateComponentUnitCost("BPC-157 10mg Lyophilized Vial")).toBe(450)
    expect(estimateComponentUnitCost("Bacteriostatic Water 30ml")).toBe(120)
    expect(estimateComponentUnitCost("1ml LDS Syringe 31G")).toBe(15)
    expect(estimateComponentUnitCost("Alcohol Prep Swabs")).toBe(2.5)
    expect(estimateComponentUnitCost("Protective Mailer Box", "packaging")).toBe(45)
    expect(estimateComponentUnitCost("Custom Research Auxiliary")).toBe(50)
  })

  it("detects component roles accurately for visual BOM breakdown", () => {
    const { detectComponentRole } = require("../kit-template-matcher")
    expect(detectComponentRole("BPC-157 10mg Vial")).toBe("finished_product")
    expect(detectComponentRole("Bacteriostatic Water 30ml")).toBe("diluent")
    expect(detectComponentRole("1ml LDS Syringe 31G")).toBe("syringe")
    expect(detectComponentRole("Alcohol Prep Pad")).toBe("sanitization")
    expect(detectComponentRole("Protective Mailer Box", "packaging")).toBe("packaging")
    expect(detectComponentRole("General Item")).toBe("other")
  })
})
