import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  manageResearchMeasurementStep,
  type MeasurementMutationInput,
} from "./steps/manage-research-measurement"

export const manageResearchMeasurementWorkflow = createWorkflow(
  "manage-research-measurement",
  (input: MeasurementMutationInput) =>
    new WorkflowResponse(manageResearchMeasurementStep(input)),
)
