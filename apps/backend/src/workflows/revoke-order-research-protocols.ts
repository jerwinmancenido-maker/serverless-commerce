/**
 * @file    apps/backend/src/workflows/revoke-order-research-protocols.ts
 * @module  RevokeOrderResearchProtocolsWorkflow (Research Content & Tracking Modules)
 * @purpose Workflow to revoke order-bound protocol tokens and linked profile entitlements.
 * @contracts
 *   Workflow: revokeOrderResearchProtocolsWorkflow
 *   Steps: revokeOrderResearchProtocolsStep
 */

import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  revokeOrderResearchProtocolsStep,
  type RevokeOrderResearchProtocolsInput,
} from "./steps/revoke-order-research-protocols"

export const revokeOrderResearchProtocolsWorkflow = createWorkflow(
  "revoke-order-research-protocols",
  function (input: RevokeOrderResearchProtocolsInput) {
    const result = revokeOrderResearchProtocolsStep(input)
    return new WorkflowResponse(result)
  },
)

export default revokeOrderResearchProtocolsWorkflow
