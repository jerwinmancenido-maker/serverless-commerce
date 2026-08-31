import type { Context } from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaError,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"

import ResearchConsentEvent from "./models/research-consent-event"
import ResearchJournalConsentEvent from "./models/research-journal-consent-event"
import ResearchJournalEntry from "./models/research-journal-entry"
import ResearchJournalEntryRevision from "./models/research-journal-entry-revision"
import ResearchJournalMutation from "./models/research-journal-mutation"
import ResearchJournalStateTransition from "./models/research-journal-state-transition"
import ResearchMeasurementConsentEvent from "./models/research-measurement-consent-event"
import ResearchMeasurementEntry from "./models/research-measurement-entry"
import ResearchMeasurementMutation from "./models/research-measurement-mutation"
import ResearchMeasurementRevision from "./models/research-measurement-revision"
import ResearchPreferenceMutation from "./models/research-preference-mutation"
import ResearchPrivacyRequest from "./models/research-privacy-request"
import ResearchProfile from "./models/research-profile"
import ResearchProtocolProfileAccess from "./models/research-protocol-profile-access"
import ResearchRoutine from "./models/research-routine"
import ResearchRoutineLog from "./models/research-routine-log"
import ResearchRoutineLogRevision from "./models/research-routine-log-revision"
import ResearchRoutineMutation from "./models/research-routine-mutation"
import ResearchRoutineRevision from "./models/research-routine-revision"
import ResearchRoutineScheduleSegment from "./models/research-routine-schedule-segment"
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

type ResearchJournalRevisionWrite = {
  revision_number: number
  local_date: Date
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
  prior_revision_id: string | null
}

type ResearchJournalMutationCompletion = {
  mutation_id: string
  response_payload: Record<string, unknown>
}

type ResearchMeasurementRevisionWrite = {
  revision_number: number
  measured_at: Date
  local_date: Date
  local_time: string
  timezone: string
  original_value: string
  original_unit: "kg" | "lb" | "cm" | "in" | "percent"
  normalized_value: string
  normalized_unit: "kg" | "cm" | "percent"
  secondary_value: string | null
  note: string | null
  allowlist_version: string
  source: "customer" | "activity" | "journal"
  routine_id: string | null
  protocol_revision_id: string | null
  profile_protocol_access_id: string | null
  tracked_material_id: string | null
  routine_log_id: string | null
  prior_revision_id: string | null
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
  source_protocol_series_id?: string | null
  source_protocol_revision_id?: string | null
  source_protocol_level_key?: string | null
  source_profile_access_id?: string | null
  source_order_id?: string | null
  source_product_id?: string | null
  source_product_variant_id?: string | null
  source_schedule_snapshot?: Record<string, unknown> | null
  calculator_result_snapshot?: Record<string, unknown> | null
  customer_modified_schedule?: boolean
}

type ResearchRoutineScheduleSegmentWrite = {
  position: number
  source_row_key: string | null
  label: string
  start_offset_days: number
  end_offset_days: number | null
  planned_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  original_amount: string
  original_unit: "mcg" | "mg" | "g" | "µL" | "mL" | "L" | "IU" | "piece"
  recurrence_type: "once" | "daily" | "weekly"
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: { values: number[] } | null
  local_times: { values: string[] }
  notes: string | null
  reference_keys: { values: string[] } | null
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
  ResearchJournalConsentEvent,
  ResearchJournalEntry,
  ResearchJournalEntryRevision,
  ResearchJournalMutation,
  ResearchJournalStateTransition,
  ResearchMeasurementConsentEvent,
  ResearchMeasurementEntry,
  ResearchMeasurementMutation,
  ResearchMeasurementRevision,
  ResearchPreferenceMutation,
  ResearchPrivacyRequest,
  ResearchProfile,
  ResearchProtocolProfileAccess,
  ResearchRoutine,
  ResearchRoutineLog,
  ResearchRoutineLogRevision,
  ResearchRoutineMutation,
  ResearchRoutineRevision,
  ResearchRoutineScheduleSegment,
  ResearchRoutineStateTransition,
  ResearchSupply,
  ResearchSupplyActivation,
  ResearchSupplyActivationRequest,
  ResearchSupplyAdjustment,
  TrackedMaterial,
}) {
  async beginMeasurementMutation(input: {
    profile_id: string
    operation: "create" | "revise" | "void" | "restore"
    idempotency_key: string
    request_fingerprint_sha256: string
  }) {
    return await this.createResearchMeasurementMutations({
      ...input,
      status: "processing",
      measurement_entry_id: null,
      measurement_revision_id: null,
      response_payload: null,
      error_code: null,
      completed_at: null,
    })
  }

  async failMeasurementMutation(input: {
    mutationId: string
    errorCode: string
  }) {
    return await this.updateResearchMeasurementMutations({
      id: input.mutationId,
      status: "failed",
      error_code: input.errorCode,
      completed_at: new Date(),
    })
  }

  @InjectTransactionManager()
  private async completeMeasurementMutation(
    input: {
      mutationId: string
      entryId: string
      revisionId: string | null
      responsePayload: Record<string, unknown>
    },
    @MedusaContext() sharedContext: Context,
  ) {
    return await this.updateResearchMeasurementMutations(
      {
        id: input.mutationId,
        status: "completed",
        measurement_entry_id: input.entryId,
        measurement_revision_id: input.revisionId,
        response_payload: input.responsePayload,
        error_code: null,
        completed_at: new Date(),
      },
      sharedContext,
    )
  }

  @InjectManager()
  @InjectTransactionManager()
  async createMeasurementWithRevision(
    input: {
      profileId: string
      metricType: "weight" | "waist" | "body_fat"
      revision: ResearchMeasurementRevisionWrite
      mutationId: string
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const entry = await this.createResearchMeasurementEntries(
      {
        profile_id: input.profileId,
        metric_type: input.metricType,
        status: "active",
        current_revision_id: null,
        voided_at: null,
        restored_at: null,
      },
      sharedContext,
    )
    const revision = await this.createResearchMeasurementRevisions(
      { ...input.revision, measurement_entry_id: entry.id },
      sharedContext,
    )
    const updatedEntry = await this.updateResearchMeasurementEntries(
      { id: entry.id, current_revision_id: revision.id },
      sharedContext,
    )
    const responsePayload = {
      created: true,
      measurement_entry_id: entry.id,
      revision_id: revision.id,
      status: "active",
    }
    const mutation = await this.completeMeasurementMutation(
      {
        mutationId: input.mutationId,
        entryId: entry.id,
        revisionId: revision.id,
        responsePayload,
      },
      sharedContext,
    )

    return { entry: updatedEntry, revision, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async reviseMeasurement(
    input: {
      entryId: string
      expectedRevisionId: string
      revision: ResearchMeasurementRevisionWrite
      mutationId: string
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const revision = await this.createResearchMeasurementRevisions(
      { ...input.revision, measurement_entry_id: input.entryId },
      sharedContext,
    )
    const entries = await this.updateResearchMeasurementEntries(
      {
        selector: {
          id: input.entryId,
          current_revision_id: input.expectedRevisionId,
          status: "active",
        },
        data: { current_revision_id: revision.id },
      },
      sharedContext,
    )
    const entry = entries[0]

    if (!entry) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_measurement_changed",
      )
    }
    const responsePayload = {
      created: false,
      measurement_entry_id: entry.id,
      revision_id: revision.id,
      status: "active",
    }
    const mutation = await this.completeMeasurementMutation(
      {
        mutationId: input.mutationId,
        entryId: entry.id,
        revisionId: revision.id,
        responsePayload,
      },
      sharedContext,
    )

    return { entry, revision, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async transitionMeasurement(
    input: {
      entryId: string
      expectedRevisionId: string
      expectedStatus: "active" | "voided"
      status: "active" | "voided"
      operation: "void" | "restore"
      mutationId: string
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const now = new Date()
    const entries = await this.updateResearchMeasurementEntries(
      {
        selector: {
          id: input.entryId,
          current_revision_id: input.expectedRevisionId,
          status: input.expectedStatus,
        },
        data: {
          status: input.status,
          voided_at: input.operation === "void" ? now : null,
          restored_at: input.operation === "restore" ? now : null,
        },
      },
      sharedContext,
    )
    const entry = entries[0]

    if (!entry) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_measurement_changed",
      )
    }
    const responsePayload = {
      measurement_entry_id: entry.id,
      revision_id: input.expectedRevisionId,
      status: input.status,
    }
    const mutation = await this.completeMeasurementMutation(
      {
        mutationId: input.mutationId,
        entryId: entry.id,
        revisionId: input.expectedRevisionId,
        responsePayload,
      },
      sharedContext,
    )

    return { entry, mutation, responsePayload }
  }

  async beginJournalMutation(input: {
    profile_id: string
    operation: "create" | "revise" | "void" | "restore"
    idempotency_key: string
    request_fingerprint_sha256: string
  }) {
    return await this.createResearchJournalMutations({
      ...input,
      status: "processing",
      journal_entry_id: null,
      journal_revision_id: null,
      response_payload: null,
      error_code: null,
      completed_at: null,
    })
  }

  async failJournalMutation(input: { mutationId: string; errorCode: string }) {
    return await this.updateResearchJournalMutations({
      id: input.mutationId,
      status: "failed",
      error_code: input.errorCode,
      completed_at: new Date(),
    })
  }

  @InjectTransactionManager()
  private async completeJournalMutation(
    input: ResearchJournalMutationCompletion & {
      journalEntryId: string
      journalRevisionId: string
    },
    @MedusaContext() sharedContext: Context,
  ) {
    return await this.updateResearchJournalMutations(
      {
        id: input.mutation_id,
        status: "completed",
        journal_entry_id: input.journalEntryId,
        journal_revision_id: input.journalRevisionId,
        response_payload: input.response_payload,
        error_code: null,
        completed_at: new Date(),
      },
      sharedContext,
    )
  }

  @InjectManager()
  @InjectTransactionManager()
  async createJournalEntryWithRevision(
    input: {
      profileId: string
      revision: ResearchJournalRevisionWrite
      mutation: ResearchJournalMutationCompletion
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const entry = await this.createResearchJournalEntries(
      {
        profile_id: input.profileId,
        status: "active",
        current_revision_id: null,
        voided_at: null,
        restored_at: null,
      },
      sharedContext,
    )
    const revision = await this.createResearchJournalEntryRevisions(
      {
        ...input.revision,
        journal_entry_id: entry.id,
      },
      sharedContext,
    )
    const updatedEntry = await this.updateResearchJournalEntries(
      {
        id: entry.id,
        current_revision_id: revision.id,
      },
      sharedContext,
    )
    const responsePayload = {
      ...input.mutation.response_payload,
      journal_entry_id: entry.id,
      revision_id: revision.id,
      status: "active",
    }
    const mutation = await this.completeJournalMutation(
      {
        ...input.mutation,
        journalEntryId: entry.id,
        journalRevisionId: revision.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )

    return { entry: updatedEntry, revision, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async reviseJournalEntry(
    input: {
      journalEntryId: string
      expectedRevisionId: string
      revision: ResearchJournalRevisionWrite
      mutation: ResearchJournalMutationCompletion
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const revision = await this.createResearchJournalEntryRevisions(
      {
        ...input.revision,
        journal_entry_id: input.journalEntryId,
      },
      sharedContext,
    )
    const entries = await this.updateResearchJournalEntries(
      {
        selector: {
          id: input.journalEntryId,
          status: "active",
          current_revision_id: input.expectedRevisionId,
        },
        data: {
          current_revision_id: revision.id,
        },
      },
      sharedContext,
    )
    const entry = entries[0]

    if (!entry) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_journal_changed",
      )
    }

    const responsePayload = {
      ...input.mutation.response_payload,
      journal_entry_id: entry.id,
      revision_id: revision.id,
      status: entry.status,
    }
    const mutation = await this.completeJournalMutation(
      {
        ...input.mutation,
        journalEntryId: entry.id,
        journalRevisionId: revision.id,
        response_payload: responsePayload,
      },
      sharedContext,
    )

    return { entry, revision, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async transitionJournalEntry(
    input: {
      profileId: string
      journalEntryId: string
      expectedRevisionId: string
      expectedStatus: "active" | "voided"
      status: "active" | "voided"
      operation: "void" | "restore"
      occurredAt: Date
      mutation: ResearchJournalMutationCompletion
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const entries = await this.updateResearchJournalEntries(
      {
        selector: {
          id: input.journalEntryId,
          status: input.expectedStatus,
          current_revision_id: input.expectedRevisionId,
        },
        data: {
          status: input.status,
          voided_at: input.operation === "void" ? input.occurredAt : null,
          restored_at: input.operation === "restore" ? input.occurredAt : null,
        },
      },
      sharedContext,
    )
    const entry = entries[0]

    if (!entry) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "research_journal_changed",
      )
    }

    const responsePayload = {
      ...input.mutation.response_payload,
      journal_entry_id: entry.id,
      revision_id: input.expectedRevisionId,
      status: input.status,
    }
    const mutation = await this.completeJournalMutation(
      {
        ...input.mutation,
        journalEntryId: entry.id,
        journalRevisionId: input.expectedRevisionId,
        response_payload: responsePayload,
      },
      sharedContext,
    )
    const transition = await this.createResearchJournalStateTransitions(
      {
        profile_id: input.profileId,
        journal_entry_id: entry.id,
        mutation_id: mutation.id,
        operation: input.operation,
        occurred_at: input.occurredAt,
      },
      sharedContext,
    )

    return { entry, mutation, transition, responsePayload }
  }

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
      segments?: ResearchRoutineScheduleSegmentWrite[]
      markProfileAccessId?: string
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
    const segments = input.segments?.length
      ? await this.createResearchRoutineScheduleSegments(
          input.segments.map((segment) => ({
            ...segment,
            routine_revision_id: revision.id,
          })),
          sharedContext,
        )
      : []
    if (input.markProfileAccessId) {
      await this.updateResearchProtocolProfileAccesses(
        {
          id: input.markProfileAccessId,
          routine_id: routine.id,
          routine_started_at: new Date(),
        },
        sharedContext,
      )
    }
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

    return { routine: updatedRoutine, revision, segments, mutation, responsePayload }
  }

  @InjectManager()
  @InjectTransactionManager()
  async reviseRoutine(
    input: {
      routineId: string
      revision: ResearchRoutineRevisionWrite
      segments?: ResearchRoutineScheduleSegmentWrite[]
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
    const segments = input.segments?.length
      ? await this.createResearchRoutineScheduleSegments(
          input.segments.map((segment) => ({
            ...segment,
            routine_revision_id: revision.id,
          })),
          sharedContext,
        )
      : []
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

    return { routine, revision, segments, mutation, transition, responsePayload }
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
