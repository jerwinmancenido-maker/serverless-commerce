import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import type { ConfirmResearchRoutineLogInput } from "../modules/research-tracking/contracts/personal-routines"
import { confirmResearchRoutineLogStep } from "./steps/confirm-research-routine-log"

export const confirmResearchRoutineLogWorkflow = createWorkflow(
  "confirm-research-routine-log",
  function (input: ConfirmResearchRoutineLogInput) {
    const requestLock = transform({ input }, ({ input }) => ({
      key: `research-log-request:${input.customerId}:${input.idempotencyKey}`,
      timeout: 10,
      ttl: 60,
    }))
    const occurrenceLock = transform({ input }, ({ input }) => ({
      key: `research-log-occurrence:${input.customerId}:${input.occurrenceId}`,
      timeout: 10,
      ttl: 60,
    }))
    const supplyLock = transform({ input }, ({ input }) => ({
      key: `research-supply-ledger:${input.customerId}`,
      timeout: 10,
      ttl: 60,
    }))

    acquireLockStep(requestLock)
    acquireLockStep(occurrenceLock).config({ name: "acquire-occurrence-lock" })
    acquireLockStep(supplyLock).config({ name: "acquire-supply-lock" })
    const result = confirmResearchRoutineLogStep(input)
    releaseLockStep(supplyLock)
    releaseLockStep(occurrenceLock).config({ name: "release-occurrence-lock" })
    releaseLockStep(requestLock).config({ name: "release-request-lock" })

    return new WorkflowResponse(result)
  },
)
