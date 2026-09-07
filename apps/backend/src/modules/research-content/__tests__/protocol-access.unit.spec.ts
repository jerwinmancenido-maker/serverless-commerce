import type { ResearchProtocolContent } from "../contracts/research-protocol"
import {
  buildPublicResearchProtocolContent,
  DEFAULT_RESEARCH_PROTOCOL_VISIBILITY,
  isProtocolCommunityEligible,
} from "../protocol-access"

const content: ResearchProtocolContent = {
  compound_name: "Example Compound",
  short_introduction: "A public introduction.",
  product_format: "Injectable",
  category: "Metabolic research",
  protocol_category_type: "single_peptide",
  full_description: "Full research description.",
  investigated_benefits: ["Improved insulin sensitivity"],
  adverse_observations: ["Transient gastrointestinal symptoms"],
  molecular_details: {
    cas_number: "123-45-6",
    pubchem_cid: 123456,
    sequence_or_formula: "A-B-C",
    molecular_weight_g_per_mol: 1000.5,
  },
  reconstitution_details: {
    default_vial_net_mg: 10,
    default_diluent_ml: 2,
    solvent: "Bacteriostatic Water",
    dissolution_method: "Swirl gently",
    resulting_concentration_mg_per_ml: 5,
    handling_rule: "Inspect visually",
  },
  storage_details: {
    lyophilized: "-20C",
    reconstituted: "2-8C",
    light_protection: true,
  },
  purity_standard: null,
  research_use_label: "Research use only",
  last_reviewed_at: "2026-08-31",
  quick_reference: [
    {
      key: "amount",
      label: "Amount",
      value: "Private amount",
      description: null,
      evidence_label: null,
      reference_keys: [],
    },
  ],
  calculator: {
    enabled: true,
    title: "Private calculator",
    default_compound_mass: "10",
    compound_mass_unit: "mg",
    default_final_volume_ml: "2",
    default_target_amount: "250",
    target_amount_unit: "mcg",
    iu_per_mg: null,
    device_volume_ml: "1",
    device_label: "Device",
    rounding_precision: 2,
    instructions: "Private instructions",
  },
  protocol_levels: [
    {
      key: "private-level",
      title: "Private schedule",
      summary: null,
      duration: null,
      interval: null,
      applicability: null,
      evidence_label: null,
      reference_keys: [],
      routine_enabled: true,
      rows: [],
    },
  ],
  sections: [
    {
      key: "public-about",
      title: "About",
      body: "Public section",
      visible: true,
      position: 0,
      reference_keys: [],
    },
    {
      key: "private-preparation",
      title: "Preparation",
      body: "Private preparation",
      visible: true,
      position: 1,
      reference_keys: [],
    },
  ],
  faqs: [{ key: "faq", question: "Question", answer: "Answer", position: 0 }],
  research_purpose: "Private purpose",
  intended_application: "Private application",
  explicit_exclusions: null,
  reference_quantities: [],
  materials_and_equipment: [],
  preparation_and_handling: "Private preparation",
  research_procedure: "Private procedure",
  storage_and_disposal: "Private storage",
  references: [],
  disclaimer: "Research use only.",
}

describe("research protocol access projection", () => {
  it("includes complete workflow sections and calculator for public access by default", () => {
    const projection = buildPublicResearchProtocolContent(content, DEFAULT_RESEARCH_PROTOCOL_VISIBILITY)

    expect(projection.quick_reference).toHaveLength(1)
    expect(projection.sections).toHaveLength(2)
    expect(projection).toHaveProperty("calculator")
    expect(projection).toHaveProperty("protocol_levels")
    expect(projection).toHaveProperty("preparation_and_handling")
    expect(projection).toHaveProperty("research_procedure")
  })

  it("respects explicit purchaser restrictions in field_visibility", () => {
    const projection = buildPublicResearchProtocolContent(content, {
      ...DEFAULT_RESEARCH_PROTOCOL_VISIBILITY,
      field_visibility: {
        "calculator": "purchaser",
        "preparation_and_handling": "purchaser",
        "sections.private-preparation": "purchaser",
      },
    })

    expect(projection).not.toHaveProperty("calculator")
    expect(projection).not.toHaveProperty("preparation_and_handling")
    expect(projection.sections).toHaveLength(1)
    expect(projection.sections[0].key).toBe("public-about")
  })

  it("requires purchase when the configured community scope is purchaser", () => {
    expect(
      isProtocolCommunityEligible({
        scope: "purchaser",
        signedIn: true,
        purchaser: false,
      }),
    ).toBe(false)
    expect(
      isProtocolCommunityEligible({
        scope: "purchaser",
        signedIn: true,
        purchaser: true,
      }),
    ).toBe(true)
  })
})
