import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  manageResearchOccurrenceAdjustmentStep,
  type ManageResearchOccurrenceAdjustmentInput,
} from "./steps/manage-research-occurrence-adjustment"

export const manageResearchOccurrenceAdjustmentWorkflow = createWorkflow(
  "manage-research-occurrence-adjustment",
  (input: ManageResearchOccurrenceAdjustmentInput) => {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-occurrence:${input.customerId}:${input.occurrenceId}`,
      timeout: 10,
      ttl: 30,
    }))
    acquireLockStep(lock)
    const result = manageResearchOccurrenceAdjustmentStep(input)
    releaseLockStep(lock)
    return new WorkflowResponse(result)
  },
)
