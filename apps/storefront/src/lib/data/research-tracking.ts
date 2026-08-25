"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { normalizeResearchSubmissionKey } from "@lib/research-tracking-idempotency"
import { revalidatePath } from "next/cache"

export type ResearchProfile = {
  timezone: string
  locale: string
  consent_version: string
  consented_at: string
  status: "active" | "closed" | "deletion_requested"
  created_at: string
  updated_at: string
}

export type ResearchPrivacyRequest = {
  request_type: "deletion"
  status: "requested" | "cancelled" | "processing" | "completed" | "rejected"
  requested_at: string
  cancelled_at: string | null
  started_at: string | null
  completed_at: string | null
}

export type ResearchTrackingConfiguration = {
  available: boolean
  consent_version: string | null
  notice_url: string | null
  default_timezone: string
  supported_locales: string[]
}

export type ResearchTrackingActionState = {
  success: boolean
  error: string | null
}

const initialActionState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

function mutationHeaders(
  authHeaders: Record<string, string>,
  idempotencyKey: string,
) {
  return {
    ...authHeaders,
    "Idempotency-Key": idempotencyKey,
  }
}

function accountPath(formData: FormData): string {
  const requestedCountryCode = String(
    formData.get("country_code") || "ph",
  ).toLowerCase()
  const countryCode = /^[a-z]{2}$/.test(requestedCountryCode)
    ? requestedCountryCode
    : "ph"
  return `/${countryCode}/account/research-tracking`
}

function customerSafeError(_error: unknown): string {
  return "The request could not be completed. Please try again."
}

async function runResearchMutation(
  path: string,
  body: Record<string, unknown>,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  try {
    const authHeaders = await getAuthHeaders()
    const idempotencyKey = normalizeResearchSubmissionKey(
      formData.get("idempotency_key"),
    )

    await sdk.client.fetch(path, {
      method: "POST",
      body,
      headers: mutationHeaders(authHeaders, idempotencyKey),
      cache: "no-store",
    })
    revalidatePath(accountPath(formData))
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: customerSafeError(error) }
  }
}

export async function retrieveResearchTrackingConfiguration(): Promise<ResearchTrackingConfiguration> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    research_tracking: ResearchTrackingConfiguration
  }>("/store/customers/me/research-tracking/configuration", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.research_tracking
}

export async function retrieveResearchProfile(): Promise<ResearchProfile | null> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    research_profile: ResearchProfile | null
  }>("/store/customers/me/research-tracking/profile", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.research_profile
}

export async function retrieveCurrentResearchDeletionRequest(): Promise<ResearchPrivacyRequest | null> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    privacy_request: ResearchPrivacyRequest | null
  }>(
    "/store/customers/me/research-tracking/privacy/deletion-requests/current",
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  )

  return response.privacy_request
}

export async function createResearchProfileAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/profile",
    {
      timezone: String(formData.get("timezone") || "Asia/Manila"),
      locale: "en-PH",
      consent_version: String(formData.get("consent_version") || ""),
      accepted: formData.get("accepted") === "on",
    },
    formData,
  )
}

export async function updateResearchPreferencesAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/profile/preferences",
    {
      timezone: String(formData.get("timezone") || ""),
      locale: "en-PH",
    },
    formData,
  )
}

export async function renewResearchConsentAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/profile/consents",
    {
      consent_version: String(formData.get("consent_version") || ""),
      accepted: formData.get("accepted") === "on",
    },
    formData,
  )
}

export async function closeResearchProfileAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/profile/closure",
    { acknowledge_closure: formData.get("acknowledge_closure") === "on" },
    formData,
  )
}

export async function requestResearchDeletionAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/privacy/deletion-requests",
    {
      acknowledge_deletion_request:
        formData.get("acknowledge_deletion_request") === "on",
    },
    formData,
  )
}

export async function cancelResearchDeletionAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/privacy/deletion-requests/cancel",
    {
      acknowledge_cancellation:
        formData.get("acknowledge_cancellation") === "on",
    },
    formData,
  )
}
