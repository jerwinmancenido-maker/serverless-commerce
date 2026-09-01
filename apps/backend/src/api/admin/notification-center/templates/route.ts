import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../../../modules/customer-notifications"
import { NOTIFICATION_EVENT_CATALOG } from "../../../../modules/customer-notifications/catalog"
import type CustomerNotificationsModuleService from "../../../../modules/customer-notifications/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
  const stored = await service.listCustomerNotificationTemplates({}, { take: 100 })
  const revisionIds = stored.map((item) => item.current_revision_id).filter(Boolean) as string[]
  const revisions = revisionIds.length
    ? await service.listCustomerNotificationTemplateRevisions({ id: revisionIds })
    : []
  const templates = Object.values(NOTIFICATION_EVENT_CATALOG).filter((entry) => entry.event_key !== "system.test").map((catalog) => {
    const template = stored.find((item) => item.event_key === catalog.event_key)
    const revision = revisions.find((item) => item.id === template?.current_revision_id)
    return {
      id: template?.id || null,
      event_key: catalog.event_key,
      display_name: catalog.display_name,
      category: catalog.category,
      enabled: template?.enabled ?? catalog.enabled,
      priority: template?.default_priority ?? catalog.priority,
      default_enabled: template?.default_enabled ?? catalog.default_enabled,
      customer_can_disable: catalog.customer_can_disable,
      retention_days: template?.retention_days ?? catalog.retention_days,
      title_template: revision?.title_template ?? catalog.title_template,
      body_template: revision?.body_template ?? catalog.body_template,
      action_label: revision?.action_label ?? catalog.action_label,
      allowed_variables: catalog.allowed_variables,
      current_version: revision?.version ?? 1,
      updated_at: template?.updated_at || null,
    }
  })
  res.json({ templates })
}
