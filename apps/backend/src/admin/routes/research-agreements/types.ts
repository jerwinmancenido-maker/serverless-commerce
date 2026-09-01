export type ResearchAgreementBundle = {
  id: string
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
  status: "draft" | "scheduled" | "active" | "superseded" | "withdrawn"
  published_at: string | null
  updated_at: string
}

export type ResearchAgreementListResponse = {
  agreement_bundles: ResearchAgreementBundle[]
  acceptance_counts: Record<string, number>
}

export type ResearchAgreementFormValue = Omit<
  ResearchAgreementBundle,
  "id" | "status" | "published_at" | "updated_at"
>
