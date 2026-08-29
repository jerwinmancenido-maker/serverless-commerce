export type PresentationSnapshot = {
  schema_version: "1"
  label: string
  description: string | null
  fields: unknown[]
  variation_axes: unknown[]
  sku_suggestion_policy: Record<string, unknown> | null
  readiness_policy: ReadinessPolicy
  variant_warning_threshold: number
}

export type ReadinessPolicy = {
  schema_version: "1"
  require_price: boolean
  require_sales_channel: boolean
  require_bom_for_managed_inventory: boolean
  require_valid_structured_measurements: boolean
  require_governance_audit: boolean
}

export type PresentationRevision = {
  id: string
  revision: number
  status: "draft" | "active" | "superseded" | "blocked" | "archived"
  snapshot: PresentationSnapshot
  fingerprint: string
  created_at: string
}

export type Presentation = {
  id: string
  key: string
  status: "draft" | "active" | "inactive" | "blocked" | "archived"
  current_revision_id: string | null
  latest_revision: number
  updated_at: string
}

export type PresentationListItem = {
  presentation: Presentation
  current_revision: PresentationRevision | null
}

export type PresentationListResponse = {
  presentations: PresentationListItem[]
  count: number
  limit: number
  offset: number
}

export type CreatePresentationInput = {
  key: string
  snapshot: PresentationSnapshot
}

export type PresentationMutationResponse = PresentationListItem

export type ClassificationMapping = {
  id: string
  product_type_id: string
  presentation_id: string
  status: "active" | "inactive" | "archived"
  reason: string
  created_by_actor_id: string
  updated_by_actor_id: string
  created_at: string
  updated_at: string
}

export type ClassificationMappingListResponse = {
  mappings: ClassificationMapping[]
  count: number
  limit: number
  offset: number
}
