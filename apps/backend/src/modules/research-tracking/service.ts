import type { Context } from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaError,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"

import ResearchConsentEvent from "./models/research-consent-event"
import ResearchPreferenceMutation from "./models/research-preference-mutation"
import ResearchPrivacyRequest from "./models/research-privacy-request"
import ResearchProfile from "./models/research-profile"
import ResearchRoutine from "./models/research-routine"
import ResearchRoutineLog from "./models/research-routine-log"
import ResearchRoutineLogRevision from "./models/research-routine-log-revision"
import ResearchRoutineMutation from "./models/research-routine-mutation"
import ResearchRoutineRevision from "./models/research-routine-revision"
import ResearchRoutineStateTransition from "./models/research-routine-state-transition"
import ResearchSupply from "./models/research-supply"
import ResearchSupplyActivation from "./models/research-supply-activation"
import ResearchSupplyActivationRequest from "./models/research-supply-activation-request"
import ResearchSupplyAdjustment from "./models/research-supply-adjustment"
import TrackedMaterial from "./models/tracked-material"

type PurchasedResearchSupplyWrite = {
  source_order_line_item_id: string
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  acquired_at: Date
  lot_number: null
  batch_number: null
  expires_at: null
  storage_note: null
  status: "active"
  tracked_material_id: string
}

type PurchasedSupplyActivationWrite = {
  profile_id: string
  tracked_material_id: string
  source_order_id: string
  source_order_line_item_id: string
  source_product_variant_id: string
  eligible_commerce_quantity: number
  material_profile_key: string
  material_profile_revision: number
  material_quantity_base_units: number
  material_base_unit: "microgram" | "microliter" | "piece"
  idempotency_key: string
  request_fingerprint_sha256: string
  activated_at: Date
  label_snapshot: string
}

type PurchasedSupplyActivationRequestWrite = {
  profile_id: string
  idempotency_key: string
  request_fingerprint_sha256: string
  accepted_at: Date
}

type ResearchRoutineWrite = {
  profile_id: string
  tracked_material_id: string
  status: "active" | "archived"
  archived_at: Date | null
}

type ResearchRoutineRevisionWrite = {
  label: string
  planned_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  timezone: string
  recurrence_type: "once" | "daily" | "weekly"
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: { values: number[] } | null
  local_time: string
  start_date: Date
  end_date: Date | null
  effective_from_date: Date
  superseded_revision_id: string | null
}

type ResearchRoutineMutationStart = {
  profile_id: string
  operation: string
  idempotency_key: string
  request_fingerprint_sha256: string
}

type ResearchRoutineMutationCompletion = {
  mutation_id: string
  response_payload: Record<string, unknown>
}

type ConfirmResearchRoutineLogWrite = {
  profileId: string
  routineId: string
  routineRevisionId: string
  occurrenceId: string
  localDate: Date
  localTime: string
  timezone: string
  supplyId: string
  confirmedQuantityBaseUnits: number
  baseUnit: "microgram" | "microliter" | "piece"
  currentRemainingQuantityBaseUnits: number
  mutation: ResearchRoutineMutationCompletion
}

type MutateResearchRoutineLogWrite = {
  profileId: string
  routineId: string
  logId: string
  routineRevisionId: string
  occurrenceId: string
  localDate: Date
  localTime: string
  timezone: string
  supplyId: string
  confirmedQuantityBaseUnits: number
  baseUnit: "microgram" | "microliter" | "piece"
  operation: "revise" | "void" | "restore"
  priorRevisionId: string
  expectedLogRevisionId: string
  expectedLogStatus: "confirmed" | "voided"
  logStatus: "confirmed" | "voided"
  supplyUpdates: Array<{
    id: string
    expected_remaining_quantity_base_units: number
    remaining_quantity_base_units: number
    status: "active" | "depleted" | "archived"
  }>
  adjustments: Array<{
    supplyId: string
    quantityDeltaBaseUnits: number
  }>
  mutation: ResearchRoutineMutationCompletion
}

class ResearchTrackingModuleService extends MedusaService({
  ResearchConsentEvent,
  ResearchPreferenceMutation,
  ResearchPrivacyRequest,
  ResearchProfile,
  ResearchRoutine,
  ResearchRoutineLog,
  ResearchRoutineLogRevision,
  ResearchRoutineMutation,
  ResearchRoutineRevision,
  ResearchRoutineStateTransition,
  ResearchSupply,
  ResearchSupplyActivation,
  ResearchSupplyActivationRequest,
  ResearchSupplyAdjustment,
  TrackedMaterial,
}) {
  @InjectTransactionManager()
  private async updateSupplyIfUnchanged(
    input: MutateResearchRoutineLogWrite["supplyUpdates"][number],
    @MedusaContext() sharedContext: Context,
  ) {
    const supplies = await this.updateResearchSupplies(
      {
        selector: {
          id: input.id,
          remaining_quantity_base_units:
            input.expected_remaining_quantity_base_units,
        },
        data: {
          remaining_quantity_base_units: input.remaining_quantity_base_units,
          status: input.status,
        },
      },
      sharedContext,
    )
    const supply = supplies[0]

    if (!supply) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_supply_balance_changed",
      )
    }

    return supply
  }

  async beginRoutineMutation(input: ResearchRoutineMutationStart) {
    return await this.createResearchRoutineMutations({
      ...input,
      status: "processing",
      result_type: null,
      result_id: null,
      response_payload: null,
      error_code: null,
      completed_at: null,
    })
  }

  async failRoutineMutation(input: { mutationId: string; errorCode: string }) {
    return await this.updateResearchRoutineMutations({
      id: input.mutationId,
      status: "failed",
      error_code: input.errorCode,
      completed_at: new Date(),
    })
  }

  @InjectTransactionManager()
  private async completeRoutineMutation(
    input: ResearchRoutineMutationCompletion & {
      resultType: "research_routine" | "research_routine_log"
      resultId: string
    },
    @MedusaContext() sharedContext: Context,
  ) {
    return await this.updateResearchRoutineMutations(
      {
        id: input.mutation_id,
        status: "completed",
        result_type: input.resultType,
        result_id: input.resultId,
        response_payload: input.response_payload,
        error_code: null,
        completed_at: new Date(),
      },
      sharedContext,
    )
  }

  @InjectManager()
  @InjectTransactionManager()
  async createRoutineWithRevision(
    input: {
      routine: ResearchRoutineWrite
      revision: ResearchRoutineRevisionWrite
      mutation: ResearchRoutineMutationCompletion
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const routine = await this.createResearchRoutines(
      { ...input.routine, current_revision_id: null },
      sharedContext,
    )
    const revision = await this.createResearchRoutineRevisions(
      { ...input.revision, routine_id: routine.id },
      sharedContext,
    )
    const updatedRoutine = await this.updateResearchRoutines(
      { id: routine.id, current_revision_id: revision.id },
      sharedContext,
    )
    const responsePayload = {
      ...input.mutation.response_payload,
      routine_id: routine.id,
      revision_id: revision.id,
    }
    const mutation = await this.completeRoutineMutation(
      {
        ...input.mutation,
        resultType: "research_routine",
        resultId: routine.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )

    return { routine: updatedRoutine, revision, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async reviseRoutine(
    input: {
      routineId: string
      revision: ResearchRoutineRevisionWrite
      mutation: ResearchRoutineMutationCompletion
      status?: "active" | "archived"
      archivedAt?: Date | null
      stateTransition?: {
        profileId: string
        operation: "resume"
        effectiveDate: Date
      }
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const revision = await this.createResearchRoutineRevisions(
      { ...input.revision, routine_id: input.routineId },
      sharedContext,
    )
    const routine = await this.updateResearchRoutines(
      {
        id: input.routineId,
        current_revision_id: revision.id,
        ...(input.status ? { status: input.status } : {}),
        ...(input.archivedAt !== undefined
          ? { archived_at: input.archivedAt }
          : {}),
      },
      sharedContext,
    )
    const responsePayload = {
      ...input.mutation.response_payload,
      routine_id: routine.id,
      revision_id: revision.id,
    }
    const mutation = await this.completeRoutineMutation(
      {
        ...input.mutation,
        resultType: "research_routine",
        resultId: routine.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )
    const transition = input.stateTransition
      ? await this.createResearchRoutineStateTransitions(
          {
            profile_id: input.stateTransition.profileId,
            routine_id: routine.id,
            mutation_id: mutation.id,
            operation: input.stateTransition.operation,
            effective_date: input.stateTransition.effectiveDate,
          },
          sharedContext,
        )
      : null

    return { routine, revision, mutation, transition, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async archiveRoutine(
    input: {
      routineId: string
      archivedAt: Date
      profileId: string
      mutation: ResearchRoutineMutationCompletion
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const routine = await this.updateResearchRoutines(
      {
        id: input.routineId,
        status: "archived",
        archived_at: input.archivedAt,
      },
      sharedContext,
    )
    const responsePayload = {
      ...input.mutation.response_payload,
      routine_id: routine.id,
      status: "archived",
    }
    const mutation = await this.completeRoutineMutation(
      {
        ...input.mutation,
        resultType: "research_routine",
        resultId: routine.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )
    const transition = await this.createResearchRoutineStateTransitions(
      {
        profile_id: input.profileId,
        routine_id: routine.id,
        mutation_id: mutation.id,
        operation: "archive",
        effective_date: input.archivedAt,
      },
      sharedContext,
    )

    return { routine, mutation, transition, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async confirmRoutineLog(
    input: ConfirmResearchRoutineLogWrite,
    @MedusaContext() sharedContext: Context = {},
  ) {
    const projectedRemaining =
      input.currentRemainingQuantityBaseUnits - input.confirmedQuantityBaseUnits
    const log = await this.createResearchRoutineLogs(
      {
        occurrence_id: input.occurrenceId,
        status: "confirmed",
        current_revision_id: null,
        profile_id: input.profileId,
        routine_id: input.routineId,
      },
      sharedContext,
    )
    const revision = await this.createResearchRoutineLogRevisions(
      {
        occurrence_id: input.occurrenceId,
        local_date: input.localDate,
        local_time: input.localTime,
        timezone: input.timezone,
        confirmed_quantity_base_units: input.confirmedQuantityBaseUnits,
        base_unit: input.baseUnit,
        operation: "confirm",
        prior_revision_id: null,
        profile_id: input.profileId,
        routine_id: input.routineId,
        log_id: log.id,
        routine_revision_id: input.routineRevisionId,
        supply_id: input.supplyId,
      },
      sharedContext,
    )
    const updatedLog = await this.updateResearchRoutineLogs(
      { id: log.id, current_revision_id: revision.id },
      sharedContext,
    )
    const responsePayload = {
      ...input.mutation.response_payload,
      log_id: log.id,
      log_revision_id: revision.id,
      remaining_quantity_base_units: projectedRemaining,
    }
    const mutation = await this.completeRoutineMutation(
      {
        ...input.mutation,
        resultType: "research_routine_log",
        resultId: log.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )
    const adjustment = await this.createResearchSupplyAdjustments(
      {
        quantity_delta_base_units: -input.confirmedQuantityBaseUnits,
        operation: "confirm",
        profile_id: input.profileId,
        supply_id: input.supplyId,
        log_id: log.id,
        log_revision_id: revision.id,
        mutation_id: mutation.id,
      },
      sharedContext,
    )
    const supply = await this.updateSupplyIfUnchanged(
      {
        id: input.supplyId,
        expected_remaining_quantity_base_units:
          input.currentRemainingQuantityBaseUnits,
        remaining_quantity_base_units: projectedRemaining,
        status: projectedRemaining === 0 ? "depleted" : "active",
      },
      sharedContext,
    )

    return {
      log: updatedLog,
      revision,
      adjustment,
      mutation,
      supply,
      responsePayload,
    }
  }

  @InjectManager()
  @InjectTransactionManager()
  async mutateRoutineLog(
    input: MutateResearchRoutineLogWrite,
    @MedusaContext() sharedContext: Context = {},
  ) {
    const revision = await this.createResearchRoutineLogRevisions(
      {
        occurrence_id: input.occurrenceId,
        local_date: input.localDate,
        local_time: input.localTime,
        timezone: input.timezone,
        confirmed_quantity_base_units: input.confirmedQuantityBaseUnits,
        base_unit: input.baseUnit,
        operation: input.operation,
        prior_revision_id: input.priorRevisionId,
        profile_id: input.profileId,
        routine_id: input.routineId,
        log_id: input.logId,
        routine_revision_id: input.routineRevisionId,
        supply_id: input.supplyId,
      },
      sharedContext,
    )
    const logs = await this.updateResearchRoutineLogs(
      {
        selector: {
          id: input.logId,
          current_revision_id: input.expectedLogRevisionId,
          status: input.expectedLogStatus,
        },
        data: {
          status: input.logStatus,
          current_revision_id: revision.id,
        },
      },
      sharedContext,
    )
    const log = logs[0]

    if (!log) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_routine_log_changed",
      )
    }
    const responsePayload = {
      ...input.mutation.response_payload,
      log_id: input.logId,
      log_revision_id: revision.id,
      status: input.logStatus,
    }
    const mutation = await this.completeRoutineMutation(
      {
        ...input.mutation,
        resultType: "research_routine_log",
        resultId: input.logId,
        response_payload: responsePayload,
      },
      sharedContext,
    )
    const adjustments = await this.createResearchSupplyAdjustments(
      input.adjustments.map((adjustment) => ({
        quantity_delta_base_units: adjustment.quantityDeltaBaseUnits,
        operation: input.operation,
        profile_id: input.profileId,
        supply_id: adjustment.supplyId,
        log_id: input.logId,
        log_revision_id: revision.id,
        mutation_id: mutation.id,
      })),
      sharedContext,
    )
    const supplies: unknown[] = []

    for (const supplyUpdate of input.supplyUpdates) {
      supplies.push(
        await this.updateSupplyIfUnchanged(supplyUpdate, sharedContext),
      )
    }

    return { log, revision, mutation, adjustments, supplies, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async createPurchasedSupplyActivation(
    input: {
      supply: PurchasedResearchSupplyWrite
      activation: PurchasedSupplyActivationWrite
      request: PurchasedSupplyActivationRequestWrite
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const supply = await this.createResearchSupplies(
      input.supply,
      sharedContext,
    )
    const activation = await this.createResearchSupplyActivations(
      {
        ...input.activation,
        supply_id: supply.id,
      },
      sharedContext,
    )
    const request = await this.createResearchSupplyActivationRequests(
      {
        ...input.request,
        activation_id: activation.id,
      },
      sharedContext,
    )

    return { supply, activation, request }
  }

  @InjectManager()
  @InjectTransactionManager()
  async deletePurchasedSupplyActivation(
    input: {
      requestId: string
      activationId: string
      supplyId: string
    },
    @MedusaContext() sharedContext: Context = {},
  ): Promise<void> {
    await this.deleteResearchSupplyActivationRequests(
      input.requestId,
      sharedContext,
    )
    await this.deleteResearchSupplyActivations(
      input.activationId,
      sharedContext,
    )
    await this.deleteResearchSupplies(input.supplyId, sharedContext)
  }
}

export default ResearchTrackingModuleService
