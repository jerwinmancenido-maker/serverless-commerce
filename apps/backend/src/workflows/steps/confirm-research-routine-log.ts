import type {
  ILockingModule,
  MedusaContainer,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  assertResearchRoutineLogConfirmationPreviewToken,
  normalizeResearchRoutineLogInput,
  type ConfirmResearchRoutineLogInput,
} from "../../modules/research-tracking/contracts/personal-routines"
import {
  previewResearchRoutineLog,
  retrieveActiveResearchProfile,
} from "../../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"
import {
  beginRoutineMutationOrReplay,
  recordRoutineMutationFailure,
} from "./research-routine-mutation"

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

export const confirmResearchRoutineLogStep = createStep(
  "confirm-research-routine-log",
  async (input: ConfirmResearchRoutineLogInput, { container }) => {
    const normalized = normalizeResearchRoutineLogInput(input)
    const profile = await retrieveActiveResearchProfile(
      container,
      normalized.customerId,
      normalized.activeConsentVersion,
    )
    const trackingService = service(container)
    const mutationState = await beginRoutineMutationOrReplay({
      trackingService,
      profileId: profile.id,
      operation: "confirm-research-routine-log",
      idempotencyKey: normalized.idempotencyKey ?? "",
      fingerprint: normalized.requestFingerprintSha256,
    })

    if (mutationState.replay) {
      return new StepResponse(mutationState.replay)
    }

    try {
      const locking = container.resolve<ILockingModule>(Modules.LOCKING)
      const responsePayload = await locking.execute(
        `research-supply-ledger:${normalized.customerId}`,
        async () => {
          assertResearchRoutineLogConfirmationPreviewToken(input.previewToken, {
            customerId: normalized.customerId,
            routineId: normalized.routineId,
            routineRevisionId: normalized.routineRevisionId,
            occurrenceId: normalized.occurrenceId,
            localDate: normalized.localDate,
            supplyId: normalized.supplyId,
            confirmedQuantityBaseUnits: normalized.confirmedQuantityBaseUnits,
            baseUnit: normalized.baseUnit,
          })
          const preview = await previewResearchRoutineLog({
            container,
            normalized,
          })
          const confirmed = await trackingService.confirmRoutineLog({
            profileId: profile.id,
            routineId: preview.routine_id,
            routineRevisionId: preview.routine_revision_id,
            occurrenceId: preview.occurrence_id,
            localDate: new Date(`${preview.local_date}T00:00:00.000Z`),
            localTime: preview.local_time,
            timezone: preview.timezone,
            supplyId: preview.supply_id,
            confirmedQuantityBaseUnits: preview.confirmed_quantity_base_units,
            baseUnit: preview.base_unit,
            currentRemainingQuantityBaseUnits:
              preview.current_remaining_quantity_base_units,
            mutation: {
              mutation_id: mutationState.mutationId,
              response_payload: {},
            },
          })

          return confirmed.responsePayload
        },
        { timeout: 10 },
      )

      return new StepResponse(responsePayload)
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
