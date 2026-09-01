"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type ResearchAgreementBundle = {
  id: string
  public_version: string
  terms_version: string
  terms_url: string
  privacy_version: string
  privacy_url: string
  research_hub_version: string
  research_hub_url: string
  locale: string
  effective_at: string
  status: "active"
}

export type ResearchAgreementStatus = {
  current_acceptance: {
    id: string
    agreement_bundle_id: string
    accepted_at: string
  } | null
  agreement_history: Array<{
    id: string
    agreement_bundle_id: string
    accepted_at: string
    acceptance_source: string
    terms_version_snapshot: string
    privacy_version_snapshot: string
    research_hub_version_snapshot: string
  }>
  active_agreement_bundle: ResearchAgreementBundle | null
  setup_required: boolean
}

export async function retrieveActiveResearchAgreement() {
  return sdk.client
    .fetch<{ agreement_bundle: ResearchAgreementBundle | null }>(
      "/store/research-agreement",
      { method: "GET", cache: "no-store" },
    )
    .then((result) => result.agreement_bundle)
}

export async function retrieveResearchAgreementStatus() {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<ResearchAgreementStatus>(
    "/store/customers/me/research-agreement",
    { method: "GET", headers, cache: "no-store" },
  )
}

export async function acceptResearchAgreement(input: {
  agreement_bundle_id: string
  acceptance_source:
    | "signup"
    | "existing_customer_upgrade"
    | "material_policy_renewal"
  locale: string
  idempotency_key: string
  authorization?: string
}) {
  const headers = input.authorization
    ? { authorization: input.authorization }
    : await getAuthHeaders()
  return sdk.client.fetch(
    "/store/customers/me/research-agreement",
    {
      method: "POST",
      headers,
      body: {
        agreement_bundle_id: input.agreement_bundle_id,
        acceptance_source: input.acceptance_source,
        locale: input.locale,
        idempotency_key: input.idempotency_key,
      },
    },
  )
}

export async function acceptCurrentResearchAgreementAction(
  _state: { success: boolean; error: string | null } | null,
  formData: FormData,
) {
  const accepted = formData.get("agreement_accepted") === "on"
  const agreementBundleId = String(formData.get("agreement_bundle_id") || "")
  const idempotencyKey = String(formData.get("idempotency_key") || "")
  if (!accepted || !agreementBundleId || !idempotencyKey) {
    return { success: false, error: "Review and accept the agreement to continue." }
  }
  try {
    await acceptResearchAgreement({
      agreement_bundle_id: agreementBundleId,
      acceptance_source: "existing_customer_upgrade",
      locale: "en-PH",
      idempotency_key: idempotencyKey,
    })
    revalidatePath("/account", "layout")
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Account setup could not be completed.",
    }
  }
}
