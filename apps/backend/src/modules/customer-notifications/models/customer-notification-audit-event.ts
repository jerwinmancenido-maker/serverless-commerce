import { model } from "@medusajs/framework/utils"

const CustomerNotificationAuditEvent = model
  .define("customer_notification_audit_event", {
    id: model.id().primaryKey(),
    event_type: model.enum([
      "template_created",
      "template_updated",
      "template_restored",
      "test_sent",
      "preference_changed",
      "legacy_backfilled",
      "retention_expired",
    ]),
    event_key: model.text().nullable(),
    notification_id: model.text().nullable(),
    actor_type: model.enum(["customer", "admin", "system"]),
    actor_id: model.text().nullable(),
    details: model.json<Record<string, unknown>>().nullable(),
  })
  .indexes([{ on: ["event_type", "created_at"] }])

export default CustomerNotificationAuditEvent
