"use client"

import type { ResearchTrackingActionState } from "@lib/data/research-tracking"
import { createResearchSubmissionKey } from "@lib/research-tracking-idempotency"
import { useCallback, useEffect, useState } from "react"

function createClientSubmissionKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("Secure submission key generation is unavailable")
  }

  return createResearchSubmissionKey(() => globalThis.crypto.randomUUID())
}

export function useResearchSubmissionKey(
  state: ResearchTrackingActionState,
  initialKey?: string,
): string {
  const [submissionKey, setSubmissionKey] = useState(
    () => initialKey || createClientSubmissionKey(),
  )
  const rotate = useCallback(() => {
    setSubmissionKey(createClientSubmissionKey())
  }, [])

  useEffect(() => {
    if (state.submissionKeyConsumed) {
      rotate()
    }
  }, [rotate, state])

  return submissionKey
}
