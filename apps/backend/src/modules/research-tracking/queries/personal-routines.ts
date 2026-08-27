import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

import type { ResearchBaseUnit } from "../../../lib/research-quantity"
import { RESEARCH_TRACKING_MODULE } from ".."
import {
  createResearchRoutineLogMutationPreviewToken,
  createResearchRoutineLogConfirmationPreviewToken,
  projectResearchOccurrences,
  type ResearchOccurrence,
  type ResearchRecurrenceType,
  type NormalizedResearchRoutineLogInput,
  type ResearchRoutineLogPreview,
  type ResearchRoutineLogMutationPreview,
  type ResearchRoutineLogProjection,
  type ResearchRoutineProjection,
  type ResearchRoutineStatus,
} from "../contracts/personal-routines"
import type ResearchTrackingModuleService from "../service"

type ProfileRecord = {
  id: string
  customer_id: string
  timezone: string
  consent_version: string
  status: "active" | "closed" | "deletion_requested"
}

type RoutineRecord = {
  id: string
  profile_id: string
  tracked_material_id: string
  status: ResearchRoutineStatus
  current_revision_id: string | null
  archived_at: Date | null
}

type RevisionRecord = {
  id: string
  routine_id: string
  label: string
  planned_quantity_base_units: number
  base_unit: ResearchBaseUnit
  timezone: string
  recurrence_type: ResearchRecurrenceType
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: { values: number[] } | null
  local_time: string
  start_date: Date
  end_date: Date | null
  effective_from_date: Date
  created_at: Date
}

type TrackedMaterialRecord = {
  id: string
  profile_id: string
  label: string
  status: "active" | "archived"
}

type RoutineStateTransitionRecord = {
  operation: "archive" | "resume"
  effective_date: Date
}

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function notFound(): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "resource was not found")
}

export async function retrieveResearchProfileForRead(
  container: MedusaContainer,
  customerId: string,
): Promise<ProfileRecord> {
  const [profile] = await service(container).listResearchProfiles(
    { customer_id: customerId },
    { take: 1 },
  )

  if (!profile) {
    notFound()
  }

  return profile as ProfileRecord
}

export async function retrieveActiveResearchProfile(
  container: MedusaContainer,
  customerId: string,
  activeConsentVersion: string,
): Promise<ProfileRecord> {
  const profile = await retrieveResearchProfileForRead(container, customerId)

  if (
    profile.status !== "active" ||
    profile.consent_version !== activeConsentVersion
  ) {
    throw new MedusaError(
      MedusaError.Types.FORBIDDEN,
      "research_profile_action_required",
    )
  }

  return profile
}

export async function retrieveOwnedRoutine(input: {
  container: MedusaContainer
  profileId: string
  routineId: string
}): Promise<RoutineRecord> {
  const [routine] = await service(input.container).listResearchRoutines(
    { id: input.routineId, profile_id: input.profileId },
    { take: 1 },
  )

  if (!routine) {
    notFound()
  }

  return routine as RoutineRecord
}

export async function retrieveOwnedActiveTrackedMaterial(input: {
  container: MedusaContainer
  profileId: string
  trackedMaterialId: string
}): Promise<TrackedMaterialRecord> {
  const [material] = await service(input.container).listTrackedMaterials(
    {
      id: input.trackedMaterialId,
      profile_id: input.profileId,
    },
    { take: 1 },
  )

  if (!material) {
    notFound()
  }

  if (material.status !== "active") {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "tracked_material_ineligible",
    )
  }

  return material as TrackedMaterialRecord
}

export async function retrieveRoutineRevision(
  container: MedusaContainer,
  revisionId: string,
): Promise<RevisionRecord> {
  const revision =
    await service(container).retrieveResearchRoutineRevision(revisionId)

  return revision as RevisionRecord
}

export async function listOwnedResearchRoutines(input: {
  container: MedusaContainer
  customerId: string
}): Promise<ResearchRoutineProjection[]> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const trackingService = service(input.container)
  const routines = (await trackingService.listResearchRoutines(
    { profile_id: profile.id },
    { order: { created_at: "DESC" } },
  )) as RoutineRecord[]

  return Promise.all(
    routines.map(async (routine) => {
      if (!routine.current_revision_id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "routine has no current revision",
        )
      }

      const revision = await retrieveRoutineRevision(
        input.container,
        routine.current_revision_id,
      )
      const material = (await trackingService.retrieveTrackedMaterial(
        routine.tracked_material_id,
      )) as TrackedMaterialRecord

      return {
        routine_id: routine.id,
        tracked_material_id: material.id,
        tracked_material_label: material.label,
        status: routine.status,
        archived_at: routine.archived_at,
        current_revision: {
          revision_id: revision.id,
          label: revision.label,
          planned_quantity_base_units: revision.planned_quantity_base_units,
          base_unit: revision.base_unit,
          schedule: {
            recurrence_type: revision.recurrence_type,
            daily_interval: revision.daily_interval,
            weekly_interval: revision.weekly_interval,
            weekdays: revision.weekdays?.values ?? [],
            local_time: revision.local_time,
            start_date: revision.start_date.toISOString().slice(0, 10),
            end_date: revision.end_date?.toISOString().slice(0, 10) ?? null,
            effective_from_date: revision.effective_from_date
              .toISOString()
              .slice(0, 10),
            timezone: revision.timezone,
          },
          created_at: revision.created_at,
        },
      }
    }),
  )
}

export async function listOwnedResearchOccurrences(input: {
  container: MedusaContainer
  customerId: string
  from: string
  to: string
}): Promise<ResearchOccurrence[]> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const routines = await listOwnedResearchRoutines(input)
  const trackingService = service(input.container)
  const occurrences: ResearchOccurrence[] = []

  for (const routine of routines.filter((item) => item.status === "active")) {
    const revisions = (await trackingService.listResearchRoutineRevisions(
      { routine_id: routine.routine_id },
      { order: { effective_from_date: "ASC" } },
    )) as RevisionRecord[]
    const logs = await trackingService.listResearchRoutineLogs({
      profile_id: profile.id,
      routine_id: routine.routine_id,
    })
    const logged = new Map(
      logs.map(
        (log) =>
          [log.occurrence_id, { logId: log.id, status: log.status }] as const,
      ),
    )
    const transitions =
      (await trackingService.listResearchRoutineStateTransitions(
        { routine_id: routine.routine_id },
        { order: { effective_date: "ASC" } },
      )) as RoutineStateTransitionRecord[]
    const inactiveDateRanges: Array<{ from: string; to: string | null }> = []

    for (const transition of transitions) {
      const date = transition.effective_date.toISOString().slice(0, 10)

      if (transition.operation === "archive") {
        inactiveDateRanges.push({ from: date, to: null })
      } else {
        const openRange = [...inactiveDateRanges]
          .reverse()
          .find((range) => range.to === null)

        if (openRange) {
          openRange.to = date
        }
      }
    }

    revisions.forEach((revision, index) => {
      const nextRevision = revisions[index + 1]
      const nextEffectiveDate = nextRevision
        ? nextRevision.effective_from_date.toISOString().slice(0, 10)
        : null
      const revisionEnd = nextEffectiveDate
        ? new Date(
            Date.parse(`${nextEffectiveDate}T00:00:00.000Z`) - 86_400_000,
          )
            .toISOString()
            .slice(0, 10)
        : input.to

      if (revisionEnd < input.from) {
        return
      }

      occurrences.push(
        ...projectResearchOccurrences({
          revision: {
            ...revision,
            weekdays: revision.weekdays?.values ?? [],
          },
          from: input.from,
          to: revisionEnd < input.to ? revisionEnd : input.to,
          loggedOccurrences: logged,
          archivedAtDate:
            routine.archived_at?.toISOString().slice(0, 10) ?? null,
          inactiveDateRanges,
        }),
      )
    })
  }

  return occurrences.sort((left, right) =>
    `${left.local_date}T${left.local_time}`.localeCompare(
      `${right.local_date}T${right.local_time}`,
    ),
  )
}

export async function previewResearchRoutineLog(input: {
  container: MedusaContainer
  normalized: NormalizedResearchRoutineLogInput
}): Promise<ResearchRoutineLogPreview> {
  const profile = await retrieveActiveResearchProfile(
    input.container,
    input.normalized.customerId,
    input.normalized.activeConsentVersion,
  )
  const routine = await retrieveOwnedRoutine({
    container: input.container,
    profileId: profile.id,
    routineId: input.normalized.routineId,
  })

  if (
    routine.status !== "active" ||
    routine.current_revision_id !== input.normalized.routineRevisionId
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "routine_revision_changed",
    )
  }

  const revision = await retrieveRoutineRevision(
    input.container,
    input.normalized.routineRevisionId,
  )
  const projected = projectResearchOccurrences({
    revision: {
      ...revision,
      weekdays: revision.weekdays?.values ?? [],
    },
    from: input.normalized.localDate,
    to: input.normalized.localDate,
  })[0]

  if (!projected || projected.occurrence_id !== input.normalized.occurrenceId) {
    throw new MedusaError(MedusaError.Types.CONFLICT, "occurrence_changed")
  }

  const trackingService = service(input.container)
  const [supply] = await trackingService.listResearchSupplies(
    {
      id: input.normalized.supplyId,
      tracked_material_id: routine.tracked_material_id,
    },
    { take: 1 },
  )

  if (!supply) {
    notFound()
  }

  if (supply.status !== "active") {
    throw new MedusaError(MedusaError.Types.CONFLICT, "supply_ineligible")
  }

  if (
    supply.base_unit !== input.normalized.baseUnit ||
    revision.base_unit !== input.normalized.baseUnit
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "incompatible_supply_unit",
    )
  }

  const projectedRemaining =
    supply.remaining_quantity_base_units -
    input.normalized.confirmedQuantityBaseUnits

  if (projectedRemaining < 0) {
    throw new MedusaError(MedusaError.Types.CONFLICT, "insufficient_supply")
  }

  const [existingLog] = await trackingService.listResearchRoutineLogs(
    {
      profile_id: profile.id,
      occurrence_id: input.normalized.occurrenceId,
    },
    { take: 1 },
  )

  if (existingLog) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      existingLog.status === "voided"
        ? "occurrence_requires_restore"
        : "occurrence_already_confirmed",
    )
  }

  return {
    routine_id: routine.id,
    routine_revision_id: revision.id,
    occurrence_id: projected.occurrence_id,
    local_date: projected.local_date,
    local_time: projected.local_time,
    timezone: projected.timezone,
    supply_id: supply.id,
    base_unit: supply.base_unit,
    confirmed_quantity_base_units: input.normalized.confirmedQuantityBaseUnits,
    current_remaining_quantity_base_units: supply.remaining_quantity_base_units,
    projected_remaining_quantity_base_units: projectedRemaining,
    notice:
      "For private research organization only. This record is not medical guidance.",
    preview_token: createResearchRoutineLogConfirmationPreviewToken({
      customerId: input.normalized.customerId,
      routineId: routine.id,
      routineRevisionId: revision.id,
      occurrenceId: projected.occurrence_id,
      localDate: projected.local_date,
      supplyId: supply.id,
      confirmedQuantityBaseUnits: input.normalized.confirmedQuantityBaseUnits,
      baseUnit: supply.base_unit,
    }),
  }
}

export async function listOwnedResearchRoutineLogs(input: {
  container: MedusaContainer
  customerId: string
}): Promise<ResearchRoutineLogProjection[]> {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const trackingService = service(input.container)
  const logs = await trackingService.listResearchRoutineLogs(
    { profile_id: profile.id },
    { order: { created_at: "DESC" } },
  )

  return Promise.all(
    logs.map(async (log) => {
      if (!log.current_revision_id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "routine log has no current revision",
        )
      }

      const revision = await trackingService.retrieveResearchRoutineLogRevision(
        log.current_revision_id,
      )

      return {
        log_id: log.id,
        routine_id: log.routine_id,
        routine_revision_id: revision.routine_revision_id,
        occurrence_id: log.occurrence_id,
        status: log.status,
        operation: revision.operation,
        local_date: revision.local_date.toISOString().slice(0, 10),
        local_time: revision.local_time,
        timezone: revision.timezone,
        supply_id: revision.supply_id,
        confirmed_quantity_base_units: revision.confirmed_quantity_base_units,
        base_unit: revision.base_unit,
        created_at: revision.created_at,
      }
    }),
  )
}

export async function previewResearchRoutineLogMutation(input: {
  container: MedusaContainer
  customerId: string
  activeConsentVersion: string
  logId: string
  operation: "revise" | "void" | "restore"
  supplyId?: string
  confirmedQuantityBaseUnits?: number
  baseUnit?: ResearchBaseUnit
}): Promise<ResearchRoutineLogMutationPreview> {
  const profile = await retrieveActiveResearchProfile(
    input.container,
    input.customerId,
    input.activeConsentVersion,
  )
  const trackingService = service(input.container)
  const [log] = await trackingService.listResearchRoutineLogs(
    { id: input.logId, profile_id: profile.id },
    { take: 1 },
  )

  if (!log?.current_revision_id) {
    notFound()
  }

  if (input.operation === "void" && log.status !== "confirmed") {
    throw new MedusaError(MedusaError.Types.CONFLICT, "log_not_confirmed")
  }

  if (input.operation === "revise" && log.status !== "confirmed") {
    throw new MedusaError(MedusaError.Types.CONFLICT, "log_not_confirmed")
  }

  if (input.operation === "restore" && log.status !== "voided") {
    throw new MedusaError(MedusaError.Types.CONFLICT, "log_not_voided")
  }

  const prior = await trackingService.retrieveResearchRoutineLogRevision(
    log.current_revision_id,
  )
  const oldSupply = await trackingService.retrieveResearchSupply(
    prior.supply_id,
  )

  if (input.operation === "void") {
    return {
      log_id: log.id,
      operation: input.operation,
      current_status: log.status,
      projected_status: "voided",
      supply_changes: [
        {
          supply_id: oldSupply.id,
          base_unit: oldSupply.base_unit,
          current_remaining_quantity_base_units:
            oldSupply.remaining_quantity_base_units,
          projected_remaining_quantity_base_units:
            oldSupply.remaining_quantity_base_units +
            prior.confirmed_quantity_base_units,
        },
      ],
      confirmed_quantity_base_units: prior.confirmed_quantity_base_units,
      base_unit: prior.base_unit,
      notice:
        "Review the restored private supply balance before voiding this record.",
      preview_token: createResearchRoutineLogMutationPreviewToken({
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
            supplyId: oldSupply.id,
            remainingQuantityBaseUnits:
              oldSupply.remaining_quantity_base_units,
          },
        ],
      }),
    }
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

  const routine = await trackingService.retrieveResearchRoutine(log.routine_id)
  const sameSupply = oldSupply.id === input.supplyId
  const [newSupply] = await trackingService.listResearchSupplies(
    {
      id: input.supplyId,
      tracked_material_id: routine.tracked_material_id,
      base_unit: input.baseUnit,
    },
    { take: 1 },
  )

  if (!newSupply) {
    notFound()
  }

  if (
    newSupply.status === "archived" ||
    (!sameSupply && newSupply.status !== "active")
  ) {
    throw new MedusaError(MedusaError.Types.CONFLICT, "supply_ineligible")
  }

  const quantity = input.confirmedQuantityBaseUnits as number
  const restoredOld =
    input.operation === "revise"
      ? oldSupply.remaining_quantity_base_units +
        prior.confirmed_quantity_base_units
      : oldSupply.remaining_quantity_base_units
  const projectedNew =
    (sameSupply ? restoredOld : newSupply.remaining_quantity_base_units) -
    quantity

  if (projectedNew < 0) {
    throw new MedusaError(MedusaError.Types.CONFLICT, "insufficient_supply")
  }

  return {
    log_id: log.id,
    operation: input.operation,
    current_status: log.status,
    projected_status: "confirmed",
    supply_changes: sameSupply
      ? [
          {
            supply_id: newSupply.id,
            base_unit: newSupply.base_unit,
            current_remaining_quantity_base_units:
              newSupply.remaining_quantity_base_units,
            projected_remaining_quantity_base_units: projectedNew,
          },
        ]
      : [
          ...(input.operation === "revise"
            ? [
                {
                  supply_id: oldSupply.id,
                  base_unit: oldSupply.base_unit,
                  current_remaining_quantity_base_units:
                    oldSupply.remaining_quantity_base_units,
                  projected_remaining_quantity_base_units: restoredOld,
                },
              ]
            : []),
          {
            supply_id: newSupply.id,
            base_unit: newSupply.base_unit,
            current_remaining_quantity_base_units:
              newSupply.remaining_quantity_base_units,
            projected_remaining_quantity_base_units: projectedNew,
          },
        ],
    confirmed_quantity_base_units: quantity,
    base_unit: input.baseUnit,
    notice:
      "Review every private supply balance change before confirming this record.",
    preview_token: createResearchRoutineLogMutationPreviewToken({
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
          remainingQuantityBaseUnits: oldSupply.remaining_quantity_base_units,
        },
        ...(sameSupply
          ? []
          : [
              {
                supplyId: newSupply.id,
                remainingQuantityBaseUnits:
                  newSupply.remaining_quantity_base_units,
              },
            ]),
      ],
    }),
  }
}
