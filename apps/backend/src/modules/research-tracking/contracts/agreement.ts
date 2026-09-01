export const AGREEMENT_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "superseded",
  "withdrawn",
] as const

export const AGREEMENT_ACCEPTANCE_SOURCES = [
  "signup",
  "existing_customer_upgrade",
  "material_policy_renewal",
] as const

export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number]
export type AgreementAcceptanceSource =
  (typeof AGREEMENT_ACCEPTANCE_SOURCES)[number]

export type AgreementBundleInput = {
  public_version: string
  terms_version: string
  terms_digest: string
  terms_url: string
  privacy_version: string
  privacy_digest: string
  privacy_url: string
  research_hub_version: string
  research_hub_digest: string
  research_hub_url: string
  locale: string
  effective_at: string
}

export type AgreementBundleProjection = AgreementBundleInput & {
  id: string
  status: AgreementStatus
  replacement_bundle_id: string | null
  published_at: string | null
  published_by: string | null
}

export type AgreementAcceptanceProjection = {
  id: string
  agreement_bundle_id: string
  acceptance_source: AgreementAcceptanceSource
  accepted_at: string
  locale: string
}
