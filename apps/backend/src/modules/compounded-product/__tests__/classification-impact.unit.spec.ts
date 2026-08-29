import { MedusaError } from "@medusajs/framework/utils"

import {
  assertCompoundedProductClassificationDecision,
  createCompoundedProductClassificationImpact,
} from "../classification-impact"

const impact = (
  overrides: Partial<
    Parameters<typeof createCompoundedProductClassificationImpact>[0]
  > = {},
) =>
  createCompoundedProductClassificationImpact({
    productId: "prod_1",
    registrationId: "cpreg_1",
    action: "reclassify",
    currentProductTypeId: "pt_vial",
    targetProductTypeId: "pt_nasal",
    targetTypeIsGoverned: true,
    productStatus: "draft",
    registrationState: "draft",
    wasPublished: false,
    variantCount: 2,
    orderLineItemCount: 0,
    ...overrides,
  })

describe("compounded product classification impact", () => {
  it("allows an exact impact-reviewed move between governed types", () => {
    const result = impact()

    expect(result.allowed).toBe(true)
    expect(result.blockers).toEqual([])
    expect(result.impact_fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(() =>
      assertCompoundedProductClassificationDecision({
        expectedFingerprint: result.impact_fingerprint,
        impact: result,
      }),
    ).not.toThrow()
  })

  it("allows removal only into a standard type", () => {
    const result = impact({
      action: "remove_governance",
      targetProductTypeId: "pt_supply",
      targetTypeIsGoverned: false,
    })

    expect(result.allowed).toBe(true)
  })

  it("blocks historical publication, order use, and invalid targets", () => {
    const result = impact({
      action: "remove_governance",
      targetTypeIsGoverned: true,
      wasPublished: true,
      orderLineItemCount: 1,
    })

    expect(result.allowed).toBe(false)
    expect(result.blockers).toEqual([
      "already_published",
      "ordered_variant_exists",
      "target_type_must_be_standard",
    ])
    expect(() =>
      assertCompoundedProductClassificationDecision({
        expectedFingerprint: result.impact_fingerprint,
        impact: result,
      }),
    ).toThrow(MedusaError)
  })

  it("rejects stale impact confirmation", () => {
    expect(() =>
      assertCompoundedProductClassificationDecision({
        expectedFingerprint: "a".repeat(64),
        impact: impact(),
      }),
    ).toThrow("classification_impact_changed")
  })
})
