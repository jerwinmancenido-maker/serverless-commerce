import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import { retrieveResearchProfileForRead } from "../../../../../../modules/research-tracking/queries/personal-routines"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const profile = await retrieveResearchProfileForRead(
    req.scope,
    req.auth_context.actor_id,
  )
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const notifications = await service.listResearchNotifications(
    { profile_id: profile.id },
    { order: { available_at: "DESC" }, take: 100 },
  )
  const now = new Date()
  const visible = notifications.filter(
    (notification) =>
      notification.status !== "scheduled" &&
      notification.status !== "dismissed" &&
      notification.available_at <= now,
  )

  res.json({
    notifications: visible,
    unread_count: visible.filter(
      (notification) =>
        notification.status === "unread" ||
        (notification.status === "snoozed" &&
          notification.snoozed_until &&
          notification.snoozed_until <= now),
    ).length,
  })
}
