import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"

import {
  recordResearchProtocolVisibilityAuditStep,
  updateResearchProtocolVisibilityStep,
  type UpdateResearchProtocolVisibilityWorkflowInput,
} from "./steps/manage-research-protocol-visibility"

export const updateResearchProtocolVisibilityWorkflow = createWorkflow(
  "update-research-protocol-visibility",
  function (input: UpdateResearchProtocolVisibilityWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-visibility:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const policy = updateResearchProtocolVisibilityStep(input)
    recordResearchProtocolVisibilityAuditStep(input)
    releaseLockStep(lock)
    return new WorkflowResponse(policy)
  },
)
