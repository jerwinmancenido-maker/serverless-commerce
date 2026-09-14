/**
 * @file    apps/backend/src/workflows/deduct-order-bom-components.ts
 * @module  DeductOrderBomComponentsWorkflow (BOM Module)
 * @purpose End-to-end workflow to deduct constituent BOM supplies when a customer order is fulfilled.
 * @contracts
 *   Workflow: deductOrderBomComponentsWorkflow
 *   Step:     deductOrderBomComponentsStep
 */

import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deductOrderBomComponentsStep,
  type DeductOrderBomComponentsInput,
} from "./steps/deduct-order-bom-components"

export const deductOrderBomComponentsWorkflow = createWorkflow(
  "deduct-order-bom-components",
  function (input: DeductOrderBomComponentsInput) {
    return new WorkflowResponse(deductOrderBomComponentsStep(input))
  },
)
