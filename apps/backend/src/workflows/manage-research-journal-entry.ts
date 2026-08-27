import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  manageResearchJournalEntryStep,
  type ManageResearchJournalWorkflowInput,
} from "./steps/manage-research-journal-entry"

export const manageResearchJournalEntryWorkflow = createWorkflow(
  "manage-research-journal-entry",
  function (input: ManageResearchJournalWorkflowInput) {
    const requestLock = transform({ input }, ({ input }) => ({
      key: `research-journal-request:${input.data.customerId}:${input.operation}:${input.data.idempotencyKey}`,
      timeout: 10,
      ttl: 60,
    }))
    const entryLock = transform({ input }, ({ input }) => ({
      key: `research-journal-entry:${input.data.customerId}:${"journalEntryId" in input.data ? input.data.journalEntryId : "create"}`,
      timeout: 10,
      ttl: 60,
    }))

    acquireLockStep(requestLock)
    acquireLockStep(entryLock).config({ name: "acquire-journal-entry-lock" })
    const result = manageResearchJournalEntryStep(input)
    releaseLockStep(entryLock)
    releaseLockStep(requestLock).config({ name: "release-journal-request-lock" })

    return new WorkflowResponse(result)
  },
)
