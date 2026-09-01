import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { AdminRestoreCustomerNotificationTemplate } from "../../../middlewares"
import { getNotificationCatalogEntry, type NotificationEventKey } from "../../../../../../modules/customer-notifications/catalog"
import { updateCustomerNotificationTemplateWorkflow } from "../../../../../../workflows/manage-customer-notifications"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminRestoreCustomerNotificationTemplate>,
  res: MedusaResponse,
) {
  const eventKey = req.params.eventKey as NotificationEventKey
  const catalog = getNotificationCatalogEntry(eventKey)
  const { result } = await updateCustomerNotificationTemplateWorkflow(req.scope).run({
    input: {
      event_key: eventKey,
      actor_id: req.auth_context.actor_id,
      title_template: catalog.title_template,
      body_template: catalog.body_template,
      action_label: catalog.action_label,
      priority: catalog.priority,
      default_enabled: catalog.default_enabled,
      enabled: catalog.enabled,
      retention_days: catalog.retention_days,
      change_reason: req.validatedBody.change_reason,
    },
  })
  res.json(result)
}
