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
  mutateResearchRoutineLogStep,
  type MutateResearchRoutineLogInput,
} from "./steps/mutate-research-routine-log"

export const mutateResearchRoutineLogWorkflow = createWorkflow(
  "mutate-research-routine-log",
  function (input: MutateResearchRoutineLogInput) {
    const requestLock = transform({ input }, ({ input }) => ({
      key: `research-log-request:${input.customerId}:${input.idempotencyKey}`,
      timeout: 10,
      ttl: 60,
    }))
    const logLock = transform({ input }, ({ input }) => ({
      key: `research-log:${input.customerId}:${input.logId}`,
      timeout: 10,
      ttl: 60,
    }))
    const supplyLock = transform({ input }, ({ input }) => ({
      key: `research-supply-ledger:${input.customerId}`,
      timeout: 10,
      ttl: 60,
    }))

    acquireLockStep(requestLock)
    acquireLockStep(logLock).config({ name: "acquire-log-lock" })
    acquireLockStep(supplyLock).config({ name: "acquire-supply-lock" })
    const result = mutateResearchRoutineLogStep(input)
    releaseLockStep(supplyLock)
    releaseLockStep(logLock).config({ name: "release-log-lock" })
    releaseLockStep(requestLock).config({ name: "release-request-lock" })

    return new WorkflowResponse(result)
  },
)
