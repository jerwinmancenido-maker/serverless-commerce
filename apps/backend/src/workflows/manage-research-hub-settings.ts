import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  updateResearchHubSettingsStep,
  type UpdateResearchHubSettingsInput,
} from "./steps/manage-research-hub-settings"

export const updateResearchHubSettingsWorkflow = createWorkflow(
  "update-research-hub-settings",
  function (input: UpdateResearchHubSettingsInput) {
    return new WorkflowResponse(updateResearchHubSettingsStep(input))
  },
)
