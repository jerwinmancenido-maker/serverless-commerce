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
  manageResearchRoutineStep,
  type ManageRoutineWorkflowInput,
} from "./steps/manage-research-routine"

export const manageResearchRoutineWorkflow = createWorkflow(
  "manage-research-routine",
  function (input: ManageRoutineWorkflowInput) {
    const requestLock = transform({ input }, ({ input }) => ({
      key: `research-routine-request:${input.data.customerId}:${input.operation}:${input.data.idempotencyKey}`,
      timeout: 10,
      ttl: 60,
    }))
    const routineLock = transform({ input }, ({ input }) => ({
      key: `research-routine:${input.data.customerId}:${"routineId" in input.data ? input.data.routineId : input.data.trackedMaterialId}`,
      timeout: 10,
      ttl: 60,
    }))

    acquireLockStep(requestLock)
    acquireLockStep(routineLock).config({ name: "acquire-routine-lock" })
    const result = manageResearchRoutineStep(input)
    releaseLockStep(routineLock)
    releaseLockStep(requestLock).config({ name: "release-request-lock" })

    return new WorkflowResponse(result)
  },
)
