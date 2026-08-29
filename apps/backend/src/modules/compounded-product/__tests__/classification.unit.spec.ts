import {
  AdminCreateCompoundedProductClassificationMapping,
  AdminTransitionCompoundedProductClassificationMapping,
} from "../contracts/classification"

describe("compounded product classification mapping contract", () => {
  it("accepts stable product-type and presentation identifiers", () => {
    expect(
      AdminCreateCompoundedProductClassificationMapping.parse({
        product_type_id: "ptyp_governed",
        presentation_id: "cpres_nasal",
        reason: "Govern this configurable presentation",
      }),
    ).toEqual({
      product_type_id: "ptyp_governed",
      presentation_id: "cpres_nasal",
      reason: "Govern this configurable presentation",
    })
  })

  it("rejects no-op lifecycle transitions", () => {
    expect(() =>
      AdminTransitionCompoundedProductClassificationMapping.parse({
        expected_status: "active",
        target_status: "active",
        reason: "No effective change",
      }),
    ).toThrow("Classification mapping status must change")
  })

  it("rejects transitions without an operational reason", () => {
    expect(() =>
      AdminTransitionCompoundedProductClassificationMapping.parse({
        expected_status: "active",
        target_status: "inactive",
        reason: "x",
      }),
    ).toThrow()
  })
})
