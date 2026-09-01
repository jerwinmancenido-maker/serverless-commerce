export type ResearchProtocolUnit = "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"

export type ResearchProtocolContent = {
  compound_name: string | null
  short_introduction: string | null
  product_format: string | null
  category: string | null
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
