import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getNotificationCatalogEntry, type NotificationEventKey } from "../../../../../modules/customer-notifications/catalog"
import type { AdminUpdateCustomerNotificationTemplate } from "../../../../../modules/customer-notifications/contracts"
import { updateCustomerNotificationTemplateWorkflow } from "../../../../../workflows/manage-customer-notifications"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateCustomerNotificationTemplate>,
  res: MedusaResponse,
) {
  const eventKey = req.params.eventKey as NotificationEventKey
  getNotificationCatalogEntry(eventKey)
  const { result } = await updateCustomerNotificationTemplateWorkflow(req.scope).run({
    input: { ...req.validatedBody, event_key: eventKey, actor_id: req.auth_context.actor_id },
  })
  res.json(result)
}
