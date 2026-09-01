import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../../modules/customer-notifications"
import { NOTIFICATION_EVENT_CATALOG } from "../../../../../modules/customer-notifications/catalog"
import type { StoreUpdateCustomerNotificationPreferences } from "../../../../../modules/customer-notifications/contracts"
import type CustomerNotificationsModuleService from "../../../../../modules/customer-notifications/service"
import { updateCustomerNotificationPreferencesWorkflow } from "../../../../../workflows/manage-customer-notifications"

const resolvePreferences = async (service: CustomerNotificationsModuleService, customerId: string) => {
  const overrides = await service.listCustomerNotificationPreferences({ customer_id: customerId })
  return Object.values(NOTIFICATION_EVENT_CATALOG).filter((entry) => entry.event_key !== "system.test").map((entry) => ({
    event_key: entry.event_key,
    display_name: entry.display_name,
    category: entry.category,
    enabled: overrides.find((item) => item.event_key === entry.event_key)?.enabled ?? entry.default_enabled,
    customer_can_disable: entry.customer_can_disable,
  }))
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "private, no-store")
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  res.json({ preferences: await resolvePreferences(service, req.auth_context.actor_id), channels: { in_app: "available", email: "unavailable", browser_push: "unavailable", mobile_push: "unavailable", sms: "unavailable" } })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateCustomerNotificationPreferences>,
  res: MedusaResponse,
) {
  res.setHeader("Cache-Control", "private, no-store")
  await updateCustomerNotificationPreferencesWorkflow(req.scope).run({
    input: { customer_id: req.auth_context.actor_id, preferences: req.validatedBody.preferences },
  })
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  res.json({ preferences: await resolvePreferences(service, req.auth_context.actor_id) })
}
