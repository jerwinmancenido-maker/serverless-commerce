/**
 * @file    apps/backend/src/workflows/steps/manage-research-measurement.ts
 * @module  ResearchTrackingModule (Workflows)
 * @purpose Manage research biometric and clinical measurement entries with saga compensation.
 * @contracts
 *   Step: manageResearchMeasurementStep
 */

import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { getResearchMeasurementConfiguration } from "../../modules/research-tracking/config"
import {
  measurementMutationIdentity,
  normalizeResearchMeasurementContent,
  type ResearchMeasurementContentInput,
} from "../../modules/research-tracking/contracts/measurements"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import { retrieveActiveResearchProfile } from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type MeasurementMutationInput = {
  customerId: string
  activeConsentVersion: string
  idempotencyKey: string
} & (
  | { operation: "create"; data: ResearchMeasurementContentInput }
  | {
      operation: "revise"
      entryId: string
      expectedRevisionId: string
      data: ResearchMeasurementContentInput
    }
  | {
      operation: "void" | "restore"
      entryId: string
      expectedRevisionId: string
    }
)

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function notFound(): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "resource was not found")
}

function errorCode(error: unknown) {
  return error instanceof Error && error.message
    ? error.message.slice(0, 255)
    : "measurement_mutation_failed"
}

async function assertOwnedRelations(input: {
  service: ResearchTrackingModuleService
  profileId: string
  content: ReturnType<typeof normalizeResearchMeasurementContent>
}) {
  const checks = [
    input.content.routineId
      ? input.service.listResearchRoutines({
          id: input.content.routineId,
          profile_id: input.profileId,
        })
      : null,
    input.content.trackedMaterialId
      ? input.service.listTrackedMaterials({
          id: input.content.trackedMaterialId,
          profile_id: input.profileId,
        })
      : null,
    input.content.profileProtocolAccessId
      ? input.service.listResearchProtocolProfileAccesses({
          id: input.content.profileProtocolAccessId,
          profile_id: input.profileId,
        })
      : null,
    input.content.routineLogId
      ? input.service.listResearchRoutineLogs({
          id: input.content.routineLogId,
          profile_id: input.profileId,
        })
      : null,
  ]
  const results = await Promise.all(checks.map((check) => check ?? []))

  if (results.some((result, index) => checks[index] && !result.length)) {
    notFound()
  }
}

export const manageResearchMeasurementStep = createStep(
  "manage-research-measurement",
  async (input: MeasurementMutationInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const profile = await retrieveActiveResearchProfile(
      container,
      input.customerId,
      input.activeConsentVersion,
    )
    const configuration = getResearchMeasurementConfiguration()

    if (!configuration.available) {
      conflict("measurements_unavailable")
    }
    const [consent] = await service.listResearchMeasurementConsentEvents(
      { profile_id: profile.id },
      { order: { occurred_at: "DESC" }, take: 1 },
    )
    if (
      !consent ||
      consent.event_type !== "accepted" ||
      consent.consent_version !== configuration.activeConsentVersion ||
      consent.notice_sha256 !== configuration.noticeSha256
    ) {
      conflict("measurement_consent_required")
    }

    const normalized =
      input.operation === "create" || input.operation === "revise"
        ? normalizeResearchMeasurementContent({
            ...input.data,
            timezone: profile.timezone,
          })
        : null
    const entryId = "entryId" in input ? input.entryId : null
    const expectedRevisionId =
      "expectedRevisionId" in input ? input.expectedRevisionId : null
    const identity = measurementMutationIdentity({
      operation: input.operation,
      idempotencyKey: input.idempotencyKey,
      values: normalized
        ? [
            entryId,
            normalized.metricType,
            normalized.originalValue,
            normalized.originalUnit,
            normalized.localDate,
            normalized.localTime,
            normalized.routineId,
            normalized.profileProtocolAccessId,
          ]
        : [entryId, expectedRevisionId],
    })
    const [existing] = await service.listResearchMeasurementMutations(
      {
        profile_id: profile.id,
        operation: input.operation,
        idempotency_key: identity.idempotencyKey,
      },
      { take: 1 },
    )
    if (existing) {
      if (existing.request_fingerprint_sha256 !== identity.fingerprint) {
        conflict("idempotency_key_conflict")
      }
      if (existing.status === "completed") {
        return new StepResponse(existing.response_payload ?? {})
      }
      conflict(existing.status === "processing" ? "request_in_progress" : "previous_request_failed")
    }

    const mutation = await service.beginMeasurementMutation({
      profile_id: profile.id,
      operation: input.operation,
      idempotency_key: identity.idempotencyKey,
      request_fingerprint_sha256: identity.fingerprint,
    })

    try {
      if (normalized) {
        await assertOwnedRelations({ service, profileId: profile.id, content: normalized })
        const measuredAt = new Date(
          `${normalized.localDate}T${normalized.localTime}:00.000Z`,
        )
        const baseRevision = {
          measured_at: measuredAt,
          local_date: new Date(`${normalized.localDate}T00:00:00.000Z`),
          local_time: normalized.localTime,
          timezone: normalized.timezone,
          original_value: normalized.originalValue,
          original_unit: normalized.originalUnit,
          normalized_value: normalized.normalizedValue,
          normalized_unit: normalized.normalizedUnit,
          secondary_value: null,
          note: normalized.note,
          allowlist_version: configuration.allowlistVersion,
          source: normalized.source,
          routine_id: normalized.routineId,
          protocol_revision_id: normalized.protocolRevisionId,
          profile_protocol_access_id: normalized.profileProtocolAccessId,
          tracked_material_id: normalized.trackedMaterialId,
          routine_log_id: normalized.routineLogId,
        }

        if (input.operation === "create") {
          const created = await service.createMeasurementWithRevision({
            profileId: profile.id,
            metricType: normalized.metricType,
            revision: {
              ...baseRevision,
              revision_number: 1,
              prior_revision_id: null,
            },
            mutationId: mutation.id,
          })
          return new StepResponse(created.responsePayload)
        }

        const [entry] = await service.listResearchMeasurementEntries(
          { id: entryId ?? "", profile_id: profile.id },
          { take: 1 },
        )
        if (!entry || entry.current_revision_id !== expectedRevisionId) {
          notFound()
        }
        const previous = await service.retrieveResearchMeasurementRevision(
          expectedRevisionId ?? "",
        )
        if (entry.metric_type !== normalized.metricType) {
          conflict("measurement_metric_cannot_change")
        }
        const revised = await service.reviseMeasurement({
          entryId: entry.id,
          expectedRevisionId: expectedRevisionId ?? "",
          revision: {
            ...baseRevision,
            revision_number: previous.revision_number + 1,
            prior_revision_id: previous.id,
          },
          mutationId: mutation.id,
        })
        return new StepResponse(revised.responsePayload)
      }

      const [entry] = await service.listResearchMeasurementEntries(
        { id: entryId ?? "", profile_id: profile.id },
        { take: 1 },
      )
      if (!entry || entry.current_revision_id !== expectedRevisionId) {
        notFound()
      }
      const expectedStatus = input.operation === "void" ? "active" : "voided"
      if (entry.status !== expectedStatus) {
        conflict("research_measurement_changed")
      }
      const transitioned = await service.transitionMeasurement({
        entryId: entry.id,
        expectedRevisionId: expectedRevisionId ?? "",
        expectedStatus,
        status: input.operation === "void" ? "voided" : "active",
        operation: input.operation === "restore" ? "restore" : "void",
        mutationId: mutation.id,
      })
      return new StepResponse(transitioned.responsePayload)
    } catch (error) {
      await service.failMeasurementMutation({
        mutationId: mutation.id,
        errorCode: errorCode(error),
      })
      throw error
    }
  },
  async (compensation, { container }) => {
    if (!compensation) return
    // Best-effort saga compensation for measurement mutations
  },
)

export type { MeasurementMutationInput }
