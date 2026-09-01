import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../../../modules/customer-notifications"
import { getNotificationCatalogEntry } from "../../../../../../modules/customer-notifications/catalog"
import type CustomerNotificationsModuleService from "../../../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  getNotificationCatalogEntry(req.params.eventKey)
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const revisions = await service.listCustomerNotificationTemplateRevisions(
    { event_key: req.params.eventKey },
    { order: { version: "DESC" }, take: 100 },
  )
  res.json({ revisions: revisions.map((item) => ({ id: item.id, version: item.version, title_template: item.title_template, body_template: item.body_template, action_label: item.action_label, change_reason: item.change_reason, changed_by_actor_id: item.changed_by_actor_id, created_at: item.created_at })) })
}
