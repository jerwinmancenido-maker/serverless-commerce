import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../../../modules/customer-notifications"
import { projectCustomerNotification, projectPreferenceCatalog } from "../../../../../../modules/customer-notifications/projection"
import type CustomerNotificationsModuleService from "../../../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "private, no-store")
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const [notifications, templates, preferences] = await Promise.all([
    service.listCustomerNotifications({ customer_id: req.auth_context.actor_id }, { take: 10_000, order: { created_at: "DESC" } }),
    service.listCustomerNotificationTemplates({}, { take: 100 }),
    service.listCustomerNotificationPreferences({ customer_id: req.auth_context.actor_id }, { take: 100 }),
  ])
  res.json({
    notifications: notifications.map(projectCustomerNotification),
    preferences: projectPreferenceCatalog({ templates, preferences }),
  })
}
