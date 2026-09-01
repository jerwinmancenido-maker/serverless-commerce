import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../modules/research-tracking/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const notifications = await service.listResearchNotifications(
    {},
    { order: { created_at: "DESC" }, take: 100 },
  )
  const attempts = await service.listResearchNotificationDeliveryAttempts(
    { notification_id: notifications.map((item) => item.id) },
    { order: { attempted_at: "DESC" } },
  )
  res.json({
    notifications: notifications.map((notification) => ({
      id: notification.id,
      channel: notification.channel,
      status: notification.status,
      type: notification.type,
      scheduled_for: notification.scheduled_for,
      delivered_at: notification.delivered_at,
      template_version: notification.template_version,
      attempt: attempts.find(
        (attempt) => attempt.notification_id === notification.id,
      ) ?? null,
    })),
  })
}
