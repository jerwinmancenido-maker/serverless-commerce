/**
 * @file    apps/backend/src/workflows/steps/start-protocol-derived-routine.ts
 * @module  ResearchTrackingModule (Workflows)
 * @purpose Start protocol-derived research routines with schedule segments and saga compensation.
 * @contracts
 *   Step: startProtocolDerivedRoutineStep
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import {
  convertResearchDisplayAmountToBaseUnits,
  type ResearchDisplayUnit,
  type ResearchUnitProfile,
} from "../../lib/research-quantity"
import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import { ResearchProtocolContent } from "../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import { createResearchRequestFingerprint } from "../../modules/research-tracking/contracts/ownership"
import {
  retrieveActiveResearchProfile,
  retrieveOwnedActiveTrackedMaterial,
} from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"
import {
  beginRoutineMutationOrReplay,
  recordRoutineMutationFailure,
} from "./research-routine-mutation"

export type StartProtocolDerivedRoutineInput = {
  customerId: string
  activeConsentVersion: string
  profileAccessId: string
  trackedMaterialId: string
  protocolLevelKey: string
  startDate: string
  localTimesByRow: Record<string, string[]>
  calculatorResultSnapshot: Record<string, unknown> | null
  idempotencyKey: string
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function addDays(date: string, days: number): Date {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000)
}

function iuProfile(iuPerMg: string | null): ResearchUnitProfile | undefined {
  if (!iuPerMg) {
    return undefined
  }

  const value = Number(iuPerMg)
  const microgramsPerIu = 1_000 / value

  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    !Number.isSafeInteger(microgramsPerIu) ||
    microgramsPerIu <= 0
  ) {
    invalid("The protocol IU conversion does not resolve to whole micrograms")
  }

  return {
    baseUnit: "microgram",
    displayUnit: "IU",
    baseUnitsPerDisplayUnit: microgramsPerIu,
    displayPrecision: 6,
  }
}

function services(container: MedusaContainer) {
  return {
    content:
      container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE),
    tracking:
      container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE),
  }
}

export const startProtocolDerivedRoutineStep = createStep(
  "start-protocol-derived-routine",
  async (input: StartProtocolDerivedRoutineInput, { container }) => {
    const { content, tracking } = services(container)
    const profile = await retrieveActiveResearchProfile(
      container,
      input.customerId,
      input.activeConsentVersion,
    )
    const [access] = await tracking.listResearchProtocolProfileAccesses(
      {
        id: input.profileAccessId,
        profile_id: profile.id,
        customer_id: input.customerId,
        status: "active",
      },
      { take: 1 },
    )

    if (!access) {
      conflict("protocol_access_not_found")
    }
    if (access.routine_id || access.routine_started_at) {
      conflict("protocol_routine_already_started")
    }

    const material = await retrieveOwnedActiveTrackedMaterial({
      container,
      profileId: profile.id,
      trackedMaterialId: input.trackedMaterialId,
    })
    const revision = await content.retrieveResearchProtocol(
      access.protocol_revision_id,
    )

    if (revision.status !== "published") {
      conflict("protocol_revision_not_available")
    }

    const parsed = ResearchProtocolContent.parse(revision.content)
    const level = parsed.protocol_levels.find(
      (item) => item.key === input.protocolLevelKey,
    )

    if (!level || !level.routine_enabled || !level.rows.length) {
      conflict("protocol_level_not_routine_ready")
    }

    const unitProfile = iuProfile(parsed.calculator.iu_per_mg)
    const segments = level.rows.map((row, position) => {
      if (
        row.start_offset_days === null ||
        row.recurrence_type === "custom" ||
        (row.recurrence_type === "weekly" && !row.weekdays.length)
      ) {
        conflict("protocol_schedule_row_needs_structure")
      }
      if (row.unit === "L") {
        conflict("protocol_schedule_unit_not_supported")
      }

      const rowKey = row.row_key ?? `${level.key}-row-${position + 1}`
      const localTimes = input.localTimesByRow[rowKey]?.length
        ? input.localTimesByRow[rowKey]
        : row.suggested_local_times

      if (!localTimes.length) {
        conflict("protocol_schedule_time_required")
      }
      if (row.times_per_day && localTimes.length !== row.times_per_day) {
        conflict("protocol_schedule_time_count_mismatch")
      }

      const quantity = convertResearchDisplayAmountToBaseUnits({
        amount: row.amount,
        displayUnit: row.unit as ResearchDisplayUnit,
        ...(row.unit === "IU" ? { unitProfile } : {}),
      })

      return {
        position,
        source_row_key: row.row_key,
        label: `${level.title} — ${row.period}`,
        start_offset_days: row.start_offset_days,
        end_offset_days: row.end_offset_days,
        planned_quantity_base_units: quantity.baseUnits,
        base_unit: quantity.baseUnit,
        original_amount: row.amount,
        original_unit: row.unit,
        recurrence_type: row.recurrence_type,
        daily_interval: row.recurrence_type === "daily" ? 1 : null,
        weekly_interval: row.recurrence_type === "weekly" ? 1 : null,
        weekdays: row.weekdays.length ? { values: row.weekdays } : null,
        local_times: { values: localTimes },
        notes: row.notes,
        reference_keys: row.reference_keys.length
          ? { values: row.reference_keys }
          : null,
      }
    })
    const baseUnit = segments[0].base_unit

    if (segments.some((segment) => segment.base_unit !== baseUnit)) {
      conflict("protocol_schedule_mixed_unit_dimensions")
    }
    const [compatibleSupply] = await tracking.listResearchSupplies(
      {
        tracked_material_id: material.id,
        base_unit: baseUnit,
        status: "active",
      },
      { take: 1 },
    )
    if (!compatibleSupply) {
      conflict("incompatible_material_unit")
    }

    const fingerprint = createResearchRequestFingerprint(
      "start-protocol-derived-routine",
      [
        input.profileAccessId,
        input.trackedMaterialId,
        input.protocolLevelKey,
        input.startDate,
        JSON.stringify(input.localTimesByRow),
        JSON.stringify(input.calculatorResultSnapshot),
      ],
    )
    const mutationState = await beginRoutineMutationOrReplay({
      trackingService: tracking,
      profileId: profile.id,
      operation: "start-protocol-derived-routine",
      idempotencyKey: input.idempotencyKey,
      fingerprint,
    })

    if (mutationState.replay) {
      return new StepResponse(mutationState.replay)
    }

    try {
      const finalOffset = segments.reduce<number | null>(
        (maximum, segment) =>
          segment.end_offset_days === null
            ? null
            : maximum === null
              ? null
              : Math.max(maximum, segment.end_offset_days),
        0,
      )
      const first = segments[0]
      const created = await tracking.createRoutineWithRevision({
        routine: {
          profile_id: profile.id,
          tracked_material_id: material.id,
          status: "active",
          archived_at: null,
        },
        revision: {
          label: `${access.protocol_title_snapshot} — ${level.title}`,
          planned_quantity_base_units: first.planned_quantity_base_units,
          base_unit: first.base_unit,
          timezone: profile.timezone,
          recurrence_type: first.recurrence_type,
          daily_interval: first.daily_interval,
          weekly_interval: first.weekly_interval,
          weekdays: first.weekdays,
          local_time: first.local_times.values[0],
          start_date: addDays(input.startDate, first.start_offset_days),
          end_date: finalOffset === null ? null : addDays(input.startDate, finalOffset),
          effective_from_date: addDays(input.startDate, 0),
          superseded_revision_id: null,
          source_protocol_series_id: access.protocol_series_id,
          source_protocol_revision_id: access.protocol_revision_id,
          source_protocol_level_key: level.key,
          source_profile_access_id: access.id,
          source_order_id: access.order_id,
          source_product_id: access.product_id,
          source_product_variant_id: access.product_variant_id,
          source_schedule_snapshot: { level },
          calculator_result_snapshot: input.calculatorResultSnapshot,
          customer_modified_schedule: Object.keys(input.localTimesByRow).length > 0,
        },
        segments,
        markProfileAccessId: access.id,
        mutation: {
          mutation_id: mutationState.mutationId,
          response_payload: {
            created: true,
            source: "research_protocol",
            protocol_level_key: level.key,
          },
        },
      })

      return new StepResponse(created.responsePayload, {
        routineId: created.routine?.id,
        profileAccessId: access.id,
      })
    } catch (error) {
      await recordRoutineMutationFailure({
        trackingService: tracking,
        mutationId: mutationState.mutationId,
        error,
      })
    }
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const { tracking } = services(container)
    if (compensation.routineId) {
      try {
        await tracking.archiveRoutine({
          routineId: compensation.routineId,
        } as never)
      } catch {
        // Best-effort saga rollback
      }
    }
  },
)
