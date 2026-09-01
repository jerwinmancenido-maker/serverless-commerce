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
  it("excludes complete schedules, calculator defaults, and preparation by construction", () => {
    const projection = buildPublicResearchProtocolContent(content, {
      ...DEFAULT_RESEARCH_PROTOCOL_VISIBILITY,
      field_visibility: { "sections.public-about": "public" },
    })

    expect(projection.quick_reference).toEqual([])
    expect(projection.sections).toHaveLength(1)
    expect(projection.sections[0].key).toBe("public-about")
    expect(projection).not.toHaveProperty("calculator")
    expect(projection).not.toHaveProperty("protocol_levels")
    expect(projection).not.toHaveProperty("preparation_and_handling")
    expect(projection).not.toHaveProperty("research_procedure")
    expect(projection).not.toHaveProperty("reference_quantities")
  })

  it("does not make quick-reference data public unless the protocol policy allows it", () => {
    expect(
      buildPublicResearchProtocolContent(content, {
        ...DEFAULT_RESEARCH_PROTOCOL_VISIBILITY,
        public_quick_reference: true,
      }).quick_reference,
    ).toHaveLength(1)
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
