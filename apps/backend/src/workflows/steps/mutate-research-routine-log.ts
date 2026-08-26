import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import { assertResearchRoutineLogMutationPreviewToken } from "../../modules/research-tracking/contracts/personal-routines"
import {
  createResearchRequestFingerprint,
  normalizeResearchIdempotencyKey,
} from "../../modules/research-tracking/contracts/ownership"
import { retrieveActiveResearchProfile } from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"
import {
  beginRoutineMutationOrReplay,
  recordRoutineMutationFailure,
} from "./research-routine-mutation"

export type MutateResearchRoutineLogInput = {
  customerId: string
  activeConsentVersion: string
  logId: string
  operation: "revise" | "void" | "restore"
  supplyId?: string
  confirmedQuantityBaseUnits?: number
  baseUnit?: "microgram" | "microliter" | "piece"
  idempotencyKey: string
  previewToken: string
}

type LogRecord = {
  id: string
  profile_id: string
  routine_id: string
  occurrence_id: string
  status: "confirmed" | "voided"
  current_revision_id: string | null
}

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function projectedSupplyStatus(
  currentStatus: "active" | "depleted" | "archived",
  remainingQuantityBaseUnits: number,
): "active" | "depleted" | "archived" {
  if (currentStatus === "archived") {
    return "archived"
  }

  return remainingQuantityBaseUnits === 0 ? "depleted" : "active"
}

export const mutateResearchRoutineLogStep = createStep(
  "mutate-research-routine-log",
  async (input: MutateResearchRoutineLogInput, { container }) => {
    const profile = await retrieveActiveResearchProfile(
      container,
      input.customerId,
      input.activeConsentVersion,
    )
    const trackingService = service(container)
    const [log] = (await trackingService.listResearchRoutineLogs(
      { id: input.logId, profile_id: profile.id },
      { take: 1 },
    )) as LogRecord[]

    if (!log || !log.current_revision_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "resource was not found",
      )
    }

    const prior = await trackingService.retrieveResearchRoutineLogRevision(
      log.current_revision_id,
    )
    const idempotencyKey = normalizeResearchIdempotencyKey(input.idempotencyKey)
    const fingerprint = createResearchRequestFingerprint(
      `${input.operation}-research-routine-log`,
      [
        log.id,
        input.supplyId ?? null,
        input.confirmedQuantityBaseUnits === undefined
          ? null
          : String(input.confirmedQuantityBaseUnits),
        input.baseUnit ?? null,
      ],
    )
    const operation = `${input.operation}-research-routine-log`
    const mutationState = await beginRoutineMutationOrReplay({
      trackingService,
      profileId: profile.id,
      operation,
      idempotencyKey,
      fingerprint,
    })

    if (mutationState.replay) {
      return new StepResponse(mutationState.replay)
    }

    try {
      if (input.operation === "void") {
        if (log.status !== "confirmed") {
          conflict("log_not_confirmed")
        }

        const supply = await trackingService.retrieveResearchSupply(
          prior.supply_id,
        )
        const remaining =
          supply.remaining_quantity_base_units +
          prior.confirmed_quantity_base_units

        assertResearchRoutineLogMutationPreviewToken(input.previewToken, {
          customerId: input.customerId,
          logId: input.logId,
          operation: input.operation,
          currentRevisionId: log.current_revision_id,
          currentStatus: log.status,
          supplyId: null,
          confirmedQuantityBaseUnits: null,
          baseUnit: null,
          supplyBalances: [
            {
              supplyId: supply.id,
              remainingQuantityBaseUnits:
                supply.remaining_quantity_base_units,
            },
          ],
        })
        const result = await trackingService.mutateRoutineLog({
          profileId: profile.id,
          routineId: log.routine_id,
          logId: log.id,
          routineRevisionId: prior.routine_revision_id,
          occurrenceId: log.occurrence_id,
          localDate: prior.local_date,
          localTime: prior.local_time,
          timezone: prior.timezone,
          supplyId: prior.supply_id,
          confirmedQuantityBaseUnits: prior.confirmed_quantity_base_units,
          baseUnit: prior.base_unit,
          operation: "void",
          priorRevisionId: prior.id,
          expectedLogRevisionId: log.current_revision_id,
          expectedLogStatus: log.status,
          logStatus: "voided",
          supplyUpdates: [
            {
              id: supply.id,
              expected_remaining_quantity_base_units:
                supply.remaining_quantity_base_units,
              remaining_quantity_base_units: remaining,
              status: projectedSupplyStatus(supply.status, remaining),
            },
          ],
          adjustments: [
            {
              supplyId: supply.id,
              quantityDeltaBaseUnits: prior.confirmed_quantity_base_units,
            },
          ],
          mutation: {
            mutation_id: mutationState.mutationId,
            response_payload: {},
          },
        })

        return new StepResponse(result.responsePayload)
      }

      if (
        !input.supplyId ||
        !input.baseUnit ||
        !Number.isSafeInteger(input.confirmedQuantityBaseUnits) ||
        (input.confirmedQuantityBaseUnits ?? 0) <= 0
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "supply and positive quantity are required",
        )
      }

      const quantity = input.confirmedQuantityBaseUnits as number
      const routine = await trackingService.retrieveResearchRoutine(
        log.routine_id,
      )
      const oldSupply = await trackingService.retrieveResearchSupply(
        prior.supply_id,
      )
      const sameSupplyRequested = oldSupply.id === input.supplyId
      const [newSupply] = await trackingService.listResearchSupplies(
        {
          id: input.supplyId,
          tracked_material_id: routine.tracked_material_id,
          base_unit: input.baseUnit,
        },
        { take: 1 },
      )

      if (!newSupply) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "resource was not found",
        )
      }

      if (
        newSupply.status === "archived" ||
        (!sameSupplyRequested && newSupply.status !== "active")
      ) {
        conflict("supply_ineligible")
      }

      if (input.operation === "restore" && log.status !== "voided") {
        conflict("log_not_voided")
      }

      if (input.operation === "revise" && log.status !== "confirmed") {
        conflict("log_not_confirmed")
      }

      assertResearchRoutineLogMutationPreviewToken(input.previewToken, {
        customerId: input.customerId,
        logId: input.logId,
        operation: input.operation,
        currentRevisionId: log.current_revision_id,
        currentStatus: log.status,
        supplyId: input.supplyId,
        confirmedQuantityBaseUnits: quantity,
        baseUnit: input.baseUnit,
        supplyBalances: [
          {
            supplyId: oldSupply.id,
            remainingQuantityBaseUnits:
              oldSupply.remaining_quantity_base_units,
          },
          ...(sameSupplyRequested
            ? []
            : [
                {
                  supplyId: newSupply.id,
                  remainingQuantityBaseUnits:
                    newSupply.remaining_quantity_base_units,
                },
              ]),
        ],
      })

      const restoredOld =
        input.operation === "revise"
          ? oldSupply.remaining_quantity_base_units +
            prior.confirmed_quantity_base_units
          : oldSupply.remaining_quantity_base_units
      const sameSupply = oldSupply.id === newSupply.id
      const newRemaining =
        (sameSupply ? restoredOld : newSupply.remaining_quantity_base_units) -
        quantity

      if (newRemaining < 0) {
        conflict("insufficient_supply")
      }

      const supplyUpdates = sameSupply
        ? [
            {
              id: newSupply.id,
              expected_remaining_quantity_base_units:
                newSupply.remaining_quantity_base_units,
              remaining_quantity_base_units: newRemaining,
              status: projectedSupplyStatus(newSupply.status, newRemaining),
            },
          ]
        : [
            ...(input.operation === "revise"
              ? [
                  {
                    id: oldSupply.id,
                    expected_remaining_quantity_base_units:
                      oldSupply.remaining_quantity_base_units,
                    remaining_quantity_base_units: restoredOld,
                    status: projectedSupplyStatus(
                      oldSupply.status,
                      restoredOld,
                    ),
                  },
                ]
              : []),
            {
              id: newSupply.id,
              expected_remaining_quantity_base_units:
                newSupply.remaining_quantity_base_units,
              remaining_quantity_base_units: newRemaining,
              status: projectedSupplyStatus(newSupply.status, newRemaining),
            },
          ]
      const adjustments = [
        ...(input.operation === "revise"
          ? [
              {
                supplyId: oldSupply.id,
                quantityDeltaBaseUnits: prior.confirmed_quantity_base_units,
              },
            ]
          : []),
        { supplyId: newSupply.id, quantityDeltaBaseUnits: -quantity },
      ]
      const result = await trackingService.mutateRoutineLog({
        profileId: profile.id,
        routineId: log.routine_id,
        logId: log.id,
        routineRevisionId: prior.routine_revision_id,
        occurrenceId: log.occurrence_id,
        localDate: prior.local_date,
        localTime: prior.local_time,
        timezone: prior.timezone,
        supplyId: newSupply.id,
        confirmedQuantityBaseUnits: quantity,
        baseUnit: input.baseUnit,
        operation: input.operation,
        priorRevisionId: prior.id,
        expectedLogRevisionId: log.current_revision_id,
        expectedLogStatus: log.status,
        logStatus: "confirmed",
        supplyUpdates,
        adjustments,
        mutation: {
          mutation_id: mutationState.mutationId,
          response_payload: {},
        },
      })

      return new StepResponse(result.responsePayload)
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
