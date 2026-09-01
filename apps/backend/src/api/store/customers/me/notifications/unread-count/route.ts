import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../../../modules/customer-notifications"
import type CustomerNotificationsModuleService from "../../../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "private, no-store")
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const [, unread] = await service.listAndCountCustomerNotifications({
    customer_id: req.auth_context.actor_id,
    status: ["unread", "snoozed"],
    available_at: { $lte: new Date() },
  }, { take: 0 })
  res.json({ unread_count: unread })
}
