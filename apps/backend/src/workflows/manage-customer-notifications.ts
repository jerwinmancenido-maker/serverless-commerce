import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import type {
  AdminUpdateCustomerNotificationTemplate,
  EmitCustomerNotification,
  StoreBulkCustomerNotificationAction,
  StoreMutateCustomerNotification,
  StoreUpdateCustomerNotificationPreferences,
} from "../modules/customer-notifications/contracts"
import type { NotificationEventKey } from "../modules/customer-notifications/catalog"
import {
  backfillLegacyCustomerNotificationsStep,
  bulkMutateCustomerNotificationsStep,
  emitCustomerNotificationStep,
  mutateCustomerNotificationStep,
  updateCustomerNotificationPreferencesStep,
  updateCustomerNotificationTemplateStep,
  releaseScheduledCustomerNotificationsStep,
  expireCustomerNotificationsStep,
} from "./steps/manage-customer-notifications"

export const emitCustomerNotificationWorkflow = createWorkflow(
  "emit-customer-notification",
  function (input: EmitCustomerNotification) {
    return new WorkflowResponse(emitCustomerNotificationStep(input))
  },
)

export const mutateCustomerNotificationWorkflow = createWorkflow(
  "mutate-customer-notification",
  function (input: { customer_id: string; notification_id: string; mutation: StoreMutateCustomerNotification }) {
    return new WorkflowResponse(mutateCustomerNotificationStep(input))
  },
)

export const bulkMutateCustomerNotificationsWorkflow = createWorkflow(
  "bulk-mutate-customer-notifications",
  function (input: { customer_id: string; mutation: StoreBulkCustomerNotificationAction }) {
    return new WorkflowResponse(bulkMutateCustomerNotificationsStep(input))
  },
)

export const updateCustomerNotificationPreferencesWorkflow = createWorkflow(
  "update-customer-notification-preferences",
  function (input: { customer_id: string; preferences: StoreUpdateCustomerNotificationPreferences["preferences"] }) {
    return new WorkflowResponse(updateCustomerNotificationPreferencesStep(input))
  },
)

export const updateCustomerNotificationTemplateWorkflow = createWorkflow(
  "update-customer-notification-template",
  function (input: AdminUpdateCustomerNotificationTemplate & { event_key: NotificationEventKey; actor_id: string }) {
    return new WorkflowResponse(updateCustomerNotificationTemplateStep(input))
  },
)

export const backfillLegacyCustomerNotificationsWorkflow = createWorkflow(
  "backfill-legacy-customer-notifications",
  function () {
    return new WorkflowResponse(backfillLegacyCustomerNotificationsStep({}))
  },
)

export const releaseScheduledCustomerNotificationsWorkflow = createWorkflow(
  "release-scheduled-customer-notifications",
  function () {
    return new WorkflowResponse(releaseScheduledCustomerNotificationsStep({}))
  },
)

export const expireCustomerNotificationsWorkflow = createWorkflow(
  "expire-customer-notifications",
  function () {
    return new WorkflowResponse(expireCustomerNotificationsStep({}))
  },
)
