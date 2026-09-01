import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../modules/customer-notifications"
import type CustomerNotificationsModuleService from "../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const [, failed] = await service.listAndCountCustomerNotificationDeliveryAttempts({ status: "failed" }, { take: 0 })
  const [last] = await service.listCustomerNotificationDeliveryAttempts({ status: "delivered" }, { order: { attempted_at: "DESC" }, take: 1 })
  res.json({
    enabled: true,
    channels: { in_app: "available", email: "unavailable", browser_push: "unavailable", mobile_push: "unavailable", sms: "unavailable" },
    scheduler: { status: "available", last_successful_delivery_at: last?.attempted_at || null },
    failed_delivery_count: failed,
  })
}
