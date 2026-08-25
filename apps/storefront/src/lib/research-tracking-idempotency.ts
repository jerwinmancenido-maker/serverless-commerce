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

const idempotencyKeyPattern = /^[A-Za-z0-9._:-]{8,128}$/

export function normalizeResearchSubmissionKey(value: unknown): string {
  const normalized = String(value ?? "").trim()

  if (!idempotencyKeyPattern.test(normalized)) {
    throw new Error("A valid research mutation key is required")
  }

  return normalized
}

export function createResearchSubmissionKeys(
  createId: () => string,
): ResearchSubmissionKeys {
  return Object.fromEntries(
    RESEARCH_MUTATION_NAMES.map((name) => [
      name,
      normalizeResearchSubmissionKey(`storefront:${createId()}`),
    ]),
  ) as ResearchSubmissionKeys
}
