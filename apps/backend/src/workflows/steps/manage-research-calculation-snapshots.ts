import { createHash } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  calculateResearchSnapshot,
  type StoreCreateCalculationSnapshotType,
  type StoreMutateCalculationSnapshotType,
} from "../../modules/research-tracking/contracts/calculations"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

async function activeProfile(service: ResearchTrackingModuleService, customerId: string) {
  const [profile] = await service.listResearchProfiles(
    { customer_id: customerId, status: "active" },
    { take: 1 },
  )
  if (!profile) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "research_profile_action_required")
  }
  return profile
}

const fingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex")

async function verifyReferences(
  service: ResearchTrackingModuleService,
  profileId: string,
  input: {
    profile_protocol_access_id?: string | null
    protocol_series_id?: string | null
    protocol_revision_id?: string | null
    routine_id?: string | null
    journal_entry_id?: string | null
  },
) {
  if (input.profile_protocol_access_id) {
    const [access] = await service.listResearchProtocolProfileAccesses(
      { id: input.profile_protocol_access_id, profile_id: profileId, status: "active" },
      { take: 1 },
    )
    if (!access) throw new MedusaError(MedusaError.Types.NOT_FOUND, "protocol_access_not_found")
    if (input.protocol_revision_id && input.protocol_revision_id !== access.protocol_revision_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "protocol_revision_mismatch")
    }
    if (input.protocol_series_id && input.protocol_series_id !== access.protocol_series_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "protocol_series_mismatch")
    }
  }
  if (input.routine_id) {
    const [routine] = await service.listResearchRoutines(
      { id: input.routine_id, profile_id: profileId },
      { take: 1 },
    )
    if (!routine) throw new MedusaError(MedusaError.Types.NOT_FOUND, "routine_not_found")
  }
  if (input.journal_entry_id) {
    const [entry] = await service.listResearchJournalEntries(
      { id: input.journal_entry_id, profile_id: profileId },
      { take: 1 },
    )
    if (!entry) throw new MedusaError(MedusaError.Types.NOT_FOUND, "journal_entry_not_found")
  }
}

export type CreateCalculationSnapshotInput = {
  customerId: string
  snapshot: StoreCreateCalculationSnapshotType
}

export const createCalculationSnapshotStep = createStep(
  "create-calculation-snapshot",
  async (input: CreateCalculationSnapshotInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const profile = await activeProfile(service, input.customerId)
    const requestFingerprint = fingerprint(input.snapshot)
    const [existing] = await service.listResearchCalculationSnapshots(
      { profile_id: profile.id, idempotency_key: input.snapshot.idempotency_key },
      { take: 1 },
    )
    if (existing) {
      if (existing.request_fingerprint_sha256 !== requestFingerprint) {
        throw new MedusaError(MedusaError.Types.CONFLICT, "idempotency_key_conflict")
      }
      return new StepResponse(existing, null)
    }
    await verifyReferences(service, profile.id, input.snapshot)
    let result: ReturnType<typeof calculateResearchSnapshot>
    try {
      result = calculateResearchSnapshot(input.snapshot.input)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error instanceof Error ? error.message : "calculation_input_invalid",
      )
    }
    const snapshot = await service.createResearchCalculationSnapshots({
      profile_id: profile.id,
      mode: input.snapshot.mode,
      title: input.snapshot.title,
      idempotency_key: input.snapshot.idempotency_key,
      request_fingerprint_sha256: requestFingerprint,
      protocol_series_id: input.snapshot.protocol_series_id,
      protocol_revision_id: input.snapshot.protocol_revision_id,
      profile_protocol_access_id: input.snapshot.profile_protocol_access_id,
      routine_id: input.snapshot.routine_id,
      journal_entry_id: input.snapshot.journal_entry_id,
      input_snapshot: input.snapshot.input,
      result_snapshot: result,
      unit_context_snapshot: {
        compound_mass_unit: input.snapshot.input.compound_mass_unit,
        target_amount_unit: input.snapshot.input.target_amount_unit,
        final_volume_unit: "mL",
        concentration_unit: "mg/mL",
        device_label: input.snapshot.input.device_label,
        device_volume_ml: input.snapshot.input.device_volume_ml,
        iu_per_mg: input.snapshot.input.iu_per_mg,
        rounding_precision: input.snapshot.input.rounding_precision,
      },
      saved_at: new Date(),
      archived_at: null,
    })
    return new StepResponse(snapshot, snapshot.id)
  },
  async (id, { container }) => {
    if (id) {
      await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).deleteResearchCalculationSnapshots(id)
    }
  },
)

export type MutateCalculationSnapshotInput = {
  customerId: string
  snapshotId: string
  mutation: StoreMutateCalculationSnapshotType
}

export const mutateCalculationSnapshotStep = createStep(
  "mutate-calculation-snapshot",
  async (input: MutateCalculationSnapshotInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const profile = await activeProfile(service, input.customerId)
    const [snapshot] = await service.listResearchCalculationSnapshots(
      { id: input.snapshotId, profile_id: profile.id },
      { take: 1 },
    )
    if (!snapshot) throw new MedusaError(MedusaError.Types.NOT_FOUND, "calculation_snapshot_not_found")
    await verifyReferences(service, profile.id, input.mutation)
    const prior = {
      id: snapshot.id,
      routine_id: snapshot.routine_id,
      journal_entry_id: snapshot.journal_entry_id,
      archived_at: snapshot.archived_at,
    }
    const updated = await service.updateResearchCalculationSnapshots({
      id: snapshot.id,
      routine_id: input.mutation.action === "attach" ? input.mutation.routine_id : snapshot.routine_id,
      journal_entry_id: input.mutation.action === "attach" ? input.mutation.journal_entry_id : snapshot.journal_entry_id,
      archived_at: input.mutation.action === "archive" ? new Date() : snapshot.archived_at,
    })
    return new StepResponse(updated, prior)
  },
  async (prior, { container }) => {
    if (prior) {
      await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).updateResearchCalculationSnapshots(prior)
    }
  },
)
