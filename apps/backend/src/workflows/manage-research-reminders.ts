import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  mutateResearchNotificationStep,
  scheduleResearchNotificationsStep,
  updateReminderPreferencesStep,
  type MutateResearchNotificationInput,
  type ScheduleResearchNotificationsInput,
  type UpdateReminderPreferencesInput,
} from "./steps/manage-research-reminders"

export const updateResearchReminderPreferencesWorkflow = createWorkflow(
  "update-research-reminder-preferences",
  function (input: UpdateReminderPreferencesInput) {
    return new WorkflowResponse(updateReminderPreferencesStep(input))
  },
)

export const mutateResearchNotificationWorkflow = createWorkflow(
  "mutate-research-notification",
  function (input: MutateResearchNotificationInput) {
    return new WorkflowResponse(mutateResearchNotificationStep(input))
  },
)

export const scheduleResearchNotificationsWorkflow = createWorkflow(
  "schedule-research-notifications",
  function (input: ScheduleResearchNotificationsInput) {
    return new WorkflowResponse(scheduleResearchNotificationsStep(input))
  },
)
