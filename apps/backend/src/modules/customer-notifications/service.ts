import { MedusaService } from "@medusajs/framework/utils"

import CustomerNotification from "./models/customer-notification"
import CustomerNotificationAuditEvent from "./models/customer-notification-audit-event"
import CustomerNotificationDeliveryAttempt from "./models/customer-notification-delivery-attempt"
import CustomerNotificationPreference from "./models/customer-notification-preference"
import CustomerNotificationTemplate from "./models/customer-notification-template"
import CustomerNotificationTemplateRevision from "./models/customer-notification-template-revision"

class CustomerNotificationsModuleService extends MedusaService({
  CustomerNotification,
  CustomerNotificationAuditEvent,
  CustomerNotificationDeliveryAttempt,
  CustomerNotificationPreference,
  CustomerNotificationTemplate,
  CustomerNotificationTemplateRevision,
}) {}

export default CustomerNotificationsModuleService
