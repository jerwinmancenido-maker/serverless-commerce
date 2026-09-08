export type ResearchProtocolUnit = "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"

export type ResearchProtocolMolecularDetails = {
  cas_number: string | null
  pubchem_cid: number | null
  sequence_or_formula: string | null
  molecular_weight_g_per_mol: number | null
}

export type ResearchProtocolReconstitutionDetails = {
  default_vial_net_mg: number | null
  default_diluent_ml: number | null
  solvent: string | null
  dissolution_method: string | null
  resulting_concentration_mg_per_ml: number | null
  handling_rule: string | null
}

export type ResearchProtocolStorageDetails = {
  lyophilized: string | null
  reconstituted: string | null
  light_protection: boolean
}

export type ResearchReconstitutionOption = {
  diluentMl: number
  concMgMl: number
  label: string
  tickConversion: string
}

export type ResearchVialStrengthOption = {
  vialMg: number
  diluentMl: number
  concMgMl: number
  badge: string
}

export type ResearchSyringeGraduation = {
  doseDisplay: string
  doseMcg: number
  volumeMl: number
  syringeIU: number
  tickLabel: string
}

export type ResearchSyringeGuide = {
  syringeType: string
  standardIUDisplay?: string
  needleGauge?: string
  deadSpaceCorrection?: string
  graduations: ResearchSyringeGraduation[]
}

export type ResearchBlendConstituent = {
  name: string
  ratioMg: number
  percentageOfTotal: number
}

export type ResearchBundleVial = {
  compoundName: string
  vialNetMass: string
  diluentMl: number
  concMgMl: number
  solvent: string
  reconstitutionInstructions: string
  targetDose: string
  cadence: string
  syringeUnits: string
}

export type ResearchProtocolContent = {
  compound_name: string | null
  short_introduction: string | null
  product_format: string | null
  category: string | null
  protocol_category_type?: "single_peptide" | "blend" | "bundle" | "topical" | null
  full_description?: string | null
  investigated_benefits?: string[]
  adverse_observations?: string[]
  molecular_details?: ResearchProtocolMolecularDetails | null
  reconstitution_details?: ResearchProtocolReconstitutionDetails | null
  reconstitution_options?: Record<string, ResearchReconstitutionOption> | null
  vial_strength_options?: ResearchVialStrengthOption[]
  syringe_guide?: ResearchSyringeGuide | null
  evidence_tier?: string | null
  blend_constituents?: ResearchBlendConstituent[]
  bundle_vials?: ResearchBundleVial[]
  storage_details?: ResearchProtocolStorageDetails | null
  purity_standard?: string | null
  research_use_label: string
  last_reviewed_at: string | null
  quick_reference: Array<{ key: string; label: string; value: string; description: string | null; evidence_label: string | null; reference_keys: string[] }>
  calculator: { enabled: boolean; title: string; default_compound_mass: string | null; compound_mass_unit: "mcg" | "mg" | "g" | "IU"; default_final_volume_ml: string | null; default_target_amount: string | null; target_amount_unit: "mcg" | "mg" | "IU"; iu_per_mg: string | null; device_volume_ml: string | null; device_label: string | null; rounding_precision: number; instructions: string | null }
  protocol_levels: Array<{
    key: string
    title: string
    summary: string | null
    duration: string | null
    interval: string | null
    applicability: string | null
    evidence_label: string | null
    reference_keys: string[]
    routine_enabled: boolean
    rows: Array<{
      row_key: string | null
      period: string
      start_offset_days: number | null
      end_offset_days: number | null
      amount: string
      unit: ResearchProtocolUnit
      recurrence_type: "once" | "daily" | "weekly" | "custom"
      times_per_day: number | null
      weekdays: number[]
      suggested_local_times: string[]
      frequency: string
      notes: string | null
      reference_keys: string[]
    }>
  }>
  sections: Array<{ key: string; title: string; body: string; visible: boolean; position: number; reference_keys: string[] }>
  faqs: Array<{ key: string; question: string; answer: string; position: number }>
  research_purpose: string
  intended_application: string | null
  explicit_exclusions: string | null
  reference_quantities: Array<{ label: string; value: string; unit: ResearchProtocolUnit; concentration: string | null; conversion_basis: string | null; laboratory_purpose: string; notes: string | null; product_format: string | null }>
  materials_and_equipment: Array<{ name: string; quantity: { value: string; unit: ResearchProtocolUnit; concentration: string | null; conversion_basis: string | null } | null; equipment_notes: string | null }>
  preparation_and_handling: string
  research_procedure: string
  storage_and_disposal: string
  references: Array<{ reference_key: string | null; title: string; authors: string | null; published_at: string | null; url: string | null; doi: string | null; evidence_type: string | null; supported_claim: string | null; customer_annotation: string | null }>
  disclaimer: string
}

export type PublicResearchProtocolContent = Pick<
  ResearchProtocolContent,
  | "compound_name"
  | "short_introduction"
  | "product_format"
  | "category"
  | "research_use_label"
  | "last_reviewed_at"
  | "quick_reference"
  | "sections"
  | "faqs"
  | "references"
  | "disclaimer"
> &
  Partial<
    Pick<
      ResearchProtocolContent,
      | "protocol_category_type"
      | "full_description"
      | "investigated_benefits"
      | "adverse_observations"
      | "molecular_details"
      | "reconstitution_details"
      | "reconstitution_options"
      | "vial_strength_options"
      | "syringe_guide"
      | "evidence_tier"
      | "blend_constituents"
      | "bundle_vials"
      | "storage_details"
      | "purity_standard"
      | "calculator"
      | "protocol_levels"
      | "research_purpose"
      | "intended_application"
      | "explicit_exclusions"
      | "reference_quantities"
      | "materials_and_equipment"
      | "preparation_and_handling"
      | "research_procedure"
      | "storage_and_disposal"
    >
  >
