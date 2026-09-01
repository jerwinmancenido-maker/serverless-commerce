import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../modules/customer-notifications"
import type { AdminListCustomerNotificationOperations } from "../../../../modules/customer-notifications/contracts"
import type CustomerNotificationsModuleService from "../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const { event_key, status, offset, limit } = req.validatedQuery as AdminListCustomerNotificationOperations
  const attemptFilters: any = {}
  if (status) attemptFilters.status = status
  const [attempts, count] = await service.listAndCountCustomerNotificationDeliveryAttempts(attemptFilters, { order: { attempted_at: "DESC" }, skip: offset, take: limit })
  const notifications = attempts.length
    ? await service.listCustomerNotifications({ id: attempts.map((item) => item.notification_id), ...(event_key ? { event_key } : {}) })
    : []
  const notificationById = new Map(notifications.map((item) => [item.id, item]))
  res.json({
    operations: attempts.filter((attempt) => notificationById.has(attempt.notification_id)).map((attempt) => {
      const notification = notificationById.get(attempt.notification_id)!
      return {
        id: attempt.id,
        event_key: notification.event_key,
        channel: attempt.channel,
        status: attempt.status,
        template_revision_id: notification.template_revision_id,
        attempted_at: attempt.attempted_at,
        failure_code: attempt.failure_code,
        retry_at: attempt.retry_at,
        is_test: notification.metadata?.is_test === true,
      }
    }),
    count,
    offset,
    limit,
  })
}
