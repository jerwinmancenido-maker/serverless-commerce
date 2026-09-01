import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../../modules/customer-notifications"
import type { StoreListCustomerNotifications } from "../../../../../modules/customer-notifications/contracts"
import { projectCustomerNotification } from "../../../../../modules/customer-notifications/projection"
import type CustomerNotificationsModuleService from "../../../../../modules/customer-notifications/service"

const privateNoStore = (res: MedusaResponse) => res.setHeader("Cache-Control", "private, no-store")

export async function GET(
  req: AuthenticatedMedusaRequest<unknown, StoreListCustomerNotifications>,
  res: MedusaResponse,
) {
  privateNoStore(res)
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const { status, category, event_key, from, to, offset, limit } = req.validatedQuery
  const filters: any = {
    customer_id: req.auth_context.actor_id,
    available_at: { $lte: new Date(), ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) },
  }
  if (status) filters.status = status
  else filters.status = ["unread", "read", "snoozed"]
  if (category) filters.category = category
  if (event_key) filters.event_key = event_key
  const [notifications, count] = await service.listAndCountCustomerNotifications(
    filters,
    { order: { created_at: "DESC" }, skip: offset, take: limit },
  )
  res.json({
    notifications: notifications.map(projectCustomerNotification),
    count,
    offset,
    limit,
  })
}
