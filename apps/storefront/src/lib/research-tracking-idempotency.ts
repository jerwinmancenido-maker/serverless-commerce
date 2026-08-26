export const RESEARCH_MUTATION_NAMES = [
  "profileCreate",
  "preferencesUpdate",
  "consentRenewal",
  "profileClosure",
  "deletionRequest",
  "deletionCancellation",
] as const

export type ResearchMutationName = (typeof RESEARCH_MUTATION_NAMES)[number]

export type ResearchSubmissionKeys = Record<ResearchMutationName, string>

export type PurchasedActivationSubmissionKeys = Record<string, string>

export const RESEARCH_LOG_MUTATION_OPERATIONS = [
  "revise",
  "void",
  "restore",
] as const

export type ResearchLogMutationOperation =
  (typeof RESEARCH_LOG_MUTATION_OPERATIONS)[number]

export type RoutineSubmissionKeys = {
  create: string
  updates: Record<string, string>
  transitions: Record<string, string>
  confirmations: Record<string, string>
  logMutations: Record<
    string,
    Record<ResearchLogMutationOperation, string>
  >
}

const idempotencyKeyPattern = /^[A-Za-z0-9._:-]{8,128}$/

export const RESEARCH_SUBMISSION_KEY_CONSUMED_PREFIX =
  "submission_key_consumed:"

export function classifyResearchSubmissionFailure(message: unknown): {
  reason: string
  submissionKeyConsumed: boolean
} {
  const rawReason = String(message ?? "")
  const explicitlyConsumed = rawReason.startsWith(
    RESEARCH_SUBMISSION_KEY_CONSUMED_PREFIX,
  )
  const reason = explicitlyConsumed
    ? rawReason.slice(RESEARCH_SUBMISSION_KEY_CONSUMED_PREFIX.length)
    : rawReason

  return {
    reason,
    submissionKeyConsumed:
      explicitlyConsumed ||
      reason === "idempotency_key_conflict" ||
      reason === "previous_request_failed",
  }
}

export function normalizeResearchSubmissionKey(value: unknown): string {
  const normalized = String(value ?? "").trim()

  if (!idempotencyKeyPattern.test(normalized)) {
    throw new Error("A valid research mutation key is required")
  }

  return normalized
}

export function createResearchSubmissionKey(createId: () => string): string {
  return normalizeResearchSubmissionKey(`storefront:${createId()}`)
}

export function createResearchSubmissionKeys(
  createId: () => string,
): ResearchSubmissionKeys {
  return Object.fromEntries(
    RESEARCH_MUTATION_NAMES.map((name) => [
      name,
      createResearchSubmissionKey(createId),
    ]),
  ) as ResearchSubmissionKeys
}

export function createPurchasedActivationSubmissionKeys(
  lineItemIds: string[],
  createId: () => string,
): PurchasedActivationSubmissionKeys {
  return Object.fromEntries(
    lineItemIds.map((lineItemId) => [
      lineItemId,
      createResearchSubmissionKey(createId),
    ]),
  )
}

export function createRoutineSubmissionKeys(
  routineIds: string[],
  occurrenceIds: string[],
  logIds: string[],
  createId: () => string,
): RoutineSubmissionKeys {
  return {
    create: createResearchSubmissionKey(createId),
    updates: Object.fromEntries(
      routineIds.map((routineId) => [
        routineId,
        createResearchSubmissionKey(createId),
      ]),
    ),
    transitions: Object.fromEntries(
      routineIds.map((routineId) => [
        routineId,
        createResearchSubmissionKey(createId),
      ]),
    ),
    confirmations: Object.fromEntries(
      occurrenceIds.map((occurrenceId) => [
        occurrenceId,
        createResearchSubmissionKey(createId),
      ]),
    ),
    logMutations: Object.fromEntries(
      logIds.map((logId) => [
        logId,
        Object.fromEntries(
          RESEARCH_LOG_MUTATION_OPERATIONS.map((operation) => [
            operation,
            createResearchSubmissionKey(createId),
          ]),
        ) as Record<ResearchLogMutationOperation, string>,
      ]),
    ),
  }
}
