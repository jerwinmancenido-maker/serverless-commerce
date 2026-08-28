import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import type { RecordResearchJournalConsentInput } from "../modules/research-tracking/contracts/journal-consent"
import { recordResearchJournalConsentStep } from "./steps/record-research-journal-consent"

export const recordResearchJournalConsentWorkflow = createWorkflow(
  "record-research-journal-consent",
  function (input: RecordResearchJournalConsentInput) {
    const requestLock = transform(
      { input },
      ({ input }) => ({
        key: `research-journal-consent:${input.customerId}:${input.idempotencyKey}`,
        timeout: 10,
        ttl: 30,
      }),
    )
    const stateLock = transform(
      { input },
      ({ input }) => ({
        key: `research-journal-consent-state:${input.customerId}`,
        timeout: 10,
        ttl: 30,
      }),
    )
    acquireLockStep(requestLock)
    acquireLockStep(stateLock).config({ name: "acquire-journal-consent-state-lock" })
    const result = recordResearchJournalConsentStep(input)
    releaseLockStep(stateLock)
    releaseLockStep(requestLock).config({ name: "release-journal-consent-request-lock" })

    return new WorkflowResponse(result)
  },
)
