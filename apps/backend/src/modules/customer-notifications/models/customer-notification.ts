import { model } from "@medusajs/framework/utils"

const CustomerNotification = model
  .define("customer_notification", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    event_key: model.text(),
    category: model.enum([
      "support",
      "community",
      "protocols",
      "research",
      "rewards",
      "system",
    ]),
    priority: model.enum(["low", "normal", "high", "urgent"]),
    title: model.text(),
    body: model.text(),
    target_kind: model.enum([
      "support_conversation",
      "community_thread",
      "protocol",
      "research_hub_section",
      "rewards",
      "notifications",
    ]),
    target_id: model.text().nullable(),
    secondary_target_id: model.text().nullable(),
    action_label: model.text().nullable(),
    status: model.enum(["scheduled", "unread", "read", "snoozed", "archived"]),
    scheduled_for: model.dateTime(),
    available_at: model.dateTime(),
    delivered_at: model.dateTime().nullable(),
    read_at: model.dateTime().nullable(),
    archived_at: model.dateTime().nullable(),
    snoozed_until: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(),
    idempotency_key: model.text(),
    group_key: model.text().nullable(),
    template_revision_id: model.text().nullable(),
    payload_schema_version: model.text().default("1"),
    metadata: model.json<Record<string, unknown>>().nullable(),
  })
  .indexes([
    { on: ["idempotency_key"], unique: true },
    { on: ["customer_id", "status", "available_at"] },
    { on: ["customer_id", "created_at"] },
    { on: ["customer_id", "category"] },
    { on: ["group_key", "status", "available_at"] },
  ])

export default CustomerNotification
