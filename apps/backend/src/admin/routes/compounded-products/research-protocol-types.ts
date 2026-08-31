export const RESEARCH_PROTOCOL_REQUIRED_DISCLAIMER =
  "For laboratory research use only. Not for human or veterinary administration, diagnosis, treatment, or consumption."

export type ResearchProtocolStatus = "draft" | "published" | "withdrawn"
export type ResearchProtocolApplicability =
  | "entire_product"
  | "selected_variants"
export type ResearchProtocolEvidenceScope = "sku" | "formulation" | "batch"
export type ResearchProtocolUnit = "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"

export type ResearchProtocolMaterial = {
  name: string
  inventory_item_id: string | null
  quantity: {
    value: string
    unit: ResearchProtocolUnit
    concentration: string | null
    conversion_basis: string | null
  } | null
  equipment_notes: string | null
}

export type ResearchProtocolReferenceQuantity = {
  label: string
  value: string
  unit: "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"
  concentration: string | null
  conversion_basis: string | null
  laboratory_purpose: string
  notes: string | null
  product_format: string | null
}

export type ResearchProtocolReference = {
  reference_key: string | null
  title: string
  authors: string | null
  published_at: string | null
  url: string | null
  doi: string | null
  evidence_type: string | null
  supported_claim: string | null
  customer_annotation: string | null
}

export type ResearchProtocolQuickReference = {
  key: string
  label: string
  value: string
  description: string | null
  evidence_label: string | null
  reference_keys: string[]
}

export type ResearchProtocolLevel = {
  key: string
  title: string
  summary: string | null
  duration: string | null
  interval: string | null
  applicability: string | null
  evidence_label: string | null
  reference_keys: string[]
  rows: Array<{ period: string; amount: string; unit: ResearchProtocolUnit; frequency: string; notes: string | null }>
}

export type ResearchProtocolSection = {
  key: string
  title: string
  body: string
  visible: boolean
  position: number
  reference_keys: string[]
}

export type ResearchProtocolFaq = {
  key: string
  question: string
  answer: string
  position: number
}

export type ResearchProtocolContent = {
  compound_name: string | null
  short_introduction: string | null
  product_format: string | null
  category: string | null
  research_use_label: string
  last_reviewed_at: string | null
  quick_reference: ResearchProtocolQuickReference[]
  calculator: {
    enabled: boolean
    title: string
    default_compound_mass: string | null
    compound_mass_unit: "mcg" | "mg" | "g" | "IU"
    default_final_volume_ml: string | null
    default_target_amount: string | null
    target_amount_unit: "mcg" | "mg" | "IU"
    iu_per_mg: string | null
    device_volume_ml: string | null
    device_label: string | null
    rounding_precision: number
    instructions: string | null
  }
  protocol_levels: ResearchProtocolLevel[]
  sections: ResearchProtocolSection[]
  faqs: ResearchProtocolFaq[]
  research_purpose: string
  intended_application: string | null
  explicit_exclusions: string | null
  reference_quantities: ResearchProtocolReferenceQuantity[]
  materials_and_equipment: ResearchProtocolMaterial[]
  preparation_and_handling: string
  research_procedure: string
  storage_and_disposal: string
  references: ResearchProtocolReference[]
  disclaimer: typeof RESEARCH_PROTOCOL_REQUIRED_DISCLAIMER
}

export type ResearchProtocolRevision = {
  id: string
  revision: number
  title: string
  summary: string | null
  content: ResearchProtocolContent
  status: ResearchProtocolStatus
  evidence_scope: ResearchProtocolEvidenceScope
  effective_at: string | null
  published_at: string | null
  withdrawn_at: string | null
  created_at: string
  updated_at: string
}

export type ResearchProtocolSeries = {
  id: string
  protocol_key: string
  purpose: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  revisions: ResearchProtocolRevision[]
  product_links: ResearchProtocolProductLink[]
}

export type ResearchProtocolProductLink = {
  id: string
  product_id: string
  applicability_scope: ResearchProtocolApplicability
  is_primary: boolean
  archived_at: string | null
  product?: {
    id: string
    title: string
    status?: string
    product_format?: string | null
    metadata?: Record<string, unknown> | null
    variants?: Array<{ id: string; title: string }>
  } | null
  variant_targets: Array<{
    id: string
    product_variant_id: string
  }>
}

export type ResearchProtocolListResponse = {
  protocols: ResearchProtocolSeries[]
  count: number
  limit: number
  offset: number
}

export type ResearchProtocolDetailResponse = {
  protocol: ResearchProtocolSeries & {
    audit_events: Array<{
      id: string
      revision_id: string | null
      event_type: string
      actor_id: string
      reason: string | null
      created_at: string
    }>
  }
}

export type ResearchProtocolMutationBody = {
  title: string
  summary: string | null
  purpose: string | null
  evidence_scope: ResearchProtocolEvidenceScope
  content: ResearchProtocolContent
}

export type ResearchProtocolProductsResponse = {
  product_links: ResearchProtocolProductLink[]
}

export type ResearchProtocolPreviewResponse = {
  preview: {
    title: string
    summary: string | null
    revision: number
    preview_status: "Draft preview" | "Published guide"
    updated_at: string
    quick_overview: string | null
    research_scope: string
    important_limitations: string | null
    reference_quantities: ResearchProtocolReferenceQuantity[]
    materials_and_equipment: ResearchProtocolMaterial[]
    preparation_and_handling: string
    research_steps: string
    storage_and_disposal: string
    references: ResearchProtocolReference[]
    safety_information: string
    compatible_products: Array<{ id: string; title: string }>
    content: ResearchProtocolContent
  }
}
