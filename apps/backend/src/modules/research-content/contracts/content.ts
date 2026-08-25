export const RESEARCH_CONTENT_STATUSES = [
  "draft",
  "published",
  "withdrawn",
] as const

export const RESEARCH_EVIDENCE_SCOPES = ["sku", "formulation", "batch"] as const

export type ResearchContentStatus = (typeof RESEARCH_CONTENT_STATUSES)[number]
export type ResearchEvidenceScope = (typeof RESEARCH_EVIDENCE_SCOPES)[number]
