import { MedusaError } from "@medusajs/framework/utils"

import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type MutationRecord = {
  id: string
  request_fingerprint_sha256: string
  status: "processing" | "completed" | "failed"
  response_payload: Record<string, unknown> | null
}

export const ROUTINE_MUTATION_KEY_CONSUMED_PREFIX =
  "submission_key_consumed:"

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function resolveExisting(
  existing: MutationRecord,
  fingerprint: string,
): { mutationId: null; replay: Record<string, unknown> } {
  if (existing.request_fingerprint_sha256 !== fingerprint) {
    conflict("idempotency_key_conflict")
  }

  if (existing.status === "processing") {
    conflict("request_in_progress")
  }

  if (existing.status === "failed") {
    conflict("previous_request_failed")
  }

  return { mutationId: null, replay: existing.response_payload ?? {} }
}

export async function beginRoutineMutationOrReplay(input: {
  trackingService: ResearchTrackingModuleService
  profileId: string
  operation: string
  idempotencyKey: string
  fingerprint: string
}): Promise<
  | { mutationId: string; replay: null }
  | { mutationId: null; replay: Record<string, unknown> }
> {
  const filters = {
    profile_id: input.profileId,
    operation: input.operation,
    idempotency_key: input.idempotencyKey,
  }
  const [existing] = (await input.trackingService.listResearchRoutineMutations(
    filters,
    { take: 1 },
  )) as MutationRecord[]

  if (existing) {
    return resolveExisting(existing, input.fingerprint)
  }

  try {
    const mutation = await input.trackingService.beginRoutineMutation({
      profile_id: input.profileId,
      operation: input.operation,
      idempotency_key: input.idempotencyKey,
      request_fingerprint_sha256: input.fingerprint,
    })

    return { mutationId: mutation.id, replay: null }
  } catch (error) {
    const [raced] = (await input.trackingService.listResearchRoutineMutations(
      filters,
      { take: 1 },
    )) as MutationRecord[]

    if (!raced) {
      throw error
    }

    return resolveExisting(raced, input.fingerprint)
  }
}

export function routineMutationErrorCode(error: unknown): string {
  if (error instanceof MedusaError && error.message.trim()) {
    return error.message.slice(0, 255)
  }

  return "routine_mutation_failed"
}

export function consumedRoutineMutationError(error: unknown): MedusaError {
  const type =
    error instanceof MedusaError
      ? error.type
      : MedusaError.Types.UNEXPECTED_STATE

  return new MedusaError(
    type,
    `${ROUTINE_MUTATION_KEY_CONSUMED_PREFIX}${routineMutationErrorCode(error)}`,
  )
}

export async function recordRoutineMutationFailure(input: {
  trackingService: ResearchTrackingModuleService
  mutationId: string
  error: unknown
}): Promise<never> {
  await input.trackingService.failRoutineMutation({
    mutationId: input.mutationId,
    errorCode: routineMutationErrorCode(input.error),
  })

  throw consumedRoutineMutationError(input.error)
}
