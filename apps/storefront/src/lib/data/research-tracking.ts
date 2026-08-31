"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import {
  classifyResearchSubmissionFailure,
  normalizeResearchSubmissionKey,
} from "@lib/research-tracking-idempotency"
import {
  convertResearchDisplayQuantityToBaseUnits,
  parseResearchUnitProfile,
  type ResearchBaseUnit,
  type ResearchDisplayUnit,
} from "@lib/research-quantity"
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

export type ResearchProtocolAccess = {
  profile_access_id: string
  protocol_handle: string
  protocol_title: string
  preserved_revision: number
  current_revision: number
  has_newer_revision: boolean
  granted_at: string
  first_viewed_at: string | null
  last_viewed_at: string | null
  routine_started_at: string | null
  routine_id: string | null
  routine_levels: Array<{
    key: string
    title: string
    summary: string | null
    duration: string | null
    rows: Array<{
      row_key: string
      period: string
      amount: string
      unit: "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"
      frequency: string
      recurrence_type: "once" | "daily" | "weekly" | "custom"
      suggested_local_times: string[]
      routine_ready: boolean
    }>
  }>
  order: { id: string; display_id: string | number; created_at: string }
  product: { id: string; title: string; thumbnail: string | null }
  variant: { id: string; title: string | null } | null
  access_token: string | null
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
  journal: {
    available: boolean
    consent_version: string | null
    notice_url: string | null
    effective_at: string | null
  }
}

export type ResearchJournalConsent = {
  event_type: "accepted" | "withdrawn"
  consent_version: string
  occurred_at: string
  is_current: boolean
}

export type ResearchPrivateRecordsConfiguration = {
  journal: ResearchTrackingConfiguration["journal"] & {
    current_consent: ResearchJournalConsent | null
  }
  measurements: {
    available: boolean
    allowlist_version: string | null
    consent_version: string | null
    notice_url: string | null
    effective_at: string | null
    supported_metrics: Array<{
      key: "weight" | "waist" | "body_fat"
      units: Array<"kg" | "lb" | "cm" | "in" | "percent">
    }>
    current_consent: ResearchJournalConsent | null
  }
}

export type ResearchMeasurement = {
  measurement_entry_id: string
  metric_type: "weight" | "waist" | "body_fat"
  status: "active" | "voided"
  current_revision: {
    revision_id: string
    revision_number: number
    measured_at: string
    local_date: string
    local_time: string
    timezone: string
    original_value: string
    original_unit: "kg" | "lb" | "cm" | "in" | "percent"
    normalized_value: string
    normalized_unit: "kg" | "cm" | "percent"
    note: string | null
    routine_id: string | null
    protocol_revision_id: string | null
    profile_protocol_access_id: string | null
    tracked_material_id: string | null
    routine_log_id: string | null
    created_at: string
  }
}

export type ResearchMeasurementSummary = {
  metric_type: "weight" | "waist" | "body_fat"
  summary: null | {
    starting_value: number
    current_value: number
    absolute_change: number
    percentage_change: number
    lowest_value: number
    highest_value: number
    measurement_count: number
    average_weekly_change: number
    normalized_unit: "kg" | "cm" | "percent"
  }
  points: Array<{
    id: string
    date: string
    value: number
    unit: "kg" | "cm" | "percent"
    routine_id: string | null
    protocol_revision_id: string | null
  }>
}

export type ResearchTimelineEvent = {
  id: string
  type: string
  occurred_at: string
  title: string
  detail: string | null
  related_id: string
}

export type ResearchUnitProfile = {
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
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
  base_unit: ResearchBaseUnit | null
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
  added_to_tracking_at: string | null
}

export type TrackedResearchSupply = {
  supply_id: string
  source_order_line_item_id: string | null
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit | null
  base_units_per_display_unit: number | null
  display_precision: number | null
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
    base_unit: ResearchBaseUnit
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
  routine_schedule_segment_id: string | null
  label: string
  planned_quantity_base_units: number
  base_unit: ResearchBaseUnit
  local_date: string
  local_time: string
  timezone: string
  status: "scheduled" | "confirmed" | "voided" | "skipped" | "rescheduled"
  log_id: string | null
  adjustment_id: string | null
  rescheduled_local_date: string | null
  rescheduled_local_time: string | null
}

export type ResearchReplenishmentProjection = {
  routine_id: string
  routine_revision_id: string
  tracked_material_id: string
  tracked_material_label: string
  product_variant_id: string | null
  source_protocol_series_id: string | null
  source_protocol_revision_id: string | null
  source_product_id: string | null
  source_product_handle: string | null
  source_product_variant_id: string | null
  current_phase: string
  base_unit: ResearchBaseUnit
  remaining_quantity_base_units: number
  planned_quantity_base_units: number
  estimated_uses_per_week: number
  estimated_days_remaining: number | null
  estimated_runout_at: string | null
  urgency: "reorder_now" | "plan_reorder" | "on_track" | "not_projected"
  calculation_basis: string
}

export type ResearchRoutineLogPreview = {
  routine_id: string
  routine_revision_id: string
  occurrence_id: string
  local_date: string
  local_time: string
  timezone: string
  supply_id: string
  base_unit: ResearchBaseUnit
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
  base_unit: ResearchBaseUnit
  created_at: string
}

export type ResearchJournalEntry = {
  journal_entry_id: string
  status: "active" | "voided"
  current_revision: {
    revision_id: string
    revision_number: number
    local_date: string
    local_time: string
    timezone: string
    title: string | null
    note: string
    tracked_material_id: string | null
    supply_id: string | null
    routine_id: string | null
    confirmed_log_id: string | null
    routine_revision_id: string | null
    protocol_revision_id: string | null
    profile_protocol_access_id: string | null
    measurement_entry_id: string | null
    order_id: string | null
    product_id: string | null
    product_variant_id: string | null
    created_at: string
  }
  created_at: string
  updated_at: string
  voided_at: string | null
  restored_at: string | null
}

export type ResearchRoutineLogMutationPreview = {
  log_id: string
  operation: "revise" | "void" | "restore"
  current_status: "confirmed" | "voided"
  projected_status: "confirmed" | "voided"
  supply_changes: Array<{
    supply_id: string
    base_unit: ResearchBaseUnit
    current_remaining_quantity_base_units: number
    projected_remaining_quantity_base_units: number
  }>
  confirmed_quantity_base_units: number
  base_unit: ResearchBaseUnit
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
  research_journal_changed:
    "This journal entry changed after the page loaded. Refresh and review the latest version.",
  confirmed_log_ineligible:
    "The linked routine record is no longer confirmed. Refresh and review the entry.",
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

export async function retrieveResearchProtocolAccesses(): Promise<
  ResearchProtocolAccess[]
> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    protocols: ResearchProtocolAccess[]
  }>("/store/customers/me/research-tracking/protocols", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.protocols
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

export async function retrieveResearchReplenishmentProjections(): Promise<
  ResearchReplenishmentProjection[]
> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    projections: ResearchReplenishmentProjection[]
  }>("/store/customers/me/research-tracking/replenishment", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.projections
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

export async function retrieveResearchPrivateRecordsConfiguration(): Promise<ResearchPrivateRecordsConfiguration> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    private_records: ResearchPrivateRecordsConfiguration
  }>("/store/customers/me/research-tracking/private-records/configuration", {
    method: "GET",
    headers,
    cache: "no-store",
  })

  return response.private_records
}

export async function retrieveResearchMeasurements(): Promise<ResearchMeasurement[]> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{ measurements: ResearchMeasurement[] }>(
    "/store/customers/me/research-tracking/measurements?include_voided=true",
    { method: "GET", headers, cache: "no-store" },
  )
  return response.measurements
}

export async function retrieveResearchMeasurementSummary(
  metricType: "weight" | "waist" | "body_fat" = "weight",
): Promise<ResearchMeasurementSummary> {
  const headers = await getAuthHeaders()
  return await sdk.client.fetch<ResearchMeasurementSummary>(
    `/store/customers/me/research-tracking/measurements/summary?metric_type=${metricType}`,
    { method: "GET", headers, cache: "no-store" },
  )
}

export async function retrieveResearchTimeline(): Promise<ResearchTimelineEvent[]> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{ timeline: ResearchTimelineEvent[] }>(
    "/store/customers/me/research-tracking/timeline",
    { method: "GET", headers, cache: "no-store" },
  )
  return response.timeline
}

export async function recordResearchMeasurementConsentAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("accepted") !== "on") {
    return { success: false, error: "Review and accept the Measurements notice." }
  }
  return runResearchMutation(
    "/store/customers/me/research-tracking/private-records/consents",
    {
      scope: "measurements",
      consent_version: String(formData.get("measurement_consent_version") || ""),
      accepted: true,
    },
    formData,
  )
}

export async function createResearchMeasurementAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const optional = (name: string) => String(formData.get(name) || "").trim() || null
  return runResearchMutation(
    "/store/customers/me/research-tracking/measurements",
    {
      metric_type: String(formData.get("metric_type") || ""),
      value: String(formData.get("value") || ""),
      unit: String(formData.get("unit") || ""),
      local_date: String(formData.get("local_date") || ""),
      local_time: String(formData.get("local_time") || ""),
      note: optional("note"),
      routine_id: optional("routine_id"),
      protocol_revision_id: null,
      profile_protocol_access_id: optional("profile_protocol_access_id"),
      tracked_material_id: optional("tracked_material_id"),
      routine_log_id: optional("routine_log_id"),
      source: "customer",
    },
    formData,
  )
}

export async function transitionResearchMeasurementAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const entryId = String(formData.get("measurement_entry_id") || "")
  const operation = formData.get("operation") === "restore" ? "restore" : "void"
  return runResearchMutation(
    `/store/customers/me/research-tracking/measurements/${encodeURIComponent(entryId)}/${operation}`,
    { expected_revision_id: String(formData.get("expected_revision_id") || "") },
    formData,
  )
}

export async function retrieveResearchJournalEntries(input: {
  limit: number
  offset: number
}): Promise<{
  entries: ResearchJournalEntry[]
  count: number
  limit: number
  offset: number
}> {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    journal_entries: ResearchJournalEntry[]
    count: number
  }>(
    `/store/customers/me/research-tracking/journal?limit=${input.limit}&offset=${input.offset}&include_voided=true`,
    { method: "GET", headers, cache: "no-store" },
  )

  return {
    entries: response.journal_entries,
    count: response.count,
    limit: input.limit,
    offset: input.offset,
  }
}

export async function recordResearchJournalConsentAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const consentAction = String(formData.get("consent_action") || "accept")

  if (
    consentAction === "accept" &&
    formData.get("accepted") !== "on"
  ) {
    return {
      success: false,
      error: "Review and accept the Journal notice before continuing.",
    }
  }

  if (
    consentAction === "withdraw" &&
    formData.get("confirm_withdrawal") !== "on"
  ) {
    return {
      success: false,
      error: "Confirm that you want to disable Journal changes.",
    }
  }

  return runResearchMutation(
    "/store/customers/me/research-tracking/private-records/consents",
    {
      scope: "journal",
      consent_version: String(formData.get("journal_consent_version") || ""),
      accepted: consentAction !== "withdraw",
    },
    formData,
  )
}

function journalContentBody(formData: FormData) {
  const optional = (field: string) =>
    String(formData.get(field) || "").trim() || null

  return {
    title: optional("title"),
    note: String(formData.get("note") || ""),
    local_date: String(formData.get("local_date") || ""),
    local_time: String(formData.get("local_time") || ""),
    timezone: String(formData.get("timezone") || "Asia/Manila"),
    tracked_material_id: optional("tracked_material_id"),
    supply_id: optional("supply_id"),
    routine_id: optional("routine_id"),
    confirmed_log_id: optional("confirmed_log_id"),
    routine_revision_id: optional("routine_revision_id"),
    protocol_revision_id: optional("protocol_revision_id"),
    profile_protocol_access_id: optional("profile_protocol_access_id"),
    measurement_entry_id: optional("measurement_entry_id"),
    order_id: optional("order_id"),
    product_id: optional("product_id"),
    product_variant_id: optional("product_variant_id"),
    confirmed: formData.get("confirmed") === "on",
  }
}

export async function createResearchJournalEntryAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirmed") !== "on") {
    return { success: false, error: "Review and confirm this private entry." }
  }

  return runResearchMutation(
    "/store/customers/me/research-tracking/journal",
    journalContentBody(formData),
    formData,
  )
}

export async function reviseResearchJournalEntryAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirmed") !== "on") {
    return { success: false, error: "Review and confirm this private entry." }
  }

  const entryId = String(formData.get("journal_entry_id") || "")
  return runResearchMutation(
    `/store/customers/me/research-tracking/journal/${encodeURIComponent(entryId)}/revise`,
    {
      ...journalContentBody(formData),
      expected_revision_id: String(formData.get("expected_revision_id") || ""),
    },
    formData,
  )
}

export async function transitionResearchJournalEntryAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  if (formData.get("confirmed") !== "on") {
    return { success: false, error: "Review and confirm this private entry." }
  }

  const entryId = String(formData.get("journal_entry_id") || "")
  const operation = formData.get("operation") === "restore" ? "restore" : "void"
  return runResearchMutation(
    `/store/customers/me/research-tracking/journal/${encodeURIComponent(entryId)}/${operation}`,
    {
      expected_revision_id: String(formData.get("expected_revision_id") || ""),
      confirmed: true,
    },
    formData,
  )
}

function researchQuantityFromForm(
  formData: FormData,
  displayField: string,
  legacyBaseField: string,
) {
  const unitProfile = parseResearchUnitProfile(formData.get("unit_profile"))

  if (unitProfile && formData.has(displayField)) {
    return {
      baseUnits:
        convertResearchDisplayQuantityToBaseUnits(
          Number(formData.get(displayField)),
          unitProfile,
        ) ?? Number.NaN,
      baseUnit: unitProfile.base_unit,
    }
  }

  return {
    baseUnits: Number(formData.get(legacyBaseField)),
    baseUnit: String(formData.get("base_unit") || ""),
  }
}

function routineBody(formData: FormData) {
  const recurrenceType = String(formData.get("recurrence_type") || "once")
  const quantity = researchQuantityFromForm(
    formData,
    "planned_quantity_display_units",
    "planned_quantity_base_units",
  )

  return {
    label: String(formData.get("label") || ""),
    planned_quantity_base_units: quantity.baseUnits,
    base_unit: quantity.baseUnit,
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

export async function startProtocolRoutineAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const profileAccessId = String(formData.get("profile_access_id") || "")

  return runResearchMutation(
    `/store/customers/me/research-tracking/protocols/${encodeURIComponent(profileAccessId)}/start-routine`,
    {
      tracked_material_id: String(formData.get("tracked_material_id") || ""),
      protocol_level_key: String(formData.get("protocol_level_key") || ""),
      start_date: String(formData.get("start_date") || ""),
      local_times_by_row: {},
      calculator_result_snapshot: null,
    },
    formData,
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
  const quantity = researchQuantityFromForm(
    formData,
    "confirmed_quantity_display_units",
    "confirmed_quantity_base_units",
  )

  return {
    routine_id: String(formData.get("routine_id") || ""),
    routine_revision_id: String(formData.get("routine_revision_id") || ""),
    occurrence_id: String(formData.get("occurrence_id") || ""),
    local_date: String(formData.get("local_date") || ""),
    supply_id: String(formData.get("supply_id") || ""),
    confirmed_quantity_base_units: quantity.baseUnits,
    base_unit: quantity.baseUnit,
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

export async function adjustResearchOccurrenceAction(
  _state: ResearchTrackingActionState = initialActionState,
  formData: FormData,
): Promise<ResearchTrackingActionState> {
  const occurrenceId = String(formData.get("occurrence_id") || "")
  const operation = String(formData.get("operation") || "")

  if (!["skip", "reschedule", "restore"].includes(operation)) {
    return { success: false, error: "Select a valid schedule action." }
  }

  return runResearchMutation(
    `/store/customers/me/research-tracking/occurrences/${encodeURIComponent(occurrenceId)}/adjust`,
    {
      routine_id: String(formData.get("routine_id") || ""),
      routine_revision_id: String(formData.get("routine_revision_id") || ""),
      routine_schedule_segment_id:
        String(formData.get("routine_schedule_segment_id") || "") || null,
      operation,
      planned_local_date: String(formData.get("planned_local_date") || ""),
      planned_local_time: String(formData.get("planned_local_time") || ""),
      rescheduled_local_date:
        String(formData.get("rescheduled_local_date") || "") || null,
      rescheduled_local_time:
        String(formData.get("rescheduled_local_time") || "") || null,
      timezone: String(formData.get("timezone") || ""),
      note: String(formData.get("note") || "") || null,
    },
    formData,
  )
}

function routineLogMutationBody(formData: FormData) {
  const operation = String(formData.get("operation") || "")
  const quantity = researchQuantityFromForm(
    formData,
    "confirmed_quantity_display_units",
    "confirmed_quantity_base_units",
  )

  return {
    operation,
    ...(operation === "void"
      ? {}
      : {
          supply_id: String(formData.get("supply_id") || ""),
          confirmed_quantity_base_units: quantity.baseUnits,
          base_unit: quantity.baseUnit,
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
