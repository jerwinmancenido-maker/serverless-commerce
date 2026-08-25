export const RESEARCH_PROFILE_STATUSES = [
  "active",
  "deletion_requested",
  "closed",
] as const

export const TRACKED_MATERIAL_SOURCES = ["purchased", "manual"] as const
export const TRACKED_MATERIAL_STATUSES = ["active", "archived"] as const
export const RESEARCH_SUPPLY_STATUSES = [
  "active",
  "depleted",
  "archived",
] as const

export const RESEARCH_CONSENT_EVENT_TYPES = ["accepted", "withdrawn"] as const
export const RESEARCH_PRIVACY_REQUEST_TYPES = ["deletion"] as const
export const RESEARCH_PRIVACY_REQUEST_STATUSES = [
  "requested",
  "cancelled",
  "processing",
  "completed",
  "rejected",
] as const
export const RESEARCH_PRIVACY_PRIOR_PROFILE_STATUSES = [
  "active",
  "closed",
] as const

export type ResearchProfileStatus = (typeof RESEARCH_PROFILE_STATUSES)[number]
export type ResearchConsentEventType =
  (typeof RESEARCH_CONSENT_EVENT_TYPES)[number]
export type ResearchPrivacyRequestStatus =
  (typeof RESEARCH_PRIVACY_REQUEST_STATUSES)[number]
export type ResearchPrivacyPriorProfileStatus =
  (typeof RESEARCH_PRIVACY_PRIOR_PROFILE_STATUSES)[number]
