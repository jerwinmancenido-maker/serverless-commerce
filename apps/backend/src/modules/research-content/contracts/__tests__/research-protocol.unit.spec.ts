import {
  AdminCreateResearchProtocol,
  RESEARCH_PROTOCOL_REQUIRED_DISCLAIMER,
} from "../research-protocol"

const validProtocol = () => ({
  protocol_key: "ghk-cu-laboratory-handling",
  title: "GHK-Cu laboratory handling",
  summary: "Controlled laboratory-reference content.",
  purpose: "Document product-linked laboratory handling.",
  evidence_scope: "formulation" as const,
  content: {
    compound_name: "GHK-Cu",
    short_introduction: "Customer-facing protocol introduction.",
    product_format: "Injectable",
    category: "Healing and tissue repair",
    research_use_label: "Research use only",
    last_reviewed_at: "2026-08-31",
    quick_reference: [
      {
        key: "typical-amount",
        label: "Typical amount",
        value: "Example merchant-authored range",
        description: null,
        evidence_label: "Community reference",
        reference_keys: ["reference-one"],
      },
    ],
    calculator: {
      enabled: true,
      title: "Reconstitution calculator",
      default_compound_mass: "10",
      compound_mass_unit: "mg" as const,
      default_final_volume_ml: "5",
      default_target_amount: "200",
      target_amount_unit: "mcg" as const,
      iu_per_mg: null,
      device_volume_ml: "0.1",
      device_label: "Metered pump",
      rounding_precision: 2,
      instructions: "Use the exact product strength and final volume.",
    },
    protocol_levels: [
      {
        key: "starter",
        title: "Starter",
        summary: null,
        duration: "8 weeks",
        interval: "2 weeks",
        applicability: "Linked format only",
        evidence_label: "Merchant reference",
        reference_keys: ["reference-one"],
        rows: [{ period: "Weeks 1-2", amount: "200", unit: "mcg" as const, frequency: "Once daily", notes: null }],
      },
    ],
    sections: [{ key: "about", title: "About this compound", body: "Structured customer content.", visible: true, position: 0, reference_keys: ["reference-one"] }],
    faqs: [{ key: "storage", question: "How is it stored?", answer: "Follow the storage section.", position: 0 }],
    research_purpose: "Define the bounded laboratory research purpose.",
    intended_application: "Analytical laboratory workflows only.",
    explicit_exclusions: "No human or veterinary use.",
    reference_quantities: [
      {
        label: "Reference material per assay",
        value: "5",
        unit: "mcg" as const,
        concentration: "1 mg/mL",
        conversion_basis: "1,000 mcg = 1 mg",
        laboratory_purpose: "Laboratory assay preparation",
        notes: null,
        product_format: null,
      },
    ],
    materials_and_equipment: [
      {
        name: "Reference material",
        inventory_item_id: null,
        quantity: {
          value: "5",
          unit: "mg" as const,
          concentration: "5 mg/mL",
          conversion_basis: "Manufacturer certificate of analysis",
        },
        equipment_notes: null,
      },
      {
        name: "Potency reference",
        inventory_item_id: null,
        quantity: {
          value: "500",
          unit: "IU" as const,
          concentration: null,
          conversion_basis: "Product-specific reference standard",
        },
        equipment_notes: null,
      },
    ],
    preparation_and_handling: "Follow the documented laboratory controls.",
    research_procedure: "Record observations without treatment claims.",
    storage_and_disposal: "Follow the product storage and laboratory disposal policy.",
    references: [
      {
        reference_key: "reference-one",
        title: "Analytical method reference",
        authors: null,
        published_at: null,
        url: "https://example.com/reference",
        doi: null,
        evidence_type: "analytical method",
        supported_claim: "Supports the stated laboratory method only.",
        customer_annotation: "Supports the preparation statement.",
      },
    ],
    disclaimer: RESEARCH_PROTOCOL_REQUIRED_DISCLAIMER,
  },
})

describe("research protocol contract", () => {
  it("preserves explicit units, concentration, and conversion context", () => {
    const parsed = AdminCreateResearchProtocol.parse(validProtocol())

    expect(parsed.content.materials_and_equipment[0].quantity).toEqual({
      value: "5",
      unit: "mg",
      concentration: "5 mg/mL",
      conversion_basis: "Manufacturer certificate of analysis",
    })
    expect(parsed.content.materials_and_equipment[1].quantity).toEqual({
      value: "500",
      unit: "IU",
      concentration: null,
      conversion_basis: "Product-specific reference standard",
    })
    expect(parsed.content.reference_quantities[0]).toEqual({
      label: "Reference material per assay",
      value: "5",
      unit: "mcg",
      concentration: "1 mg/mL",
      conversion_basis: "1,000 mcg = 1 mg",
      laboratory_purpose: "Laboratory assay preparation",
      notes: null,
      product_format: null,
    })
  })

  it("accepts a standalone protocol without a product", () => {
    const parsed = AdminCreateResearchProtocol.parse(validProtocol())

    expect(parsed.protocol_key).toBe("ghk-cu-laboratory-handling")
    expect(parsed).not.toHaveProperty("product_id")
  })

  it("requires a non-empty research-use disclaimer", () => {
    const input = validProtocol()
    input.content.disclaimer = ""

    expect(() => AdminCreateResearchProtocol.parse(input)).toThrow()
  })

  it("accepts structured customer protocol levels and calculator settings", () => {
    const parsed = AdminCreateResearchProtocol.parse(validProtocol())

    expect(parsed.content.protocol_levels[0].rows[0].frequency).toBe("Once daily")
    expect(parsed.content.calculator.device_label).toBe("Metered pump")
  })

  it("rejects unsupported or ambiguous quantity units", () => {
    const input = validProtocol()
    input.content.materials_and_equipment[0].quantity!.unit = "units" as "mg"

    expect(() => AdminCreateResearchProtocol.parse(input)).toThrow()
  })
})
