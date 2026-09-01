import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  manageSupportSavedResponseStep,
  type ManageSupportSavedResponseInput,
} from "./steps/manage-support-saved-response"

export const manageSupportSavedResponseWorkflow = createWorkflow(
  "manage-support-saved-response",
  (input: ManageSupportSavedResponseInput) =>
    new WorkflowResponse(manageSupportSavedResponseStep(input)),
)
