import { model } from "@medusajs/framework/utils"

const CustomerNotificationTemplate = model
  .define("customer_notification_template", {
    id: model.id().primaryKey(),
    event_key: model.text(),
    display_name: model.text(),
    category: model.enum(["support", "community", "protocols", "research", "rewards", "system"]),
    enabled: model.boolean().default(true),
    default_priority: model.enum(["low", "normal", "high", "urgent"]),
    default_enabled: model.boolean().default(true),
    customer_can_disable: model.boolean().default(true),
    current_revision_id: model.text().nullable(),
    retention_days: model.number().default(180),
    updated_by_actor_id: model.text().nullable(),
  })
  .indexes([{ on: ["event_key"], unique: true }])

export default CustomerNotificationTemplate
