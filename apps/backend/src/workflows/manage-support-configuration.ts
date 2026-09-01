import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  markSupportReadStep,
  updateSupportSettingsStep,
  upsertSupportCategoryStep,
  type MarkSupportReadInput,
  type UpdateSupportSettingsInput,
  type UpsertSupportCategoryInput,
} from "./steps/manage-support-configuration"

export const updateSupportSettingsWorkflow = createWorkflow(
  "update-support-settings",
  (input: UpdateSupportSettingsInput) =>
    new WorkflowResponse(updateSupportSettingsStep(input)),
)

export const upsertSupportCategoryWorkflow = createWorkflow(
  "upsert-support-category",
  (input: UpsertSupportCategoryInput) =>
    new WorkflowResponse(upsertSupportCategoryStep(input)),
)

export const markSupportReadWorkflow = createWorkflow(
  "mark-support-read",
  (input: MarkSupportReadInput) =>
    new WorkflowResponse(markSupportReadStep(input)),
)
