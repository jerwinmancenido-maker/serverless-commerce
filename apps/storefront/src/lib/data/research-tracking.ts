"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import {
  classifyResearchSubmissionFailure,
  normalizeResearchSubmissionKey,
} from "@lib/research-tracking-idempotency"
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

export type ResearchRoutine = {
  routine_id: string
  tracked_material_id: string
  tracked_material_label: string
  status: "active" | "archived"
  archived_at: string | null
  current_revision: {
    revision_id: string
    label: string
    planned_quantity_base_units: number
    base_unit: "microgram" | "microliter" | "piece"
    schedule: {
      recurrence_type: "once" | "daily" | "weekly"
      daily_interval: number | null
      weekly_interval: number | null
      weekdays: number[]
      local_time: string
      start_date: string
      end_date: string | null
      effective_from_date: string
      timezone: string
    }
    created_at: string
  }
}

export type ResearchOccurrence = {
  occurrence_id: string
  routine_id: string
  routine_revision_id: string
  label: string
  planned_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  local_date: string
  local_time: string
  timezone: string
  status: "scheduled" | "confirmed" | "voided"
  log_id: string | null
}

export type ResearchRoutineLogPreview = {
  routine_id: string
  routine_revision_id: string
  occurrence_id: string
  local_date: string
  local_time: string
  timezone: string
  supply_id: string
  base_unit: "microgram" | "microliter" | "piece"
  confirmed_quantity_base_units: number
  current_remaining_quantity_base_units: number
  projected_remaining_quantity_base_units: number
  notice: string
  preview_token: string
}

export type ResearchRoutineLog = {
  log_id: string
  routine_id: string
  routine_revision_id: string
  occurrence_id: string
  status: "confirmed" | "voided"
  operation: "confirm" | "revise" | "void" | "restore"
  local_date: string
  local_time: string
  timezone: string
  supply_id: string
  confirmed_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  created_at: string
}

export type ResearchRoutineLogMutationPreview = {
  log_id: string
  operation: "revise" | "void" | "restore"
  current_status: "confirmed" | "voided"
  projected_status: "confirmed" | "voided"
  supply_changes: Array<{
    supply_id: string
    base_unit: "microgram" | "microliter" | "piece"
    current_remaining_quantity_base_units: number
    projected_remaining_quantity_base_units: number
  }>
  confirmed_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  notice: string
  preview_token: string
}

export type ResearchRoutineLogActionState = ResearchTrackingActionState & {
  preview: ResearchRoutineLogPreview | null
}

export type ResearchRoutineLogMutationActionState =
  ResearchTrackingActionState & {
    preview: ResearchRoutineLogMutationPreview | null
  }

export type ResearchTrackingActionState = {
  success: boolean
  error: string | null
  submissionKeyConsumed?: boolean
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

const customerConflictMessages: Record<string, string> = {
  ...purchasedActivationConflictMessages,
  incompatible_material_unit:
    "Choose a unit supported by the selected material's verified supply history.",
  routine_not_active: "This routine is not active. Refresh and try again.",
  routine_not_archived: "This routine is not archived. Refresh and try again.",
  routine_revision_changed:
    "This routine changed after the page loaded. Review the latest version.",
  occurrence_changed:
    "This occurrence changed after the page loaded. Refresh and review it again.",
  occurrence_already_confirmed: "This occurrence is already confirmed.",
  occurrence_requires_restore:
    "This occurrence was voided. Restore its existing record instead.",
  insufficient_supply:
    "The selected supply does not have enough remaining quantity.",
  incompatible_supply_unit:
    "The selected supply unit does not match this routine.",
  tracked_material_ineligible:
    "The selected tracked material is archived or otherwise unavailable.",
  supply_ineligible:
    "The selected supply is inactive or otherwise unavailable.",
  log_not_confirmed: "This record is no longer confirmed.",
  log_not_voided: "This record is no longer voided.",
  preview_required: "Review the latest preview before confirming.",
  preview_expired_or_changed:
    "The preview expired or changed. Review the record again.",
  research_supply_balance_changed:
    "The supply balance changed. Refresh and review the latest balance.",
  research_routine_log_changed:
    "This record changed after preview. Refresh and review the latest record.",
  request_in_progress:
    "This request is already processing. Wait a moment, then refresh.",
  previous_request_failed:
    "The previous attempt failed. Refresh to create a new submission.",
}

function customerSafeError(error: unknown): string {
  const rawReason =
    error instanceof Error
      ? (error.message as PurchasedActivationConflictReason)
      : null
  const { reason } = classifyResearchSubmissionFailure(rawReason)

  if (reason && reason in customerConflictMessages) {
    return customerConflictMessages[reason]
  }

  return "The request could not be completed. Please try again."
}

function researchMutationFailureState(
  error: unknown,
): ResearchTrackingActionState {
  const rawReason = error instanceof Error ? error.message : null
  const { submissionKeyConsumed } =
    classifyResearchSubmissionFailure(rawReason)

  return {
    success: false,
    error: customerSafeError(error),
    submissionKeyConsumed,
  }
}

function researchTrackingAccountPath(formData: FormData): string {
  const countryCode = String(formData.get("country_code") || "").toLowerCase()

  if (!/^[a-z]{2}$/.test(countryCode)) {
    return "/account/research-tracking"
  }

  return `/${countryCode}/account/research-tracking`
}

async function runResearchMutation(
  path: string,
  body: Record<string, unknown>,
  formData: FormData,
  refreshAccountPage = true,
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
    if (refreshAccountPage) {
      revalidatePath(researchTrackingAccountPath(formData), "page")
    }
    return { success: true, error: null, submissionKeyConsumed: true }
  } catch (error) {
    return researchMutationFailureState(error)
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
  }>(
    "/store/customers/me/research-tracking/purchased-items?limit=20&offset=0",
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  )

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

export async function retrieveResearchRoutines(): Promise<ResearchRoutine[]> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{ routines: ResearchRoutine[] }>(
    "/store/customers/me/research-tracking/routines",
    { method: "GET", headers, cache: "no-store" },
  )

  return response.routines
}

export async function retrieveResearchOccurrences(
  from: string,
  to: string,
): Promise<ResearchOccurrence[]> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    occurrences: ResearchOccurrence[]
  }>(
    `/store/customers/me/research-tracking/occurrences?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { method: "GET", headers, cache: "no-store" },
  )

  return response.occurrences
}

export async function retrieveResearchRoutineLogs(): Promise<
  ResearchRoutineLog[]
> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{ logs: ResearchRoutineLog[] }>(
    "/store/customers/me/research-tracking/logs",
    { method: "GET", headers, cache: "no-store" },
  )

  return response.logs
}

function routineBody(formData: FormData) {
  const recurrenceType = String(formData.get("recurrence_type") || "once")

  return {
    label: String(formData.get("label") || ""),
    planned_quantity_base_units: Number(
      formData.get("planned_quantity_base_units"),
    ),
    base_unit: String(formData.get("base_unit") || ""),
    recurrence_type: recurrenceType,
    daily_interval:
      recurrenceType === "daily"
        ? Number(formData.get("daily_interval") || 1)
        : null,
    weekly_interval:
      recurrenceType === "weekly"
        ? Number(formData.get("weekly_interval") || 1)
        : null,
    weekdays:
      recurrenceType === "weekly"
        ? formData.getAll("weekdays").map(Number)
        : [],
    local_time: String(formData.get("local_time") || ""),
    start_date: String(formData.get("start_date") || ""),
    end_date: String(formData.get("end_date") || "") || null,
    effective_from_date: String(formData.get("effective_from_date") || ""),
  }
}

export async function createResearchRoutineAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  return runResearchMutation(
    "/store/customers/me/research-tracking/routines",
    {
      tracked_material_id: String(formData.get("tracked_material_id") || ""),
      ...routineBody(formData),
    },
    formData,
    false,
  )
}

export async function updateResearchRoutineAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const routineId = String(formData.get("routine_id") || "")

  return runResearchMutation(
    `/store/customers/me/research-tracking/routines/${encodeURIComponent(routineId)}`,
    routineBody(formData),
    formData,
    false,
  )
}

export async function transitionResearchRoutineAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const routineId = String(formData.get("routine_id") || "")
  const operation =
    formData.get("operation") === "resume" ? "resume" : "archive"

  return runResearchMutation(
    `/store/customers/me/research-tracking/routines/${encodeURIComponent(routineId)}/${operation}`,
    {
      effective_from_date: String(formData.get("effective_from_date") || ""),
    },
    formData,
    false,
  )
}

function routineLogBody(formData: FormData) {
  return {
    routine_id: String(formData.get("routine_id") || ""),
    routine_revision_id: String(formData.get("routine_revision_id") || ""),
    occurrence_id: String(formData.get("occurrence_id") || ""),
    local_date: String(formData.get("local_date") || ""),
    supply_id: String(formData.get("supply_id") || ""),
    confirmed_quantity_base_units: Number(
      formData.get("confirmed_quantity_base_units"),
    ),
    base_unit: String(formData.get("base_unit") || ""),
  }
}

export async function previewResearchRoutineLogAction(
  _state: ResearchRoutineLogActionState,
  formData: FormData,
): Promise<ResearchRoutineLogActionState> {
  try {
    const authHeaders = await getAuthHeaders()
    const response = await sdk.client.fetch<{
      preview: ResearchRoutineLogPreview
    }>("/store/customers/me/research-tracking/logs/preview", {
      method: "POST",
      body: routineLogBody(formData),
      headers: authHeaders,
      cache: "no-store",
    })

    return { success: true, error: null, preview: response.preview }
  } catch (error) {
    return { success: false, error: customerSafeError(error), preview: null }
  }
}

export async function confirmResearchRoutineLogAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirm_record") !== "on") {
    return { success: false, error: "Review and confirm this private record." }
  }

  return runResearchMutation(
    "/store/customers/me/research-tracking/logs",
    {
      ...routineLogBody(formData),
      preview_token: String(formData.get("preview_token") || ""),
    },
    formData,
    false,
  )
}

function routineLogMutationBody(formData: FormData) {
  const operation = String(formData.get("operation") || "")

  return {
    operation,
    ...(operation === "void"
      ? {}
      : {
          supply_id: String(formData.get("supply_id") || ""),
          confirmed_quantity_base_units: Number(
            formData.get("confirmed_quantity_base_units"),
          ),
          base_unit: String(formData.get("base_unit") || ""),
        }),
  }
}

export async function previewResearchRoutineLogMutationAction(
  _state: ResearchRoutineLogMutationActionState,
  formData: FormData,
): Promise<ResearchRoutineLogMutationActionState> {
  try {
    const authHeaders = await getAuthHeaders()
    const logId = String(formData.get("log_id") || "")
    const response = await sdk.client.fetch<{
      preview: ResearchRoutineLogMutationPreview
    }>(
      `/store/customers/me/research-tracking/logs/${encodeURIComponent(logId)}/preview`,
      {
        method: "POST",
        body: routineLogMutationBody(formData),
        headers: authHeaders,
        cache: "no-store",
      },
    )

    return { success: true, error: null, preview: response.preview }
  } catch (error) {
    return { success: false, error: customerSafeError(error), preview: null }
  }
}

export async function mutateResearchRoutineLogAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirm_record") !== "on") {
    return { success: false, error: "Review and confirm this private record." }
  }

  const logId = String(formData.get("log_id") || "")
  const operation = String(formData.get("operation") || "")

  if (!["revise", "void", "restore"].includes(operation)) {
    return { success: false, error: "Select a valid record action." }
  }

  const body = routineLogMutationBody(formData)
  delete (body as { operation?: string }).operation
  Object.assign(body, {
    preview_token: String(formData.get("preview_token") || ""),
  })

  return runResearchMutation(
    `/store/customers/me/research-tracking/logs/${encodeURIComponent(logId)}/${operation}`,
    body,
    formData,
    false,
  )
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
