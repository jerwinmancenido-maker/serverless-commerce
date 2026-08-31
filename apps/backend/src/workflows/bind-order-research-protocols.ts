import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import { bindOrderResearchProtocolsStep } from "./steps/bind-order-research-protocols"

export const bindOrderResearchProtocolsWorkflow = createWorkflow(
  "bind-order-research-protocols",
  function (input: { order_id: string }) {
    return new WorkflowResponse(bindOrderResearchProtocolsStep(input))
  },
)
