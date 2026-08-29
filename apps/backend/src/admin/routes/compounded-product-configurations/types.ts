export type PresentationSnapshot = {
  schema_version: "1"
  label: string
  description: string | null
  fields: unknown[]
  variation_axes: unknown[]
  sku_suggestion_policy: Record<string, unknown> | null
  variant_warning_threshold: number
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
