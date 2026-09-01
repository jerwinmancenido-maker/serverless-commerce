import { calculateResearchSnapshot } from "../contracts/calculations"

describe("Research Hub calculation snapshots", () => {
  it("preserves explicit mg, mL and device-unit context", () => {
    expect(calculateResearchSnapshot({
      compound_mass: "10",
      compound_mass_unit: "mg",
      final_volume_ml: "2",
      target_amount: "250",
      target_amount_unit: "mcg",
      comparison_target_amount: null,
      iu_per_mg: null,
      device_volume_ml: "0.01",
      device_label: "U-100 syringe units",
      rounding_precision: 2,
    })).toEqual({
      concentration_mg_per_ml: "5",
      volume_ml: "0.05",
      device_measurements: "5",
      uses_per_container: "40",
      comparison_volume_ml: null,
      comparison_device_measurements: null,
    })
  })

  it("calculates both targets in comparison mode", () => {
    const result = calculateResearchSnapshot({
      compound_mass: "10",
      compound_mass_unit: "mg",
      final_volume_ml: "2",
      target_amount: "250",
      target_amount_unit: "mcg",
      comparison_target_amount: "500",
      iu_per_mg: null,
      device_volume_ml: "0.01",
      device_label: "U-100 syringe units",
      rounding_precision: 2,
    })
    expect(result.comparison_volume_ml).toBe("0.1")
    expect(result.comparison_device_measurements).toBe("10")
  })

  it("requires an explicit IU conversion", () => {
    expect(() => calculateResearchSnapshot({
      compound_mass: "1000",
      compound_mass_unit: "IU",
      final_volume_ml: "1",
      target_amount: "100",
      target_amount_unit: "IU",
      comparison_target_amount: null,
      iu_per_mg: null,
      device_volume_ml: null,
      device_label: null,
      rounding_precision: 2,
    })).toThrow("calculation_input_invalid")
  })
})
