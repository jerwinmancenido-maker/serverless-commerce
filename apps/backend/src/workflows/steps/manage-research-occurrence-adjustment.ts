import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import { normalizeResearchOccurrenceAdjustment } from "../../modules/research-tracking/contracts/occurrence-adjustments"
import { listOwnedResearchOccurrences } from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

export type ManageResearchOccurrenceAdjustmentInput = {
  customerId: string
  activeConsentVersion: string
  occurrenceId: string
  routineId: string
  routineRevisionId: string
  routineScheduleSegmentId?: string | null
  operation: "skip" | "reschedule" | "restore"
  plannedLocalDate: string
  plannedLocalTime: string
  rescheduledLocalDate?: string | null
  rescheduledLocalTime?: string | null
  timezone: string
  note?: string | null
  idempotencyKey: string
}

export const manageResearchOccurrenceAdjustmentStep = createStep(
  "manage-research-occurrence-adjustment",
  async (input: ManageResearchOccurrenceAdjustmentInput, { container }) => {
    const normalized = normalizeResearchOccurrenceAdjustment(input)
    const trackingService = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const [profile] = await trackingService.listResearchProfiles(
      {
        customer_id: normalized.customerId,
        status: "active",
        consent_version: normalized.activeConsentVersion,
      },
      { take: 1 },
    )
    if (!profile) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "research_profile_action_required")
    }
    const [existing] = await trackingService.listResearchOccurrenceAdjustments(
      { profile_id: profile.id, idempotency_key: normalized.idempotencyKey },
      { take: 1 },
    )
    if (existing) {
      if (existing.request_fingerprint_sha256 !== normalized.requestFingerprintSha256) {
        throw new MedusaError(MedusaError.Types.CONFLICT, "idempotency_key_conflict")
      }
      return new StepResponse(existing, "")
    }

    const occurrences = await listOwnedResearchOccurrences({
      container,
      customerId: normalized.customerId,
      from: normalized.plannedLocalDate,
      to: normalized.plannedLocalDate,
    })
    const occurrence = occurrences.find(
      (item) =>
        item.occurrence_id === normalized.occurrenceId &&
        item.routine_id === normalized.routineId &&
        item.routine_revision_id === normalized.routineRevisionId,
    )
    if (!occurrence) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "occurrence_not_found")
    }
    if (occurrence.status === "confirmed" || occurrence.status === "voided") {
      throw new MedusaError(MedusaError.Types.CONFLICT, "recorded_occurrence_cannot_be_adjusted")
    }
    const [prior] = await trackingService.listResearchOccurrenceAdjustments(
      { profile_id: profile.id, occurrence_id: normalized.occurrenceId },
      { order: { created_at: "DESC" }, take: 1 },
    )
    const created = await trackingService.createResearchOccurrenceAdjustments({
      profile_id: profile.id,
      routine_id: normalized.routineId,
      routine_revision_id: normalized.routineRevisionId,
      routine_schedule_segment_id: normalized.routineScheduleSegmentId,
      occurrence_id: normalized.occurrenceId,
      operation: normalized.operation,
      planned_local_date: new Date(`${normalized.plannedLocalDate}T00:00:00.000Z`),
      planned_local_time: normalized.plannedLocalTime,
      rescheduled_local_date: normalized.rescheduledLocalDate
        ? new Date(`${normalized.rescheduledLocalDate}T00:00:00.000Z`)
        : null,
      rescheduled_local_time: normalized.rescheduledLocalTime,
      timezone: normalized.timezone,
      note: normalized.note,
      protocol_revision_id: null,
      prior_adjustment_id: prior?.id ?? null,
      idempotency_key: normalized.idempotencyKey,
      request_fingerprint_sha256: normalized.requestFingerprintSha256,
    })
    return new StepResponse(created, created.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) {
      await container
        .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
        .deleteResearchOccurrenceAdjustments(id)
    }
  },
)
