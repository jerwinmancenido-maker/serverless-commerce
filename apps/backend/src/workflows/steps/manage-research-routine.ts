import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  normalizeResearchRoutineInput,
  normalizeRoutineTransitionInput,
  type CreateResearchRoutineInput,
  type ResearchRoutineProjection,
  type TransitionResearchRoutineInput,
  type UpdateResearchRoutineInput,
} from "../../modules/research-tracking/contracts/personal-routines"
import {
  retrieveActiveResearchProfile,
  retrieveOwnedActiveTrackedMaterial,
  retrieveOwnedRoutine,
  retrieveRoutineRevision,
} from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"
import {
  beginRoutineMutationOrReplay,
  recordRoutineMutationFailure,
} from "./research-routine-mutation"

export type CreateRoutineWorkflowInput = Omit<
  CreateResearchRoutineInput,
  "timezone"
>

export type UpdateRoutineWorkflowInput = Omit<
  UpdateResearchRoutineInput,
  "timezone"
>

type ManageRoutineWorkflowInput =
  | { operation: "create"; data: CreateRoutineWorkflowInput }
  | { operation: "update"; data: UpdateRoutineWorkflowInput }
  | {
      operation: "archive" | "resume"
      data: TransitionResearchRoutineInput
    }

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function asDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

async function assertMaterialUnitCompatibility(input: {
  trackingService: ResearchTrackingModuleService
  trackedMaterialId: string
  baseUnit: "microgram" | "microliter" | "piece"
}) {
  const [evidence] = await input.trackingService.listResearchSupplies(
    {
      tracked_material_id: input.trackedMaterialId,
      base_unit: input.baseUnit,
    },
    { take: 1 },
  )

  if (!evidence) {
    conflict("incompatible_material_unit")
  }
}

function revisionWrite(
  normalized: ReturnType<typeof normalizeResearchRoutineInput>,
  supersededRevisionId: string | null,
) {
  return {
    label: normalized.label,
    planned_quantity_base_units: normalized.plannedQuantityBaseUnits,
    base_unit: normalized.baseUnit,
    timezone: normalized.schedule.timezone,
    recurrence_type: normalized.schedule.recurrence_type,
    daily_interval: normalized.schedule.daily_interval,
    weekly_interval: normalized.schedule.weekly_interval,
    weekdays: normalized.schedule.weekdays.length
      ? { values: normalized.schedule.weekdays }
      : null,
    local_time: normalized.schedule.local_time,
    start_date: asDate(normalized.schedule.start_date),
    end_date: normalized.schedule.end_date
      ? asDate(normalized.schedule.end_date)
      : null,
    effective_from_date: asDate(normalized.schedule.effective_from_date),
    superseded_revision_id: supersededRevisionId,
  }
}

export const manageResearchRoutineStep = createStep(
  "manage-research-routine",
  async (input: ManageRoutineWorkflowInput, { container }) => {
    const trackingService = service(container)
    const profile = await retrieveActiveResearchProfile(
      container,
      input.data.customerId,
      input.data.activeConsentVersion,
    )

    if (input.operation === "create" || input.operation === "update") {
      const existingRoutine =
        input.operation === "update"
          ? await retrieveOwnedRoutine({
              container,
              profileId: profile.id,
              routineId: input.data.routineId,
            })
          : null
      const existingRevision = existingRoutine?.current_revision_id
        ? await retrieveRoutineRevision(
            container,
            existingRoutine.current_revision_id,
          )
        : null
      const normalized = normalizeResearchRoutineInput({
        ...input.data,
        timezone: existingRevision?.timezone ?? profile.timezone,
      } as CreateResearchRoutineInput | UpdateResearchRoutineInput)
      const operation =
        input.operation === "create"
          ? "create-research-routine"
          : "update-research-routine"
      const mutationState = await beginRoutineMutationOrReplay({
        trackingService,
        profileId: profile.id,
        operation,
        idempotencyKey: normalized.idempotencyKey,
        fingerprint: normalized.requestFingerprintSha256,
      })

      if (mutationState.replay) {
        return new StepResponse(mutationState.replay)
      }

      try {
        if (input.operation === "create") {
          const material = await retrieveOwnedActiveTrackedMaterial({
            container,
            profileId: profile.id,
            trackedMaterialId: normalized.trackedMaterialId ?? "",
          })
          await assertMaterialUnitCompatibility({
            trackingService,
            trackedMaterialId: material.id,
            baseUnit: normalized.baseUnit,
          })
          const created = await trackingService.createRoutineWithRevision({
            routine: {
              profile_id: profile.id,
              tracked_material_id: material.id,
              status: "active",
              archived_at: null,
            },
            revision: revisionWrite(normalized, null),
            mutation: {
              mutation_id: mutationState.mutationId,
              response_payload: { created: true },
            },
          })

          return new StepResponse(created.responsePayload)
        }

        const routine = existingRoutine

        if (
          !routine ||
          routine.status !== "active" ||
          !routine.current_revision_id
        ) {
          conflict("routine_not_active")
        }
        await assertMaterialUnitCompatibility({
          trackingService,
          trackedMaterialId: routine.tracked_material_id,
          baseUnit: normalized.baseUnit,
        })

        const revised = await trackingService.reviseRoutine({
          routineId: routine.id,
          revision: revisionWrite(normalized, routine.current_revision_id),
          mutation: {
            mutation_id: mutationState.mutationId,
            response_payload: { created: false },
          },
        })

        return new StepResponse(revised.responsePayload)
      } catch (error) {
        await recordRoutineMutationFailure({
          trackingService,
          mutationId: mutationState.mutationId,
          error,
        })
        throw error
      }
    }

    const normalized = normalizeRoutineTransitionInput(
      input.data,
      input.operation,
    )
    const operation = `${input.operation}-research-routine`
    const mutationState = await beginRoutineMutationOrReplay({
      trackingService,
      profileId: profile.id,
      operation,
      idempotencyKey: normalized.idempotencyKey,
      fingerprint: normalized.requestFingerprintSha256,
    })

    if (mutationState.replay) {
      return new StepResponse(mutationState.replay)
    }

    try {
      const routine = await retrieveOwnedRoutine({
        container,
        profileId: profile.id,
        routineId: normalized.routineId,
      })

      if (input.operation === "archive") {
        if (routine.status !== "active") {
          conflict("routine_not_active")
        }

        const archived = await trackingService.archiveRoutine({
          routineId: routine.id,
          archivedAt: asDate(normalized.effectiveFromDate),
          profileId: profile.id,
          mutation: {
            mutation_id: mutationState.mutationId,
            response_payload: {},
          },
        })

        return new StepResponse(archived.responsePayload)
      }

      if (routine.status !== "archived" || !routine.current_revision_id) {
        conflict("routine_not_archived")
      }

      const previous = await retrieveRoutineRevision(
        container,
        routine.current_revision_id,
      )
      const resumed = await trackingService.reviseRoutine({
        routineId: routine.id,
        revision: {
          label: previous.label,
          planned_quantity_base_units: previous.planned_quantity_base_units,
          base_unit: previous.base_unit,
          timezone: previous.timezone,
          recurrence_type: previous.recurrence_type,
          daily_interval: previous.daily_interval,
          weekly_interval: previous.weekly_interval,
          weekdays: previous.weekdays,
          local_time: previous.local_time,
          start_date: previous.start_date,
          end_date: previous.end_date,
          effective_from_date: asDate(normalized.effectiveFromDate),
          superseded_revision_id: previous.id,
        },
        status: "active",
        archivedAt: null,
        stateTransition: {
          profileId: profile.id,
          operation: "resume",
          effectiveDate: asDate(normalized.effectiveFromDate),
        },
        mutation: {
          mutation_id: mutationState.mutationId,
          response_payload: { status: "active" },
        },
      })

      return new StepResponse(resumed.responsePayload)
    } catch (error) {
      await recordRoutineMutationFailure({
        trackingService,
        mutationId: mutationState.mutationId,
        error,
      })
      throw error
    }
  },
)

export type { ManageRoutineWorkflowInput }
