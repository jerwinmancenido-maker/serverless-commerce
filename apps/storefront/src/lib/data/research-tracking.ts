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
  purchased_activation_available: boolean
  consent_version: string | null
  notice_url: string | null
  default_timezone: string
  supported_locales: string[]
}

export type PurchasedItemIneligibilityReason =
  | "not_fulfilled"
  | "order_cancelled"
  | "returned_or_reversed"
  | "unsupported_order_source"
  | "material_profile_unavailable"
  | "quantity_unavailable"
  | "already_tracked"
  | "archived_material_action_required"

type PurchasedActivationConflictReason =
  | Exclude<PurchasedItemIneligibilityReason, "already_tracked">
  | "research_profile_action_required"
  | "idempotency_key_conflict"

export type PurchasedItemCandidate = {
  order_id: string
  order_display_id: string | number
  line_item_id: string
  label: string
  variant_id: string | null
  variant_sku: string | null
  eligibility: "eligible" | "ineligible" | "already_tracked"
  ineligibility_reason: PurchasedItemIneligibilityReason | null
  eligible_commerce_quantity: number | null
  initial_quantity_base_units: number | null
  base_unit: "microgram" | "microliter" | "piece" | null
  added_to_tracking_at: string | null
}

export type TrackedResearchSupply = {
  supply_id: string
  source_order_line_item_id: string | null
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  added_to_tracking_at: string
  lot_number: string | null
  batch_number: string | null
  expires_at: string | null
  storage_note: string | null
  status: "active" | "depleted" | "archived"
}

export type TrackedResearchMaterial = {
  tracked_material_id: string
  label: string
  product_variant_id: string | null
  status: "active"
  supplies: TrackedResearchSupply[]
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

const purchasedActivationConflictMessages: Record<
  PurchasedActivationConflictReason,
  string
> = {
  research_profile_action_required:
    "Activate or renew your Research & Tracking profile before continuing.",
  idempotency_key_conflict:
    "This submission was already used for a different item. Refresh and try again.",
  not_fulfilled: "This item is not fully fulfilled yet.",
  order_cancelled: "This item belongs to a cancelled order.",
  returned_or_reversed: "No eligible fulfilled quantity remains for tracking.",
  unsupported_order_source:
    "This order source is not eligible for private tracking.",
  material_profile_unavailable:
    "Verified material information is not currently available for this item.",
  quantity_unavailable:
    "The eligible material quantity could not be verified safely.",
  archived_material_action_required:
    "An archived material requires a separate customer-controlled action.",
}

function customerSafeError(error: unknown): string {
  const reason =
    error instanceof Error
      ? (error.message as PurchasedActivationConflictReason)
      : null

  if (reason && reason in purchasedActivationConflictMessages) {
    return purchasedActivationConflictMessages[reason]
  }

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

export async function retrievePurchasedItemCandidates(): Promise<
  PurchasedItemCandidate[]
> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    purchased_items: PurchasedItemCandidate[]
  }>("/store/customers/me/research-tracking/purchased-items?limit=20&offset=0", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.purchased_items
}

export async function retrieveTrackedResearchMaterials(): Promise<
  TrackedResearchMaterial[]
> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    materials: TrackedResearchMaterial[]
  }>("/store/customers/me/research-tracking/materials?limit=20&offset=0", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.materials
}

export async function activatePurchasedSupplyAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirm_tracking") !== "on") {
    return {
      success: false,
      error: "Review and confirm before starting private tracking.",
    }
  }

  return runResearchMutation(
    "/store/customers/me/research-tracking/purchased-items/activate",
    {
      order_id: String(formData.get("order_id") || ""),
      line_item_id: String(formData.get("line_item_id") || ""),
    },
    formData,
  )
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
