import { MedusaError } from "@medusajs/framework/utils"

import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type MutationRecord = {
  id: string
  request_fingerprint_sha256: string
  status: "processing" | "completed" | "failed"
  response_payload: Record<string, unknown> | null
}

const JOURNAL_MUTATION_KEY_CONSUMED_PREFIX = "submission_key_consumed:"
const JOURNAL_REVISION_UNIQUE_CONFLICT =
  /^Research journal entry revision with journal_entry_id: [^,]+, revision_number: \d+, already exists\.$/

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

export async function beginJournalMutationOrReplay(input: {
  trackingService: ResearchTrackingModuleService
  profileId: string
  operation: "create" | "revise" | "void" | "restore"
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
  const [existing] = (await input.trackingService.listResearchJournalMutations(
    filters,
    { take: 1 },
  )) as MutationRecord[]

  if (existing) {
    return resolveExisting(existing, input.fingerprint)
  }

  try {
    const mutation = await input.trackingService.beginJournalMutation({
      ...filters,
      request_fingerprint_sha256: input.fingerprint,
    })

    return { mutationId: mutation.id, replay: null }
  } catch (error) {
    const [raced] =
      (await input.trackingService.listResearchJournalMutations(filters, {
        take: 1,
      })) as MutationRecord[]

    if (!raced) {
      throw error
    }

    return resolveExisting(raced, input.fingerprint)
  }
}

function journalMutationErrorCode(error: unknown): string {
  if (error instanceof MedusaError && error.message.trim()) {
    return error.message.slice(0, 255)
  }

  return "journal_mutation_failed"
}

export function normalizeJournalRevisionConflict(error: unknown): unknown {
  if (
    error instanceof MedusaError &&
    error.type === MedusaError.Types.INVALID_DATA &&
    JOURNAL_REVISION_UNIQUE_CONFLICT.test(error.message)
  ) {
    return new MedusaError(
      MedusaError.Types.CONFLICT,
      "research_journal_changed",
    )
  }

  return error
}

export async function recordJournalMutationFailure(input: {
  trackingService: ResearchTrackingModuleService
  mutationId: string
  error: unknown
}): Promise<never> {
  const errorCode = journalMutationErrorCode(input.error)

  await input.trackingService.failJournalMutation({
    mutationId: input.mutationId,
    errorCode,
  })

  const type =
    input.error instanceof MedusaError
      ? input.error.type
      : MedusaError.Types.UNEXPECTED_STATE

  throw new MedusaError(
    type,
    `${JOURNAL_MUTATION_KEY_CONSUMED_PREFIX}${errorCode}`,
  )
}
