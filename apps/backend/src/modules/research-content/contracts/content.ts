export const RESEARCH_CONTENT_STATUSES = [
  "draft",
  "published",
  "withdrawn",
] as const

export const RESEARCH_EVIDENCE_SCOPES = ["sku", "formulation", "batch"] as const

export const RESEARCH_PROTOCOL_APPLICABILITY_SCOPES = [
  "entire_product",
  "selected_variants",
] as const

export const RESEARCH_PROTOCOL_AUDIT_EVENT_TYPES = [
  "series_created",
  "draft_updated",
  "revision_created",
  "revision_published",
  "revision_withdrawn",
  "applicability_changed",
  "product_linked",
  "product_link_updated",
  "product_unlinked",
  "primary_protocol_changed",
  "publication_readiness_evaluated",
  "series_archived",
  "merchandising_link_created",
  "merchandising_link_updated",
  "merchandising_link_archived",
] as const

export type ResearchContentStatus = (typeof RESEARCH_CONTENT_STATUSES)[number]
export type ResearchEvidenceScope = (typeof RESEARCH_EVIDENCE_SCOPES)[number]
export type ResearchProtocolApplicabilityScope =
  (typeof RESEARCH_PROTOCOL_APPLICABILITY_SCOPES)[number]
export type ResearchProtocolAuditEventType =
  (typeof RESEARCH_PROTOCOL_AUDIT_EVENT_TYPES)[number]
