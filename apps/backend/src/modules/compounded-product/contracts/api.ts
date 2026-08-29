import type {
  CompoundedProductConfigurationStatus,
  CompoundedProductPresentationSnapshot,
  CompoundedProductRevisionStatus,
} from "./configuration"

export type AdminCompoundedProductPresentationRevision = {
  id: string
  revision: number
  schema_version: string
  status: CompoundedProductRevisionStatus
  snapshot: CompoundedProductPresentationSnapshot
  fingerprint: string
  reason: string | null
  created_by_actor_id: string | null
  activated_at: string | null
  superseded_at: string | null
  blocked_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export type AdminCompoundedProductPresentation = {
  id: string
  key: string
  status: CompoundedProductConfigurationStatus
  current_revision_id: string | null
  latest_revision: number
  created_at: string
  updated_at: string
}

export type AdminCompoundedProductPresentationResponse = {
  presentation: AdminCompoundedProductPresentation
  current_revision: AdminCompoundedProductPresentationRevision | null
}

export type AdminCompoundedProductPresentationListResponse = {
  presentations: AdminCompoundedProductPresentationResponse[]
  count: number
  limit: number
  offset: number
}

